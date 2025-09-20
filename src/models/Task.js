// src/models/Task.js
const { query } = require('../config/database');

class Task {
    // Create a new task
    static async create(taskData) {
        const { title, description, status = 'pending', deadline, user_id } = taskData;
        const text = `
            INSERT INTO tasks (title, description, status, deadline, user_id) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, title, description, status, deadline, user_id, created_at, updated_at
        `;
        const values = [title, description, status, deadline, user_id];
        
        const result = await query(text, values);
        return result.rows[0];
    }

    // Get task by ID with user details
    static async findById(id) {
        const text = `
            SELECT 
                t.id, t.title, t.description, t.status, t.deadline, t.created_at, t.updated_at,
                u.id as user_id, u.name as user_name, u.email as user_email
            FROM tasks t
            JOIN users u ON t.user_id = u.id
            WHERE t.id = $1
        `;
        const result = await query(text, [id]);
        
        if (result.rows[0]) {
            const row = result.rows[0];
            return {
                id: row.id,
                title: row.title,
                description: row.description,
                status: row.status,
                deadline: row.deadline,
                created_at: row.created_at,
                updated_at: row.updated_at,
                user: {
                    id: row.user_id,
                    name: row.user_name,
                    email: row.user_email
                }
            };
        }
        return null;
    }

    // Get all tasks with user details and optional filtering
    static async findAll(filters = {}, pagination = {}) {
        let text = `
            SELECT 
                t.id, t.title, t.description, t.status, t.deadline, t.created_at, t.updated_at,
                u.id as user_id, u.name as user_name, u.email as user_email
            FROM tasks t
            JOIN users u ON t.user_id = u.id
        `;
        
        const conditions = [];
        const values = [];
        let paramCount = 0;

        // Apply filters
        if (filters.status) {
            paramCount++;
            conditions.push(`t.status = $${paramCount}`);
            values.push(filters.status);
        }

        if (filters.deadline) {
            paramCount++;
            conditions.push(`t.deadline = $${paramCount}`);
            values.push(filters.deadline);
        }

        if (filters.user_id) {
            paramCount++;
            conditions.push(`t.user_id = $${paramCount}`);
            values.push(filters.user_id);
        }

        if (conditions.length > 0) {
            text += ' WHERE ' + conditions.join(' AND ');
        }

        text += ' ORDER BY t.created_at DESC';

        // Apply pagination
        if (pagination.limit) {
            paramCount++;
            text += ` LIMIT $${paramCount}`;
            values.push(pagination.limit);

            if (pagination.offset) {
                paramCount++;
                text += ` OFFSET $${paramCount}`;
                values.push(pagination.offset);
            }
        }

        const result = await query(text, values);
        
        return result.rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            status: row.status,
            deadline: row.deadline,
            created_at: row.created_at,
            updated_at: row.updated_at,
            user: {
                id: row.user_id,
                name: row.user_name,
                email: row.user_email
            }
        }));
    }

    // Update task
    static async update(id, taskData) {
        const updateFields = [];
        const values = [];
        let paramCount = 0;

        // Build dynamic update query
        ['title', 'description', 'status', 'deadline'].forEach(field => {
            if (taskData[field] !== undefined) {
                paramCount++;
                updateFields.push(`${field} = $${paramCount}`);
                values.push(taskData[field]);
            }
        });

        if (updateFields.length === 0) {
            throw new Error('No fields to update');
        }

        paramCount++;
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const text = `
            UPDATE tasks 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramCount}
            RETURNING id, title, description, status, deadline, user_id, created_at, updated_at
        `;

        const result = await query(text, values);
        return result.rows[0];
    }

    // Delete task
    static async delete(id) {
        const text = 'DELETE FROM tasks WHERE id = $1 RETURNING id';
        const result = await query(text, [id]);
        return result.rows[0];
    }

    // Check if task exists
    static async exists(id) {
        const text = 'SELECT 1 FROM tasks WHERE id = $1';
        const result = await query(text, [id]);
        return result.rows.length > 0;
    }

    // Get task count for pagination
    static async getCount(filters = {}) {
        let text = 'SELECT COUNT(*) FROM tasks t';
        const conditions = [];
        const values = [];
        let paramCount = 0;

        if (filters.status) {
            paramCount++;
            conditions.push(`t.status = $${paramCount}`);
            values.push(filters.status);
        }

        if (filters.deadline) {
            paramCount++;
            conditions.push(`t.deadline = $${paramCount}`);
            values.push(filters.deadline);
        }

        if (filters.user_id) {
            paramCount++;
            conditions.push(`t.user_id = $${paramCount}`);
            values.push(filters.user_id);
        }

        if (conditions.length > 0) {
            text += ' WHERE ' + conditions.join(' AND ');
        }

        const result = await query(text, values);
        return parseInt(result.rows[0].count);
    }
}

module.exports = Task;