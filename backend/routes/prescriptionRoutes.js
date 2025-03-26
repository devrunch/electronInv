const express = require('express');
const router = express.Router();
const PrescriptionController = require('../controllers/PrescriptionController');
const authMiddleware = require('../middleware/auth');

// Route for sending prescription via email
router.post('/email', 
    authMiddleware,
    PrescriptionController.sendPrescriptionEmail
);

module.exports = router; 