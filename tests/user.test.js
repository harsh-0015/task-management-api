// tests/user.test.js
const request = require('supertest');
const app = require('../src/app');

// Test data - Use unique emails for each test run
const testUser = {
    name: 'John Doe',
    email: `john.doe.${Date.now()}@example.com`
};

const updatedUser = {
    name: 'John Smith',
    email: `john.smith.${Date.now()}@example.com`
};

let createdUserId;

describe('User API Endpoints', () => {
    
    // Test POST /api/users - Create user
    describe('POST /api/users', () => {
        test('Should create a new user with valid data', async () => {
            const response = await request(app)
                .post('/api/users')
                .send(testUser)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User created successfully');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe(testUser.name);
            expect(response.body.data.email).toBe(testUser.email.toLowerCase());
            expect(response.body.data).toHaveProperty('created_at');

            // Store the created user ID for other tests
            createdUserId = response.body.data.id;
        });

        test('Should reject user creation with duplicate email', async () => {
            await request(app)
                .post('/api/users')
                .send(testUser)
                .expect(409);
        });

        test('Should reject user creation with invalid email', async () => {
            const invalidUser = {
                name: 'Jane Doe',
                email: 'invalid-email'
            };

            const response = await request(app)
                .post('/api/users')
                .send(invalidUser)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContain('Email must be a valid email address');
        });

        test('Should reject user creation with missing required fields', async () => {
            const incompleteUser = {
                name: 'Jane Doe'
                // Missing email
            };

            const response = await request(app)
                .post('/api/users')
                .send(incompleteUser)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContain('Email is required and must be a string');
        });

        test('Should reject user creation with empty name', async () => {
            const invalidUser = {
                name: '',
                email: 'test@example.com'
            };

            const response = await request(app)
                .post('/api/users')
                .send(invalidUser)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContain('Name is required and must be a non-empty string');
        });
    });

    // Test GET /api/users - Get all users
    describe('GET /api/users', () => {
        test('Should retrieve all users', async () => {
            const response = await request(app)
                .get('/api/users')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Users retrieved successfully');
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body).toHaveProperty('count');
        });
    });

    // Test GET /api/users/:id - Get user by ID
    describe('GET /api/users/:id', () => {
        test('Should retrieve user by valid ID', async () => {
            const response = await request(app)
                .get(`/api/users/${createdUserId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User retrieved successfully');
            expect(response.body.data.id).toBe(createdUserId);
            expect(response.body.data.name).toBe(testUser.name);
        });

        test('Should return 404 for non-existent user ID', async () => {
            const response = await request(app)
                .get('/api/users/99999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User not found');
        });

        test('Should return 400 for invalid user ID', async () => {
            const response = await request(app)
                .get('/api/users/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid ID parameter');
        });
    });

    // Test PUT /api/users/:id - Update user
    describe('PUT /api/users/:id', () => {
        test('Should update user with valid data', async () => {
            const response = await request(app)
                .put(`/api/users/${createdUserId}`)
                .send(updatedUser)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User updated successfully');
            expect(response.body.data.id).toBe(createdUserId);
            expect(response.body.data.name).toBe(updatedUser.name);
            expect(response.body.data.email).toBe(updatedUser.email.toLowerCase());
        });

        test('Should return 404 for updating non-existent user', async () => {
            const response = await request(app)
                .put('/api/users/99999')
                .send(updatedUser)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User not found');
        });

        test('Should reject update with invalid email', async () => {
            const invalidUpdate = {
                name: 'Valid Name',
                email: 'invalid-email'
            };

            const response = await request(app)
                .put(`/api/users/${createdUserId}`)
                .send(invalidUpdate)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContain('Email must be a valid email address');
        });
    });

    // Test DELETE /api/users/:id - Delete user
    describe('DELETE /api/users/:id', () => {
        test('Should return 404 for deleting non-existent user', async () => {
            const response = await request(app)
                .delete('/api/users/99999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User not found');
        });

        test('Should delete user with valid ID', async () => {
            const response = await request(app)
                .delete(`/api/users/${createdUserId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User deleted successfully');

            // Verify user is actually deleted
            await request(app)
                .get(`/api/users/${createdUserId}`)
                .expect(404);
        });
    });
});