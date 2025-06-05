const leaveService = require("../services/leaveService");
const approvalService = require("../services/approvalService");
const userService = require("../services/userService");
const auditService = require("../services/auditService");
const logger = require("../utils/logger");
const { calculateTotaldays } = require("../utils/helper");

const applyLeave = async (req, res) => {
  try {
    const { emp_id, leave_id, start_date, end_date, reason } = req.body;

    const leaveRepo = await leaveService.getLeaveType();
    const leaveType = leaveRepo.find((lt) => lt.leave_id == leave_id);

    const total_days = await calculateTotaldays(start_date, end_date);
    if (total_days === 0) {
      return res.status(400).json({ message: "It is already a Holiday or weekend" });
    }

    // Check for balance except LOP
    if (leave_id !== 4) {
      const balances = await userService.getUserLeaveBalance(emp_id);
      const leaveBalance = balances.find((lb) => lb.leave_type_id === leave_id);

      if (!leaveBalance || leaveBalance.remaining < total_days) {
        logger.warn("Insufficient leave balance");
        return res.status(400).json({ message: "Insufficient leave balance" });
      }
    }

    // Auto-approve for sick leave
    if (leaveType.is_auto_approve) {
      const reqId = await leaveService.applyLeave({
        emp_id,
        leave_id,
        start_date,
        end_date,
        reason,
        status: "auto_approved",
        current_approver_id: null,
        total_days,
      });

      // Create audit entry for auto-approval
      await auditService.createAuditEntry({
        emp_id: emp_id,
        req_id: reqId,
        action: "approved",
        remarks: "Automatically approved based on leave type policy",
      });

      await approvalService.deductLeaveBalance(emp_id, leave_id, total_days);
      logger.info("Leave auto-approved!");
      return res.json({ message: "Leave auto-approved", reqId });
    }

    // Escalation and approver
    // const escalation_level = 1;
    const employee = await userService.getUserById(emp_id);
    const current_approver_id = employee.Manager_ID;

    const reqId = await leaveService.applyLeave({
      emp_id,
      leave_id,
      start_date,
      end_date,
      reason,
      status: "pending",
      // escalation_level,
      current_approver_id,
      total_days,
    });

    // Create audit entry for leave application
    await auditService.createAuditEntry({
      emp_id: emp_id,
      req_id: reqId,
      action: "created",
      remarks: `Leave application submitted by employee`,
    });

    logger.info(`Leave request with ID ${reqId} submitted`);
    res.json({ message: "Leave request submitted", reqId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserRequests = async (req, res) => {
  try {
    const { emp_ID } = req.user;
    const requests = await leaveService.getUserLeaveRequests(emp_ID);

    // Get audit history for all requests
    if (requests.length > 0) {
      const reqIds = requests.map((req) => req.req_id);
      const auditHistory = await auditService.getAuditHistoryForRequests(
        reqIds
      );

      // Attach audit history to each request
      const requestsWithAudit = requests.map((request) => ({
        ...request,
        audit_history: auditHistory[request.req_id] || [],
      }));

      res.json(requestsWithAudit);
    } else {
      res.json(requests);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLeaveType = async (req, res) => {
  try {
    const requests = await leaveService.getLeaveType();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getApprovedLeaves = async (req, res) => {
  try {
    const { emp_ID } = req.user;
    const response = await leaveService.getApprovedLeaves(emp_ID);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const response = await leaveService.getAllLeaves();
    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const getUserApprovedLeaves = async (req, res) => {
  try {
    const { emp_ID } = req.user;
    const response = await leaveService.getUserApprovedLeaves(emp_ID);
    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const cancelLeaveRequest = async (req, res) => {
  try {
    const { req_id } = req.params;
    const { emp_ID } = req.user;

    const leaveRequest = await leaveService.getLeaveById(req_id);

    if (leaveRequest.emp_id !== emp_ID) {
      return res
        .status(403)
        .json({ message: "You cannot cancel other's requests" });
    }

    if (leaveRequest.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Leave request is already cancelled" });
    }
    if (leaveRequest.status === "rejected") {
      return res
        .status(400)
        .json({ message: "Leave request is already rejected" });
    }

    const result = await leaveService.cancelLeave(req_id);

    logger.info(`Leave request with ID ${req_id} cancelled by user ${emp_ID}`);
    res.json({ message: "Leave request cancelled successfully" });
  } catch (err) {
    logger.error(`Error cancelling leave request: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const getHolidays = async (req, res) => {
  try {
    const holidays = await leaveService.getHolidays();
    res.json(holidays);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  applyLeave,
  getUserRequests,
  getLeaveType,
  getApprovedLeaves,
  getAllLeaves,
  getUserApprovedLeaves,
  cancelLeaveRequest,
  getHolidays,
};
