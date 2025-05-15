const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authorizeRoles = require('../middlewares/authorizeRoles');

// View user profile with leave balances
router.get('/profile', authorizeRoles('EMPLOYEE','MANAGER', 'DIRECTOR', 'HR'),userController.getUserProfile);

// Get reportees for a manager
router.get('/reportees',authorizeRoles('MANAGER', 'DIRECTOR', 'HR'), userController.getReportees);

// Get all users for a HR
router.get('/all-users',authorizeRoles('HR'), userController.getAllUsers);

// Get user leave balances
router.get('/leave-balance', authorizeRoles('EMPLOYEE','MANAGER', 'DIRECTOR', 'HR'), userController.getUserLeaveBalance);

module.exports = router;
