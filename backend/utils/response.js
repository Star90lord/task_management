/**
 * API Response Handler
 * Standardized response utilities for consistent API responses
 */

import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants.js';

/**
 * Success Response
 * Sends a standardized success response
 */
export const sendSuccess = (res, statusCode = 200, message = '', data = null) => {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message: message || SUCCESS_MESSAGES.OPERATION_SUCCESS,
    data: data || null,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Error Response
 * Sends a standardized error response
 */
export const sendError = (res, statusCode = 500, message = '', errors = []) => {
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    errors: errors || [],
    timestamp: new Date().toISOString(),
  });
};

/**
 * Paginated Response
 * Sends a paginated success response
 */
export const sendPaginatedResponse = (
  res,
  statusCode = 200,
  data = [],
  pagination = {},
  message = ''
) => {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message: message || SUCCESS_MESSAGES.OPERATION_SUCCESS,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || 0,
      totalPages: pagination.totalPages || 0,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Not Found Response
 */
export const sendNotFound = (res, message = 'Resource not found') => {
  sendError(res, HTTP_STATUS.NOT_FOUND, message);
};

/**
 * Bad Request Response
 */
export const sendBadRequest = (res, message = 'Bad request', errors = []) => {
  sendError(res, HTTP_STATUS.BAD_REQUEST, message, errors);
};

/**
 * Unauthorized Response
 */
export const sendUnauthorized = (res, message = 'Unauthorized access') => {
  sendError(res, HTTP_STATUS.UNAUTHORIZED, message);
};

/**
 * Forbidden Response
 */
export const sendForbidden = (res, message = 'Access forbidden') => {
  sendError(res, HTTP_STATUS.FORBIDDEN, message);
};

/**
 * Conflict Response
 */
export const sendConflict = (res, message = 'Resource already exists', errors = []) => {
  sendError(res, HTTP_STATUS.CONFLICT, message, errors);
};

/**
 * Server Error Response
 */
export const sendServerError = (res, message = 'Internal server error', errors = []) => {
  sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, message, errors);
};

export default {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
  sendNotFound,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendConflict,
  sendServerError,
};
