const { PrismaClient } = require('../../prisma/generated/local');

const prisma = new PrismaClient();

class LogController {
    static async createLog(req, res) {
        const { inventoryId, userId, type, quantity } = req.body;

        try {
            const log = await prisma.inventoryLog.create({
                data: {
                    inventoryId,
                    userId,
                    type,
                    quantity,
                },
            });
            res.status(201).json(log);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create log' });
        }
    }

    static async getLogs(req, res) {
        try {
            const logs = await prisma.inventoryLog.findMany({
                include: {
                    inventory: true,
                    user: true,
                },
            });
            res.status(200).json(logs);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to retrieve logs' });
        }
    }

    static async getLogById(req, res) {
        const { id } = req.params;

        try {
            const log = await prisma.inventoryLog.findUnique({
                where: { id: parseInt(id) },
                include: {
                    inventory: true,
                    user: true,
                },
            });

            if (!log) {
                return res.status(404).json({ error: 'Log not found' });
            }

            res.status(200).json(log);
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve log' });
        }
    }

    static async updateLog(req, res) {
        const { id } = req.params;
        const { inventoryId, userId, type, quantity, synced } = req.body;

        try {
            const log = await prisma.inventoryLog.update({
                where: { id: parseInt(id) },
                data: {
                    inventoryId,
                    userId,
                    type,
                    quantity,
                    synced,
                },
            });
            res.status(200).json(log);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update log' });
        }
    }

    static async deleteLog(req, res) {
        const { id } = req.params;

        try {
            await prisma.inventoryLog.delete({
                where: { id: parseInt(id) },
            });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete log' });
        }
    }
}

module.exports = LogController;