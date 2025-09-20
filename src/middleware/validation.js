// src/middleware/validation.js

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valid task statuses
const validStatuses = ['pending', 'in_progress', 'completed'];

// Validation helper functions
const isValidEmail = (email) => emailRegex.test(email);
const isValidStatus = (status) => validStatuses.includes(status);
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

// User validation middleware
const validateUser = (req, res, next) => {
    const { name, email } = req.body;
    const errors = [];

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Name is required and must be a non-empty string');
    } else if (name.trim().length > 100) {
        errors.push('Name must be less than 100 characters');
    }

    // Validate email
    if (!email || typeof email !== 'string') {
        errors.push('Email is required and must be a string');
    } else if (!isValidEmail(email.trim())) {
        errors.push('Email must be a valid email address');
    } else if (email.trim().length > 255) {
        errors.push('Email must be less than 255 characters');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Trim whitespace
    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();
    
    next();
};

// Task creation validation middleware
const validateTask = (req, res, next) => {
    const { title, description, status, deadline, user_id } = req.body;
    const errors = [];

    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Title is required and must be a non-empty string');
    } else if (title.trim().length > 200) {
        errors.push('Title must be less than 200 characters');
    }

    // Validate description (optional)
    if (description !== undefined) {
        if (typeof description !== 'string') {
            errors.push('Description must be a string');
        } else if (description.length > 1000) {
            errors.push('Description must be less than 1000 characters');
        }
    }

    // Validate status (optional)
    if (status !== undefined) {
        if (typeof status !== 'string' || !isValidStatus(status)) {
            errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
        }
    }

    // Validate deadline (optional)
    if (deadline !== undefined) {
        if (!isValidDate(deadline)) {
            errors.push('Deadline must be a valid date in YYYY-MM-DD format');
        }
    }

    // Validate user_id
    if (!user_id) {
        errors.push('User ID is required');
    } else if (!Number.isInteger(Number(user_id)) || Number(user_id) <= 0) {
        errors.push('User ID must be a positive integer');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Clean up data
    req.body.title = title.trim();
    if (description !== undefined) {
        req.body.description = description.trim() || null;
    }
    req.body.user_id = parseInt(user_id);

    next();
};

// Task update validation middleware
const validateTaskUpdate = (req, res, next) => {
    const { title, description, status, deadline } = req.body;
    const errors = [];

    // At least one field should be provided for update
    if (!title && !description && !status && !deadline) {
        errors.push('At least one field (title, description, status, deadline) must be provided for update');
    }

    // Validate title (if provided)
    if (title !== undefined) {
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            errors.push('Title must be a non-empty string');
        } else if (title.trim().length > 200) {
            errors.push('Title must be less than 200 characters');
        }
    }

    // Validate description (if provided)
    if (description !== undefined) {
        if (typeof description !== 'string') {
            errors.push('Description must be a string');
        } else if (description.length > 1000) {
            errors.push('Description must be less than 1000 characters');
        }
    }

    // Validate status (if provided)
    if (status !== undefined) {
        if (typeof status !== 'string' || !isValidStatus(status)) {
            errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
        }
    }

    // Validate deadline (if provided)
    if (deadline !== undefined) {
        if (!isValidDate(deadline)) {
            errors.push('Deadline must be a valid date in YYYY-MM-DD format');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Clean up provided data
    if (title !== undefined) {
        req.body.title = title.trim();
    }
    if (description !== undefined) {
        req.body.description = description.trim() || null;
    }

    next();
};

// Validate query parameters for filtering and pagination
const validateQueryParams = (req, res, next) => {
    const { status, deadline, page, limit, user_id } = req.query;
    const errors = [];

    // Validate status filter
    if (status && !isValidStatus(status)) {
        errors.push(`Status filter must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate deadline filter
    if (deadline && !isValidDate(deadline)) {
        errors.push('Deadline filter must be a valid date in YYYY-MM-DD format');
    }

    // Validate user_id filter
    if (user_id && (!Number.isInteger(Number(user_id)) || Number(user_id) <= 0)) {
        errors.push('User ID filter must be a positive integer');
    }

    // Validate pagination parameters
    if (page && (!Number.isInteger(Number(page)) || Number(page) <= 0)) {
        errors.push('Page must be a positive integer');
    }

    if (limit && (!Number.isInteger(Number(limit)) || Number(limit) <= 0 || Number(limit) > 100)) {
        errors.push('Limit must be a positive integer between 1 and 100');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid query parameters',
            errors
        });
    }

    next();
};

// Validate ID parameter
const validateIdParam = (req, res, next) => {
    const { id } = req.params;
    
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID parameter. ID must be a positive integer'
        });
    }

    req.params.id = parseInt(id);
    next();
};

module.exports = {
    validateUser,
    validateTask,
    validateTaskUpdate,
    validateQueryParams,
    validateIdParam,
    validStatuses
};