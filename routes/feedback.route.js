const express = require('express');
const router = express.Router();
const { createFeedback, } = require('../controllers/feedback.controller');
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


module.exports = router;