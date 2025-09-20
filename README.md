# Task Management API

A RESTful API for managing tasks and users built with Node.js, Express, and PostgreSQL.

## Features

- **User Management**: Create, read, update, and delete users
- **Task Management**: Full CRUD operations for tasks with user assignment
- **Filtering & Search**: Filter tasks by status, deadline, and assigned user
- **Pagination**: Efficient pagination for large datasets
- **Input Validation**: Comprehensive validation and error handling
- **Database Relations**: Proper foreign key relationships between users and tasks
- **Unit Testing**: 35 comprehensive tests with 100% pass rate

## 🛠️ Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL (no ORM - using raw SQL queries)
- **Testing**: Jest and Supertest
- **Security**: Helmet for security headers, CORS support
- **Environment**: dotenv for configuration management

## 📁 Project Structure

```
task-management-api/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection and configuration
│   ├── controllers/
│   │   ├── userController.js    # User business logic
│   │   └── taskController.js    # Task business logic
│   ├── models/
│   │   ├── User.js             # User data access layer
│   │   └── Task.js             # Task data access layer
│   ├── routes/
│   │   ├── userRoutes.js       # User API routes
│   │   └── taskRoutes.js       # Task API routes
│   ├── middleware/
│   │   └── validation.js       # Input validation middleware
│   ├── utils/
│   │   └── helpers.js          # Utility functions
│   └── app.js                  # Express app configuration
├── tests/
│   ├── user.test.js            # User endpoint tests
│   └── task.test.js            # Task endpoint tests
├── sql/
│   └── schema.sql              # Database schema
├── server.js                   # Server entry point
├── package.json
├── .env                        # Environment variables
└── README.md
```

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd task-management-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   - Create database named `task_management`
   - Run the SQL schema from `sql/schema.sql`

4. **Configure environment variables**
   
   Create a `.env` file:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=task_management
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Verify installation**
   Visit `http://localhost:3000` to check if the API is running.

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Response Format
All API responses follow this structure:
```json
{
  "success": boolean,
  "message": "string",
  "data": object | array | null,
  "pagination": object (for paginated responses)
}
```

---

## 👤 User Endpoints

### Create User
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get All Users
```http
GET /api/users
```

### Get User by ID
```http
GET /api/users/:id
```

### Update User
```http
PUT /api/users/:id
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

### Delete User
```http
DELETE /api/users/:id
```

---

## 📋 Task Endpoints

### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Complete project proposal",
  "description": "Write and submit the project proposal",
  "status": "pending",
  "deadline": "2024-01-15",
  "user_id": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 1,
    "title": "Complete project proposal",
    "description": "Write and submit the project proposal",
    "status": "pending",
    "deadline": "2024-01-15",
    "user_id": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get All Tasks (with filtering and pagination)
```http
GET /api/tasks
GET /api/tasks?status=pending
GET /api/tasks?deadline=2024-01-15
GET /api/tasks?user_id=1
GET /api/tasks?page=1&limit=10
GET /api/tasks?status=pending&page=2&limit=5
```

**Response (200):**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Complete project proposal",
      "description": "Write and submit the project proposal",
      "status": "pending",
      "deadline": "2024-01-15",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 25,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  }
}
```

### Get Task by ID
```http
GET /api/tasks/:id
```

### Update Task
```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated task title",
  "status": "in_progress"
}
```

### Delete Task
```http
DELETE /api/tasks/:id
```

### Get Tasks by User ID
```http
GET /api/tasks/user/:userId
GET /api/tasks/user/:userId?status=completed&page=1&limit=5
```

---

## 🔍 Query Parameters

### Filtering
- `status`: Filter by task status (`pending`, `in_progress`, `completed`)
- `deadline`: Filter by deadline date (YYYY-MM-DD format)
- `user_id`: Filter by assigned user ID

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

---

## ✅ Validation Rules

### User Validation
- `name`: Required, string, max 100 characters, non-empty after trimming
- `email`: Required, valid email format, max 255 characters, unique

### Task Validation
- `title`: Required, string, max 200 characters, non-empty after trimming
- `description`: Optional, string, max 1000 characters
- `status`: Optional, must be one of: `pending`, `in_progress`, `completed`
- `deadline`: Optional, valid date in YYYY-MM-DD format
- `user_id`: Required, positive integer, must reference existing user

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage
- **User endpoints**: Create, read, update, delete operations
- **Task endpoints**: Full CRUD with filtering and pagination
- **Validation**: Input validation for all endpoints
- **Error handling**: 404, 400, 409, and 500 error scenarios

---

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=task_management_prod
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
```

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

---

## 🛠️ Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run test:watch # Run tests in watch mode
```

### Code Structure Guidelines
- **Controllers**: Handle HTTP requests and responses
- **Models**: Data access layer with database operations
- **Routes**: Define API endpoints and middleware
- **Middleware**: Input validation and error handling
- **Utils**: Helper functions and utilities

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    deadline DATE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔧 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Port already in use**
   - Change `PORT` in `.env` file
   - Kill process using the port: `lsof -ti:3000 | xargs kill`

3. **Tests failing**
   - Ensure test database is set up
   - Check database permissions
   - Run `npm install` to ensure all dependencies are installed

4. **CORS errors**
   - Check allowed origins in `src/app.js`
   - Verify request headers

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

// In the context of the users the name and email address is required to workflow for the endpoints working else the result will be fail , if the email is already been used for initial time then also its fail 
// The invalid form of the email address will led to depict the error fail , will be success 
// The API can be tested with the required fields to pass in the postman as well , invalid details and missing field leds to fail 
// Try creating the same user twice with same email will also led to the fail .
