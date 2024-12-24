const express = require('express');
const { profile, updateUserDetails, getAvailableRoles, deleteUser } = require('../controllers/user.controller.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const {checkRole} = require('../middleware/roleMiddleware.js');

const router = express.Router();


/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile information
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User profile information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: User ID
 *                 name:
 *                   type: string
 *                   description: User name
 */
router.get('/profile', authMiddleware, profile)

/**
 * @swagger
 * /api/users/{user_id}:
 *   put:
 *     summary: Update user details
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User name
 *               email:
 *                 type: string
 *                 description: User email
 *     responses:
 *       200:
 *         description: User details updated
 */
router.put('/:user_id', updateUserDetails)


/**
 * @swagger
 * /api/users/roles:
 *   get:
 *     summary: Get available user roles
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of available user roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/roles', authMiddleware, checkRole('admin'), getAvailableRoles)


/**
 * @swagger
 * /api/users/delete/{user_id}:
 *   delete:
 *     summary: Delete user account
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       204:
 *         description: User account deleted
 */
router.delete('/delete/:user_id', checkRole('admin'), authMiddleware, deleteUser);

module.exports = router;