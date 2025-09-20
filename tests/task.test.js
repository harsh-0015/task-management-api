// tests/task.test.js
const request = require('supertest');
const app = require('../src/app');

// Test data
let testUserId;
let testTaskId;

const testUser = {
    name: 'Test User',
    email: `test.user.${Date.now()}@example.com`
};

const testTask = {
    title: 'Test Task',
    description: 'This is a test task',
    status: 'pending',
    deadline: '2024-12-31'
};

describe('Task API Endpoints', () => {

    // Setup: Create a test user first
    beforeAll(async () => {
        const userResponse = await request(app)
            .post('/api/users')
            .send(testUser);
        
        testUserId = userResponse.body.data.id;
        testTask.user_id = testUserId;
    });

    // Cleanup: Delete test user after all tests
    afterAll(async () => {
        if (testUserId) {
            await request(app).delete(`/api/users/${testUserId}`);
        }
    });

    // Test POST /api/tasks - Create task
    describe('POST /api/tasks', () => {
        test('Should create a new task with valid data', async () => {
            const response = await request(app)
                .post('/api/tasks')
                .send(testTask)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Task created successfully');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.title).toBe(testTask.title);
            expect(response.body.data.description).toBe(testTask.description);
            expect(response.body.data.status).toBe(testTask.status);
            expect(response.body.data.user_id).toBe(testUserId);

            // Store the created task ID for other tests
            testTaskId = response.body.data.id;
        });

        test('Should reject task creation with non-existent user', async () => {
            const invalidTask = {
                ...testTask,
                user_id: 99999
            };

            const response = await request(app)
                .post('/api/tasks')
                .send(invalidTask)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Assigned user not found');
        });

        test('Should reject task creation with missing required fields', async () => {
            const incompleteTask = {
                description: 'Task without title',
                user_id: testUserId
                // Missing title
            };

            const response = await request(app)
                .post('/api/tasks')
                .send(incompleteTask)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContain('Title is required and must be a non-empty string');
        });

        test('Should reject task creation with invalid status', async () => {
            const invalidTask = {
                ...testTask,
                status: 'invalid_status'
            };

            const response = await request(app)
                .post('/api/tasks')
                .send(invalidTask)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContain('Status must be one of: pending, in_progress, completed');
        });

        test('Should reject task creation with invalid deadline format', async () => {
            const invalidTask = {
                ...testTask,
                deadline: 'invalid-date'
            };

            const response = await request(app)
                .post('/api/tasks')
                .send(invalidTask)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContain('Deadline must be a valid date in YYYY-MM-DD format');
        });

        test('Should create task with minimal required data', async () => {
            const minimalTask = {
                title: 'Minimal Task',
                user_id: testUserId
            };

            const response = await request(app)
                .post('/api/tasks')
                .send(minimalTask)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe(minimalTask.title);
            expect(response.body.data.status).toBe('pending'); // Default status
            expect(response.body.data.description).toBeNull();
        });
    });

    // Test GET /api/tasks - Get all tasks
    describe('GET /api/tasks', () => {
        test('Should retrieve all tasks with user details', async () => {
            const response = await request(app)
                .get('/api/tasks')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Tasks retrieved successfully');
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body).toHaveProperty('pagination');
            
            // Check if user details are included
            const task = response.body.data[0];
            expect(task).toHaveProperty('user');
            expect(task.user).toHaveProperty('id');
            expect(task.user).toHaveProperty('name');
            expect(task.user).toHaveProperty('email');
        });

        test('Should filter tasks by status', async () => {
            const response = await request(app)
                .get('/api/tasks?status=pending')
                .expect(200);

            expect(response.body.success).toBe(true);
            response.body.data.forEach(task => {
                expect(task.status).toBe('pending');
            });
        });

        test('Should handle pagination parameters', async () => {
            const response = await request(app)
                .get('/api/tasks?page=1&limit=5')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.pagination.currentPage).toBe(1);
            expect(response.body.pagination.limit).toBe(5);
            expect(response.body.data.length).toBeLessThanOrEqual(5);
        });

        test('Should reject invalid status filter', async () => {
            const response = await request(app)
                .get('/api/tasks?status=invalid_status')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContain('Status filter must be one of: pending, in_progress, completed');
        });
    });

    // Test GET /api/tasks/:id - Get task by ID
    describe('GET /api/tasks/:id', () => {
        test('Should retrieve task by valid ID with user details', async () => {
            const response = await request(app)
                .get(`/api/tasks/${testTaskId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Task retrieved successfully');
            expect(response.body.data.id).toBe(testTaskId);
            expect(response.body.data.title).toBe(testTask.title);
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.user.id).toBe(testUserId);
        });

        test('Should return 404 for non-existent task ID', async () => {
            const response = await request(app)
                .get('/api/tasks/99999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Task not found');
        });

        test('Should return 400 for invalid task ID', async () => {
            const response = await request(app)
                .get('/api/tasks/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid ID parameter');
        });
    });

    // Test PUT /api/tasks/:id - Update task
    describe('PUT /api/tasks/:id', () => {
        test('Should update task with valid data', async () => {
            const updateData = {
                title: 'Updated Task Title',
                status: 'in_progress'
            };

            const response = await request(app)
                .put(`/api/tasks/${testTaskId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Task updated successfully');
            expect(response.body.data.title).toBe(updateData.title);
            expect(response.body.data.status).toBe(updateData.status);
        });

        test('Should return 404 for updating non-existent task', async () => {
            const updateData = {
                title: 'Updated Title'
            };

            const response = await request(app)
                .put('/api/tasks/99999')
                .send(updateData)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Task not found');
        });

        test('Should reject update with no fields provided', async () => {
            const response = await request(app)
                .put(`/api/tasks/${testTaskId}`)
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContain('At least one field (title, description, status, deadline) must be provided for update');
        });

        test('Should reject update with invalid status', async () => {
            const invalidUpdate = {
                status: 'invalid_status'
            };

            const response = await request(app)
                .put(`/api/tasks/${testTaskId}`)
                .send(invalidUpdate)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContain('Status must be one of: pending, in_progress, completed');
        });
    });

    // Test GET /api/tasks/user/:userId - Get tasks by user
    describe('GET /api/tasks/user/:userId', () => {
        test('Should retrieve tasks for valid user ID', async () => {
            const response = await request(app)
                .get(`/api/tasks/user/${testUserId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User tasks retrieved successfully');
            expect(Array.isArray(response.body.data)).toBe(true);
            
            // All tasks should belong to the specified user
            response.body.data.forEach(task => {
                expect(task.user.id).toBe(testUserId);
            });
        });

        test('Should return 404 for non-existent user ID', async () => {
            const response = await request(app)
                .get('/api/tasks/user/99999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User not found');
        });
    });

    // Test DELETE /api/tasks/:id - Delete task
    describe('DELETE /api/tasks/:id', () => {
        test('Should return 404 for deleting non-existent task', async () => {
            const response = await request(app)
                .delete('/api/tasks/99999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Task not found');
        });

        test('Should delete task with valid ID', async () => {
            const response = await request(app)
                .delete(`/api/tasks/${testTaskId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Task deleted successfully');

            // Verify task is actually deleted
            await request(app)
                .get(`/api/tasks/${testTaskId}`)
                .expect(404);
        });
    });
});