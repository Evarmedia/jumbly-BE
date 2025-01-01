const express = require('express');
const { createTask, getProjectTasks, getAllTasks, getTaskDetails, getOperatorTasks, updateTaskDetails, updateTaskStatus, reassignTask, deleteTask, reportIssue, listIssues, getTaskIssues, updateIssueStatus } = require('../controllers/task.controller');
const authMiddleware = require('../middleware/authMiddleware');
const {checkRole} = require('../middleware/roleMiddleware.js');


const router = express.Router();


/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []  # Ensure authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: integer
 *                 description: The ID of the project this task belongs to.
 *               task_name:
 *                 type: string
 *                 description: The name of the task.
 *               task_description:
 *                 type: string
 *                 description: A detailed description of the task.
 *               assigned_by:
 *                 type: integer
 *                 description: The ID of the supervisor assigning the task.
 *               assigned_to:
 *                 type: integer
 *                 description: The ID of the operator assigned to the task.
 *               status_id:
 *                 type: integer
 *                 description: The ID of the task status.
 *               priority_id:
 *                 type: integer
 *                 description: The ID of the task priority.
 *               category_id:
 *                 type: integer
 *                 description: The ID of the task priority.
 *               due_date:
 *                 type: string
 *                 format: date
 *                 description: The due date of the task.
 *     responses:
 *       201:
 *         description: Task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task created successfully.
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Project or user not found.
 *       500:
 *         description: Internal server error.
 */
// Route to create a new task
router.post('/', authMiddleware, createTask);


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

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: List all tasks - permissions(admin)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     responses:
 *       200:
 *         description: Tasks fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tasks fetched successfully.
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       404:
 *         description: No tasks found.
 *       500:
 *         description: Internal server error.
 */
// Route to fetch all tasks
router.get('/', authMiddleware, checkRole('admin'), getAllTasks);


/**
 * @swagger
 * /api/tasks/operator:
 *   get:
 *     summary: List tasks assigned to the logged-in operator- permissions(operator)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     responses:
 *       200:
 *         description: Tasks fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tasks fetched successfully.
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       403:
 *         description: Access denied. Only operators can access this endpoint.
 *       404:
 *         description: No tasks assigned to this operator.
 *       500:
 *         description: Internal server error.
 */
// Route to fetch tasks assigned to the logged-in operator
router.get('/operator', authMiddleware, checkRole('operator'), getOperatorTasks);


/**
 * @swagger
 * /api/tasks/{task_id}:
 *   get:
 *     summary: Retrieve specific task details
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: task_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the task to retrieve
 *     responses:
 *       200:
 *         description: Task details fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task details fetched successfully.
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Internal server error.
 */
// Route to fetch specific task details
router.get('/:task_id', authMiddleware, getTaskDetails);


/**
 * @swagger
 * /api/tasks/{task_id}:
 *   put:
 *     summary: Update task details
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: task_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the task to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: integer
 *                 description: The updated project ID.
 *               task_name:
 *                 type: string
 *                 description: The updated task name.
 *               task_description:
 *                 type: string
 *                 description: The updated task description.
 *               assigned_by:
 *                 type: integer
 *                 description: The updated supervisor ID.
 *               assigned_to:
 *                 type: integer
 *                 description: The updated operator ID.
 *               status_id:
 *                 type: integer
 *                 description: The updated status ID.
 *               priority_id:
 *                 type: integer
 *                 description: The updated priority ID.
 *               due_date:
 *                 type: string
 *                 format: date
 *                 description: The updated due date.
 *               category_id:
 *                 type: integer
 *                 description: The updated category ID.
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task updated successfully.
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task or related resources not found.
 *       500:
 *         description: Internal server error.
 */
// Route to update task details
router.put('/:task_id', authMiddleware, updateTaskDetails);


/**
 * @swagger
 * /api/tasks/{task_id}/status:
 *   patch:
 *     summary: Update the status of a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: task_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the task to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status_id:
 *                 type: integer
 *                 description: The ID of the new status.
 *             required:
 *               - status_id
 *     responses:
 *       200:
 *         description: Task status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task status updated successfully.
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request. Missing or invalid status_id.
 *       404:
 *         description: Task or status not found.
 *       500:
 *         description: Internal server error.
 */
// Route to update task status
router.patch('/:task_id/status', authMiddleware, updateTaskStatus);


/**
 * @swagger
 * /api/tasks/{task_id}/assign:
 *   patch:
 *     summary: Reassign task to a different operative -permissions("admin, supervisor")
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: task_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the task to reassign
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assigned_to:
 *                 type: integer
 *                 description: The ID of the new operative to assign the task to.
 *             required:
 *               - assigned_to
 *     responses:
 *       200:
 *         description: Task reassigned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task reassigned successfully.
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request. Missing or invalid assigned_to.
 *       404:
 *         description: Task or user not found.
 *       500:
 *         description: Internal server error.
 */
// Route to reassign a task
router.patch('/:task_id/assign', authMiddleware, checkRole('admin', 'supervisor'), reassignTask);


/**
 * @swagger
 * /api/tasks/{task_id}:
 *   delete:
 *     summary: Delete a task - permissions(admin)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: task_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the task to delete
 *     responses:
 *       200:
 *         description: Task deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task with ID {task_id} deleted successfully.
 *       404:
 *         description: Task not found.
 *       500:
 *         description: Internal server error.
 */
// Route to delete a task
router.delete('/:task_id', authMiddleware, checkRole('admin'), deleteTask);


/**
 * @swagger
 * /api/tasks/issues:
 *   post:
 *     summary: Report a new issue for a task
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task_id:
 *                 type: integer
 *                 description: The ID of the task the issue relates to.
 *               reported_by:
 *                 type: integer
 *                 description: The ID of the user reporting the issue.
 *               issue_description:
 *                 type: string
 *                 description: A detailed description of the issue.
 *               photo_attachment:
 *                 type: string
 *                 description: A URL or file path for an optional photo attachment.
 *             required:
 *               - task_id
 *               - reported_by
 *               - issue_description
 *     responses:
 *       201:
 *         description: Issue reported successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Issue reported successfully.
 *                 issue:
 *                   $ref: '#/components/schemas/Issue'
 *       400:
 *         description: Missing required fields.
 *       404:
 *         description: Task or user not found.
 *       500:
 *         description: Server error.
 */
// Route to report a new issue
router.post('/issues', authMiddleware, reportIssue);

/**
 * @swagger
 * /api/tasks/issues:
 *   get:
 *     summary: List all reported issues
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     responses:
 *       200:
 *         description: Issues fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Issues fetched successfully.
 *                 issues:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Issue'
 *       404:
 *         description: No issues found.
 *       500:
 *         description: Server error.
 */
// Route to list all reported issues
router.get('/issues', authMiddleware, listIssues);


/**
 * @swagger
 * /api/tasks/issues/{task_id}:
 *   get:
 *     summary: Retrieve issues for a specific task
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: task_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the task whose issues you want to retrieve.
 *     responses:
 *       200:
 *         description: Issues fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Issues fetched successfully.
 *                 issues:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Issue'
 *       404:
 *         description: Task or issues not found.
 *       500:
 *         description: Server error.
 */
// Route to retrieve issues for a specific task
router.get('/issues/:task_id', authMiddleware, getTaskIssues);


/**
 * @swagger
 * /api/tasks/issues/{task_id}/status:
 *   put:
 *     summary: Update the status of a task issue
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: task_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the task whose issue status you want to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [reported, resolved]
 *                 description: The new status of the issue.
 *     responses:
 *       200:
 *         description: Issue status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Issue status updated successfully.
 *                 issue:
 *                   $ref: '#/components/schemas/Issue'
 *       400:
 *         description: Missing or invalid fields.
 *       404:
 *         description: Task or issue not found.
 *       500:
 *         description: Server error.
 */
// Route to update the status of a task issue
router.put('/issues/:task_id/status', authMiddleware, updateIssueStatus);


module.exports = router;
