const { PrismaClient } = require('../prisma/generated/remote');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  await prisma.user.createMany({
    data: [
      { username: 'admin', password: await bcrypt.hash('admin123', 10), role: 'admin' },
      { username: 'employee1', password: await bcrypt.hash('employee123', 10), role: 'employee' },
    ],
  });

  // Create suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'MediSupply Co.',
      contact: '1234567890',
      email: 'contact@medisupply.com',
      address: '123 Pharma Street, Health City',
    },
  });

  // Create inventory
  await prisma.inventory.createMany({
    data: [
      {
        sku: 'MED123',
        name: 'Aspirin',
        quantity: 50,
        lowerThreshold: 10,
        upperThreshold: 200,
        supplierId: supplier1.id,
      },
      {
        sku: 'MED124',
        name: 'Paracetamol',
        quantity: 75,
        lowerThreshold: 15,
        upperThreshold: 150,
        supplierId: supplier1.id,
      },
    ],
  });

  // Create patients
  const patient1 = await prisma.patient.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      dob: new Date('1990-05-20'),
      gender: 'MALE',
      contactInfo: '9876543210',
      emergencyContact: '1234567890',
    },
  });

  // Create medical history
  await prisma.medicalHistory.create({
    data: {
      patientId: patient1.id,
      description: 'Routine check-up',
      diagnosis: 'Healthy',
      treatment: 'N/A',
      doctor: 'Dr. Smith',
    },
  });

  // Create prescription
  const prescription1 = await prisma.prescription.create({
    data: {
      patientId: patient1.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      doctor: 'Dr. Smith',
    },
  });

  // Create dosage
  await prisma.dosage.create({
    data: {
      prescriptionId: prescription1.id,
      sku: 'MED123',
      quantity: 1,
      frequency: 'Twice a day',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
