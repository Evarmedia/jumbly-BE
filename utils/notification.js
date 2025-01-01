const { Notification } = require('../models/models');

/**
 * Creates a notification for a user.
 * 
 * @param {number} userId - ID of the user to notify.
 * @param {string} message - The notification message.
 * @param {string} type - The type of notification (e.g., 'task', 'system'). Default is 'system'.
 * @param {string} priority - The priority of the notification (e.g., 'low', 'medium', 'high'). Default is 'medium'.
 * @returns {Promise<void>}
 */
const createNotification = async (userId, message, type = 'system', priority = 'medium') => {
  try {
    await Notification.create({
      user_id: userId,
      message,
      type,
      priority,
      delivered_at, // Set when delivered
    });
    console.log(`Notification created for user ${userId}: ${message}`);
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

module.exports = {
  createNotification,
};
