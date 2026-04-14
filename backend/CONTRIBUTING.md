# Contributing to Task Management API

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn
- Report inappropriate behavior

## Getting Started

### 1. Fork and Clone
```bash
git clone https://github.com/yourusername/task_management.git
cd task_management/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

## Development Guidelines

### Coding Standards

- **Language**: JavaScript (ES6+)
- **Framework**: Express.js
- **Style**: Follow existing code style
- **Formatting**: Use consistent indentation (2 spaces)

### Code Quality

```javascript
// ✓ GOOD - Clear, descriptive names
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  return user;
};

// ✗ BAD - Unclear names
const getU = async (id) => {
  return User.findById(id);
};
```

### Error Handling

```javascript
// ✓ GOOD - Proper error handling
try {
  const result = await performAction();
  return result;
} catch (error) {
  if (error instanceof ApiError) {
    throw error;
  }
  throw new ApiError(500, error.message);
}

// ✗ BAD - No error handling
const result = await performAction();
return result;
```

### Async/Await Pattern

```javascript
// ✓ GOOD
const register = async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// ✗ BAD - Using callbacks
const register = (req, res) => {
  AuthService.register(req.body, (err, result) => {
    if (err) res.status(500).json(err);
    else res.status(201).json(result);
  });
};
```

### File Organization

```
├── controllers/       # Request handlers
├── services/         # Business logic
├── models/          # Data models
├── middleware/      # Middleware functions
├── routes/          # Route definitions
├── config/          # Configuration files
├── utils/           # Utility functions
└── constants.js     # Application constants
```

### Naming Conventions

- **Files**: `camelCase` or `lowercase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Classes**: `PascalCase`
- **Variables**: `camelCase`

```javascript
// ✓ Correct
const MAX_USERS = 100;
const getUserById = () => {};
class UserService {}
const userName = 'John';

// ✗ Incorrect
const max_users = 100;
const get_user_by_id = () => {};
class userService {}
const user_name = 'John';
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
# Good commits
git commit -m "feat(auth): add JWT token refresh endpoint"
git commit -m "fix(tasks): prevent task deletion by unauthorized users"
git commit -m "docs(api): update authentication documentation"
git commit -m "refactor(services): improve error handling in auth service"

# Bad commits
git commit -m "fixed stuff"
git commit -m "updated code"
git commit -m "WIP"
```

## Pull Request Process

### 1. Before Submitting

- [ ] Tests pass: `npm test`
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No hardcoded values
- [ ] .env.example updated if needed

### 2. Create Pull Request

- Use a descriptive title
- Link related issues
- Provide clear description of changes
- Include testing notes

### 3. PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Related Issues
Closes #123

## Changes Made
- Change 1
- Change 2

## Testing Done
- Test 1
- Test 2

## Screenshots/Logs
If applicable, add screenshots or logs

## Checklist
- [ ] Tests pass
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No breaking changes
```

## Testing

### Running Tests

```bash
npm test
```

### Writing Tests

```javascript
// Example test
describe('AuthService', () => {
  describe('register', () => {
    it('should register a new user', async () => {
      const result = await AuthService.register(
        'test@example.com',
        'Password123!',
        'Test User'
      );
      expect(result.success).toBe(true);
      expect(result.user.email).toBe('test@example.com');
    });
  });
});
```

## Documentation

### JSDoc Comments

```javascript
/**
 * Create a new task
 * @param {string} userId - User ID
 * @param {object} taskData - Task data
 * @param {string} taskData.title - Task title
 * @param {string} [taskData.description] - Task description (optional)
 * @returns {object} Created task
 * @throws {ApiError} If validation fails
 */
const createTask = async (userId, taskData) => {
  // Implementation
};
```

### Comment Guidelines

```javascript
// ✓ GOOD - Explains why, not what
// Filter completed tasks to get pending ones for user dashboard
const pendingTasks = tasks.filter(task => task.status !== 'completed');

// ✗ BAD - Explains what is already obvious
// Filter tasks where status is not completed
const pendingTasks = tasks.filter(task => task.status !== 'completed');
```

## Performance Considerations

### Database Queries
- Add indexes for frequently queried fields
- Use lean() for read-only queries
- Implement pagination for large datasets
- Avoid N+1 queries

### Caching
- Use Redis for session data
- Cache frequently accessed data
- Implement cache invalidation

### API Optimization
- Compress responses
- Implement request rate limiting
- Use middleware efficiently

```javascript
// ✓ GOOD - Efficient query
const tasks = await Task.find({ userId })
  .select('title status priority')
  .limit(10)
  .lean();

// ✗ BAD - Inefficient query
const tasks = await Task.find({ userId });
```

## Security Best Practices

- Never hardcode secrets
- Validate all inputs
- Use parameterized queries (already handled by Mongoose/pg)
- Update dependencies regularly
- Use HTTPS in production
- Implement rate limiting
- Sanitize error messages

## Debugging Tips

### Using Node Inspector
```bash
node --inspect server.js
```

### Logging
```javascript
// Use appropriate log levels
console.error('Critical error'); // Errors
console.warn('Warning'); // Warnings
console.info('Info'); // Important info
console.debug('Debug info'); // Debug details
```

### Environment-Specific Debugging
```javascript
if (process.env.NODE_ENV === 'development') {
  console.debug('Debug info:', data);
}
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   lsof -i :5000  # Find process
   kill -9 <PID>  # Kill process
   ```

2. **Database Connection Error**
   - Verify credentials in .env
   - Check database is running
   - Check network connectivity

3. **Module Not Found**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Getting Help

- Check existing documentation
- Search GitHub issues
- Create a new issue with details
- Join our community chat

## Recognition

Contributors will be recognized in:
- README.md
- CONTRIBUTORS.md (to be created)
- Release notes

## Questions?

Feel free to open an issue or contact the maintainers.

---

**Thank you for contributing to Task Management API! 🎉**
