const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// Apply for leave
router.post('/apply', leaveController.applyLeave);

// Get leave requests for an employee
router.get('/:empId', leaveController.getUserRequests);

module.exports = router;
