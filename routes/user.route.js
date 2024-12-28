const express = require('express');
const { profile, updateUserDetails, getAvailableRoles, getAllStaff, getAllClients, deleteUser } = require('../controllers/user.controller.js');
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/profile', authMiddleware, profile)


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
 *                 $ref: '#/components/schemas/Roles'  # Reference the Roles schema
 *       403:
 *         description: Unauthorized. Only admins can access this endpoint.
 *       500:
 *         description: Internal server error.
 */
router.get('/roles', authMiddleware, checkRole('admin'), getAvailableRoles);


/**
 * @swagger
 * /api/users/staff:
 *   get:
 *     summary: Retrieve a list of staff members
 *     description: Returns a list of users who are either operatives or supervisors.
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of staff members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized, if the user does not have the right permissions
 *       500:
 *         description: Internal server error
 */
router.get('/staff', authMiddleware, checkRole('admin'), getAllStaff);


/**
 * @swagger
 * /api/users/clients:
 *   get:
 *     summary: Retrieve a list of all clients, permissions["admin"]
 *     description: Returns a list of users who have the role of "client."
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 *       401:
 *         description: Unauthorized, if the user does not have the right permissions
 *       500:
 *         description: Internal server error
 */
router.get('/clients', authMiddleware, checkRole('admin'), getAllClients);


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
 *           type: integer
 *         required: true
 *         description: The unique ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'  # Reference to the User schema
 *     responses:
 *       200:
 *         description: User details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User details updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'  # Reference to the updated User schema
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/:user_id', authMiddleware, updateUserDetails);


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
router.delete('/delete/:user_id', authMiddleware, checkRole('admin'),  deleteUser);

module.exports = router;