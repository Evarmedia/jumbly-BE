const express = require('express');
const { getProjectTasks } = require('../controllers/task.controller');
const authMiddleware = require('../middleware/authMiddleware');
const {checkRole} = require('../middleware/roleMiddleware.js');


const router = express.Router();

/**
 * @swagger
 * /api/tasks/projects/{project_id}:
 *   get:
 *     summary: Retrieve all tasks for a specific project
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: project_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: Successfully retrieved tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       404:
 *         description: Project or tasks not found
 *       500:
 *         description: Internal server error
 */
router.get('/projects/:project_id/', authMiddleware, getProjectTasks);

module.exports = router;
