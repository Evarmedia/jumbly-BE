const express = require('express');
const { createTask, getProjectTasks, getAllTasks, getTaskDetails, getOperatorTasks, updateTaskDetails, updateTaskStatus, reassignTask, deleteTask, reportIssue, listIssues, getTaskIssues, updateIssueStatus } = require('../controllers/task.controller');
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
router.post('/', createTask);


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
router.get('/projects/:project_id/', getProjectTasks);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Retrieve a list of tasks with filters, queries, and pagination
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter tasks by project ID
 *       - in: query
 *         name: status_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter tasks by status ID
 *       - in: query
 *         name: priority_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter tasks by priority ID
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter tasks by category ID
 *       - in: query
 *         name: assigned_to
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter tasks assigned to a specific user
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of tasks per page
 *     responses:
 *       200:
 *         description: List of tasks retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       task_id:
 *                         type: integer
 *                         description: The unique ID of the task
 *                       task_name:
 *                         type: string
 *                         description: The name of the task
 *                       project:
 *                         type: object
 *                         properties:
 *                           project_id:
 *                             type: integer
 *                             description: The ID of the associated project
 *                           project_name:
 *                             type: string
 *                             description: The name of the associated project
 *                       status:
 *                         type: object
 *                         properties:
 *                           status_id:
 *                             type: integer
 *                             description: The ID of the task's status
 *                           status_name:
 *                             type: string
 *                             description: The name of the task's status
 *                       priority:
 *                         type: object
 *                         properties:
 *                           priority_id:
 *                             type: integer
 *                             description: The ID of the task's priority
 *                           priority_name:
 *                             type: string
 *                             description: The name of the task's priority
 *                       category:
 *                         type: object
 *                         properties:
 *                           category_id:
 *                             type: integer
 *                             description: The ID of the task's category
 *                           category_name:
 *                             type: string
 *                             description: The name of the task's category
 *                 page:
 *                   type: integer
 *                   description: The current page number
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   description: The number of tasks per page
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   description: The total number of tasks retrieved
 *                   example: 2
 *       404:
 *         description: No tasks found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No tasks found.
 *       500:
 *         description: Internal server error
 */
// Route to fetch all tasks
router.get('/', checkRole('admin'), getAllTasks);


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
router.get('/operator', checkRole('operator'), getOperatorTasks);


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
router.get('/:task_id', getTaskDetails);


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
router.put('/:task_id', updateTaskDetails);


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
router.patch('/:task_id/status', updateTaskStatus);


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
router.patch('/:task_id/assign', checkRole('admin', 'supervisor'), reassignTask);


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
router.delete('/:task_id', checkRole('admin'), deleteTask);


/**
 * @swagger
 * /api/tasks/issues:
 *   post:
 *     summary: Report a new issue for a task by a logged in user(client mostly)
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
router.post('/issues', reportIssue);

/**
 * @swagger
 * /api/issues:
 *   get:
 *     summary: Retrieve a list of reported issues with filters, queries, and pagination
 *     tags: [Issues]
 *     parameters:
 *       - in: query
 *         name: task_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter issues by task ID
 *       - in: query
 *         name: reported_by
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter issues by reporter's user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [reported, resolved]
 *         required: false
 *         description: Filter issues by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of issues per page
 *     responses:
 *       200:
 *         description: List of issues retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       issue_id:
 *                         type: integer
 *                         description: The unique ID of the issue
 *                       task:
 *                         type: object
 *                         properties:
 *                           task_id:
 *                             type: integer
 *                             description: The ID of the related task
 *                           task_name:
 *                             type: string
 *                             description: The name of the related task
 *                           project_id:
 *                             type: integer
 *                             description: The ID of the project the task belongs to
 *                       reportedBy:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: integer
 *                             description: The ID of the user who reported the issue
 *                           first_name:
 *                             type: string
 *                             description: The first name of the reporter
 *                           last_name:
 *                             type: string
 *                             description: The last name of the reporter
 *                       status:
 *                         type: string
 *                         description: The status of the issue
 *                         enum: [reported, resolved]
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: When the issue was created
 *                 page:
 *                   type: integer
 *                   description: The current page number
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   description: The number of issues per page
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   description: The total number of issues retrieved
 *                   example: 2
 *       404:
 *         description: No issues found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No issues found.
 *       500:
 *         description: Internal server error
 */
// Route to list all reported issues
router.get('/issues', listIssues);


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
router.get('/issues/:task_id', getTaskIssues);


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
router.put('/issues/:task_id/status', updateIssueStatus);


module.exports = router;
