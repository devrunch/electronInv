const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const inventoryLogs = [
        { inventoryId: 1, userId: 1, type: 'IN', quantity: 10 },
        { inventoryId: 2, userId: 1, type: 'OUT', quantity: 5 },
    ];

    for (const log of inventoryLogs) {
        await prisma.inventoryLog.create({
            data: log,
        });
    }

    console.log('Inventory logs have been seeded');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });