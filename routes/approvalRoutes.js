const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const authorizeRoles = require('../middlewares/authorizeRoles');
const checkID = require('../middlewares/checkID');


// Get all pending approvals for a user (manager, director, HR)
router.get('/:empId/pending', authorizeRoles('MANAGER', 'DIRECTOR', 'HR'),checkID(), approvalController.getPendingApprovals);

// Approve or reject a leave request
router.post('/:reqId/action', authorizeRoles('MANAGER', 'DIRECTOR', 'HR'), approvalController.handleApproval);

module.exports = router;
