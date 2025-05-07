const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authorizeRoles = require('../middlewares/authorizeRoles');
const checkID = require('../middlewares/checkID');

// Apply for leave
router.post('/apply',authorizeRoles('EMPLOYEE'), leaveController.applyLeave);

// Get leave requests for an employee
router.get('/requests', authorizeRoles('EMPLOYEE'), leaveController.getUserRequests);

module.exports = router;
