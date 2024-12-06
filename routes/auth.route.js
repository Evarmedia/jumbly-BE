const express = require('express');
const { register, login, verifyEmail, deleteUser,forgotPassword, resetPassword } = require('../controllers/auth.controller');
const {checkRole} = require('../middleware/roleMiddleware.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// 
router.post('/verify-email', verifyEmail);

// Delete
router.delete('/delete/:user_id', authMiddleware, checkRole('admin'), deleteUser);

// Forgot Password
router.post('/forgot-password', forgotPassword);

// reset password
router.post('/reset-password', resetPassword);


module.exports = router;
