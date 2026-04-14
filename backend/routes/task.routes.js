import express from 'express';
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  getOverdueTasks,
} from '../controllers/task.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
  validatePagination,
} from '../middleware/validation.middleware.js';

const router = express.Router();

// Apply auth middleware to all task routes
router.use(authMiddleware);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', validateCreateTask, createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with pagination and filters
 * @access  Private
 */
router.get('/', validatePagination, getAllTasks);

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics
 * @access  Private
 */
router.get('/stats', getTaskStats);

/**
 * @route   GET /api/tasks/overdue
 * @desc    Get overdue tasks
 * @access  Private
 */
router.get('/overdue', getOverdueTasks);

/**
 * @route   GET /api/tasks/:taskId
 * @desc    Get a single task by ID
 * @access  Private
 */
router.get('/:taskId', validateTaskId, getTaskById);

/**
 * @route   PATCH /api/tasks/:taskId
 * @desc    Update a task
 * @access  Private
 */
router.patch('/:taskId', validateTaskId, validateUpdateTask, updateTask);

/**
 * @route   DELETE /api/tasks/:taskId
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:taskId', validateTaskId, deleteTask);

export default router;