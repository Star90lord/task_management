# Project File Structure

Complete overview of the Task Management API project structure.

```
task_management/
├── backend/
│   ├── config/
│   │   ├── postgres.js          # PostgreSQL connection pool & initialization
│   │   └── mongo.js             # MongoDB connection setup
│   │
│   ├── controllers/
│   │   ├── auth.controller.js   # Authentication request handlers
│   │   └── task.controller.js   # Task management request handlers
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT verification
│   │   ├── error.middleware.js       # Global error handler
│   │   └── validation.middleware.js  # Input validation rules
│   │
│   ├── models/
│   │   ├── user.model.js        # User model for PostgreSQL
│   │   └── task.model.js        # Task schema for MongoDB
│   │
│   ├── routes/
│   │   ├── auth.routes.js       # Authentication API routes
│   │   └── task.routes.js       # Task API routes
│   │
│   ├── services/
│   │   ├── auth.service.js      # Authentication business logic
│   │   └── task.service.js      # Task management business logic
│   │
│   ├── utils/
│   │   ├── ApiError.js          # Custom error class
│   │   ├── generateToken.js     # JWT token utilities
│   │   └── response.js          # Standardized response handlers
│   │
│   ├── app.js                   # Express app configuration
│   ├── server.js                # Server entry point with graceful shutdown
│   ├── constants.js             # Application constants & configurations
│   │
│   ├── .env                     # Environment variables (local)
│   ├── .env.example             # Environment template (version control)
│   ├── .gitignore               # Git ignore rules
│   │
│   ├── package.json             # Dependencies & scripts
│   ├── README.md                # Main documentation
│   ├── QUICKSTART.md            # Quick start guide
│   ├── API_REFERENCE.md         # Detailed API documentation
│   ├── DEPLOYMENT.md            # Deployment guide for various platforms
│   ├── TESTING.md               # Testing strategies & examples
│   ├── CONTRIBUTING.md          # Contributing guidelines
│   └── FILE_STRUCTURE.md        # This file
```

---

## File Descriptions

### Core Application Files

#### `server.js`
- Server entry point
- Database connection initialization
- Graceful shutdown handling
- Signal handlers (SIGTERM, SIGINT)
- Unhandled exception catching
- Server listening setup

#### `app.js`
- Express application configuration
- Security middleware setup (helmet, cors, etc.)
- Route registration
- 404 handler
- Global error middleware

#### `constants.js`
- HTTP status codes
- Task statuses and priorities
- Validation rules
- Error and success messages
- Regular expressions
- Field limits
- Rate limiting configurations

---

### Configuration Files

#### `config/postgres.js`
- PostgreSQL connection pool
- Connection configuration
- Table initialization
- Error handling
- Connection events management

#### `config/mongo.js`
- MongoDB connection setup
- Connection event handlers
- Graceful disconnection
- Error handling

---

### Models

#### `models/user.model.js`
- User data access layer
- Methods: create, findByEmail, findById, update, delete
- Password hashing and comparison
- Validation logic

#### `models/task.model.js`
- Task MongoDB schema
- Indexes for performance
- Validation rules
- Middleware (auto-complete timestamp)
- Virtual fields (daysUntilDue)

---

### Services

#### `services/auth.service.js`
- User registration logic
- User login logic
- Profile retrieval and update
- Password change functionality
- Error handling and validation

#### `services/task.service.js`
- Task creation with validation
- Task retrieval with filtering & pagination
- Task update (partial updates)
- Task deletion
- Task statistics generation
- Overdue task retrieval

---

### Controllers

#### `controllers/auth.controller.js`
- Registration endpoint handler
- Login endpoint handler
- Profile retrieval handler
- Profile update handler
- Password change handler
- Request validation and response formatting

#### `controllers/task.controller.js`
- Task creation handler
- Task retrieval handler (all & single)
- Task update handler
- Task deletion handler
- Task statistics handler
- Overdue tasks handler

---

### Middleware

#### `middleware/auth.middleware.js`
- JWT token extraction from headers
- Token verification
- User information attachment to request
- Unauthorized request rejection

#### `middleware/error.middleware.js`
- Global error catching
- Error classification
- Consistent error response formatting
- Logging of errors
- Database error handling
- JWT error handling

#### `middleware/validation.middleware.js`
- User registration validation
- User login validation
- Task creation validation
- Task update validation
- Task ID validation
- Pagination validation
- Express-validator integration

---

### Routes

#### `routes/auth.routes.js`
- POST /register - User registration
- POST /login - User login
- GET /profile - Get user profile
- PUT /profile - Update profile
- POST /change-password - Change password

#### `routes/task.routes.js`
- POST / - Create task
- GET / - Get all tasks with filtering
- GET /stats - Get task statistics
- GET /overdue - Get overdue tasks
- GET /:taskId - Get single task
- PATCH /:taskId - Update task
- DELETE /:taskId - Delete task

---

### Utilities

#### `utils/ApiError.js`
- Custom error class extending Error
- Status code property
- Errors array for detailed messages
- JSON serialization method
- Stack trace capture

#### `utils/generateToken.js`
- JWT token generation
- Token verification
- Expiry configuration
- Error handling

#### `utils/response.js`
- Standardized success responses
- Standardized error responses
- Paginated response formatter
- Helper response methods (sendNotFound, sendUnauthorized, etc.)

---

### Documentation Files

#### `README.md`
- Complete project overview
- Features list
- Installation instructions
- API documentation
- Database schema
- Authentication details
- Project structure
- Testing information
- Deployment guide

#### `QUICKSTART.md`
- 5-minute setup guide
- First API call examples
- Common commands
- Troubleshooting
- Environment variables explanation
- Quick development workflow

#### `API_REFERENCE.md`
- Complete endpoint documentation
- Request/response examples
- Error codes reference
- Status codes explanation
- Rate limiting info
- Pagination details
- Usage examples with cURL and Fetch

#### `DEPLOYMENT.md`
- Pre-deployment checklist
- Environment configuration
- Local production testing
- Heroku deployment guide
- AWS deployment options
- VPS deployment with PM2
- Docker deployment
- Monitoring and logging setup
- Backup and recovery procedures
- Performance optimization
- Security hardening
- Rollback procedures

#### `TESTING.md`
- Testing strategy overview
- Unit testing setup and examples
- Integration testing examples
- API testing with Postman
- Performance testing with Apache Bench
- Security testing examples
- Test configuration
- CI/CD integration examples

#### `CONTRIBUTING.md`
- Code of conduct
- Development setup
- Coding standards
- Code quality guidelines
- Commit message format
- Pull request process
- Testing requirements
- Documentation guidelines
- Performance considerations
- Security best practices
- Debugging tips

---

### Configuration Files

#### `package.json`
- Project metadata
- Dependencies (Express, Mongoose, PostgreSQL, JWT, etc.)
- Dev dependencies (Nodemon)
- Scripts (start, dev, test, lint, format)
- Engine requirements (Node 18+)

#### `.env`
- Local environment variables
- Database credentials
- JWT configuration
- Server port and environment

#### `.env.example`
- Template for required environment variables
- Safe to commit to version control
- Used for documentation

#### `.gitignore`
- Node modules exclusion
- Environment file exclusion
- IDE configuration exclusion
- Log files exclusion
- Build artifacts exclusion

---

## File Organization Principles

### Separation of Concerns
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Models**: Manage data access
- **Middleware**: Handle cross-cutting concerns
- **Utilities**: Provide helper functions
- **Config**: Manage external service connections

### Scalability
- Can add more routes without modification
- Services can be tested independently
- Controllers can be extended easily
- Middleware can be composed

### Maintainability
- Clear directory structure
- Single responsibility per file
- Consistent naming conventions
- Comprehensive documentation

### Security
- No hardcoded secrets
- Input validation at multiple levels
- Error messages don't expose details
- Passwords properly hashed
- JWT tokens for authentication

---

## Key Dependencies

### Production Dependencies
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **pg**: PostgreSQL client
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT creation/verification
- **express-validator**: Input validation
- **helmet**: Security headers
- **cors**: CORS handling
- **morgan**: HTTP request logging
- **dotenv**: Environment variable management

### Dev Dependencies
- **nodemon**: Auto-reload during development

### Optional (for production)
- **pm2**: Process manager
- **redis**: Caching
- **winston**: Advanced logging
- **newrelic**: Performance monitoring

---

## File Size Reference

Typical production-ready implementation:
- Controllers: ~300-400 lines each
- Services: ~400-500 lines each
- Models: ~200-300 lines
- Routes: ~80-100 lines
- Middleware: ~100-150 lines

Total backend code: ~3000-4000 lines (excluding tests)

---

## Loading Order

When the server starts:

1. **server.js** loads (entry point)
2. **app.js** initializes Express
3. **config/postgres.js** connects to PostgreSQL
4. **config/mongo.js** connects to MongoDB
5. Routes are registered in **app.js**
6. Middleware stack loads
7. Server listens on specified port

---

## Common Modifications

### Adding a New Feature
1. Create model in `models/`
2. Create service in `services/`
3. Create controller in `controllers/`
4. Add routes in `routes/`
5. Create middleware in `middleware/` if needed
6. Update constants if needed
7. Write tests
8. Update documentation

### Changing Database Schema
1. Update model in `models/`
2. Update validation in `middleware/validation.middleware.js`
3. Update services if logic changes
4. Update API documentation

### Adding Authentication
- Already implemented with JWT
- Modify `middleware/auth.middleware.js` if needed
- Update `services/auth.service.js` for logic changes

---

## Best Practices Implemented

✅ Error handling at every level
✅ Data validation on input
✅ Consistent response format
✅ Security headers configured
✅ CORS properly configured
✅ Environment-based configuration
✅ Graceful shutdown handling
✅ Database connection pooling
✅ Comprehensive logging
✅ Code organization and separation of concerns
✅ Security best practices
✅ Production-ready structure

---

For more information on specific files, refer to their JSDoc comments and inline documentation.
