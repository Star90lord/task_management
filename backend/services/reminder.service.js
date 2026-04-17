// In-memory store for active reminders
const reminderMap = new Map();

const reminderOffsetMs = Number(process.env.REMINDER_OFFSET_MS);
const reminderOffsetMinutes = Number(process.env.REMINDER_OFFSET_MINUTES);
const DEFAULT_REMINDER_OFFSET_MS = 1 * 60 * 1000; // 1 hour

const REMINDER_OFFSET =
  Number.isFinite(reminderOffsetMs) && reminderOffsetMs > 0
    ? reminderOffsetMs
    : Number.isFinite(reminderOffsetMinutes) && reminderOffsetMinutes > 0
    ? reminderOffsetMinutes * 60 * 1000
    : DEFAULT_REMINDER_OFFSET_MS;

/**
 * Schedule a reminder before dueDate
 */
export const scheduleReminder = (task) => {
  try {
    // 1. Validate input
    if (!task || !task.dueDate) {
      console.log({
        event: 'REMINDER_SKIPPED',
        reason: 'No due date',
        taskId: task?._id || null,
      });
      return;
    }

    const now = Date.now();
    const due = new Date(task.dueDate).getTime();

    // 2. Calculate delay
    const delay = due - now - REMINDER_OFFSET;

    // 3. Handle past/invalid timing
    if (delay <= 0) {
      console.log({
        event: 'REMINDER_SKIPPED',
        taskId: task._id,
        title: task.title,
        reason: 'Due time too close or passed',
        now: new Date(now).toISOString(),
        dueDate: new Date(due).toISOString(),
      });
      return;
    }

    // 4. Cancel existing reminder if present (avoid duplicates)
    cancelReminder(task._id);

    // 5. Schedule new reminder
    const timer = setTimeout(() => {
      console.log({
        event: 'REMINDER_TRIGGERED',
        taskId: task._id,
        title: task.title,
        triggeredAt: new Date().toISOString(),
      });

      // Clean up after execution
      reminderMap.delete(task._id.toString());
    }, delay);

    // 6. Store timer reference
    reminderMap.set(task._id.toString(), timer);

    // 7. Log scheduling info
    console.log({
        event: 'REMINDER_SET',
      title: task.title,
      scheduledFor: new Date(now + delay).toISOString(),
      dueDate: new Date(due).toISOString(),
      offsetMs: REMINDER_OFFSET,
    });

  } catch (error) {
    console.error({
      event: 'REMINDER_ERROR',
      message: error.message,
      taskId: task?._id || null,
    });
  }
};

/**
 * Cancel existing reminder
 */
export const cancelReminder = (taskId) => {
  try {
    const key = taskId.toString();
    const timer = reminderMap.get(key);

    if (timer) {
      clearTimeout(timer);
      reminderMap.delete(key);

      console.log({
        event: 'REMINDER_CANCELLED',
        taskId: key,
        cancelledAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error({
      event: 'REMINDER_CANCEL_ERROR',
      message: error.message,
      taskId: taskId || null,
    });
  }
};