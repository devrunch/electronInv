const { PrismaClient } = require('../prisma/generated/remote');
const { PrismaClient: RemotePrismaClient } = require('../prisma/generated/remote');

const localPrisma = new PrismaClient();
const remotePrisma = new RemotePrismaClient();

// Sync Inventory Logs -> Update Remote Inventory
async function syncInventoryToRemote() {
    const unsyncedLogs = await localPrisma.inventoryLog.findMany({
        where: { synced: false },
        include: { inventory: true }
    });

    for (const log of unsyncedLogs) {
        const invItemLocal = await localPrisma.inventory.findUnique({ 
            where: { sku: log.inventoryId }
        });

        const invItemRemote = await remotePrisma.inventory.findUnique({
            where: { sku: invItemLocal.sku }
        });
        
        if (!invItemRemote) {
            await remotePrisma.inventory.create({
                data: {
                    sku: invItemLocal.sku,
                    name: invItemLocal.name,
                    quantity: invItemLocal.quantity,
                    lowerThreshold: invItemLocal.lowerThreshold,
                    upperThreshold: invItemLocal.upperThreshold,
                    
                }
            });
        }
        if(log.type === 'OUT'|| log.type === 'IN'){ 
        await remotePrisma.inventory.update({
            where: { sku: log.inventoryId },
            data: {
                quantity: {
                    increment: log.type === 'IN' ? log.quantity : -log.quantity
                }
            }
        });
      }

        if(log.type === 'UPDATE'){
            await remotePrisma.inventory.update({
                where: { sku: invItemLocal.sku },
                data: {
                    name: invItemLocal.name,
                    quantity: log.quantity,
                    lowerThreshold: invItemLocal.lowerThreshold,
                    upperThreshold: invItemLocal.upperThreshold,
                }
            });

        }

        await localPrisma.inventoryLog.update({
            where: { id: log.id },
            data: { synced: true }
        });
    }

    console.log(`Synced ${unsyncedLogs.length} inventory logs to remote.`);
}

// Sync Patients, Users, and Prescriptions -> Upsert to Remote
async function syncPatientsToRemote() {
    const patients = await localPrisma.patient.findMany({
        include: {
            medicalHistories: true,
            prescriptions: {
                include: { dosages: true }
            }
        }
    });

    for (const patient of patients) {
        await remotePrisma.patient.upsert({
            where: { contactInfo: patient.contactInfo },
            update: {
                firstName: patient.firstName,
                lastName: patient.lastName,
                dob: patient.dob,
                gender: patient.gender,
                contactInfo: patient.contactInfo,
                emergencyContact: patient.emergencyContact
            },
            create: {
                firstName: patient.firstName,
                lastName: patient.lastName,
                dob: patient.dob,
                gender: patient.gender,
                contactInfo: patient.contactInfo,
                emergencyContact: patient.emergencyContact,
                prescriptions: {
                    create: patient.prescriptions.map(prescription => ({
                        startDate: prescription.startDate,
                        endDate: prescription.endDate,
                        doctor: prescription.doctor,
                        dosages: {
                            create: prescription.dosages.map(dosage => ({
                                sku: dosage.sku,
                                quantity: dosage.quantity,
                                frequency: dosage.frequency
                            }))
                        }
                    }))
                }
            }
        });
    }

    console.log(`Synced ${patients.length} patients and prescriptions to remote.`);
}

// Sync Remote -> Local
async function syncRemoteToLocal() {
    const remotePatients = await remotePrisma.patient.findMany({
        include: {
            medicalHistories: true,
            prescriptions: {
                include: { dosages: true }
            }
        }
    });

    for (const patient of remotePatients) {
        await localPrisma.patient.upsert({
            where: { contactInfo: patient.contactInfo },
            update: {
                firstName: patient.firstName,
                lastName: patient.lastName,
                dob: patient.dob,
                gender: patient.gender,
                contactInfo: patient.contactInfo,
                emergencyContact: patient.emergencyContact
            },
            create: {
                firstName: patient.firstName,
                lastName: patient.lastName,
                dob: patient.dob,
                gender: patient.gender,
                contactInfo: patient.contactInfo,
                emergencyContact: patient.emergencyContact
            }
        });
    }

    const remoteInventory = await remotePrisma.inventory.findMany();
    for (const invItem of remoteInventory) {
        await localPrisma.inventory.upsert({
            where: { sku: invItem.sku },
            update: {
                name: invItem.name,
                quantity: invItem.quantity,
                lowerThreshold: invItem.lowerThreshold,
                upperThreshold: invItem.upperThreshold
            },
            create: {
                sku: invItem.sku,
                name: invItem.name,
                quantity: invItem.quantity,
                lowerThreshold: invItem.lowerThreshold,
                upperThreshold: invItem.upperThreshold
            }
        });
    }

    const remotePrescriptions = await remotePrisma.prescription.findMany({
        include: { dosages: true,patient:true }
    });
    for (const prescription of remotePrescriptions) {
        await localPrisma.prescription.upsert({
            where: {prescriptionID: prescription.prescriptionID },
            update: {
                startDate: prescription.startDate,
                endDate: prescription.endDate,
                doctor: prescription.doctor
            },
            create: {
                prescriptionID: prescription.prescriptionID,
                startDate: prescription.startDate,
                endDate: prescription.endDate,
                doctor: prescription.doctor,
                patient: {
                    connect: { contactInfo: prescription.patient.contactInfo }
                },
                dosages: {
                    create: prescription.dosages.map(dosage => ({
                        sku: dosage.sku,
                        quantity: dosage.quantity,
                        frequency: dosage.frequency
                    }))
                }
            }
        });
    } 

    console.log(`Synced ${remotePatients.length} patients and prescriptions to local.`);
}


const syncUsers = async() => {
    const localUsers = await localPrisma.user.findMany();
    for (const user of localUsers) {
        await remotePrisma.user.upsert({
            where: { username: user.username },
            update: {
                password: user.password,
                role: user.role
            },
            create: {
                username: user.username,
                password: user.password,
                role: user.role
            }
        });
    }
    const remoteUsers = await remotePrisma.user.findMany();
    for (const user of remoteUsers) {
        await localPrisma.user.upsert({
            where: { username: user.username },
            update: {
                password: user.password,
                role: user.role
            },
            create: {
                username: user.username,
                password: user.password,
                role: user.role
            }
        });
    }
}

const pushInventoryItems = async() => {
    const localInventory = await localPrisma.inventory.findMany();
    for (const invItem of localInventory) {
        await remotePrisma.inventory.upsert({
            where: { sku: invItem.sku },
            update: {
                name: invItem.name,
                quantity: invItem.quantity,
                lowerThreshold: invItem.lowerThreshold,
                upperThreshold: invItem.upperThreshold
            },
            create: {
                sku: invItem.sku,
                name: invItem.name,
                quantity: invItem.quantity,
                lowerThreshold: invItem.lowerThreshold,
                upperThreshold: invItem.upperThreshold
            }
        });
    }
}

const syncSuppliers = async() => {
    const localSuppliers = await localPrisma.supplier.findMany();
    for (const supplier of localSuppliers) {
        await remotePrisma.supplier.upsert({
            where: { email: supplier.email },
            update: {
                name: supplier.name,
                email: supplier.email,
                contact: supplier.contact,
                address : supplier.address
            },
            create: {
                name: supplier.name,
                email: supplier.email,
                contact: supplier.contact,
                address : supplier.address

            }
        });
    }
    const remoteSuppliers = await remotePrisma.supplier.findMany();
    for (const supplier of remoteSuppliers) {
        await localPrisma.supplier.upsert({
            where: { email: supplier.email },
            update: {
                name: supplier.name,
                email: supplier.email,
                contact: supplier.contact,
                address: supplier.address,
            },
            create: {
                name: supplier.name,
                email: supplier.email,
                contact: supplier.contact,
                address: supplier.address,
            }
        });
    }
}

const syncPurchases = async() => {
    const localPurchases = await localPrisma.purchase.findMany({
        include: { purchaseItems: true }
    });
    for (const purchase of localPurchases) {
        await remotePrisma.purchase.upsert({
            where: { purchaseId: purchase.purchaseId },
            update: {
                supplierMail: purchase.supplierMail
            },
            create: {
                purchaseId: purchase.purchaseId,
                supplierMail: purchase.supplierMail,
                purchaseItems: {
                    create: purchase.purchaseItems.map(item => ({
                        inventoryId: item.inventoryId,
                        quantity: item.quantity,
                        costPrice: item.costPrice
                    }))
                }
            }
        });
    }

    const remotePurchases = await remotePrisma.purchase.findMany({
        include: { purchaseItems: true }
    });

    for (const purchase of remotePurchases) {
        await localPrisma.purchase.upsert({
            where: { purchaseId: purchase.purchaseId },
            update: {
                supplierMail: purchase.supplierMail
            },
            create: {
                purchaseId: purchase.purchaseId,
                supplierMail: purchase.supplierMail,
                purchaseItems: {
                    create: purchase.purchaseItems.map(item => ({
                        inventoryId: item.inventoryId,
                        quantity: item.quantity,
                        costPrice: item.costPrice
                    }))
                }
            }
        });
    }   
}


// Main Sync Function
async function main() {
    // await pushInventoryItems();
    await syncUsers();
    await syncInventoryToRemote();
    await syncPatientsToRemote();
    await syncRemoteToLocal();
    await syncSuppliers();
    await syncPurchases();

    await localPrisma.$disconnect();
    await remotePrisma.$disconnect();
}
exports.syncService = main;


