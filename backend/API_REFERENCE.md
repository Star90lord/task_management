# API Reference

Complete API documentation for the Task Management Backend.

## Base URL

```
Production: https://api.yourdomain.com
Development: http://localhost:5000
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### Authentication Endpoints

#### 1. Register User

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-04-14T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input or email already exists
- `500 Internal Server Error` - Server error

**Validation Rules:**
- Email: Valid email format, unique
- Password: Min 8 chars, uppercase, lowercase, number, special character
- Name: 2-100 characters

---

#### 2. Login

**POST** `/api/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-04-14T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Missing fields
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Server error

---

#### 3. Get Profile

**GET** `/api/auth/profile`

Get authenticated user's profile.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile fetched successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2024-04-14T08:00:00.000Z"
    }
  },
  "timestamp": "2024-04-14T10:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

#### 4. Update Profile

**PUT** `/api/auth/profile`

Update user profile information.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "newemail@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "newemail@example.com",
      "name": "Jane Doe"
    }
  },
  "timestamp": "2024-04-14T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Invalid token
- `409 Conflict` - Email already in use

---

#### 5. Change Password

**POST** `/api/auth/change-password`

Change user password.

**Authentication:** Required

**Request Body:**
```json
{
  "oldPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password changed successfully",
  "data": {
    "success": true,
    "message": "Password changed successfully"
  },
  "timestamp": "2024-04-14T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Missing fields
- `401 Unauthorized` - Invalid old password
- `500 Internal Server Error` - Server error

---

### Task Endpoints

#### 1. Create Task

**POST** `/api/tasks`

Create a new task.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation for all endpoints",
  "dueDate": "2024-12-31T23:59:59Z",
  "priority": "high",
  "tags": ["documentation", "api"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "60d5ec49f1b2b2a3b8e8c1a1",
      "userId": "1",
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation for all endpoints",
      "status": "pending",
      "priority": "high",
      "dueDate": "2024-12-31T23:59:59Z",
      "tags": ["documentation", "api"],
      "completedAt": null,
      "createdAt": "2024-04-14T10:00:00.000Z",
      "updatedAt": "2024-04-14T10:00:00.000Z"
    }
  },
  "timestamp": "2024-04-14T10:00:00.000Z"
}
```

**Validation Rules:**
- Title: 3-200 characters (required)
- Description: Max 2000 characters (optional)
- DueDate: ISO 8601 format, must be in future (optional)
- Priority: low, medium, or high (optional, defaults to medium)
- Tags: Array of strings (optional)

**Error Responses:**
- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Invalid token
- `500 Internal Server Error` - Server error

---

#### 2. Get All Tasks

**GET** `/api/tasks`

Get all tasks with optional filtering and pagination.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| page | number | Page number | 1 |
| limit | number | Items per page (1-100) | 10 |
| status | string | Filter by status | - |
| priority | string | Filter by priority | - |
| tags | string | Filter by tags (comma-separated) | - |
| search | string | Search in title/description | - |

**Example Request:**
```
GET /api/tasks?page=1&limit=10&status=pending&priority=high&search=documentation
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Tasks fetched successfully",
  "data": {
    "success": true,
    "data": [
      {
        "_id": "60d5ec49f1b2b2a3b8e8c1a1",
        "userId": "1",
        "title": "Task title",
        "description": "Task description",
        "status": "pending",
        "priority": "high",
        "dueDate": "2024-12-31T23:59:59Z",
        "tags": ["tag1", "tag2"],
        "createdAt": "2024-04-14T10:00:00.000Z",
        "updatedAt": "2024-04-14T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  },
  "timestamp": "2024-04-14T10:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid token
- `500 Internal Server Error` - Server error

---

#### 3. Get Single Task

**GET** `/api/tasks/:taskId`

Get a specific task by ID.

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| taskId | string | MongoDB ObjectId |

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Task fetched successfully",
  "data": {
    "task": {
      "_id": "60d5ec49f1b2b2a3b8e8c1a1",
      "userId": "1",
      "title": "Task title",
      "description": "Task description",
      "status": "pending",
      "priority": "high",
      "dueDate": "2024-12-31T23:59:59Z",
      "tags": ["tag1"],
      "daysUntilDue": 261,
      "createdAt": "2024-04-14T10:00:00.000Z",
      "updatedAt": "2024-04-14T10:00:00.000Z"
    }
  },
  "timestamp": "2024-04-14T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid task ID format
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Task not found
- `500 Internal Server Error` - Server error

---

#### 4. Update Task

**PATCH** `/api/tasks/:taskId`

Update a task (partial update allowed).

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| taskId | string | MongoDB ObjectId |

**Request Body (all fields optional):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "medium",
  "dueDate": "2024-06-30T23:59:59Z",
  "tags": ["updated", "tag"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "_id": "60d5ec49f1b2b2a3b8e8c1a1",
      "userId": "1",
      "title": "Updated title",
      "status": "in_progress",
      "priority": "medium",
      "updatedAt": "2024-04-14T11:00:00.000Z"
    }
  },
  "timestamp": "2024-04-14T10:00:00.000Z"
}
```

**Valid Status Values:**
- pending
- in_progress
- completed
- cancelled

**Error Responses:**
- `400 Bad Request` - Validation failed or invalid task ID
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Task not found
- `500 Internal Server Error` - Server error

---

#### 5. Delete Task

**DELETE** `/api/tasks/:taskId`

Delete a task.

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| taskId | string | MongoDB ObjectId |

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Task deleted successfully",
  "data": {
    "success": true,
    "message": "Task deleted successfully"
  },
  "timestamp": "2024-04-14T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid task ID format
- `401 Unauthorized` - Invalid token
- `404 Not Found` - Task not found
- `500 Internal Server Error` - Server error

---

#### 6. Get Task Statistics

**GET** `/api/tasks/stats`

Get statistics about user's tasks.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Statistics fetched successfully",
  "data": {
    "stats": {
      "total": 25,
      "byStatus": {
        "pending": 10,
        "in_progress": 5,
        "completed": 8,
        "cancelled": 2
      }
    }
  },
  "timestamp": "2024-04-14T10:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid token
- `500 Internal Server Error` - Server error

---

#### 7. Get Overdue Tasks

**GET** `/api/tasks/overdue`

Get all overdue tasks for the user.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Overdue tasks fetched successfully",
  "data": {
    "tasks": [
      {
        "_id": "60d5ec49f1b2b2a3b8e8c1a1",
        "title": "Overdue task",
        "dueDate": "2024-01-01T00:00:00Z",
        "priority": "high",
        "status": "pending"
      }
    ]
  },
  "timestamp": "2024-04-14T10:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid token
- `500 Internal Server Error` - Server error

---

### Utility Endpoints

#### Health Check

**GET** `/health`

Check if the server is running.

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Server is healthy",
  "timestamp": "2024-04-14T10:00:00.000Z"
}
```

---

#### API Info

**GET** `/`

Get API information and available endpoints.

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Task Management API v1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "tasks": "/api/tasks",
    "health": "/health"
  }
}
```

---

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Internal server error |

---

## Status Codes Reference

### Success Responses

- `200 OK` - Successful GET, PUT, PATCH requests
- `201 Created` - Successful POST request creating a new resource

### Client Error Responses

- `400 Bad Request` - Validation errors, missing fields
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists (e.g., duplicate email)

### Server Error Responses

- `500 Internal Server Error` - Unexpected server error
- `503 Service Unavailable` - Server temporarily unavailable

---

## Rate Limiting

Default rate limits per API:

- General endpoints: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per hour

If rate limited, response includes:
```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many requests, please try again later"
}
```

---

## Pagination

All list endpoints support pagination:

- `page`: Current page (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "total": 150,
    "page": 2,
    "limit": 10,
    "totalPages": 15
  }
}
```

---

## Sorting and Filtering

### Supported Filters

**Tasks:**
- `status`: Filter by task status
- `priority`: Filter by priority level
- `tags`: Filter by tags (comma-separated)
- `search`: Search in title and description

**Example:**
```
GET /api/tasks?status=completed&priority=high&search=documentation
```

---

## Best Practices

1. **Always include Authorization header** for protected endpoints
2. **Use pagination** for large result sets
3. **Implement error handling** for all API calls
4. **Validate input data** before sending requests
5. **Cache responses** when appropriate
6. **Monitor rate limits** and adjust requests accordingly
7. **Use appropriate HTTP methods** (GET, POST, PATCH, DELETE)
8. **Handle token expiration** by re-authenticating

---

## Examples Using Different Tools

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "name": "User Name"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'

# Get all tasks
curl -X GET "http://localhost:5000/api/tasks?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Fetch API (JavaScript)

```javascript
// Register
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123!',
    name: 'User Name',
  }),
});

const data = await response.json();
const token = data.data.token;

// Create Task
const taskResponse = await fetch('http://localhost:5000/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: 'New Task',
    description: 'Task description',
    priority: 'high',
  }),
});
```

---

For more information, visit the [main README](./README.md) or [API Documentation](./README.md#-api-documentation).
