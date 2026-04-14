import Task from '../models/task.model.js';
import ApiError from '../utils/ApiError.js';

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
}

export default TaskService;