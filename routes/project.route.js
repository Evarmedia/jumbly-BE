const express = require('express');
const { getClientProjects } = require('../controllers/project.controller.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const {checkRole} = require('../middleware/roleMiddleware.js');

const router = express.Router();

/**
 * @swagger
 * /api/projects/client:
 *   get:
 *     summary: Retrieve all projects for the logged-in client
 *     description: Fetches all projects associated with the authenticated user's client account.
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Successfully retrieved projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   project_id:
 *                     type: integer
 *                     description: Unique project identifier
 *                   client_id:
 *                     type: integer
 *                     description: Foreign key referencing the Clients table
 *                   project_name:
 *                     type: string
 *                     description: Name of the project
 *                   start_date:
 *                     type: string
 *                     format: date
 *                     description: Start date of the project
 *                   end_date:
 *                     type: string
 *                     format: date
 *                     description: End date of the project
 *                   status_id:
 *                     type: integer
 *                     description: Foreign key referencing the ProjectStatuses table
 *                   description:
 *                     type: string
 *                     description: Brief description of the project
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp when the project was created
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp when the project was last updated
 *       403:
 *         description: Unauthorized, user is not a client
 *       404:
 *         description: No projects found for the client
 *       500:
 *         description: Internal server error
 */
// Route to fetch projects for the logged-in client
router.get('/client', authMiddleware, checkRole('client'), getClientProjects);

module.exports = router;
