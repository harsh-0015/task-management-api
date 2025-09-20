// src/utils/helpers.js

/**
 * Format date to YYYY-MM-DD format
 * @param {Date} date - Date object to format
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
    if (!date || !(date instanceof Date)) {
        return null;
    }
    return date.toISOString().split('T')[0];
};

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} - Parsed Date object or null if invalid
 */
const parseDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
};

/**
 * Check if a date is in the past
 * @param {string|Date} date - Date to check
 * @returns {boolean} - True if date is in the past
 */
const isPastDate = (date) => {
    const checkDate = typeof date === 'string' ? parseDate(date) : date;
    if (!checkDate) return false;
    return checkDate < new Date();
};

/**
 * Check if a date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} - True if date is today
 */
const isToday = (date) => {
    const checkDate = typeof date === 'string' ? parseDate(date) : date;
    if (!checkDate) return false;
    const today = new Date();
    return formatDate(checkDate) === formatDate(today);
};

/**
 * Get days until deadline
 * @param {string|Date} deadline - Deadline date
 * @returns {number|null} - Number of days until deadline (negative if past)
 */
const getDaysUntilDeadline = (deadline) => {
    const deadlineDate = typeof deadline === 'string' ? parseDate(deadline) : deadline;
    if (!deadlineDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const timeDiff = deadlineDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Sanitize string by trimming and removing extra spaces
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/\s+/g, ' ');
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
const capitalizeFirst = (str) => {
    if (typeof str !== 'string' || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Generate pagination metadata
 * @param {number} currentPage - Current page number
 * @param {number} limit - Items per page
 * @param {number} totalCount - Total number of items
 * @returns {object} - Pagination metadata
 */
const generatePaginationMeta = (currentPage, limit, totalCount) => {
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;
    
    return {
        currentPage: parseInt(currentPage),
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit),
        offset: (currentPage - 1) * limit
    };
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} - Validated and normalized pagination params
 */
const normalizePagination = (page = 1, limit = 10) => {
    const normalizedPage = Math.max(1, parseInt(page) || 1);
    const normalizedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    
    return {
        page: normalizedPage,
        limit: normalizedLimit,
        offset: (normalizedPage - 1) * normalizedLimit
    };
};

/**
 * Create standardized API response
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {any} data - Response data
 * @param {object} meta - Additional metadata
 * @returns {object} - Standardized response object
 */
const createResponse = (success, message, data = null, meta = {}) => {
    const response = {
        success,
        message
    };
    
    if (data !== null) {
        response.data = data;
    }
    
    if (Object.keys(meta).length > 0) {
        Object.assign(response, meta);
    }
    
    return response;
};

/**
 * Create error response
 * @param {string} message - Error message
 * @param {array} errors - Array of specific errors
 * @returns {object} - Error response object
 */
const createErrorResponse = (message, errors = []) => {
    const response = {
        success: false,
        message
    };
    
    if (errors.length > 0) {
        response.errors = errors;
    }
    
    return response;
};

/**
 * Log API request for debugging
 * @param {object} req - Express request object
 * @param {string} action - Action being performed
 */
const logRequest = (req, action) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${action}`);
        if (Object.keys(req.body).length > 0) {
            console.log('Body:', req.body);
        }
        if (Object.keys(req.query).length > 0) {
            console.log('Query:', req.query);
        }
    }
};

module.exports = {
    formatDate,
    parseDate,
    isPastDate,
    isToday,
    getDaysUntilDeadline,
    sanitizeString,
    capitalizeFirst,
    generatePaginationMeta,
    normalizePagination,
    createResponse,
    createErrorResponse,
    logRequest
};