const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const authorizeRoles = require('../middlewares/authorizeRoles');


// Get all pending approvals for a user (manager, director, HR)
router.get('/pending', authorizeRoles('MANAGER', 'DIRECTOR', 'HR'), approvalController.getPendingApprovals);

// Approve or reject a leave request
router.post('/:reqId/action', authorizeRoles('MANAGER', 'DIRECTOR', 'HR'), approvalController.handleApproval);

module.exports = router;
