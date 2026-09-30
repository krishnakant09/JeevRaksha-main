import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding JeevRaksha database...');

  // Clear existing data
  await prisma.alert.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.sample.deleteMany();
  await prisma.treatment.deleteMany();
  await prisma.fieldVisit.deleteMany();
  await prisma.symptom.deleteMany();
  await prisma.healthReport.deleteMany();
  await prisma.case.deleteMany();
  await prisma.vaccination.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.user.deleteMany();

  const hashedPass = await bcrypt.hash('password123', 10);

  // --- Users ---
  const farmer = await prisma.user.create({
    data: { email: 'farmer@jeevraksha.in', name: 'Ramesh Kumar', password: hashedPass, role: 'FARMER' },
  });
  const vet = await prisma.user.create({
    data: { email: 'vet@jeevraksha.in', name: 'Dr. Priya Sharma', password: hashedPass, role: 'VETERINARIAN' },
  });
  const admin = await prisma.user.create({
    data: { email: 'admin@jeevraksha.in', name: 'Admin User', password: hashedPass, role: 'ADMIN' },
  });

  console.log('✅ Users created');

  // --- Animals ---
  const cow1 = await prisma.animal.create({
    data: { ownerId: farmer.id, species: 'Cow', breed: 'Gir', age: 4, gender: 'Female', weight: 350, village: 'Rampur', block: 'Sadar', district: 'Varanasi' },
  });
  const cow2 = await prisma.animal.create({
    data: { ownerId: farmer.id, species: 'Cow', breed: 'Sahiwal', age: 3, gender: 'Female', weight: 310, village: 'Rampur', block: 'Sadar', district: 'Varanasi' },
  });
  const buffalo = await prisma.animal.create({
    data: { ownerId: farmer.id, species: 'Buffalo', breed: 'Murrah', age: 5, gender: 'Female', weight: 500, village: 'Rampur', block: 'Sadar', district: 'Varanasi' },
  });
  const goat = await prisma.animal.create({
    data: { ownerId: farmer.id, species: 'Goat', breed: 'Black Bengal', age: 2, gender: 'Male', weight: 30, village: 'Sitapur', block: 'Cholapur', district: 'Varanasi' },
  });

  console.log('✅ Animals created');

  // --- Vaccinations ---
  await prisma.vaccination.createMany({
    data: [
      { animalId: cow1.id, vaccine: 'FMD', date: new Date('2024-01-15'), nextDueDate: new Date('2024-07-15'), location: 'Rampur Camp' },
      { animalId: cow2.id, vaccine: 'BQ', date: new Date('2024-02-10'), nextDueDate: new Date('2025-02-10'), location: 'Rampur Camp' },
      { animalId: buffalo.id, vaccine: 'HS', date: new Date('2023-12-01'), nextDueDate: new Date('2024-12-01'), location: 'Sadar Block' },
    ],
  });

  console.log('✅ Vaccinations created');

  // --- HIGH RISK scenario: Rampur cluster ---
  const report1 = await prisma.healthReport.create({
    data: {
      animalId: cow1.id,
      reporterId: farmer.id,
      severity: 'SEVERE',
      animalsAffected: 8,
      deaths: 2,
      locationVillage: 'Rampur',
      locationBlock: 'Sadar',
      locationDistrict: 'Varanasi',
      temperature: 104.5,
      duration: 5,
      additionalNotes: 'Excessive salivation, blistering on hooves. Multiple cows showing same symptoms.',
      riskScore: 82,
      riskLevel: 'HIGH',
      riskFactors: 'Severe symptoms reported, 2 mortalities reported, 5 nearby cases detected',
      recommendedAction: 'Veterinary inspection recommended immediately.',
      symptoms: {
        create: [
          { name: 'Fever' },
          { name: 'Loss of appetite' },
          { name: 'Blistering' },
          { name: 'Excessive salivation' },
        ],
      },
    },
  });

  const report2 = await prisma.healthReport.create({
    data: {
      animalId: cow2.id,
      reporterId: farmer.id,
      severity: 'MODERATE',
      animalsAffected: 3,
      deaths: 0,
      locationVillage: 'Rampur',
      locationBlock: 'Sadar',
      locationDistrict: 'Varanasi',
      temperature: 102.2,
      duration: 3,
      additionalNotes: 'Reduced milk production, lethargy.',
      riskScore: 48,
      riskLevel: 'MEDIUM',
      riskFactors: 'Moderate symptoms reported, 1 nearby case detected',
      recommendedAction: 'Observe animal closely. Consider consultation if symptoms persist.',
      symptoms: {
        create: [
          { name: 'Weakness' },
          { name: 'Loss of appetite' },
          { name: 'Reduced milk' },
        ],
      },
    },
  });

  const report3 = await prisma.healthReport.create({
    data: {
      animalId: goat.id,
      reporterId: farmer.id,
      severity: 'MILD',
      animalsAffected: 1,
      deaths: 0,
      locationVillage: 'Sitapur',
      locationBlock: 'Cholapur',
      locationDistrict: 'Varanasi',
      temperature: 101.0,
      duration: 1,
      riskScore: 10,
      riskLevel: 'LOW',
      riskFactors: '',
      recommendedAction: 'Standard monitoring.',
      symptoms: {
        create: [{ name: 'Cough' }],
      },
    },
  });

  console.log('✅ Health reports created');

  // --- Cases ---
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

  const case3 = await prisma.case.create({
    data: {
      animalId: goat.id,
      healthReportId: report3.id,
      status: 'NEW',
    },
  });

  console.log('✅ Cases created');

  // --- Field visit for case1 ---
  await prisma.fieldVisit.create({
    data: {
      caseId: case1.id,
      fieldWorkerId: vet.id,
      visitDate: new Date(),
      findings: 'Classic FMD symptoms confirmed. Isolation of affected herd recommended. Collected blood and swab samples.',
      status: 'COMPLETED',
    },
  });

  // --- Treatment ---
  await prisma.treatment.create({
    data: {
      caseId: case1.id,
      animalId: cow1.id,
      assessment: 'Suspected Foot and Mouth Disease (FMD)',
      treatment: 'Symptomatic treatment, wound antiseptic, anti-inflammatory',
      medication: 'Betadine wash, Meloxicam 0.5mg/kg IM',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Isolate from rest of herd. Monitor water intake.',
    },
  });

  // --- Samples ---
  const lab = await prisma.laboratory.create({
    data: { name: 'IVRI Bareilly', location: 'Bareilly, UP' },
  });

  await prisma.sample.create({
    data: {
      caseId: case1.id,
      animalId: cow1.id,
      sampleType: 'Blood + Epithelial tissue swab',
      collectedById: vet.id,
      laboratoryId: lab.id,
      status: 'TESTING',
      result: null,
    },
  });

  console.log('✅ Field visits, treatments, samples created');

  // --- Alerts ---
  await prisma.alert.createMany({
    data: [
      {
        type: 'HIGH_RISK',
        message: 'Possible FMD outbreak detected in Rampur village. 8 animals affected, 2 deaths. Risk score: 82/100. Immediate veterinary inspection required.',
        village: 'Rampur',
        block: 'Sadar',
        district: 'Varanasi',
        isRead: false,
      },
      {
        type: 'OUTBREAK_WARNING',
        message: 'Cluster of 3 cases in Rampur (Sadar Block) within 7 days. Possible outbreak forming.',
        village: 'Rampur',
        block: 'Sadar',
        district: 'Varanasi',
        isRead: false,
      },
      {
        type: 'VACCINATION_DUE',
        message: 'Buffalo (Murrah) in Rampur is overdue for HS vaccination. Last vaccinated Dec 2023.',
        village: 'Rampur',
        block: 'Sadar',
        district: 'Varanasi',
        isRead: true,
      },
    ],
  });

  console.log('✅ Alerts created');
  console.log('\n🎉 Seed complete! Demo accounts:');
  console.log('  Farmer:  farmer@jeevraksha.in  / password123');
  console.log('  Vet:     vet@jeevraksha.in     / password123');
  console.log('  Admin:   admin@jeevraksha.in   / password123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
