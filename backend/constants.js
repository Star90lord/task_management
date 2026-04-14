/**
 * Application Constants
 * Centralized constants used throughout the application
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Task Status
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const VALID_TASK_STATUS = Object.values(TASK_STATUS);

// Task Priority
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const VALID_TASK_PRIORITY = Object.values(TASK_PRIORITY);

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
};

// JWT
export const JWT = {
  HEADER_NAME: 'Authorization',
  BEARER_PREFIX: 'Bearer ',
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
  TAG_MAX_LENGTH: 50,
};

// Error Messages
export const ERROR_MESSAGES = {
  // Auth Errors
  INVALID_EMAIL: 'Invalid email format',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  WEAK_PASSWORD:
    'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Unauthorized - token is missing or invalid',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid or malformed token',

  // User Errors
  USER_NOT_FOUND: 'User not found',
  PASSWORD_MISMATCH: 'Old password is incorrect',

  // Task Errors
  TASK_NOT_FOUND: 'Task not found',
  INVALID_TASK_ID: 'Invalid task ID',
  TITLE_REQUIRED: 'Task title is required',
  INVALID_DUE_DATE: 'Due date must be in the future',
  INVALID_STATUS: 'Invalid task status',
  INVALID_PRIORITY: 'Invalid task priority',

  // Validation Errors
  MISSING_FIELDS: 'Missing required fields',
  INVALID_INPUT: 'Invalid input provided',
  VALIDATION_FAILED: 'Validation failed',

  // Server Errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database connection error',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  // Auth
  REGISTRATION_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  PROFILE_FETCHED: 'Profile fetched successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',

  // Tasks
  TASK_CREATED: 'Task created successfully',
  TASK_FETCHED: 'Task fetched successfully',
  TASKS_FETCHED: 'Tasks fetched successfully',
  TASK_UPDATED: 'Task updated successfully',
  TASK_DELETED: 'Task deleted successfully',
  STATS_FETCHED: 'Statistics fetched successfully',

  // General
  OPERATION_SUCCESS: 'Operation completed successfully',
};

// Regex Patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  PHONE: /^[\d\s\-\+\(\)]{10,}$/,
  ISO_DATE: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,
};

// API Routes
export const ROUTES = {
  AUTH: '/api/auth',
  TASKS: '/api/tasks',
  HEALTH: '/health',
};

// Request Headers
export const HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  APPLICATION_JSON: 'application/json',
  AUTHORIZATION: 'Authorization',
};

// Cache Keys (for Redis or similar)
export const CACHE_KEYS = {
  USER_PROFILE: (userId) => `user_profile_${userId}`,
  USER_TASKS: (userId) => `user_tasks_${userId}`,
  TASK_DETAIL: (taskId) => `task_detail_${taskId}`,
};

// Cache Durations (in seconds)
export const CACHE_DURATION = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 2 * 60 * 60, // 2 hours
};

// Field Limits
export const FIELD_LIMITS = {
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MAX_LENGTH: 255,
  NAME_MAX_LENGTH: 255,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
};

// Rate Limiting
export const RATE_LIMITING = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // requests per window
  AUTH_MAX_REQUESTS: 5, // for auth endpoints
  AUTH_WINDOW_MS: 60 * 60 * 1000, // 1 hour
};

// Database Limits
export const DB_LIMITS = {
  MAX_QUERY_TIMEOUT: 30000, // 30 seconds
  CONNECTION_POOL_SIZE: 20,
  MAX_BATCH_SIZE: 1000,
};

export default {
  HTTP_STATUS,
  TASK_STATUS,
  TASK_PRIORITY,
  PAGINATION,
  JWT,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REGEX,
  ROUTES,
  HEADERS,
  CACHE_KEYS,
  CACHE_DURATION,
  FIELD_LIMITS,
  RATE_LIMITING,
  DB_LIMITS,
};
