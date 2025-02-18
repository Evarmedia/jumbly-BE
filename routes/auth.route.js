const express = require("express");
const {
  registerTenant,
  registerUser,
  login,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  //   resetRegistrationPassword,
} = require("../controllers/auth.controller");
const { checkRole } = require("../middleware/roleMiddleware.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

/**
 * @swagger
 * /api/auth/register/tenant:
 *   post:
 *     summary: Register a new Tenant
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *               role_name:
 *                 type: string
 *                 description: should be "admin"
 *     responses:
 *       201:
 *         description: User registered successfully, check your email for verification
 *       400:
 *         description: Bad request
 *
 */
router.post("/register/tenant", registerTenant);

/**
 * @swagger
 * /api/auth/register/user:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *               role_name:
 *                 type: string
 *                 description: Role name
 *     responses:
 *       201:
 *         description: User registered successfully, check your email for verification
 *       400:
 *         description: Bad request
 *
 */
router.post("/register/user", authMiddleware, checkRole("admin"), registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized
 *
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh the access token using a refresh token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []  # Optional if you're testing authenticated endpoints
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: The refresh token sent in the request body (optional for Swagger testing).
 *     responses:
 *       200:
 *         description: Access token refreshed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access token refreshed successfully.
 *                 token:
 *                   type: string
 *                   description: The new access token.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: User ID.
 *                     first_name:
 *                       type: string
 *                       description: First name of the user.
 *                     email:
 *                       type: string
 *                       description: Email of the user.
 *                     role_id:
 *                       type: integer
 *                       description: Role ID of the user.
 *                     role_name:
 *                       type: string
 *                       description: Role name of the user.
 *       400:
 *         description: Refresh token is required.
 *       403:
 *         description: Invalid or expired refresh token.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
// Route for refreshing tokens
router.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify user email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Bad request
 *
 */
router.post("/verify-email", verifyEmail);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User email
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *       400:
 *         description: Bad request
 *
 */
router.post("/forgot-password", forgotPassword);

// /**
//  * @swagger
//  * /api/auth/reset-newuser-password:
//  *   post:
//  *     summary: Send reset password link to new user
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               email:
//  *                 type: string
//  *                 description: User email
//  *     responses:
//  *       200:
//  *         description: Password reset link sent successfully
//  *       400:
//  *         description: Bad request
//  *
//  */
// router.post('/reset-newuser-password', resetRegistrationPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token
 *               password:
 *                 type: string
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad request
 *
 */
router.post("/reset-password", resetPassword);

module.exports = router;
