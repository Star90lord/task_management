# Quick Start Guide

Get your Task Management API up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- npm 8+ installed
- PostgreSQL database running
- MongoDB instance (local or cloud)
- Git

## Installation (5 minutes)

### 1. Clone and Navigate
```bash
git clone <your-repo-url>
cd task_management/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your credentials
# Update: JWT_SECRET, MONGO_URI, PG_HOST, PG_USER, PG_PASSWORD, etc.
nano .env
```

### 4. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

✅ Server running on `http://localhost:5000`

---

## First API Call (2 minutes)

### Register a User

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

**Using Postman:**
1. Create new POST request
2. URL: `http://localhost:5000/api/auth/register`
3. Body (JSON):
   ```json
   {
     "email": "test@example.com",
     "password": "SecurePass123!",
     "name": "Test User"
   }
   ```
4. Send

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "name": "Test User"
    },
    "token": "eyJhbGciOiJIUzI..."
  }
}
```

---

## Create Your First Task

**Using the token from registration:**

```bash
TOKEN="eyJhbGciOiJIUzI..." # Use token from registration

curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "My First Task",
    "description": "This is my first task",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59Z"
  }'
```

---

## Common Commands

### Development
```bash
npm run dev          # Start with auto-reload
npm test             # Run tests
npm run test:watch   # Watch mode testing
npm run test:coverage # Coverage report
```

### Production
```bash
npm start            # Start server
NODE_ENV=production npm start
```

---

## Project Structure Overview

```
backend/
├── config/              # Database configurations
├── controllers/         # Request handlers
├── models/             # Data models
├── middleware/         # Express middleware
├── routes/             # API routes
├── services/           # Business logic
├── utils/              # Helper utilities
├── constants.js        # App constants
├── server.js           # Entry point
├── app.js              # Express app
├── package.json        # Dependencies
├── .env                # Environment variables
└── README.md           # Documentation
```

---

## Key Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats` - Get statistics
- `GET /api/tasks/overdue` - Get overdue tasks

---

## Environment Variables Explained

```env
# Server Configuration
NODE_ENV=development    # development or production
PORT=5000              # Server port

# Security
JWT_SECRET=your-secret  # Change this in production!
JWT_EXPIRY=7d          # Token expiration

# MongoDB (for tasks)
MONGO_URI=mongodb://...

# PostgreSQL (for users)
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=***
PG_DATABASE=taskdb

# CORS
CLIENT_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
kill -9 $(lsof -ti:5000)
# Then restart server
npm run dev
```

### Database Connection Error
- Verify PostgreSQL is running
- Check credentials in .env
- Ensure database exists

### MongoDB Connection Error
- Check MongoDB connection string in .env
- Verify MongoDB is running
- Check network connectivity

---

## Next Steps

1. **Read Full Documentation**: See [README.md](./README.md)
2. **API Reference**: Check [API_REFERENCE.md](./API_REFERENCE.md)
3. **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Testing**: Review [TESTING.md](./TESTING.md)
5. **Contributing**: Read [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Getting Help

- Check error messages in logs
- Review API documentation
- Check GitHub issues
- Contact maintainers

---

## Quick Development Workflow

```bash
# 1. Start server
npm run dev

# 2. Test in another terminal
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "DevPass123!",
    "name": "Developer"
  }'

# 3. Copy the token from response

# 4. Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Dev Task",
    "priority": "high"
  }'

# 5. View all tasks
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Production Deployment Checklist

- [ ] Update `JWT_SECRET` to long random string
- [ ] Change `NODE_ENV` to `production`
- [ ] Update database credentials
- [ ] Set `CLIENT_URL` to your domain
- [ ] Configure HTTPS/SSL
- [ ] Enable CORS for your domain only
- [ ] Set up monitoring and logging
- [ ] Create database backups
- [ ] Test all endpoints
- [ ] Review security settings
- [ ] Enable rate limiting
- [ ] Set up error tracking

---

**Happy coding! 🚀**

For detailed guides, see other documentation files in the backend folder.
