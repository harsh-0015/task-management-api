// src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const { 
    validateTask, 
    validateTaskUpdate, 
    validateIdParam, 
    validateQueryParams 
} = require('../middleware/validation');

// POST /api/tasks - Create a new task
router.post('/', validateTask, TaskController.createTask);

// GET /api/tasks - Get all tasks with optional filtering and pagination
router.get('/', validateQueryParams, TaskController.getAllTasks);

// GET /api/tasks/:id - Get task by ID
router.get('/:id', validateIdParam, TaskController.getTaskById);

// PUT /api/tasks/:id - Update task
router.put('/:id', validateIdParam, validateTaskUpdate, TaskController.updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', validateIdParam, TaskController.deleteTask);

// GET /api/tasks/user/:userId - Get tasks by user ID
router.get('/user/:userId', 
    (req, res, next) => {
        // Validate userId parameter
        const { userId } = req.params;
        if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID parameter. User ID must be a positive integer'
            });
        }
        req.params.userId = parseInt(userId);
        next();
    },
    validateQueryParams, 
    TaskController.getTasksByUser
);

module.exports = router;