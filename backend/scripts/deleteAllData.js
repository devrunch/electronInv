const { PrismaClient } = require('../../prisma/generated/remote');
const prisma = new PrismaClient();

async function deleteAllData() {
    try {
        console.log('Starting data deletion process...');

        // Delete in order of dependencies to maintain referential integrity
        await prisma.$transaction(async (prisma) => {
            // Delete PurchaseItem records
            console.log('Deleting PurchaseItem records...');
            await prisma.purchaseItem.deleteMany();

            // Delete Purchase records
            console.log('Deleting Purchase records...');
            await prisma.purchase.deleteMany();

            // Delete InventoryLog records
            console.log('Deleting InventoryLog records...');
            await prisma.inventoryLog.deleteMany();

            // Delete Dosage records
            console.log('Deleting Dosage records...');
            await prisma.dosage.deleteMany();

            // Delete Prescription records
            console.log('Deleting Prescription records...');
            await prisma.prescription.deleteMany();

            // Delete MedicalHistory records
            console.log('Deleting MedicalHistory records...');
            await prisma.medicalHistory.deleteMany();

            // Delete Patient records
            console.log('Deleting Patient records...');
            await prisma.patient.deleteMany();

            // Delete Inventory records
            console.log('Deleting Inventory records...');
            await prisma.inventory.deleteMany();

            // Delete Supplier records
            console.log('Deleting Supplier records...');
            await prisma.supplier.deleteMany();

            console.log('All data deleted successfully!');
        });

    } catch (error) {
        console.error('Error deleting data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the deletion
deleteAllData()
    .then(() => {
        console.log('Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    }); 