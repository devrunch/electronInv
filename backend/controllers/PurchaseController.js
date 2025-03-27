const { PrismaClient } = require('../../prisma/generated/remote');
const prisma = new PrismaClient();

// Get all purchases with optional search and filter
exports.getPurchases = async (req, res) => {
    try {
        const { search, filter } = req.query;
        let where = {};

        if (search) {
            where.OR = [
                { supplier: { name: { contains: search, mode: 'insensitive' } } },
                { supplierMail: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (filter) {
            Object.assign(where, JSON.parse(filter)); // Ensure filter is passed as a JSON string
        }

        const purchases = await prisma.purchase.findMany({
            where,
            include: { supplier: true, purchaseItems: true },
        });

        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single purchase
exports.getPurchase = async (req, res) => {
    try {
        const { id } = req.params;

        const purchase = await prisma.purchase.findUnique({
            where: { purchaseId: (id) },
            include: { supplier: true, purchaseItems: true },
        });

        res.status(200).json(purchase);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};


// Add a new purchase
exports.addPurchase = async (req, res) => {
    try {
        const { supplierMail, purchaseItems } = req.body;

        const purchase = await prisma.purchase.create({
            data: {
                supplierMail,
                purchaseItems: {
                    create: purchaseItems.map(item => ({
                        inventoryId: item.inventoryId,
                        quantity: item.quantity,
                        costPrice: item.costPrice
                    }))
                }
            },
            include: { purchaseItems: true },
        });

        for (let item of purchaseItems) {
            await prisma.inventory.update({
                where: { id: item.inventoryId },
                data: {
                    quantity: { increment: item.quantity }
                }
            });
            await prisma.inventoryLog.create({
                data: {
                    quantity: item.quantity,
                    type: 'IN',
                    inventory: {
                        connect: {
                            sku: item.inventoryId
                        }
                    },
                    user: {
                        connect: {
                            username: req.user.username
                        }
                    }
                }
            });
        }

        res.status(201).json(purchase);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a purchase
exports.updatePurchase = async (req, res) => {
    try {
        const { id } = req.params;
        const { supplierMail, purchaseItems } = req.body;

        const purchase = await prisma.purchase.update({
            where: { purchaseId: id },
            data: {
                supplierMail,  // Directly updating a scalar field
                purchaseItems: purchaseItems
                    ? {
                        updateMany: purchaseItems.map(item => ({
                            where: { id: item.id },
                            data: {
                                inventoryId: item.inventoryId,
                                quantity: item.quantity,
                                costPrice: item.costPrice
                            }
                        }))
                    }
                    : undefined
            },
            include: { purchaseItems: true },
        });

        res.status(200).json(purchase);
    } catch (error) {
        console.error("Error updating purchase:", error);
        res.status(400).json({ message: error.message });
    }
};


// Delete a purchase
exports.deletePurchase = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.purchaseItem.deleteMany({ where: { purchaseId: Number(id) } }); // Delete related items first

        const purchase = await prisma.purchase.delete({
            where: { id: Number(id) },
        });

        res.status(200).json({ message: 'Purchase deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
