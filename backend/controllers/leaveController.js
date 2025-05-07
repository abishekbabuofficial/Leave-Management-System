const leaveService = require("../services/leaveService");
const approvalService = require("../services/approvalService");
const userService = require("../services/userService");
const logger = require("../utils/logger");

const applyLeave = async (req, res) => {
  try {
    const { emp_id, leave_id, start_date, end_date, reason } = req.body;

    const leaveType = await leaveService.getLeaveType(leave_id);
    const total_days =
      Math.ceil(
        (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)
      ) + 1;

    // Check for balance (except LOP)
    if (leave_id !== 4) {
      const balances = await userService.getUserLeaveBalance(emp_id);
      const leaveBalance = balances.find((lb) => lb.leave_type_id === leave_id);

      if (!leaveBalance || leaveBalance.remaining < total_days) {
        logger.warn("Insufficient leave balance");
        return res.status(400).json({ message: "Insufficient leave balance" });
      }
    }

    // Auto-approve
    if (leaveType.is_auto_approve) {
      const reqId = await leaveService.applyLeave({
        emp_id,
        leave_id,
        start_date,
        end_date,
        reason,
        status: "auto_approved",
        total_days,
      });

      await approvalService.deductLeaveBalance(emp_id, leave_id, total_days);
      logger.info("Leave auto-approved!");
      return res.json({ message: "Leave auto-approved", reqId });
    }

    // Escalation and approver
    const escalation_level = total_days > 4 ? 1 : 1;
    const employee = await userService.getUserById(emp_id);
    const current_approver_id = employee.Manager_ID;

    const reqId = await leaveService.applyLeave({
      emp_id,
      leave_id,
      start_date,
      end_date,
      reason,
      escalation_level,
      current_approver_id,
      total_days,
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
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  applyLeave,
  getUserRequests,
};
