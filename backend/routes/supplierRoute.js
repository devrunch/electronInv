const express = require('express');
const SupplierController = require('../controllers/SupplierController');
const {authenticateToken} = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', authenticateToken,SupplierController.getAllSuppliers);
router.get('/:id', authenticateToken,SupplierController.getSupplierById);
router.post('/', authenticateToken,SupplierController.createSupplier);
router.put('/:id', authenticateToken,SupplierController.updateSupplier);
router.delete('/:id', authenticateToken,SupplierController.deleteSupplier);

module.exports = router;