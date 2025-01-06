const express = require('express');
const { profile, updateUserDetails, getAvailableRoles, getAllStaff, getAllClients, deleteUser } = require('../controllers/user.controller.js');
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
router.get('/profile', profile)


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
router.get('/roles', checkRole('admin'), getAvailableRoles);


/**
 * @swagger
 * /api/users/staff:
 *   get:
 *     summary: Retrieve a list of staff members(operators and supervisors)
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
router.get('/staff', checkRole('admin'), getAllStaff);


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
 *                 $ref: '#/components/schemas/Clients'
 *       401:
 *         description: Unauthorized, if the user does not have the right permissions
 *       500:
 *         description: Internal server error
 */
router.get('/clients', checkRole('admin'), getAllClients);


/**
 * @swagger
 * /api/users/{user_id}:
 *   put:
 *     summary: Update user details of a logged-in user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: User's first name
 *               last_name:
 *                 type: string
 *                 description: User's last name
 *               address:
 *                 type: string
 *                 description: User's address
 *               gender:
 *                 type: string
 *                 description: User's gender
 *                 enum: [Male, Female, Other]
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               photo:
 *                 type: string
 *                 description: URL of the user's photo
 *               education:
 *                 type: string
 *                 description: User's education details
 *               birthdate:
 *                 type: string
 *                 format: date
 *                 description: User's birthdate in YYYY-MM-DD format
 *               website:
 *                 type: string
 *                 description: User's website (if applicable)
 *               company_name:
 *                 type: string
 *                 description: Name of the user's company
 *               industry:
 *                 type: string
 *                 description: User's industry
 *               official_email:
 *                 type: string
 *                 description: User's official email address
 *               contact_person:
 *                 type: string
 *                 description: User's contact person
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
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       description: The unique ID of the user
 *                     first_name:
 *                       type: string
 *                       description: User's first name
 *                     last_name:
 *                       type: string
 *                       description: User's last name
 *                     address:
 *                       type: string
 *                       description: User's address
 *                     gender:
 *                       type: string
 *                       description: User's gender
 *                     phone:
 *                       type: string
 *                       description: User's phone number
 *                     photo:
 *                       type: string
 *                       description: URL of the user's photo
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.put('/:user_id', updateUserDetails);


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
router.delete('/delete/:user_id', checkRole('admin'),  deleteUser);

module.exports = router;