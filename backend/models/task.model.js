import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // This will be the PostgreSQL user ID
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      minlength: [3, 'Title must be at least 3 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in_progress', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
      index: true,
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > new Date();
        },
        message: 'Due date must be in the future',
      },
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
      index: true,
    },
    category: {
      type: String,
      enum: {
        values: ['study', 'work', 'personal', 'health', 'finance', 'errand', 'other'],
        message: '{VALUE} is not a valid task category',
      },
      default: 'other',
      index: true,
    },
    estimatedMinutes: {
      type: Number,
      min: [15, 'Estimated time must be at least 15 minutes'],
      max: [720, 'Estimated time cannot exceed 720 minutes'],
      default: null,
    },
    energyLevel: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid energy level',
      },
      default: 'medium',
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot exceed 50 characters'],
      },
    ],
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for common queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ createdAt: -1 });

// Middleware to set completedAt when status changes to completed
taskSchema.pre('save', function () {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.status !== 'completed') {
    this.completedAt = null;
  }
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function () {
  if (!this.dueDate) return null;
  const now = new Date();
  const diff = this.dueDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Lean for performance on read operations
taskSchema.set('toJSON', { virtuals: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;
