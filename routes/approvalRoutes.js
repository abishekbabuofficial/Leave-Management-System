const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');

// Get all pending approvals for a user (manager, director, HR)
router.get('/:approverId/pending', approvalController.getPendingApprovals);

// Approve or reject a leave request
router.post('/:reqId/action', approvalController.handleApproval);

module.exports = router;
