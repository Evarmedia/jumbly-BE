const express = require('express');
const { profile, updateUserDetails, getAvailableRoles } = require('../controllers/user.controller.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const {checkRole} = require('../middleware/roleMiddleware.js');

const router = express.Router();

// Profile (protected route)
router.get('/profile', authMiddleware, profile)

// Edit user details /user/client
router.put('/:user_id', updateUserDetails)

// get all available roles
router.get('/roles', authMiddleware, checkRole('admin'), getAvailableRoles)

module.exports = router;