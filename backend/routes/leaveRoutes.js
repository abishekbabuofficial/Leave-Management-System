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

router.get('/types', leaveController.getLeaveType);

router.get('/leave-history',authorizeRoles('MANAGER','DIRECTOR'), leaveController.getApprovedLeaves);

router.get('/all-approved-leaves',authorizeRoles('HR'), leaveController.getAllLeaves);

router.get('/user-approved-leaves',authorizeRoles('EMPLOYEE'), leaveController.getUserApprovedLeaves);

module.exports = router;
