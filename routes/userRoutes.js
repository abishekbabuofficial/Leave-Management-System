const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// View user profile with leave balances
router.get('/:empId', userController.getUserProfile);

// Get reportees for a manager
router.get('/:managerId/reportees', userController.getReportees);

module.exports = router;
