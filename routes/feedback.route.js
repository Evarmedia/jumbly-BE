const express = require('express');
const router = express.Router();
const { createFeedback, updateFeedback, getProjectFeedback, getClientFeedback, getTenancyFeedback, deleteFeedback,  } = require('../controllers/feedback.controller');
const { checkRole } = require('../middleware/roleMiddleware');


/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Clients submit feedback for a project.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: integer
 *                 description: The ID of the project being reviewed.
 *               rating:
 *                 type: integer
 *                 description: Rating between 1-5.
 *                 minimum: 1
 *                 maximum: 5
 *               comments:
 *                 type: string
 *                 description: Optional feedback comments.
 *     responses:
 *       201:
 *         description: Feedback submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Feedback submitted successfully."
 *                 feedback:
 *                   type: object
 *                   properties:
 *                     feedback_id:
 *                       type: integer
 *                     tenant_id:
 *                       type: integer
 *                     client_id:
 *                       type: integer
 *                     project_id:
 *                       type: integer
 *                     rating:
 *                       type: integer
 *                     comments:
 *                       type: string
 *       400:
 *         description: Invalid input data or duplicate feedback.
 *       403:
 *         description: Unauthorized access, only clients can submit feedback.
 *       404:
 *         description: Project not found within the tenant.
 *       500:
 *         description: Internal server error.
 */
router.post("/", createFeedback);

/**
 * @swagger
 * /api/feedback/{feedback_id}:
 *   put:
 *     summary: Clients update their feedback on a project.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedback_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the feedback to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 description: Updated rating between 1-5.
 *                 minimum: 1
 *                 maximum: 5
 *               comments:
 *                 type: string
 *                 description: Updated feedback comments.
 *     responses:
 *       200:
 *         description: Feedback updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Feedback updated successfully."
 *                 feedback:
 *                   type: object
 *                   properties:
 *                     feedback_id:
 *                       type: integer
 *                     client_id:
 *                       type: integer
 *                     project_id:
 *                       type: integer
 *                     rating:
 *                       type: integer
 *                     comments:
 *                       type: string
 *       400:
 *         description: Invalid rating or missing required fields.
 *       403:
 *         description: Unauthorized access - Only the original client can update feedback.
 *       404:
 *         description: Feedback not found.
 *       500:
 *         description: Internal server error.
 */
router.put("/:feedback_id", updateFeedback);

/**
 * @swagger
 * /api/feedback/project/{project_id}:
 *   get:
 *     summary: Retrieve all feedback for a specific project.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: project_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project to retrieve feedback for.
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [top, low, all]
 *         description: Sort feedback by top, lowest or all.
 *     responses:
 *       200:
 *         description: Feedback retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Feedback retrieved successfully."
 *                 project_id:
 *                   type: integer
 *                 project_name:
 *                   type: string
 *                 feedback:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       feedback_id:
 *                         type: integer
 *                       rating:
 *                         type: integer
 *                       comments:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       client_id:
 *                         type: integer
 *                       company_name:
 *                         type: string
 *                       contact_person:
 *                         type: string
 *                       client_email:
 *                         type: string
 *       404:
 *         description: No feedback found or project not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/project/:project_id", getProjectFeedback);

/**
 * @swagger
 * /api/feedback/client/{client_id}:
 *   get:
 *     summary: Retrieve all feedback from a specific client.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: client_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the client to retrieve feedback for.
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [top, low, all]
 *         description: |
 *           Sort feedback by:
 *           - `top`: Highest-rated feedback first.
 *           - `low`: Lowest-rated feedback first.
 *           - `all`: Default sorting (newest first).
 *     responses:
 *       200:
 *         description: Feedback retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Client feedback retrieved successfully."
 *                 client_id:
 *                   type: integer
 *                 company_name:
 *                   type: string
 *                 feedback:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       feedback_id:
 *                         type: integer
 *                       rating:
 *                         type: integer
 *                       comments:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       project_id:
 *                         type: integer
 *                       project_name:
 *                         type: string
 *       404:
 *         description: No feedback found or client not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/client/:client_id", getClientFeedback);

/**
 * @swagger
 * /api/feedback/tenancy-feedbacks:
 *   get:
 *     summary: Admins view all feedback in their tenancy.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [top, low, all]
 *         description: |
 *           Sort feedback by:
 *           - `top`: Highest-rated feedback first.
 *           - `low`: Lowest-rated feedback first.
 *           - `all`: Default sorting (newest first).
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [rating, date, project, client]
 *         description: |
 *           Additional sorting options:
 *           - `rating`: Sort by rating (highest first).
 *           - `date`: Sort by newest first.
 *           - `project`: Sort alphabetically by project name.
 *           - `client`: Sort alphabetically by client name.
 *     responses:
 *       200:
 *         description: Tenancy-wide feedback retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tenancy-wide feedback retrieved successfully."
 *                 feedback:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       feedback_id:
 *                         type: integer
 *                       rating:
 *                         type: integer
 *                       comments:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       project_id:
 *                         type: integer
 *                       project_name:
 *                         type: string
 *                       client_id:
 *                         type: integer
 *                       company_name:
 *                         type: string
 *                       contact_person:
 *                         type: string
 *                       client_email:
 *                         type: string
 *       403:
 *         description: Access denied. Only admins can view tenancy-wide feedback.
 *       404:
 *         description: No feedback found in the tenancy.
 *       500:
 *         description: Internal server error.
 */
router.get("/tenancy-feedbacks", getTenancyFeedback);

/**
 * @swagger
 * /api/feedback/{feedback_id}:
 *   delete:
 *     summary: Clients delete their feedback on a project.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedback_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the feedback to be deleted.
 *     responses:
 *       200:
 *         description: Feedback deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Feedback deleted successfully."
 *       403:
 *         description: Unauthorized access - Only the original client can delete feedback.
 *       404:
 *         description: Feedback not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/:feedback_id", deleteFeedback);


module.exports = router;