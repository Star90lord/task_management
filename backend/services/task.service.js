import Task from '../models/task.model.js';
import ApiError from '../utils/ApiError.js';

const PRIORITY_SCORES = {
  low: 10,
  medium: 20,
  high: 35,
};

const ENERGY_SCORES = {
  low: 1,
  medium: 2,
  high: 3,
};

const DEFAULT_ESTIMATED_MINUTES = 45;
const MINIMUM_FOCUS_BLOCK = 15;

const getUrgencyScore = (dueDate) => {
  if (!dueDate) {
    return 0;
  }

  const now = new Date();
  const diffInMs = new Date(dueDate) - now;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInDays <= 0) return 45;
  if (diffInDays <= 1) return 35;
  if (diffInDays <= 3) return 25;
  if (diffInDays <= 7) return 15;
  return 5;
};

const getEnergyMatchScore = (taskEnergyLevel, currentEnergyLevel) => {
  const taskEnergy = ENERGY_SCORES[taskEnergyLevel] || ENERGY_SCORES.medium;
  const currentEnergy = ENERGY_SCORES[currentEnergyLevel] || ENERGY_SCORES.medium;

  if (taskEnergy === currentEnergy) {
    return 15;
  }

  if (currentEnergy > taskEnergy) {
    return 8;
  }

  return -10;
};

const getDurationFitScore = (estimatedMinutes, availableMinutes) => {
  const minutes = estimatedMinutes || DEFAULT_ESTIMATED_MINUTES;

  if (minutes <= availableMinutes) {
    return 12;
  }

  if (minutes <= availableMinutes * 1.5) {
    return 4;
  }

  return -10;
};

const buildTaskReasons = (task, options) => {
  const reasons = [];
  const estimatedMinutes = task.estimatedMinutes || DEFAULT_ESTIMATED_MINUTES;

  if (task.priority === 'high') {
    reasons.push('High priority task');
  }

  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    const hoursUntilDue = (dueDate - new Date()) / (1000 * 60 * 60);

    if (hoursUntilDue <= 24) {
      reasons.push('Due within 24 hours');
    } else if (hoursUntilDue <= 72) {
      reasons.push('Due soon');
    }
  }

  if ((task.energyLevel || 'medium') === options.energyLevel) {
    reasons.push('Matches your current energy level');
  }

  if (estimatedMinutes <= options.availableMinutes) {
    reasons.push('Fits into your available time');
  } else {
    reasons.push('Can be started as a focused partial session');
  }

  if (task.category === 'study') {
    reasons.push('Great for a study sprint');
  } else if (task.category === 'work') {
    reasons.push('Good candidate for a productive work block');
  }

  return reasons.slice(0, 3);
};

const buildBreakSuggestion = (sessionMinutes) => {
  if (sessionMinutes >= 90) {
    return 'Take a 15 minute reset break after this session';
  }

  if (sessionMinutes >= 50) {
    return 'Take a 10 minute break after this session';
  }

  return 'Take a 5 minute break after this session';
};

const scoreTaskForFocusPlan = (task, options) => {
  const estimatedMinutes = task.estimatedMinutes || DEFAULT_ESTIMATED_MINUTES;
  const isInProgress = task.status === 'in_progress' ? 10 : 0;
  const categoryMatch = options.category && task.category === options.category ? 10 : 0;

  return (
    (PRIORITY_SCORES[task.priority] || PRIORITY_SCORES.medium) +
    getUrgencyScore(task.dueDate) +
    getEnergyMatchScore(task.energyLevel || 'medium', options.energyLevel) +
    getDurationFitScore(estimatedMinutes, options.availableMinutes) +
    isInProgress +
    categoryMatch
  );
};

class TaskService {
  /**
   * Create a new task
   */
  static async createTask(userId, taskData) {
    try {
      const task = new Task({
        userId: userId.toString(),
        ...taskData,
      });

      await task.save();

      return {
        success: true,
        task: task.toJSON(),
      };
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        throw new ApiError(400, 'Validation failed', messages);
      }
      throw new ApiError(500, error.message || 'Failed to create task');
    }
  }

  /**
   * Get all tasks for a user (with pagination and filters)
   */
  static async getTasks(userId, filters = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = { userId: userId.toString() };

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.priority) {
        query.priority = filters.priority;
      }

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.energyLevel) {
        query.energyLevel = filters.energyLevel;
      }

      if (filters.tags) {
        query.tags = { $in: Array.isArray(filters.tags) ? filters.tags : [filters.tags] };
      }

      if (filters.searchTerm) {
        query.$or = [
          { title: { $regex: filters.searchTerm, $options: 'i' } },
          { description: { $regex: filters.searchTerm, $options: 'i' } },
        ];
      }

      const total = await Task.countDocuments(query);
      const tasks = await Task.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        success: true,
        data: tasks,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new ApiError(500, error.message || 'Failed to fetch tasks');
    }
  }

  /**
   * Get a single task by ID
   */
  static async getTaskById(userId, taskId) {
    try {
      const task = await Task.findOne({
        _id: taskId,
        userId: userId.toString(),
      });

      if (!task) {
        throw new ApiError(404, 'Task not found');
      }

      return {
        success: true,
        task: task.toJSON(),
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.kind === 'ObjectId') {
        throw new ApiError(400, 'Invalid task ID');
      }
      throw new ApiError(500, error.message || 'Failed to fetch task');
    }
  }

  /**
   * Update a task
   */
  static async updateTask(userId, taskId, updateData) {
    try {
      // Remove fields that shouldn't be updated
      delete updateData.userId;
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      if (updateData.status === 'completed') {
        updateData.completedAt = new Date();
      } else if (updateData.status && updateData.status !== 'completed') {
        updateData.completedAt = null;
      }

      const task = await Task.findOneAndUpdate(
        {
          _id: taskId,
          userId: userId.toString(),
        },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!task) {
        throw new ApiError(404, 'Task not found or unauthorized');
      }

      return {
        success: true,
        task: task.toJSON(),
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        throw new ApiError(400, 'Validation failed', messages);
      }
      if (error.kind === 'ObjectId') {
        throw new ApiError(400, 'Invalid task ID');
      }
      throw new ApiError(500, error.message || 'Failed to update task');
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(userId, taskId) {
    try {
      const task = await Task.findOneAndDelete({
        _id: taskId,
        userId: userId.toString(),
      });

      if (!task) {
        throw new ApiError(404, 'Task not found or unauthorized');
      }

      return {
        success: true,
        message: 'Task deleted successfully',
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.kind === 'ObjectId') {
        throw new ApiError(400, 'Invalid task ID');
      }
      throw new ApiError(500, error.message || 'Failed to delete task');
    }
  }

  /**
   * Get task statistics for a user
   */
  static async getTaskStats(userId) {
    try {
      const stats = await Task.aggregate([
        {
          $match: { userId: userId.toString() },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const totalTasks = await Task.countDocuments({ userId: userId.toString() });

      const formattedStats = {
        total: totalTasks,
        byStatus: {},
      };

      stats.forEach((stat) => {
        formattedStats.byStatus[stat._id] = stat.count;
      });

      return {
        success: true,
        stats: formattedStats,
      };
    } catch (error) {
      throw new ApiError(500, error.message || 'Failed to fetch task statistics');
    }
  }

  /**
   * Get overdue tasks
   */
  static async getOverdueTasks(userId) {
    try {
      const tasks = await Task.find({
        userId: userId.toString(),
        status: { $ne: 'completed' },
        dueDate: { $lt: new Date() },
      })
        .sort({ dueDate: 1 })
        .lean();

      return {
        success: true,
        tasks,
      };
    } catch (error) {
      throw new ApiError(500, error.message || 'Failed to fetch overdue tasks');
    }
  }

  /**
   * Generate a smart focus plan for the user
   */
  static async getFocusPlan(userId, options = {}) {
    try {
      const normalizedOptions = {
        availableMinutes: options.availableMinutes || 120,
        energyLevel: options.energyLevel || 'medium',
        category: options.category || null,
      };

      const query = {
        userId: userId.toString(),
        status: { $in: ['pending', 'in_progress'] },
      };

      if (normalizedOptions.category) {
        query.category = normalizedOptions.category;
      }

      const tasks = await Task.find(query)
        .sort({ dueDate: 1, priority: -1, createdAt: 1 })
        .lean();

      if (tasks.length === 0) {
        return {
          success: true,
          summary: {
            availableMinutes: normalizedOptions.availableMinutes,
            plannedMinutes: 0,
            remainingMinutes: normalizedOptions.availableMinutes,
            energyLevel: normalizedOptions.energyLevel,
          },
          sessions: [],
          backupTasks: [],
          insights: [
            'No active tasks matched this focus plan. Add a few tasks with due dates or estimated minutes to get stronger recommendations.',
          ],
        };
      }

      const rankedTasks = tasks
        .map((task) => ({
          ...task,
          focusScore: scoreTaskForFocusPlan(task, normalizedOptions),
          estimatedMinutes: task.estimatedMinutes || DEFAULT_ESTIMATED_MINUTES,
        }))
        .sort((a, b) => {
          if (b.focusScore !== a.focusScore) {
            return b.focusScore - a.focusScore;
          }

          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
          }

          if (a.dueDate) return -1;
          if (b.dueDate) return 1;
          return new Date(a.createdAt) - new Date(b.createdAt);
        });

      let remainingMinutes = normalizedOptions.availableMinutes;
      const sessions = [];
      const usedTaskIds = new Set();

      for (const task of rankedTasks) {
        if (sessions.length >= 3 || remainingMinutes < MINIMUM_FOCUS_BLOCK) {
          break;
        }

        const sessionMinutes = Math.min(task.estimatedMinutes, remainingMinutes);

        if (sessionMinutes < MINIMUM_FOCUS_BLOCK) {
          continue;
        }

        sessions.push({
          taskId: task._id,
          title: task.title,
          category: task.category,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
          energyLevel: task.energyLevel,
          focusScore: task.focusScore,
          recommendedSessionMinutes: sessionMinutes,
          estimatedMinutesRemaining: Math.max(task.estimatedMinutes - sessionMinutes, 0),
          breakSuggestion: buildBreakSuggestion(sessionMinutes),
          reasons: buildTaskReasons(task, normalizedOptions),
        });

        usedTaskIds.add(task._id.toString());
        remainingMinutes -= sessionMinutes;
      }

      if (sessions.length === 0 && rankedTasks.length > 0) {
        const task = rankedTasks[0];
        const sessionMinutes = Math.min(
          Math.max(normalizedOptions.availableMinutes, MINIMUM_FOCUS_BLOCK),
          task.estimatedMinutes
        );

        sessions.push({
          taskId: task._id,
          title: task.title,
          category: task.category,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
          energyLevel: task.energyLevel,
          focusScore: task.focusScore,
          recommendedSessionMinutes: sessionMinutes,
          estimatedMinutesRemaining: Math.max(task.estimatedMinutes - sessionMinutes, 0),
          breakSuggestion: buildBreakSuggestion(sessionMinutes),
          reasons: buildTaskReasons(task, normalizedOptions),
        });

        usedTaskIds.add(task._id.toString());
        remainingMinutes = Math.max(normalizedOptions.availableMinutes - sessionMinutes, 0);
      }

      const backupTasks = rankedTasks
        .filter((task) => !usedTaskIds.has(task._id.toString()))
        .slice(0, 3)
        .map((task) => ({
          taskId: task._id,
          title: task.title,
          category: task.category,
          priority: task.priority,
          dueDate: task.dueDate,
          estimatedMinutes: task.estimatedMinutes,
          energyLevel: task.energyLevel,
          focusScore: task.focusScore,
        }));

      const plannedMinutes = sessions.reduce(
        (total, session) => total + session.recommendedSessionMinutes,
        0
      );

      const insights = [
        `${sessions.length} focus session(s) selected for your ${normalizedOptions.availableMinutes}-minute block.`,
      ];

      if (normalizedOptions.category) {
        insights.push(`Plan filtered to ${normalizedOptions.category} tasks.`);
      }

      if (sessions.some((session) => session.estimatedMinutesRemaining > 0)) {
        insights.push('At least one task is larger than your current session, so the planner split it into a manageable work block.');
      }

      if (sessions.some((session) => session.priority === 'high')) {
        insights.push('High-priority work was moved toward the front of the plan.');
      }

      return {
        success: true,
        summary: {
          availableMinutes: normalizedOptions.availableMinutes,
          plannedMinutes,
          remainingMinutes,
          energyLevel: normalizedOptions.energyLevel,
          tasksConsidered: tasks.length,
        },
        sessions,
        backupTasks,
        insights,
      };
    } catch (error) {
      throw new ApiError(500, error.message || 'Failed to generate focus plan');
    }
  }
}

export default TaskService;
