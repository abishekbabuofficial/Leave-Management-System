const approvalService = require("../services/approvalService");
const leaveService = require("../services/leaveService");
const userService = require("../services/userService");
const logger = require("../utils/logger");

const getPendingApprovals = async (req, res) => {
  try {
    const { empId } = req.params;
    const requests = await approvalService.getPendingApprovals(empId);
    res.json(requests);
  } catch (err) {
    logger.error(`${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const handleApproval = async (req, res) => {
  try {
    const { reqId } = req.params;
    const { approverId, action, remarks } = req.body;

    const leave = await leaveService.getLeaveById(reqId);
    if (!leave || leave.status !== "pending") {
      logger.warn(`Request with ID: ${reqId} is either invalid or already processed`);
      return res
        .status(400)
        .json({ message: "Invalid or already processed request" });
    }

    let status = action === "approve" ? "approved" : "rejected";

    if (action === "reject") {
      await approvalService.updateLeaveStatus(reqId, status, approverId, remarks);
      logger.info(`Leave Request ID ${reqId} is rejected`);
      return res.json({ message: "Leave rejected" });
    }

    let nextApprover = null;
    let newLevel = leave.escalation_level;

    if (leave.total_days > 4 && leave.escalation_level === 1) {
      const employee = await userService.getUserById(leave.emp_id);
      const manager = await userService.getUserById(employee.Manager_ID);
      nextApprover = manager.Manager_ID; // Director
      newLevel = 2;
    } else if (leave.escalation_level < 3 && leave.current_approver_id !== 401) {
      nextApprover = 401; // HR
      newLevel += 1;
    } else if (nextApprover === 401) {
      nextApprover = null;
    }

    if (nextApprover) {
      await approvalService.updateLeaveStatus(
        reqId,
        "pending",
        approverId,
        remarks,
        newLevel,
        nextApprover
      );
      logger.info(`Leave approved by ${approverId} and escalated to ${nextApprover}`)
      return res.json({
        message: `Leave approved and escalated to ${nextApprover}`,
      });
    }

    // Final approval
    await approvalService.updateLeaveStatus(
      reqId,
      "approved",
      approverId,
      remarks
    );
    if (leave.leave_id !== 4) {
      await approvalService.deductLeaveBalance(
        leave.emp_id,
        leave.leave_id,
        leave.total_days
      );
    } else if (leave.leave_id === 4) {
      await approvalService.addLopBalance(
        leave.emp_id,
        leave.leave_id,
        leave.total_days
      );
    }
    logger.info("Leave fully approved!");
    res.json({ message: "Leave fully approved" });
  } catch (err) {
    logger.error(`${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getPendingApprovals,
  handleApproval,
};
