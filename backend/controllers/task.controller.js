import TaskService from '../services/task.service.js';
import ApiError from '../utils/ApiError.js';

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await TaskService.createTask(userId, req.body);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Task created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for the logged-in user with pagination and filters
 * @access  Private
 */
const getAllTasks = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      tags: req.query.tags,
      searchTerm: req.query.search,
    };

    const result = await TaskService.getTasks(userId, filters, page, limit);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Tasks fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/:taskId
 * @desc    Get a single task by ID
 * @access  Private
 */
const getTaskById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.params;

    const result = await TaskService.getTaskById(userId, taskId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Task fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/tasks/:taskId
 * @desc    Update a task
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.params;

    if (Object.keys(req.body).length === 0) {
      throw new ApiError(400, 'No fields to update');
    }

    const result = await TaskService.updateTask(userId, taskId, req.body);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Task updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tasks/:taskId
 * @desc    Delete a task
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.params;

    const result = await TaskService.deleteTask(userId, taskId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Task deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics for the user
 * @access  Private
 */
const getTaskStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await TaskService.getTaskStats(userId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Statistics fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/overdue
 * @desc    Get overdue tasks for the user
 * @access  Private
 */
const getOverdueTasks = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await TaskService.getOverdueTasks(userId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Overdue tasks fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  getOverdueTasks,
};