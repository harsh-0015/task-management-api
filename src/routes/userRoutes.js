// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { validateUser, validateIdParam } = require('../middleware/validation');

// POST /api/users - Create a new user
router.post('/', validateUser, UserController.createUser);

// GET /api/users - Get all users
router.get('/', UserController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', validateIdParam, UserController.getUserById);

// PUT /api/users/:id - Update user
router.put('/:id', validateIdParam, validateUser, UserController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', validateIdParam, UserController.deleteUser);

module.exports = router;