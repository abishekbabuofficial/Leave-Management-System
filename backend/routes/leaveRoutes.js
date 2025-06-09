const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authorizeRoles = require('../middlewares/authorizeRoles');
const checkID = require('../middlewares/checkID');
const leaveService = require('../services/leaveService');

// Apply for leave
router.post('/apply', leaveController.applyLeave);

// Cancel a leave request
router.post('/cancel/:req_id', leaveController.cancelLeaveRequest);

// Get leave requests for an employee
router.get('/requests', leaveController.getUserRequests);

// Get leave types
router.get('/types', leaveController.getLeaveType);

router.get('/holidays', leaveController.getHolidays);

router.get('/leave-calendar', leaveController.getLeaveCalendar);

router.get('/leave-calendar-hr',authorizeRoles('HR'), leaveController.getAllLeaves);

module.exports = router;
