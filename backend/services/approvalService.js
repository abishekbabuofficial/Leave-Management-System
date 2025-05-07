const AppDataSource = require("../config/dataSource");
const LeaveRequest = require("../entities/leaveRequest");
const LeaveType = require("../entities/leaveType");
const LeaveBalance = require("../entities/leaveBalance");
const logger = require("../utils/logger");

const approvalService = {
  getPendingApprovals: async (approverId) => {
    return await AppDataSource.getRepository(LeaveRequest)
      .createQueryBuilder("lr")
      .leftJoinAndSelect("lr.employee", "e")
      .leftJoinAndSelect("lr.leaveType", "lt")
      .where("lr.current_approver_id = :approverId AND lr.status = :status", {
        approverId,
        status: "pending",
      })
      .select(["lr", "e.Emp_name", "lt.leave_name"])
      .getMany();
  },

  updateLeaveStatus: async (
    reqId,
    status,
    approverId,
    remarks,
    escalationLevel = null,
    nextApprover = null
  ) => {
    const leaveRepo = AppDataSource.getRepository(LeaveRequest);
    const leave = await leaveRepo.findOneBy({
      req_id: reqId,
      current_approver_id: approverId,
    });

    if (!leave) {
      logger.error("Leave not found");
      throw new Error("Leave not found or approver mismatch");
    }

    leave.status = status;
    leave.remarks = remarks;
    leave.updated_at = new Date();

    if (escalationLevel !== null) leave.escalation_level = escalationLevel;
    if (nextApprover !== null) leave.current_approver_id = nextApprover;

    await leaveRepo.save(leave);
    return true;
  },

  deductLeaveBalance: async (empId, leaveTypeId, daysUsed) => {
    const repo = AppDataSource.getRepository(LeaveBalance);
    const record = await repo.findOneBy({
      emp_id: empId,
      leave_type_id: leaveTypeId,
    });

    if (!record) {
      logger.error("Leave balance not found");
      throw new Error("Leave balance not found");
    }
    record.used += daysUsed;
    record.remaining -= daysUsed;

    await repo.save(record);
  },

  addLopBalance: async (empId, leaveTypeId, daysUsed) => {
    const repo = AppDataSource.getRepository(LeaveBalance);
    const record = await repo.findOneBy({
      emp_id: empId,
      leave_type_id: leaveTypeId,
    });

    if (!record) {
      logger.error("Leave balance not found");
      throw new Error("Leave balance not found");
    }
    record.used += daysUsed;

    await repo.save(record);
  },
};

module.exports = approvalService;
