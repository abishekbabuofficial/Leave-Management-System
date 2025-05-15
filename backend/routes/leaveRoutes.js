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

// Approve leave request of Mentees
router.get('/leave-history',authorizeRoles('MANAGER','DIRECTOR'), leaveController.getApprovedLeaves);

//All Approved Leave Requests
router.get('/all-approved-leaves',authorizeRoles('HR'), leaveController.getAllLeaves);

//Get All Leaves by Employee ID
router.get('/user-approved-leaves',authorizeRoles('EMPLOYEE'), leaveController.getUserApprovedLeaves);

module.exports = router;
