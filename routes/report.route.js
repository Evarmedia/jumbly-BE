const express = require('express');
const { checkRole } = require("../middleware/roleMiddleware.js"); // Ensure user authentication
const { createReport, downloadReport, listReports, getProjectReports, deleteProjectReports, } = require("../controllers/report.controller.js");

const router = express.Router();


/**
 * @swagger
 * /api/reports/create:
 *   post:
 *     summary: Generate a report for a specific project
 *     tags: [Reports]
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
 *                 description: The ID of the project for which to generate the report.
 *             required:
 *               - project_id
 *     responses:
 *       201:
 *         description: Report generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Report generated successfully.
 *                 report_url:
 *                   type: string
 *                   example: /api/reports/download/1
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Server error.
 */
router.post('/create', createReport);


/**
 * @swagger
 * /api/reports/download/{project_id}:
 *   get:
 *     summary: Download the report for a specific project
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: project_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project whose report you want to download.
 *     responses:
 *       200:
 *         description: Report downloaded successfully.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Report file or project not found.
 *       500:
 *         description: Server error.
 */
router.get('/download/:project_id', downloadReport);


/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: List all generated reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     responses:
 *       200:
 *         description: Reports fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reports fetched successfully.
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *       404:
 *         description: No reports found.
 *       500:
 *         description: Server error.
 */
// Route to list all reports
router.get('/', listReports);


/**
 * @swagger
 * /api/reports/{project_id}:
 *   get:
 *     summary: Retrieve reports for a specific project
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []  # Ensure authentication is required
 *     parameters:
 *       - in: path
 *         name: project_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project whose reports you want to retrieve.
 *     responses:
 *       200:
 *         description: Reports fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reports fetched successfully.
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *       404:
 *         description: Project or reports not found.
 *       500:
 *         description: Server error.
 */
// Route to retrieve reports for a specific project
router.get('/:project_id/', getProjectReports);


/**
 * @swagger
 * /api/reports/{project_id}:
 *   delete:
 *     summary: Delete a project's reports from the database and file system
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: project_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project whose reports should be deleted.
 *     responses:
 *       200:
 *         description: Reports deleted successfully.
 *       404:
 *         description: No reports found for the specified project.
 *       500:
 *         description: Server error.
 */
// Route to delete a project's reports
router.delete('/:project_id', deleteProjectReports);

module.exports = router;
