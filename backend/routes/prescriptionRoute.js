const express = require('express');
const PrescriptionController = require('../controllers/PrescriptionController');
const {authenticateToken} = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', authenticateToken,PrescriptionController.getAllPrescriptions);
router.get('/:id', authenticateToken,PrescriptionController.getPrescriptionById);
router.post('/', authenticateToken,PrescriptionController.createPrescription);
router.put('/:id', authenticateToken,PrescriptionController.updatePrescription);
router.delete('/:id', authenticateToken,PrescriptionController.deletePrescription);
router.post('/pdf/:id', authenticateToken,PrescriptionController.generatePDF);
router.post('/email', authenticateToken,PrescriptionController.sendPrescriptionEmail);

module.exports = router;