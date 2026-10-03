import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding JeevRaksha (Pashu Rakshak) synthetic demo data for Maharashtra (SIH26128)...');

  // Clear existing records
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.sample.deleteMany();
  await prisma.laboratory.deleteMany();
  await prisma.treatment.deleteMany();
  await prisma.fieldVisit.deleteMany();
  await prisma.symptom.deleteMany();
  await prisma.case.deleteMany();
  await prisma.healthReport.deleteMany();
  await prisma.vaccination.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.user.deleteMany();

  const hashedPass = await bcrypt.hash('password123', 10);

  // --- 1. Officials & Users (FR-1 & FR-8) ---
  const stateOfficer = await prisma.user.create({
    data: {
      email: 'state.officer@jeevraksha.in',
      name: 'Dr. Anil Deshmukh (State Director)',
      password: hashedPass,
      role: 'STATE_OFFICER',
      status: 'APPROVED',
      registrationNo: 'MAH-DIR-001',
      jurisdictionLevel: 'STATE',
      jurisdictionState: 'Maharashtra',
    },
  });

  const puneOfficer = await prisma.user.create({
    data: {
      email: 'pune.officer@jeevraksha.in',
      name: 'Dr. Sunita Patil (District Officer)',
      password: hashedPass,
      role: 'DISTRICT_OFFICER',
      status: 'APPROVED',
      registrationNo: 'MAH-DIS-042',
      jurisdictionLevel: 'DISTRICT',
      jurisdictionState: 'Maharashtra',
      jurisdictionDistrict: 'Pune',
    },
  });

  const haveliOfficer = await prisma.user.create({
    data: {
      email: 'haveli.officer@jeevraksha.in',
      name: 'Dr. Vijay Kadam (Taluka Officer)',
      password: hashedPass,
      role: 'TALUKA_OFFICER',
      status: 'APPROVED',
      registrationNo: 'MAH-TAL-108',
      jurisdictionLevel: 'TALUKA',
      jurisdictionState: 'Maharashtra',
      jurisdictionDistrict: 'Pune',
      jurisdictionTaluka: 'Haveli',
    },
  });

  const vet = await prisma.user.create({
    data: {
      email: 'vet@jeevraksha.in',
      name: 'Dr. Priya Sharma (Veterinary Surgeon)',
      password: hashedPass,
      role: 'VETERINARIAN',
      status: 'APPROVED',
      registrationNo: 'MSVC-2018-9942',
      jurisdictionLevel: 'TALUKA',
      jurisdictionState: 'Maharashtra',
      jurisdictionDistrict: 'Pune',
      jurisdictionTaluka: 'Haveli',
    },
  });

  const pendingVet = await prisma.user.create({
    data: {
      email: 'applicant.vet@jeevraksha.in',
      name: 'Dr. Rohan Shinde (Pending Approval)',
      password: hashedPass,
      role: 'VETERINARIAN',
      status: 'PENDING',
      registrationNo: 'MSVC-2024-1102',
      jurisdictionLevel: 'TALUKA',
      jurisdictionState: 'Maharashtra',
      jurisdictionDistrict: 'Pune',
      jurisdictionTaluka: 'Baramati',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@jeevraksha.in',
      name: 'System Administrator',
      password: hashedPass,
      role: 'ADMIN',
      status: 'APPROVED',
      jurisdictionLevel: 'STATE',
      jurisdictionState: 'Maharashtra',
    },
  });

  const farmer = await prisma.user.create({
    data: {
      email: 'farmer@jeevraksha.in',
      name: 'Tukaram Shinde',
      password: hashedPass,
      role: 'FARMER',
      status: 'APPROVED',
      jurisdictionLevel: 'VILLAGE',
      jurisdictionState: 'Maharashtra',
      jurisdictionDistrict: 'Pune',
      jurisdictionTaluka: 'Haveli',
      jurisdictionVillage: 'Wagholi',
    },
  });

  console.log('✅ Demo Officers and Users Created');

  // --- 2. Laboratories ---
  const labPune = await prisma.laboratory.create({
    data: {
      name: 'District Veterinary Polyclinic & Disease Diagnostic Lab',
      location: 'Aundh, Pune, Maharashtra',
    },
  });

  const labState = await prisma.laboratory.create({
    data: {
      name: 'State Animal Disease Investigation Section (DIS)',
      location: 'Aundh Pune / Commissionerate of AH, Maharashtra',
    },
  });

  // --- 3. Animals in Maharashtra (Pune & Satara) ---
  const cow1 = await prisma.animal.create({
    data: {
      ownerId: farmer.id,
      species: 'Cow',
      breed: 'Gir',
      age: 4,
      gender: 'Female',
      weight: 380,
      village: 'Wagholi',
      block: 'Haveli',
      district: 'Pune',
    },
  });

  const cow2 = await prisma.animal.create({
    data: {
      ownerId: farmer.id,
      species: 'Cow',
      breed: 'Khillari',
      age: 3,
      gender: 'Female',
      weight: 340,
      village: 'Wagholi',
      block: 'Haveli',
      district: 'Pune',
    },
  });

  const buffalo1 = await prisma.animal.create({
    data: {
      ownerId: farmer.id,
      species: 'Buffalo',
      breed: 'Murrah',
      age: 5,
      gender: 'Female',
      weight: 510,
      village: 'Uruli Kanchan',
      block: 'Haveli',
      district: 'Pune',
    },
  });

  const goat1 = await prisma.animal.create({
    data: {
      ownerId: farmer.id,
      species: 'Goat',
      breed: 'Osmanabadi',
      age: 2,
      gender: 'Male',
      weight: 32,
      village: 'Baramati Rural',
      block: 'Baramati',
      district: 'Pune',
    },
  });

  const cowSatara = await prisma.animal.create({
    data: {
      ownerId: farmer.id,
      species: 'Cow',
      breed: 'Dangi',
      age: 4,
      gender: 'Female',
      weight: 360,
      village: 'Shirwal',
      block: 'Khandala',
      district: 'Satara',
    },
  });

  console.log('✅ Animals Created');

  // --- 4. Vaccinations ---
  await prisma.vaccination.createMany({
    data: [
      {
        animalId: cow1.id,
        vaccine: 'FMD (Foot & Mouth Disease)',
        date: new Date('2024-01-10'),
        nextDueDate: new Date('2024-07-10'),
        location: 'Wagholi Veterinary Dispensary',
      },
      {
        animalId: cow2.id,
        vaccine: 'Lumpy Skin Disease (LSD)',
        date: new Date('2024-02-15'),
        nextDueDate: new Date('2025-02-15'),
        location: 'Wagholi Veterinary Dispensary',
      },
      {
        animalId: buffalo1.id,
        vaccine: 'Haemorrhagic Septicaemia (HS)',
        date: new Date('2023-11-20'),
        nextDueDate: new Date('2024-11-20'),
        location: 'Uruli Kanchan Sub-centre',
      },
      {
        animalId: cowSatara.id,
        vaccine: 'FMD (Foot & Mouth Disease)',
        date: new Date('2024-03-01'),
        nextDueDate: new Date('2024-09-01'),
        location: 'Khandala Vet Clinic',
      },
    ],
  });

  console.log('✅ Vaccinations Created');

  // --- 5. Health Reports with Plain-Language Explainable AI Reasons ---
  const report1 = await prisma.healthReport.create({
    data: {
      animalId: cow1.id,
      reporterId: farmer.id,
      severity: 'SEVERE',
      animalsAffected: 12,
      deaths: 2,
      vaccinatedCount: 2,
      locationVillage: 'Wagholi',
      locationBlock: 'Haveli',
      locationDistrict: 'Pune',
      latitude: 18.5793,
      longitude: 73.9814,
      temperature: 105.2,
      duration: 4,
      additionalNotes: 'Severe salivation, vesicle ruptures on tongue and hooves. Herd inability to graze.',
      riskScore: 88,
      riskLevel: 'HIGH',
      riskFactors: 'High mortality rate (2 deaths), 12 animals affected in close proximity, characteristic vesicle lesions, unvaccinated status in 83% of herd.',
      recommendedAction: 'Immediate ring vaccination within 5 km radius, isolate infected livestock, dispatch mobile veterinary unit for disinfectant spraying.',
      symptoms: {
        create: [
          { name: 'High Fever' },
          { name: 'Excessive Foaming Saliva' },
          { name: 'Blisters on Tongue and Hooves' },
          { name: 'Severe Lameness' },
        ],
      },
    },
  });

  const report2 = await prisma.healthReport.create({
    data: {
      animalId: cow2.id,
      reporterId: farmer.id,
      severity: 'MODERATE',
      animalsAffected: 4,
      deaths: 0,
      vaccinatedCount: 3,
      locationVillage: 'Uruli Kanchan',
      locationBlock: 'Haveli',
      locationDistrict: 'Pune',
      latitude: 18.4883,
      longitude: 74.1345,
      temperature: 103.4,
      duration: 3,
      additionalNotes: 'Nodular skin eruptions over neck and flanks, swelling in limbs.',
      riskScore: 65,
      riskLevel: 'MEDIUM',
      riskFactors: 'Nodular lesions matching Lumpy Skin Disease (LSD), moderate fever, vector activity reported near canal.',
      recommendedAction: 'Apply vector control (anti-fly spray), quarantine infected animals, monitor daily temperature.',
      symptoms: {
        create: [
          { name: 'Skin Nodules' },
          { name: 'Lethargy' },
          { name: 'Reduced Milk Production' },
        ],
      },
    },
  });

  const reportSatara = await prisma.healthReport.create({
    data: {
      animalId: cowSatara.id,
      reporterId: farmer.id,
      severity: 'MODERATE',
      animalsAffected: 5,
      deaths: 1,
      vaccinatedCount: 1,
      locationVillage: 'Shirwal',
      locationBlock: 'Khandala',
      locationDistrict: 'Satara',
      latitude: 18.1333,
      longitude: 74.0167,
      temperature: 104.0,
      duration: 2,
      additionalNotes: 'Respiratory distress, sudden high fever.',
      riskScore: 74,
      riskLevel: 'HIGH',
      riskFactors: 'Respiratory distress, sudden death of 1 heifer, localized pocket near river basin.',
      recommendedAction: 'Urgent vet visit, broad-spectrum antibiotic intervention under vet guidance.',
      symptoms: {
        create: [
          { name: 'Dyspnea / Difficulty Breathing' },
          { name: 'High Fever' },
          { name: 'Swelling under throat' },
        ],
      },
    },
  });

  console.log('✅ Health Reports Created');

  // --- 6. Cases (FR-5) ---
  const case1 = await prisma.case.create({
    data: {
      animalId: cow1.id,
      healthReportId: report1.id,
      veterinarianId: vet.id,
      status: 'FIELD_VISIT',
    },
  });

  const case2 = await prisma.case.create({
    data: {
      animalId: cow2.id,
      healthReportId: report2.id,
      veterinarianId: vet.id,
      status: 'UNDER_REVIEW',
    },
  });

  const caseSatara = await prisma.case.create({
    data: {
      animalId: cowSatara.id,
      healthReportId: reportSatara.id,
      status: 'NEW',
    },
  });

  // --- 7. Field Visits & Treatments ---
  await prisma.fieldVisit.create({
    data: {
      caseId: case1.id,
      fieldWorkerId: vet.id,
      visitDate: new Date(),
      findings: 'Verified classic FMD symptoms in 12 cattle. Potassium permanganate mouth wash distributed to 5 farmers. Quarantined infected shed.',
      status: 'COMPLETED',
    },
  });

  await prisma.treatment.create({
    data: {
      caseId: case1.id,
      animalId: cow1.id,
      assessment: 'Suspected Foot & Mouth Disease (FMD) Serotype O',
      treatment: 'Boric acid glycerin application, Antiseptic foot bath, Supportive fluid therapy',
      medication: 'Meloxicam, Enrofloxacin, Povidone-Iodine ointment',
      followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      notes: 'Advised strict movement restriction of cattle outside the village for 21 days.',
    },
  });

  // --- 8. Lab Referrals (FR-7) ---
  await prisma.sample.create({
    data: {
      caseId: case1.id,
      animalId: cow1.id,
      sampleType: 'Epithelial tissue flap + Serum',
      collectedById: vet.id,
      laboratoryId: labState.id,
      status: 'TESTING',
      result: null,
    },
  });

  // --- 9. Alerts (FR-4) ---
  await prisma.alert.createMany({
    data: [
      {
        type: 'HIGH_RISK',
        message: 'FMD Cluster Alert: 12 cases and 2 deaths confirmed in Wagholi (Haveli, Pune). Ring vaccination protocol initiated.',
        village: 'Wagholi',
        block: 'Haveli',
        district: 'Pune',
        isRead: false,
      },
      {
        type: 'OUTBREAK_WARNING',
        message: 'Suspected Lumpy Skin Disease reported in Uruli Kanchan (Haveli). Vector control recommended.',
        village: 'Uruli Kanchan',
        block: 'Haveli',
        district: 'Pune',
        isRead: false,
      },
      {
        type: 'HIGH_RISK',
        message: 'Haemorrhagic Septicaemia (HS) suspect cluster in Shirwal (Khandala, Satara). Response team alerted.',
        village: 'Shirwal',
        block: 'Khandala',
        district: 'Satara',
        isRead: false,
      },
    ],
  });

  // --- 10. Audit Log (FR-8 & Compliance) ---
  await prisma.auditLog.createMany({
    data: [
      {
        userId: stateOfficer.id,
        action: 'SYSTEM_INITIALIZATION',
        details: 'Maharashtra State Animal Disease Surveillance System initialized with SIH26128 parameters.',
      },
      {
        userId: puneOfficer.id,
        action: 'JURISDICTION_LOGIN',
        details: 'District Officer logged in to Pune surveillance dashboard.',
      },
      {
        userId: vet.id,
        action: 'CASE_ASSIGNED',
        details: `Assigned case ${case1.id} for Wagholi FMD investigation.`,
      },
    ],
  });

  console.log('\n🎉 Seed Completed successfully!');
  console.log('----------------------------------------------------');
  console.log('DEMO ACCOUNTS (PASSWORD for all: password123):');
  console.log('1. State Officer (All Maharashtra): state.officer@jeevraksha.in');
  console.log('2. District Officer (Pune):         pune.officer@jeevraksha.in');
  console.log('3. Taluka Officer (Haveli, Pune):   haveli.officer@jeevraksha.in');
  console.log('4. Veterinarian (Haveli, Pune):     vet@jeevraksha.in');
  console.log('5. System Admin:                    admin@jeevraksha.in');
  console.log('6. Farmer:                          farmer@jeevraksha.in');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
