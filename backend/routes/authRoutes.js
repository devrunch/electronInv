const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/login', AuthController.login);
router.post('/profile',authenticateToken,AuthController.profile);

module.exports = router;
