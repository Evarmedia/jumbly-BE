const express = require('express');
const { profile, getUserProfileByAdmin, updateUserDetails, adminUpdateUser, getAvailableRoles, getAllStaff, getAllClients, getAllAdmins,  getAllUsers, superDeleteUser, deleteUser } = require('../controllers/user.controller.js');
const {checkRole} = require('../middleware/roleMiddleware.js');
const authMiddleware = require('../middleware/authMiddleware.js');

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
 * /api/users/profile/{user_id}:
 *   get:
 *     summary: Retrieve a user's profile by an admin -permissions(admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique ID of the user
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User profile retrieved successfully.
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
 *                     email:
 *                       type: string
 *                       description: User's email address
 *                     role:
 *                       type: object
 *                       properties:
 *                         role_name:
 *                           type: string
 *                           description: The name of the user's role
 *                         description:
 *                           type: string
 *                           description: A brief description of the role
 *                     client:
 *                       type: object
 *                       description: Client details associated with the user
 *                       properties:
 *                         client_id:
 *                           type: integer
 *                           description: The unique ID of the client
 *                         company_name:
 *                           type: string
 *                           description: Name of the company
 *                         contact_person:
 *                           type: string
 *                           description: Name of the contact person
 *                     projects:
 *                       type: array
 *                       description: Projects associated with the user
 *                       items:
 *                         type: object
 *                         properties:
 *                           project_id:
 *                             type: integer
 *                             description: The unique ID of the project
 *                           project_name:
 *                             type: string
 *                             description: The name of the project
 *                           start_date:
 *                             type: string
 *                             format: date
 *                             description: Project start date
 *                           end_date:
 *                             type: string
 *                             format: date
 *                             description: Project end date
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/profile/:user_id", checkRole("admin"), getUserProfileByAdmin);


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
 * /api/users/admins:
 *   get:
 *     summary: Retrieve all admins in the system - permissions(admin) DEV only
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all admins retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                     description: The unique ID of the admin.
 *                   first_name:
 *                     type: string
 *                     description: Admin's first name.
 *                   last_name:
 *                     type: string
 *                     description: Admin's last name.
 *                   email:
 *                     type: string
 *                     description: Admin's email address.
 *                   phone:
 *                     type: string
 *                     description: Admin's phone number.
 *                   tenant_id:
 *                     type: integer
 *                     description: Tenant ID the admin belongs to.
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Date and time when the admin was created.
 *                   role:
 *                     type: object
 *                     properties:
 *                       role_name:
 *                         type: string
 *                         description: The name of the role (e.g., "admin").
 *                       description:
 *                         type: string
 *                         description: A brief description of the role.
 *       404:
 *         description: No admins found in the system.
 *       500:
 *         description: Internal server error.
 */
router.get("/admins", authMiddleware, getAllAdmins);

/**
 * @swagger
 * /api/users/:
 *   get:
 *     summary: Retrieve all users in the system - permissions(admin) DEV only
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                     description: The unique ID of the user.
 *                   first_name:
 *                     type: string
 *                     description: User's first name.
 *                   last_name:
 *                     type: string
 *                     description: User's last name.
 *                   email:
 *                     type: string
 *                     description: User's email address.
 *                   phone:
 *                     type: string
 *                     description: User's phone number.
 *                   tenant_id:
 *                     type: integer
 *                     description: Tenant ID the user belongs to.
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Date and time when the user was created.
 *                   role:
 *                     type: object
 *                     properties:
 *                       role_name:
 *                         type: string
 *                         description: The name of the role assigned to the user.
 *                       description:
 *                         type: string
 *                         description: A brief description of the role.
 *       404:
 *         description: No users found in the system.
 *       500:
 *         description: Internal server error.
 */
router.get("/", authMiddleware, getAllUsers);


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
router.put('/:user_id', authMiddleware, updateUserDetails);


/**
 * @swagger
 * /api/users/edit/{user_id}:
 *   put:
 *     summary: Admin Edit a user's details - permissions(admin)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique ID of the user to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: The user's first name.
 *               last_name:
 *                 type: string
 *                 description: The user's last name.
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *               phone:
 *                 type: string
 *                 description: The user's phone number.
 *               address:
 *                 type: string
 *                 description: The user's address.
 *               gender:
 *                 type: string
 *                 description: The user's gender.
 *               photo:
 *                 type: string
 *                 description: A URL or path to the user's photo.
 *               education:
 *                 type: string
 *                 description: The user's educational background.
 *               birthdate:
 *                 type: string
 *                 format: date
 *                 description: The user's date of birth.
 *     responses:
 *       200:
 *         description: User details updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User details updated successfully.
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       description: The unique ID of the user.
 *                     first_name:
 *                       type: string
 *                       description: The user's updated first name.
 *                     last_name:
 *                       type: string
 *                       description: The user's updated last name.
 *                     email:
 *                       type: string
 *                       description: The user's updated email address.
 *                     phone:
 *                       type: string
 *                       description: The user's updated phone number.
 *                     address:
 *                       type: string
 *                       description: The user's updated address.
 *       403:
 *         description: Access denied. Only admins can edit user details.
 *       404:
 *         description: User not found in the admin's tenancy.
 *       500:
 *         description: Internal server error.
 */
router.put("/edit/:user_id", authMiddleware, adminUpdateUser);


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

/**
 * @swagger
 * /api/users/superdelete/{user_id}:
 *   delete:
 *     summary: Super Delete admins account - DEV only⚠️
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
router.delete('/superdelete/:user_id', checkRole('admin'),  superDeleteUser);

module.exports = router;