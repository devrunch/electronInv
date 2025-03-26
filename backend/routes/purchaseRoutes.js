const express = require('express');
const purchaseController = require('../controllers/PurchaseController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Get all purchases with optional search and filter
router.get('/',authenticateToken, purchaseController.getPurchases);

// Get a single purchase
router.get('/:id',authenticateToken, purchaseController.getPurchase);

// Add a new purchase
router.post('/',authenticateToken, purchaseController.addPurchase);

// Update a purchase
router.put('/:id',authenticateToken, purchaseController.updatePurchase);

// Delete a purchase
router.delete('/:id',authenticateToken, purchaseController.deletePurchase);

module.exports = router;