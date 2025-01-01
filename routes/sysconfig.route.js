const express = require('express');
const { createRole, editRole, getTaskStatuses, createTaskCategory, getTaskCategories, getProjectStatuses } = require('../controllers/sysconfig.controller.js');
const authMiddleware = require('../middleware/authMiddleware');
const {checkRole} = require('../middleware/roleMiddleware.js');

const router = express.Router();


/**
 * @swagger
 * /api/admin/roles:
 *   post:
 *     summary: Create a new role -permissions(admin)
 *     tags: [System Configuration]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_name:
 *                 type: string
 *                 description: The name of the new role.
 *               description:
 *                 type: string
 *                 description: A description of the new role.
 *             required:
 *               - role_name
 *     responses:
 *       201:
 *         description: Role created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Role created successfully.
 *                 role:
 *                   $ref: '#/components/schemas/Roles'
 *       400:
 *         description: Bad request. Missing or invalid role_name, or role already exists.
 *       500:
 *         description: Internal server error.
 */
// Route to create a new role
router.post('/roles', authMiddleware, checkRole('admin'), createRole);


/**
 * @swagger
 * /api/admin/roles/{role_id}:
 *   put:
 *     summary: Edit an existing role -permissions(admin)
 *     tags: [System Configuration]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: role_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the role to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_name:
 *                 type: string
 *                 description: The updated name of the role.
 *               description:
 *                 type: string
 *                 description: The updated description of the role.
 *     responses:
 *       200:
 *         description: Role updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Role updated successfully.
 *                 role:
 *                   $ref: '#/components/schemas/Roles'
 *       404:
 *         description: Role not found.
 *       400:
 *         description: Role name already exists or other validation error.
 *       500:
 *         description: Internal server error.
 */
// Route to edit a role
router.put('/roles/:role_id', authMiddleware, checkRole('admin'), editRole);


/**
 * @swagger
 * /api/admin/task-statuses:
 *   get:
 *     summary: Retrieve task status types
 *     tags: [System Configuration]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     responses:
 *       200:
 *         description: Task statuses fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task statuses fetched successfully.
 *                 statuses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaskStatus'
 *       404:
 *         description: No task statuses found.
 *       500:
 *         description: Internal server error.
 */
// Route to retrieve task statuses
router.get('/task-statuses', authMiddleware, checkRole('admin'), getTaskStatuses);


/**
 * @swagger
 * /api/admin/task-categories:
 *   post:
 *     summary: Create a new task category
 *     tags: [System Configuration]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_name:
 *                 type: string
 *                 description: The name of the new task category.
 *               description:
 *                 type: string
 *                 description: A description of the task category.
 *             required:
 *               - category_name
 *     responses:
 *       201:
 *         description: Task category created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task category created successfully.
 *                 category:
 *                   $ref: '#/components/schemas/TaskCategory'
 *       400:
 *         description: Bad request. Missing or invalid category_name, or category already exists.
 *       500:
 *         description: Internal server error.
 */
// Route to create a new task category
router.post('/task-categories', authMiddleware, checkRole('admin'), createTaskCategory);


/**
 * @swagger
 * /api/admin/task-categories:
 *   get:
 *     summary: List all task categories
 *     tags: [System Configuration]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     responses:
 *       200:
 *         description: Task categories fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task categories fetched successfully.
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaskCategory'
 *       404:
 *         description: No task categories found.
 *       500:
 *         description: Internal server error.
 */
// Route to list task categories
router.get('/task-categories', authMiddleware, checkRole('admin'), getTaskCategories);


/**
 * @swagger
 * /api/admin/project-statuses:
 *   get:
 *     summary: Retrieve all project status types
 *     tags: [System Configuration]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     responses:
 *       200:
 *         description: Project statuses fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project statuses fetched successfully.
 *                 statuses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProjectStatus'
 *       404:
 *         description: No project statuses found.
 *       500:
 *         description: Internal server error.
 */
// Route to retrieve project statuses
router.get('/project-statuses', authMiddleware, checkRole('admin'), getProjectStatuses);


module.exports = router;