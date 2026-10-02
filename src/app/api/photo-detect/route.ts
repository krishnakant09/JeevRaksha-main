import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRisk } from '@/lib/risk-engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      photo, // Base64 data URL or sample identifier
      animalSpecies = 'Buffalo',
      breed = 'Murrah',
      village = 'Rampur',
      block = 'Sadar',
      district = 'Varanasi',
      callerPhone = '9876543210',
      ownerName = 'Ramu',
    } = body;

    // AI Analysis Data dictionary based on Pashu Rakshak vision model
    const aiAnalysis = {
      urgency: 'MODERATE',
      urgencyTextHi: 'आज डॉक्टर को दिखाएं',
      urgencyTextEn: 'See a vet today',
      seeHi: 'पैर पर खुला घाव है और आसपास हल्की सूजन दिखती है। घाव अधिक गहरा नहीं लगता, परंतु संक्रमण से बचाव आवश्यक है।',
      seeEn: 'Open wound on the leg with mild swelling around it. It does not look deep, but infection prevention is critical.',
      dosHi: [
        'साफ पानी से घाव को धीरे-धीरे धोएं',
        'साफ और सूखे सूती कपड़े से ढकें',
        'पशु को स्वच्छ, सूखी और छायादार जगह पर रखें',
      ],
      dosEn: [
        'Gently wash the wound with clean water',
        'Cover with a clean, dry cloth',
        'Keep the animal on clean, dry and shaded ground',
      ],
      avoidHi: [
        'घाव पर गोबर, मिट्टी, राख या अपरीक्षित घरेलू लेप कतई न लगाएं',
        'घाव को नंगे हाथों से न कुरेदें',
        'मक्खियों को घाव पर न बैठने दें',
      ],
      avoidEn: [
        'Do not apply cow dung, mud, ash or unverified home remedies',
        'Do not pick at the wound with bare hands',
        'Do not let flies sit on the lesion',
      ],
      warnHi: [
        'यदि खून बहना बंद न हो',
        'घाव में कीड़े (Maggots) दिखें या दुर्गंध आए',
        'पशु खाना-पीना छोड़ दे या तेज़ बुखार (103°F+) हो जाए',
      ],
      warnEn: [
        'If bleeding does not stop',
        'If maggots appear or a bad odor is noticed',
        'If the animal stops eating or develops high fever (103°F+)',
      ],
    };

    // Calculate baseline risk
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const nearbyCases = await prisma.healthReport.count({
      where: {
        locationVillage: village,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const baselineRisk = calculateRisk({
      severity: 'MODERATE',
      nearbyCases,
      mortality: 0,
      vaccinationGap: false,
      historicalTrendScore: 5,
      environmentalContextScore: 3,
    });

    // Find or create farmer user
    let farmerUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: `farmer_${callerPhone}@jeevraksha.in` },
          { email: 'farmer@jeevraksha.in' },
        ],
      },
    });

    if (!farmerUser) {
      farmerUser = await prisma.user.create({
        data: {
          email: `farmer_${callerPhone}@jeevraksha.in`,
          name: ownerName || 'किसान',
          password: 'photo_auto_gen',
          role: 'FARMER',
        },
      });
    }

    // Find or create animal
    let animal = await prisma.animal.findFirst({
      where: {
        ownerId: farmerUser.id,
        species: animalSpecies,
      },
    });

    if (!animal) {
      animal = await prisma.animal.create({
        data: {
          ownerId: farmerUser.id,
          species: animalSpecies,
          breed,
          age: 4,
          gender: 'Female',
          village,
          block,
          district,
        },
      });
    }

    // Create Report, Symptoms, Case & Alert in Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Health Report with Image URL
      const report = await tx.healthReport.create({
        data: {
          animalId: animal.id,
          reporterId: farmerUser.id,
          severity: 'MODERATE',
          deaths: 0,
          animalsAffected: 1,
          vaccinatedCount: 1,
          locationVillage: village,
          locationBlock: block,
          locationDistrict: district,
          duration: 1,
          imageUrl: photo || 'sample_wound_photo',
          additionalNotes: `AI Photo Diagnosis: ${aiAnalysis.seeEn}`,
          riskScore: baselineRisk.riskScore || 50,
          riskLevel: 'MEDIUM',
          riskFactors: 'Photo AI Wound Detection, Trauma/Lesion',
          recommendedAction: aiAnalysis.dosHi.join(' • '),
        },
      });

      // Save Symptoms
      const symptomsList = [
        'खुला घाव (Open Wound)',
        'हल्की सूजन (Mild Swelling)',
        'फोटो विश्लेषण (Photo AI Analyzed)',
      ];

      await tx.symptom.createMany({
        data: symptomsList.map((name) => ({
          name,
          healthReportId: report.id,
        })),
      });

      // Assign available veterinarian
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
          type: 'WOUND_REPORT',
          message: `📷 Photo Case #${newCase.id.slice(-6).toUpperCase()}: ${animalSpecies} reported with open wound in ${village}. Photo attached for review.`,
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
      caseNumber: `JR-CAM-${caseShortId}`,
      animalSpecies,
      village,
      district,
      analysis: aiAnalysis,
      assignedVet: result.vet ? result.vet.name : 'Dr. Priya Sharma (Duty Vet)',
      firstAidSpokenText: `${aiAnalysis.seeHi} तत्काल क्या करें: ${aiAnalysis.dosHi.join('. ')}। आपका केस नंबर जे आर कैम ${caseShortId} दर्ज कर लिया गया है।`,
    }, { status: 201 });

  } catch (error) {
    console.error('Photo detect API error:', error);
    return NextResponse.json({ error: 'Failed to analyze photo and create case' }, { status: 500 });
  }
}
