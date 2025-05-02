const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authorizeRoles = require('../middlewares/authorizeRoles');
const checkID = require('../middlewares/checkID');

// View user profile with leave balances
router.get('/:empId', authorizeRoles('EMPLOYEE'),checkID(),userController.getUserProfile);

// Get reportees for a manager
router.get('/:empId/reportees',authorizeRoles('MANAGER', 'DIRECTOR', 'HR'),checkID(), userController.getReportees);

module.exports = router;
