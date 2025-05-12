const { PrismaClient } = require('../../prisma/generated/remote');
const nodemailer = require('nodemailer');
const { PdfGenerator } = require('../utils/prescriptionHTML');
const { sendPrescriptionViaWhatsapp } = require('../utils/prescriptionSender');
const prisma = new PrismaClient();
const fs = require('fs');
// Email configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com', // Replace with your SMTP server
    port: 465, // Replace with your SMTP port
    secure: true,
    auth: {
        user: 'aditya@outlfy.com',
        pass: '17@Outlfy#24,'
    }
});

class PrescriptionController {
    static async getAllPrescriptions(req, res) {
        try {
            const prescriptions = await prisma.prescription.findMany({
                include: {
                    patient: true,
                    dosages: true,
                },
            });
            res.status(200).json(prescriptions);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Failed to fetch prescriptions' });
        }
    }

    static async getPrescriptionById(req, res) {
        const { id } = req.params;
        try {
            const prescription = await prisma.prescription.findUnique({
                where: { id: parseInt(id.trim()) },
                include: {
                    patient: true,
                    dosages: {
                        select: {
                            sku: true,
                            quantity: true,
                            inventory: true,
                        },
                    },
                },
            });
            if (prescription) {
                res.status(200).json(prescription);
            } else {
                res.status(404).json({ error: 'Prescription not found' });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to fetch prescription' });
        }
    }

    static async createPrescription(req, res) {
        const { patientId, dosages,  startDate, endDate, doctor,disease } = req.body;
        // Trim patientId
        const trimmedPatientId = parseInt(patientId.toString().trim());
        
        // Remove name field from each dosage object and trim SKUs
        const sanitizedDosages = dosages.map(({ name, ...rest }) => ({
            ...rest,
            sku: rest.sku.trim()
        }));
        
        for (const item of sanitizedDosages) {
            const inv = await prisma.inventory.findUnique({
                where: { sku: item.sku },
            });
            if (!inv) {
                return res.status(404).json({ error: 'Inventory item not found' });
            }
            if (inv.quantity < item.quantity) {
                return res.status(400).json({ error: 'Insufficient quantity in inventory' });
            }
        }
        try {
            let newPrescription = await prisma.prescription.create({
                data: {
                    patientId: trimmedPatientId,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    doctor,
                    disease,
                    dosages: {
                        create: sanitizedDosages,
                    },
                },
            });

            newPrescription = await prisma.prescription.findUnique({
                where: { id: newPrescription.id },
                include: {
                    patient: true,
                    dosages: {
                        include: {
                            inventory: true,
                        },
                    },
                },
            });

            // Decrement the quantity of inventory items used in skus
            for (const item of dosages) {
                await prisma.inventory.update({
                    where: { sku: item.sku },
                    data: {
                        quantity: {
                            decrement: item.quantity,
                        },
                    },
                });
            }
            
            for (const item of dosages) {
                await prisma.inventoryLog.create({
                    data: {
                        inventoryId: item.sku,
                        quantity: item.quantity,
                        type: 'OUT',
                        userId: req.user.username,
                    },
                });
            }

            // Changed from PdfGenerator to ImageGenerator and .pdf to .png
            const imageFileName = `prescription_${newPrescription.patient.firstName}_${newPrescription.prescriptionID}.pdf`;
            await PdfGenerator(newPrescription, imageFileName);
            await sendPrescriptionViaWhatsapp(
                newPrescription.patient.contactInfo,
                [newPrescription.patient.firstName],
                `https://aditya.outlfy.com/static/images/prescription_${newPrescription.patient.firstName}_${newPrescription.prescriptionID}.pdf`)
            res.status(201).json(newPrescription);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to create prescription' });
        }
    }

    static async sendPrescriptionWhatsapp(req, res) {
        const { id } = req.params;
        const prescription = await prisma.prescription.findUnique({
            where: { id: parseInt(id.trim()) },
            include: {
                patient: true,
            },
        });
        if (!prescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }
        await sendPrescriptionViaWhatsapp(
            prescription.patient.contactInfo,
            [prescription.patient.firstName],
            `https://aditya.outlfy.com/static/images/prescription_${prescription.patient.firstName}_${prescription.prescriptionID}.pdf`)
        res.status(200).json({ message: 'Prescription sent successfully' });
    }

    static async updatePrescription(req, res) {
        const { id } = req.params;
        const { dosage, startDate, endDate, doctor } = req.body;
        console.log(dosage);
        
        // Trim SKUs in dosage objects
        const trimmedDosage = dosage.map(item => ({
            ...item,
            sku: item.sku.trim()
        }));
        
        try {
            const updatedPrescription = await prisma.prescription.update({
                where: { id: parseInt(id.trim()) },
                data: {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    doctor,
                    dosages: {
                        deleteMany: {}, // Delete existing dosages
                        create: trimmedDosage, // Create new dosages
                    },
                },
            });
            res.status(200).json(updatedPrescription);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to update prescription' });
        }
    }

    static async deletePrescription(req, res) {
        const { id } = req.params;
        try {
            await prisma.prescription.delete({
                where: { id: parseInt(id.trim()) },
            });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete prescription' });
        }
    }


    static async revokePrescription(req, res) {
        const { id } = req.params;
        try {
            const prescription = await prisma.prescription.findUnique({
                where: { id: parseInt(id.trim()) },
                include: {
                    dosages: true,
                },
            });

            if (!prescription) {
                return res.status(404).json({ error: 'Prescription not found' });
            }

            // Increment the quantity of inventory items used in skus
            for (const item of prescription.dosage) {
                await prisma.inventory.update({
                    where: { sku: item.sku.trim() },
                    data: {
                        quantity: {
                            increment: item.quantity,
                        },
                    },
                });
            }

            await prisma.prescription.delete({
                where: { id: parseInt(id.trim()) },
            });

            res.status(204).send();
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to revoke prescription' });
        }
    }

    static async sendPrescriptionEmail(req, res) {
        const { id } = req.params;
        try {
            const prescription = await prisma.prescription.findUnique({
                where: { id: parseInt(id.trim()) },
                include: {
                    patient: true,
                },
            });
            if (!prescription) {
                return res.status(404).json({ error: 'Prescription not found' });
            }
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'No email address provided' });
            }

            // Get the image buffer from the saved file
            const filePath = `uploads/images/prescription_${prescription.patient.firstName}_${prescription.prescriptionID}.pdf`;
            const buffer = await fs.promises.readFile(filePath);


            // Email content
            const mailOptions = {
                from: 'aditya@outlfy.com',
                to: email,
                subject: `Prescription from श्री जी सेवा संस्थान`,
                html: `
                    <h2>Your Prescription</h2>
                    <p>Please find your prescription attached to this email.</p>
                `,
                attachments: [{
                    filename: `prescription_${new Date().toLocaleDateString()}.pdf`,
                    content: buffer
                }]
            };

            // Send email
            await transporter.sendMail(mailOptions);

            res.status(200).json({ 
                message: 'Prescription sent successfully',
                email: email
            });

        } catch (error) {
            console.error('Error sending prescription email:', error);
            res.status(500).json({ 
                error: 'Failed to send prescription email',
                details: error.message 
            });
        }
    }
}

module.exports = PrescriptionController;