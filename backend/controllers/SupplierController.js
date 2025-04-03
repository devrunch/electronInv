const { PrismaClient } = require('../../prisma/generated/remote');

const prisma = new PrismaClient();

class SupplierController {
    static async getAllSuppliers(req, res) {
        try {
            const suppliers = await prisma.supplier.findMany();
            res.status(200).json(suppliers);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch suppliers' });
        }
    }

    static async getSupplierById(req, res) {
        const { id } = req.params;
        try {
            const supplier = await prisma.supplier.findUnique({
                where: { id: parseInt(id.trim()) },
            });
            if (supplier) {
                res.status(200).json(supplier);
            } else {
                res.status(404).json({ error: 'Supplier not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch supplier' });
        }
    }

    static async createSupplier(req, res) {
        const { name, contact, email, address } = req.body;
        
        // Trim email
        const trimmedEmail = email.trim();
        
        try {
            const newSupplier = await prisma.supplier.create({
                data: { 
                    name, 
                    contact, 
                    email: trimmedEmail, 
                    address 
                },
            });
            res.status(201).json(newSupplier);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create supplier' });
        }
    }

    static async updateSupplier(req, res) {
        const { id } = req.params;
        const { name, contact, email, address } = req.body;
        
        // Trim ID and email
        const trimmedId = id.trim();
        const trimmedEmail = email ? email.trim() : email;
        
        try {
            const updatedSupplier = await prisma.supplier.update({
                where: { id: parseInt(trimmedId) },
                data: { 
                    name, 
                    contact, 
                    email: trimmedEmail, 
                    address 
                },
            });
            res.status(200).json(updatedSupplier);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update supplier' });
        }
    }

    static async deleteSupplier(req, res) {
        const { id } = req.params;
        
        // Trim ID
        const trimmedId = id.trim();
        
        try {
            await prisma.supplier.delete({
                where: { id: parseInt(trimmedId) },
            });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete supplier' });
        }
    }
}

module.exports = SupplierController;