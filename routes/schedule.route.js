const express = require('express');
const { createSchedule, getAllSchedules, getProjectSchedules, getScheduleDetails, updateScheduleDetails } = require('../controllers/schedule.controller.js');
const {checkRole} = require('../middleware/roleMiddleware.js');

const router = express.Router();

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Create a new schedule
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: integer
 *                 description: The ID of the project associated with the schedule.
 *               supervisor_id:
 *                 type: integer
 *                 description: The ID of the supervisor for the schedule.
 *               schedule_date:
 *                 type: string
 *                 format: date
 *                 description: The date of the schedule.
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *                 description: The status of the schedule.
 *             required:
 *               - project_id
 *               - supervisor_id
 *               - schedule_date
 *               - status
 *     responses:
 *       201:
 *         description: Schedule created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Schedule created successfully.
 *                 schedule:
 *                   $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Bad request. Missing or invalid fields.
 *       404:
 *         description: Project or supervisor not found.
 *       500:
 *         description: Internal server error.
 */
// Route to create a new schedule
router.post('/', checkRole('admin', 'supervisor'), createSchedule);


/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: List all schedules
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     responses:
 *       200:
 *         description: Schedules fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Schedules fetched successfully.
 *                 schedules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: No schedules found.
 *       500:
 *         description: Internal server error.
 */
// Route to list all schedules
router.get('/', checkRole('admin', 'supervisor'), getAllSchedules);


/**
 * @swagger
 * /api/schedules/{project_id}:
 *   get:
 *     summary: Retrieve schedules for a specific project
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: project_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project to fetch schedules for
 *     responses:
 *       200:
 *         description: Schedules fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Schedules fetched successfully.
 *                 schedules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: Project or schedules not found.
 *       500:
 *         description: Internal server error.
 */
// Route to retrieve schedules for a specific project
router.get('/:project_id', checkRole('admin', 'supervisor'), getProjectSchedules);


/**
 * @swagger
 * /api/schedules/{schedule_id}:
 *   get:
 *     summary: Retrieve details of a specific schedule
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: schedule_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the schedule to fetch
 *     responses:
 *       200:
 *         description: Schedule fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Schedule fetched successfully.
 *                 schedule:
 *                   $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: Schedule not found.
 *       500:
 *         description: Internal server error.
 */
// Route to retrieve a specific schedule
router.get('/:schedule_id', checkRole('admin', 'supervisor'), getScheduleDetails);


/**
 * @swagger
 * /api/schedules/{schedule_id}:
 *   put:
 *     summary: Update schedule details
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: schedule_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the schedule to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: integer
 *                 description: The updated project ID associated with the schedule.
 *               supervisor_id:
 *                 type: integer
 *                 description: The updated supervisor ID managing the schedule.
 *               schedule_date:
 *                 type: string
 *                 format: date
 *                 description: The updated schedule date.
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *                 description: The updated schedule status.
 *     responses:
 *       200:
 *         description: Schedule updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Schedule updated successfully.
 *                 schedule:
 *                   $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: Schedule, project, or supervisor not found.
 *       500:
 *         description: Internal server error.
 */
// Route to update schedule details
router.put('/:schedule_id', checkRole('admin', 'supervisor'), updateScheduleDetails);


module.exports = router;