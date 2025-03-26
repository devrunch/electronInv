const express = require('express');
const LogController = require('../controllers/LogController');

const router = express.Router();

router.post('/', LogController.createLog);
router.get('/', LogController.getLogs);
router.get('/:id', LogController.getLogById);
router.put('/:id', LogController.updateLog);
router.delete('/:id', LogController.deleteLog);

module.exports = router;