const { createNotification } = require("../utils/notification");

/**
 * Create a new notification for a user.
 */
const createNotificationAdmin = async (req, res) => {
  try {
    const { user_id, message, type, priority } = req.body;

    // Validate required fields
    if (!user_id || !message) {
      return res
        .status(400)
        .json({ message: "user_id and message are required." });
    }

    // Call the utility function to create the notification
    await createNotification(
      user_id,
      message,
      type || "system",
      priority || "medium"
    );

    res.status(201).json({
      message: "Notification sent successfully.",
    });
  } catch (error) {
    console.error("Error creating notification:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Fetch notifications for the authenticated user.
 */
const getUserNotifications = async (req, res) => {
  try {
    const { user_id } = req.user; // Get the authenticated user's ID
    const { status, type } = req.query; // Optional filters for status and type

    // Build query conditions
    const where = { user_id };
    if (status) where.status = status;
    if (type) where.type = type;

    // Fetch notifications from the database
    const notifications = await Notification.findAll({
      where,
      order: [["created_at", "DESC"]], // Order notifications by most recent
    });

    if (!notifications.length) {
      return res.status(404).json({ message: "No notifications found." });
    }

    res.status(200).json({
      message: "Notifications fetched successfully.",
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update the status of a notification.
 */
const updateNotificationStatus = async (req, res) => {
  try {
    const { notificationId } = req.params; // Notification ID from the path parameter
    const { status } = req.body; // New status from the request body

    // Validate required fields
    if (!status || !["read", "unread"].includes(status)) {
      return res.status(400).json({
        message:
          "Invalid or missing status. Valid statuses are: 'read', 'unread'.",
      });
    }

    // Find the notification by ID
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ message: `Notification with ID ${notificationId} not found.` });
    }

    // Update the status
    await notification.update({ status });

    res.status(200).json({
      message: `Notification status updated to '${status}' successfully.`,
      notification,
    });
  } catch (error) {
    console.error("Error updating notification status:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createNotificationAdmin,
  getUserNotifications,
  updateNotificationStatus
};
