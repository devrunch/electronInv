const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/InventoryController');
const {authenticateToken} = require('../middlewares/authMiddleware');
router.get('/', authenticateToken ,InventoryController.getAllInventory);
router.post('/', authenticateToken ,InventoryController.createInventory);
router.put('/:id',  authenticateToken ,InventoryController.updateInventory);
router.delete('/:id',  authenticateToken ,InventoryController.deleteInventory);
router.get('/csv',  authenticateToken ,InventoryController.exportInventoryToCSV);
router.get('/search', authenticateToken , InventoryController.quickSearch);
router.get('/lowstock', authenticateToken , InventoryController.getLowStockInventory);

module.exports = router;
