const { createNotification } = require("../utils/notification");
const { User, Notification } = require("../models/models");

/**
 * Create a new notification for a user.
 */
const createNotificationAdmin = async (req, res) => {
  try {
    const { user_id, message, type, priority } = req.body;
    const { tenant_id } = req.user; // Get the tenant ID of the authenticated admin

    // Validate required fields
    if (!user_id || !message) {
      return res
        .status(400)
        .json({ message: "user_id and message are required." });
    }

    // Check if the user exists and belongs to the same tenant
    const user = await User.findOne({
      where: {
        user_id,
        tenant_id, // Ensure the user belongs to the same tenant
      },
    });

    if (!user) {
      return res.status(404).json({
        message: `User with ID ${user_id} not found in your tenancy.`,
      });
    }

    // Call the utility function with tenant_id
    await createNotification(
      user_id,
      message,
      type || "system",
      priority || "medium",
      tenant_id // Pass tenant_id to the notification function
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
    const { status, type, page = 1, limit = 10 } = req.query; // Optional filters and pagination

    // Build query conditions
    const where = { user_id };
    if (status) where.status = status;
    if (type) where.type = type;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Fetch notifications with pagination
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (!notifications.length) {
      return res.status(404).json({ message: "No notifications found." });
    }

    res.status(200).json({
      message: "Notifications fetched successfully.",
      notifications,
      page: parseInt(page),
      limit: parseInt(limit),
      total: count, // Total number of notifications matching the query
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
    const { user_id } = req.user; // Authenticated user's ID

    // Validate required fields
    if (!status || !["read", "unread"].includes(status)) {
      return res.status(400).json({
        message:
          "Invalid or missing status. Valid statuses are: 'read', 'unread'.",
      });
    }

    // Find the notification by ID and ensure it belongs to the authenticated user
    const notification = await Notification.findOne({
      where: {
        notification_id: notificationId,
        user_id, // Ensure the notification belongs to the authenticated user
      },
    });

    if (!notification) {
      return res.status(404).json({
        message: `Notification with ID ${notificationId} not found for your account.`,
      });
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
  updateNotificationStatus,
};
