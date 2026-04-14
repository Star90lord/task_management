# Testing Guide

Comprehensive guide for testing the Task Management API.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [API Testing](#api-testing)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)

## Testing Strategy

### Test Pyramid

```
        /\
       /  \    E2E Tests (5%)
      /____\
     /      \
    /        \  Integration Tests (30%)
   /          \
  /____________\
 /              \
/                \ Unit Tests (65%)
/________________\
```

### Test Coverage Goals

- Unit Tests: 80% coverage
- Integration Tests: 50% coverage
- E2E Tests: Critical paths only

## Unit Testing

### Setup

Install testing dependencies:

```bash
npm install --save-dev jest supertest @testing-library/node
```

### Example: Service Unit Test

**tests/services/auth.service.test.js**

```javascript
import AuthService from '../../services/auth.service.js';
import User from '../../models/user.model.js';
import ApiError from '../../utils/ApiError.js';

jest.mock('../../models/user.model.js');

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user with valid data', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      };

      User.findByEmail.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      const result = await AuthService.register(
        'test@example.com',
        'Password123!',
        'Test User'
      );

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBeDefined();
    });

    it('should throw error if email already exists', async () => {
      User.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      });

      await expect(
        AuthService.register('test@example.com', 'Password123!', 'Test User')
      ).rejects.toThrow(ApiError);
    });

    it('should throw error with weak password', async () => {
      User.findByEmail.mockResolvedValue(null);

      await expect(
        AuthService.register('test@example.com', 'weak', 'Test User')
      ).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const hashedPassword = await User.hashPassword('Password123!');
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
      };

      User.findByEmail.mockResolvedValue(mockUser);
      User.comparePassword = jest.fn().mockResolvedValue(true);

      const result = await AuthService.login('test@example.com', 'Password123!');

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
    });

    it('should throw error with invalid email', async () => {
      User.findByEmail.mockResolvedValue(null);

      await expect(
        AuthService.login('nonexistent@example.com', 'Password123!')
      ).rejects.toThrow(ApiError);
    });
  });
});
```

### Example: Utility Function Test

**tests/utils/generateToken.test.js**

```javascript
import { generateToken, verifyToken } from '../../utils/generateToken.js';

describe('generateToken', () => {
  it('should generate a valid token', () => {
    const token = generateToken(1, 'test@example.com');

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('generated token should be verifiable', () => {
    const token = generateToken(1, 'test@example.com');
    const decoded = verifyToken(token);

    expect(decoded.userId).toBe(1);
    expect(decoded.email).toBe('test@example.com');
  });

  it('should throw error for invalid token', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });
});
```

## Integration Testing

### Example: Controller Integration Test

**tests/controllers/auth.controller.test.js**

```javascript
import request from 'supertest';
import app from '../../app.js';
import User from '../../models/user.model.js';

jest.mock('../../models/user.model.js');

describe('Auth Controller Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
      };

      User.findByEmail.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 1,
        email: newUser.email,
        name: newUser.name,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return validation error for weak password', async () => {
      const invalidUser = {
        email: 'user@example.com',
        password: 'weak',
        name: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should return validation error for invalid email', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        name: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const hashedPassword = await User.hashPassword(credentials.password);
      User.findByEmail.mockResolvedValue({
        id: 1,
        email: credentials.email,
        password: hashedPassword,
      });
      User.comparePassword = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      User.findByEmail.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
```

## API Testing

### Using Postman

1. **Create Collection**: Task Management API
2. **Set Variables**:
   - `base_url`: http://localhost:5000/api
   - `token`: (set after login)

3. **Test Examples**:

```javascript
// Tests tab in Postman

// Test successful registration
pm.test('Register should return 201', function() {
  pm.response.to.have.status(201);
});

pm.test('Response should contain token', function() {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data.token).to.exist;
  pm.environment.set('token', jsonData.data.token);
});

// Test validation
pm.test('Weak password should return 400', function() {
  pm.response.to.have.status(400);
  var jsonData = pm.response.json();
  pm.expect(jsonData.success).to.equal(false);
});
```

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'

# Create Task (with token)
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Task",
    "description": "Task description",
    "priority": "high"
  }'
```

## Performance Testing

### Load Testing with Apache Bench

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Basic load test
ab -n 1000 -c 10 http://localhost:5000/health

# With POST data
ab -n 1000 -c 10 -p body.json http://localhost:5000/api/auth/login
```

### Using autocannon

```bash
npm install -g autocannon

# Run load test
autocannon http://localhost:5000/api/tasks
```

### Performance Benchmark Example

```javascript
import autocannon from 'autocannon';

const run = async () => {
  const result = await autocannon({
    url: 'http://localhost:5000/api/tasks',
    connections: 10,
    pipelining: 1,
    duration: 10,
    headers: {
      Authorization: 'Bearer YOUR_TOKEN',
    },
  });

  console.log(result);
};

run();
```

## Security Testing

### Input Validation Tests

```javascript
describe('Input Validation', () => {
  it('should reject SQL injection attempts', async () => {
    const maliciousInput = {
      email: "'; DROP TABLE users; --",
      password: 'Password123!',
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(maliciousInput)
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('should sanitize XSS attempts', async () => {
    const xssInput = {
      title: '<script>alert("XSS")</script>',
      description: 'Normal description',
    };

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${validToken}`)
      .send(xssInput)
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('should reject commands injection', async () => {
    const injectionInput = {
      description: '$(rm -rf /)',
    };

    // Should not execute
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${validToken}`)
      .send(injectionInput)
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});
```

### Authentication Tests

```javascript
describe('Authentication Security', () => {
  it('should deny access without token', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test' })
      .expect(401);

    expect(response.body.success).toBe(false);
  });

  it('should deny access with invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalid_token')
      .expect(401);

    expect(response.body.success).toBe(false);
  });

  it('should deny expired tokens', async () => {
    // Mock expired token
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body.success).toBe(false);
  });
});
```

## Test Configuration

### jest.config.js

```javascript
export default {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'models/**/*.js',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:security": "jest tests/security"
  }
}
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/services/auth.service.test.js

# Run tests matching pattern
npm test -- --testNamePattern="register"
```

## CI/CD Integration

### GitHub Actions Example

**.github/workflows/test.yml**

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test

      mongodb:
        image: mongo:6

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

For more testing strategies, refer to Jest documentation and testing best practices.
