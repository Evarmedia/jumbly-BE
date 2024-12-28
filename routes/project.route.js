const express = require("express");
const {
  createProjectAdmin,
  createProject,
  listAllProjects,
  getClientProjects,
  getProjectDetails,
  updateProjectDetails,
  updateProjectStatus,
  deleteProject,
} = require("../controllers/project.controller.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const { checkRole } = require("../middleware/roleMiddleware.js");

const router = express.Router();

/**
 * @swagger
 * /api/projects/admin:
 *   post:
 *     summary: Admin creates a new project and assigns it to a client
 *     description: Allows an administrator to create a new project and assign it to a specific client using the `client_id`.
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_name:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               status_id:
 *                 type: integer
 *               description:
 *                 type: string
 *               client_id:
 *                 type: integer
 *             required:
 *               - project_name
 *               - start_date
 *               - status_id
 *               - client_id
 *     responses:
 *       201:
 *         description: Project created successfully and assigned to the client.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 project:
 *       403:
 *         description: Unauthorized, user must be an admin to create projects.
 *       404:
 *         description: Client not found.
 *       500:
 *         description: Internal server error.
 */
// Route to create a new project as admin
router.post("/admin", authMiddleware, checkRole('admin'),createProjectAdmin);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     description: Allows an authenticated client to create a new project.
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_name:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               status_id:
 *                 type: integer
 *               description:
 *                 type: string
 *             required:
 *               - project_name
 *               - start_date
 *               - status_id
 *     responses:
 *       201:
 *         description: Project created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 project:
 *       403:
 *         description: Unauthorized, user must be a client to create a project.
 *       500:
 *         description: Internal server error.
 */
// Route to create a new project as a client
router.post("/", authMiddleware, checkRole('client'), createProject);


/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: List all projects
 *     description: Retrieves a list of all projects, optionally including related client information.
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of projects.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *       404:
 *         description: No projects found.
 *       500:
 *         description: Internal server error.
 */
// Route to list all projects
router.get('/', authMiddleware, listAllProjects);


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
router.get("/client", authMiddleware, checkRole('client'), getClientProjects);


/**
 * @swagger
 * /api/projects/{project_id}:
 *   get:
 *     summary: Retrieve specific project details
 *     description: Retrieves the details of a specific project, optionally including related client information.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: project_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved project details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Internal server error.
 */
// Route to retrieve a specific project by its ID
router.get('/:project_id', authMiddleware, getProjectDetails);


/**
 * @swagger
 * /api/projects/{project_id}:
 *   put:
 *     summary: Update project details
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: project_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_name:
 *                 type: string
 *                 description: The name of the project
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: The start date of the project
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: The end date of the project
 *               status_id:
 *                 type: integer
 *                 description: The status ID of the project
 *               description:
 *                 type: string
 *                 description: Additional details about the project
 *     responses:
 *       200:
 *         description: Project details updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project details updated successfully.
 *                 project:
 *                   $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Internal server error.
 */

// Route to update project details
router.put('/:project_id', authMiddleware, checkRole('client', 'admin'), updateProjectDetails);


/**
 * @swagger
 * /api/projects/{project_id}/status:
 *   patch:
 *     summary: Update the status of a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: project_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status_id:
 *                 type: integer
 *                 description: The new status ID of the project
 *             required:
 *               - status_id
 *     responses:
 *       200:
 *         description: Project status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project status updated successfully
 *                 project:
 *                   type: object
 *                   properties:
 *                     project_id:
 *                       type: integer
 *                       description: The ID of the updated project
 *                     project_name:
 *                       type: string
 *                       description: The name of the updated project
 *                     status_id:
 *                       type: integer
 *                       description: The updated status ID of the project
 *       400:
 *         description: Bad request. Missing or invalid status_id.
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Internal server error.
 */
// Route to update project status
router.patch('/:project_id/status', authMiddleware, updateProjectStatus);


/**
 * @swagger
 * /api/projects/{project_id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: project_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project to delete
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project with ID {project_id} deleted successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
// Route to delete a project
router.delete('/:project_id', authMiddleware, deleteProject);

module.exports = router;
