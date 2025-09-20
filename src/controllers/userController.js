// src/controllers/userController.js
const User = require('../models/User');

class UserController {
    // Create a new user
    static async createUser(req, res) {
        try {
            const userData = req.body;
            const user = await User.create(userData);

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: user
            });
        } catch (error) {
            console.error('Create user error:', error.message);
            
            if (error.message === 'Email already exists') {
                return res.status(409).json({
                    success: false,
                    message: 'A user with this email already exists'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error while creating user'
            });
        }
    }

    // Get all users
    static async getAllUsers(req, res) {
        try {
            const users = await User.findAll();

            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: users,
                count: users.length
            });
        } catch (error) {
            console.error('Get all users error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching users'
            });
        }
    }

    // Get user by ID
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: user
            });
        } catch (error) {
            console.error('Get user by ID error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching user'
            });
        }
    }

    // Update user
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const userData = req.body;

            // Check if user exists
            const existingUser = await User.findById(id);
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const updatedUser = await User.update(id, userData);

            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: updatedUser
            });
        } catch (error) {
            console.error('Update user error:', error.message);
            
            if (error.message === 'Email already exists') {
                return res.status(409).json({
                    success: false,
                    message: 'A user with this email already exists'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error while updating user'
            });
        }
    }

    // Delete user
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;

            // Check if user exists
            const existingUser = await User.findById(id);
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            await User.delete(id);

            res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Delete user error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error while deleting user'
            });
        }
    }
}

module.exports = UserController;