import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRisk } from '@/lib/risk-engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      callerPhone = '9876543210',
      animalChoice = '1', // 1: Cow, 2: Buffalo, 3: Goat, 4: Other
      symptomChoice = '1', // 1: Fever & Blisters (FMD), 2: Skin Nodules (LSD), 3: Respiratory/Cough (HS), 4: Spoken voice
      voiceNoteText = '',
      village = 'Rampur',
      block = 'Sadar',
      district = 'Varanasi',
    } = body;

    // 1. Map Animal Choice
    let species = 'Cow';
    let breed = 'Desi / Cross';
    if (animalChoice === '2') {
      species = 'Buffalo';
      breed = 'Murrah';
    } else if (animalChoice === '3') {
      species = 'Goat';
      breed = 'Black Bengal';
    } else if (animalChoice === '4') {
      species = 'Other Livestock';
      breed = 'Indigenous';
    }

    // 2. Map Symptoms & Suspected Outbreak Disease
    let symptoms: string[] = [];
    let severity: 'MILD' | 'MODERATE' | 'SEVERE' = 'MODERATE';
    let suspectedDisease = 'General Clinical Distress';
    let firstAidHindi = 'पशु को स्वच्छ छायादार स्थान पर रखें और ताजा पानी दें।';

    if (symptomChoice === '1') {
      symptoms = [
        'तेज़ बुखार (High Fever)',
        'खुर व मुंह में छाले (Foot & Mouth Lesions)',
        'मुंह से अत्यधिक लार गिरना (Excessive Salivation)',
        'लंगड़ा कर चलना (Lameness)'
      ];
      severity = 'SEVERE';
      suspectedDisease = 'Foot-and-Mouth Disease (FMD / खुरपका-मुंहपका)';
      firstAidHindi = 'तुरंत प्रभाव से बीमार पशु को बाकी झुंड से अलग करें। खुरों को 2% पोटाश (KMNO4) या गुनगुने नमक के पानी से धोएं। लार को किसी अन्य पशु के संपर्क में न आने दें।';
    } else if (symptomChoice === '2') {
      symptoms = [
        'त्वचा में कठोर गांठें (Lumpy Skin Nodules)',
        'तेज़ बुखार (Fever)',
        'पैरों में सूजन (Leg Edema)',
        'भूख न लगना (Anorexia)'
      ];
      severity = 'MODERATE';
      suspectedDisease = 'Lumpy Skin Disease (LSD / लंपी चर्म रोग)';
      firstAidHindi = 'पशु को मच्छरों व मक्खियों से बचाएं। नीम की पत्तियों के धुएं से बाड़े को सुरक्षित रखें। गांठों पर नीम या हल्दी का लेप लगाएं और डॉक्टर का इंतजार करें।';
    } else if (symptomChoice === '3') {
      symptoms = [
        'सांस लेने में भारी घरघराहट (Labored Breathing)',
        'गले में सूजन (Throat Swelling)',
        'तेज़ बुखार (High Fever)',
        'नाक से स्राव (Nasal Discharge)'
      ];
      severity = 'SEVERE';
      suspectedDisease = 'Haemorrhagic Septicaemia (HS / गलघोंटू)';
      firstAidHindi = 'अत्यंत संवेदनशील स्थिति! पशु को खुला हवादार स्थान दें, गले पर कोई दबाव न डालें। नजदीकी पशु चिकित्सालय की इमरजेंसी टीम को तत्काल सूचित किया गया है।';
    } else {
      // Voice / custom symptoms
      symptoms = voiceNoteText 
        ? [voiceNoteText, 'कॉल पर बताया गया लक्षण (Reported via Voice)']
        : ['अस्पष्ट अस्वस्थता (Unspecified Illness)', 'IVR वॉयस रिपोर्ट (Voice Reported)'];
      severity = 'MODERATE';
      suspectedDisease = 'Triage Pending (वॉयस ट्राइएज विचाराधीन)';
      firstAidHindi = 'पशु को आराम दें और डॉक्टर के आगमन तक अन्य पशुओं से सुरक्षित दूरी पर रखें।';
    }

    // 3. Find or create a caller Farmer User
    let farmerUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: `farmer_${callerPhone}@jeevraksha.in` },
          { email: 'farmer@jeevraksha.in' }
        ]
      }
    });

    if (!farmerUser) {
      farmerUser = await prisma.user.create({
        data: {
          email: `farmer_${callerPhone}@jeevraksha.in`,
          name: `किसान (Phone: ${callerPhone})`,
          password: 'ivr_auto_generated',
          role: 'FARMER',
        }
      });
    }

    // 4. Find or create Animal
    let animal = await prisma.animal.findFirst({
      where: {
        ownerId: farmerUser.id,
        species,
      }
    });

    if (!animal) {
      animal = await prisma.animal.create({
        data: {
          ownerId: farmerUser.id,
          species,
          breed,
          age: 3,
          gender: 'Female',
          village,
          block,
          district,
        }
      });
    }

    // 5. Calculate Risk Score
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const nearbyCases = await prisma.healthReport.count({
      where: {
        locationVillage: village,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const baselineRisk = calculateRisk({
      severity,
      nearbyCases,
      mortality: 0,
      vaccinationGap: true,
      historicalTrendScore: 6,
      environmentalContextScore: 4,
    });

    // 6. Create Health Report, Symptoms, Case, and Alert in Transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const report = await tx.healthReport.create({
        data: {
          animalId: animal.id,
          reporterId: farmerUser.id,
          severity,
          deaths: 0,
          animalsAffected: 1,
          vaccinatedCount: 0,
          locationVillage: village,
          locationBlock: block,
          locationDistrict: district,
          duration: 2,
          additionalNotes: `IVR Telephonic Emergency Intake from ${callerPhone}. Suspected: ${suspectedDisease}`,
          riskScore: baselineRisk.riskScore,
          riskLevel: baselineRisk.riskLevel,
          riskFactors: `IVR Rapid Triage, ${baselineRisk.factors.join(', ')}`,
          recommendedAction: firstAidHindi,
        },
      });

      // Save Symptoms
      if (symptoms.length > 0) {
        await tx.symptom.createMany({
          data: symptoms.map((name) => ({
            name,
            healthReportId: report.id,
          })),
        });
      }

      // Find an available veterinarian to assign
      const vet = await tx.user.findFirst({
        where: { role: 'VETERINARIAN' },
      });

      // Create Case
      const newCase = await tx.case.create({
        data: {
          animalId: animal.id,
          healthReportId: report.id,
          veterinarianId: vet ? vet.id : null,
          status: 'NEW',
        },
      });

      // Create Alert
      await tx.alert.create({
        data: {
          type: baselineRisk.riskLevel === 'HIGH' ? 'HIGH_RISK' : 'OUTBREAK_WARNING',
          message: `🚨 IVR Emergency Call from ${village} (${callerPhone}): ${species} suspected with ${suspectedDisease}. Case #${newCase.id.slice(-6).toUpperCase()}`,
          village,
          block,
          district,
        },
      });

      return { report, newCase, vet };
    });

    const caseShortId = result.newCase.id.slice(-6).toUpperCase();

    return NextResponse.json({
      success: true,
      caseId: result.newCase.id,
      caseNumber: `JR-IVR-${caseShortId}`,
      animalSpecies: species,
      suspectedDisease,
      riskLevel: baselineRisk.riskLevel,
      riskScore: baselineRisk.riskScore,
      symptoms,
      village,
      district,
      firstAidHindi,
      assignedVet: result.vet ? result.vet.name : 'Duty Veterinary Officer (Auto-Dispatched)',
      confirmationVoiceText: `धन्यवाद। आपका आपातकालीन केस नंबर जे आर आई वी आर ${caseShortId} दर्ज कर लिया गया है। डॉक्टर ${result.vet?.name || 'को'} तुरंत सूचना भेज दी गई है। ${firstAidHindi}`,
    }, { status: 201 });

  } catch (error) {
    console.error('IVR Simulation error:', error);
    return NextResponse.json({ error: 'Failed to process IVR call intake' }, { status: 500 });
  }
}
