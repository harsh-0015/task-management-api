// src/controllers/taskController.js
const Task = require('../models/Task');
const User = require('../models/User');

class TaskController {
    // Create a new task
    static async createTask(req, res) {
        try {
            const taskData = req.body;

            // Check if assigned user exists
            const userExists = await User.exists(taskData.user_id);
            if (!userExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Assigned user not found'
                });
            }

            const task = await Task.create(taskData);

            res.status(201).json({
                success: true,
                message: 'Task created successfully',
                data: task
            });
        } catch (error) {
            console.error('Create task error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error while creating task'
            });
        }
    }

    // Get all tasks with filtering and pagination
    static async getAllTasks(req, res) {
        try {
            const { status, deadline, user_id, page = 1, limit = 10 } = req.query;

            // Build filters object
            const filters = {};
            if (status) filters.status = status;
            if (deadline) filters.deadline = deadline;
            if (user_id) filters.user_id = parseInt(user_id);

            // Build pagination object
            const pagination = {
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            };

            // Get tasks and total count
            const [tasks, totalCount] = await Promise.all([
                Task.findAll(filters, pagination),
                Task.getCount(filters)
            ]);

            // Calculate pagination info
            const totalPages = Math.ceil(totalCount / pagination.limit);
            const hasNextPage = parseInt(page) < totalPages;
            const hasPrevPage = parseInt(page) > 1;

            res.status(200).json({
                success: true,
                message: 'Tasks retrieved successfully',
                data: tasks,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCount,
                    hasNextPage,
                    hasPrevPage,
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get all tasks error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching tasks'
            });
        }
    }

    // Get task by ID
    static async getTaskById(req, res) {
        try {
            const { id } = req.params;
            const task = await Task.findById(id);

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Task retrieved successfully',
                data: task
            });
        } catch (error) {
            console.error('Get task by ID error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching task'
            });
        }
    }

    // Update task
    static async updateTask(req, res) {
        try {
            const { id } = req.params;
            const taskData = req.body;

            // Check if task exists
            const existingTask = await Task.exists(id);
            if (!existingTask) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            const updatedTask = await Task.update(id, taskData);

            // Get the complete task with user details
            const completeTask = await Task.findById(id);

            res.status(200).json({
                success: true,
                message: 'Task updated successfully',
                data: completeTask
            });
        } catch (error) {
            console.error('Update task error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error while updating task'
            });
        }
    }

    // Delete task
    static async deleteTask(req, res) {
        try {
            const { id } = req.params;

            // Check if task exists
            const existingTask = await Task.exists(id);
            if (!existingTask) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }

            await Task.delete(id);

            res.status(200).json({
                success: true,
                message: 'Task deleted successfully'
            });
        } catch (error) {
            console.error('Delete task error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error while deleting task'
            });
        }
    }

    // Get tasks by user ID
    static async getTasksByUser(req, res) {
        try {
            const { userId } = req.params;
            const { status, deadline, page = 1, limit = 10 } = req.query;

            // Check if user exists
            const userExists = await User.exists(userId);
            if (!userExists) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Build filters object
            const filters = { user_id: parseInt(userId) };
            if (status) filters.status = status;
            if (deadline) filters.deadline = deadline;

            // Build pagination object
            const pagination = {
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            };

            // Get tasks and total count
            const [tasks, totalCount] = await Promise.all([
                Task.findAll(filters, pagination),
                Task.getCount(filters)
            ]);

            // Calculate pagination info
            const totalPages = Math.ceil(totalCount / pagination.limit);
            const hasNextPage = parseInt(page) < totalPages;
            const hasPrevPage = parseInt(page) > 1;

            res.status(200).json({
                success: true,
                message: 'User tasks retrieved successfully',
                data: tasks,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCount,
                    hasNextPage,
                    hasPrevPage,
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get tasks by user error:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching user tasks'
            });
        }
    }
}

module.exports = TaskController;