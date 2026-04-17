import axios from 'axios';

// Configurable values
const MAX_RETRIES = Number(process.env.WEBHOOK_MAX_RETRIES) || 3;
const BASE_DELAY = Number(process.env.WEBHOOK_BASE_DELAY) || 1000; // 1 sec

/**
 * Send webhook with retry logic
 */
export const sendTaskCompletedWebhook = async (task) => {
  const webhookUrl = process.env.WEBHOOK_URL;

  if (!webhookUrl || !task) {
    console.log({
      event: 'WEBHOOK_SKIPPED',
      reason: 'No webhook URL configured or task missing',
      taskId: task?._id || null,
    });
    return;
  }

  const payload = {
    taskId: task._id,
    title: task.title,
    status: task.status,
    completedAt: task.completedAt || new Date().toISOString(),
    userId: task.userId,
    source: 'task-management-api',
  };

  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;

      await axios.post(webhookUrl, payload);

      console.log({
        event: 'WEBHOOK_SUCCESS',
        taskId: task._id,
        attempt,
        timestamp: new Date().toISOString(),
      });

      return; //  success → exit

    } catch (error) {
      console.log({
        event: 'WEBHOOK_FAILED',
        taskId: task._id,
        attempt,
        error: error.message,
      });

      // If last attempt → stop retrying
      if (attempt === MAX_RETRIES) {
        console.error({
          event: 'WEBHOOK_DROPPED',
          taskId: task._id,
          reason: 'Max retries reached',
        });
        return;
      }

      //  Exponential backoff
      const delay = BASE_DELAY * Math.pow(2, attempt - 1);

      console.log({
        event: 'WEBHOOK_RETRY_SCHEDULED',
        taskId: task._id,
        nextAttemptInMs: delay,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};