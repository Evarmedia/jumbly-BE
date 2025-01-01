const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const { createNotificationAdmin, getUserNotifications, updateNotificationStatus } = require('../controllers/notification.controller');

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification - Permissions(admin)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: The ID of the user to notify.
 *               message:
 *                 type: string
 *                 description: The notification message.
 *               type:
 *                 type: string
 *                 description: The type of notification (e.g., 'task', 'system'). Default is 'system'.
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: The priority of the notification. Default is 'medium'.
 *             required:
 *               - user_id
 *               - message
 *     responses:
 *       201:
 *         description: Notification created successfully.
 *       400:
 *         description: Missing required fields.
 *       500:
 *         description: Server error.
 */
// Route to create a new notification
router.post('/', authMiddleware, checkRole('admin'), createNotificationAdmin);


/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Retrieve notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [read, unread]
 *         required: false
 *         description: Filter notifications by status.
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter notifications by type (e.g., 'task', 'system').
 *     responses:
 *       200:
 *         description: Notifications fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notifications fetched successfully.
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notifications'
 *       404:
 *         description: No notifications found.
 *       500:
 *         description: Server error.
 */
// Route to fetch user notifications
router.get('/', authMiddleware, getUserNotifications);


/**
 * @swagger
 * /api/notifications/{notificationId}/status:
 *   patch:
 *     summary: Mark a notification as read or unread
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the notification to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [read, unread]
 *                 description: The new status for the notification.
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Notification status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification status updated to 'read' successfully.
 *                 notification:
 *                   $ref: '#/components/schemas/Notifications'
 *       400:
 *         description: Invalid or missing status.
 *       404:
 *         description: Notification not found.
 *       500:
 *         description: Server error.
 */
// Route to update notification status
router.patch('/:notificationId/status', authMiddleware, updateNotificationStatus);

module.exports = router;
