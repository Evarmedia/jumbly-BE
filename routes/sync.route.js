const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { syncOfflineData } = require('../controllers/sync.controller');

/**
 * @swagger
 * /api/sync/offline-data:
 *   post:
 *     summary: Synchronize offline-entered data with the server
 *     tags: [Sync]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projects:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Project'
 *               tasks:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Task'
 *               issues:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Issue'
 *               schedules:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Schedule'
 *     responses:
 *       200:
 *         description: Data synchronized successfully.
 *       500:
 *         description: Server error.
 */
router.post('/offline-data', syncOfflineData);

module.exports = router;
