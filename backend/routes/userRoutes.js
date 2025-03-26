const express = require('express');
const userController = require('../controllers/userController');
const {authenticateToken} = require('../middlewares/authMiddleware');
const router = express.Router();

// Create a new user
router.post('/',authenticateToken, userController.createUser);

// Get all users
router.get('/', authenticateToken,userController.getUsers);

// Get a single user by ID
router.get('/:id', authenticateToken,userController.getUserById);

// Update a user by ID
router.put('/:id',authenticateToken, userController.updateUser);

// Delete a user by ID
router.delete('/:id',authenticateToken, userController.deleteUser);

module.exports = router;