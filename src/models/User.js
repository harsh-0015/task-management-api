// src/models/User.js
const { query } = require('../config/database');

class User {
    // Create a new user
    static async create(userData) {
        const { name, email } = userData;
        const text = `
            INSERT INTO users (name, email) 
            VALUES ($1, $2) 
            RETURNING id, name, email, created_at, updated_at
        `;
        const values = [name, email];
        
        try {
            const result = await query(text, values);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique constraint violation
                throw new Error('Email already exists');
            }
            throw error;
        }
    }

    // Get user by ID
    static async findById(id) {
        const text = 'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1';
        const result = await query(text, [id]);
        return result.rows[0];
    }

    // Get user by email
    static async findByEmail(email) {
        const text = 'SELECT id, name, email, created_at, updated_at FROM users WHERE email = $1';
        const result = await query(text, [email]);
        return result.rows[0];
    }

    // Get all users
    static async findAll() {
        const text = 'SELECT id, name, email, created_at, updated_at FROM users ORDER BY created_at DESC';
        const result = await query(text);
        return result.rows;
    }

    // Update user
    static async update(id, userData) {
        const { name, email } = userData;
        const text = `
            UPDATE users 
            SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $3 
            RETURNING id, name, email, created_at, updated_at
        `;
        const values = [name, email, id];
        
        try {
            const result = await query(text, values);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique constraint violation
                throw new Error('Email already exists');
            }
            throw error;
        }
    }

    // Delete user
    static async delete(id) {
        const text = 'DELETE FROM users WHERE id = $1 RETURNING id';
        const result = await query(text, [id]);
        return result.rows[0];
    }

    // Check if user exists
    static async exists(id) {
        const text = 'SELECT 1 FROM users WHERE id = $1';
        const result = await query(text, [id]);
        return result.rows.length > 0;
    }
}

module.exports = User;