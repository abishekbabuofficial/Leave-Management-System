const AppDataSource = require("../config/dataSource");
const LeaveRequest = require("../entities/leaveRequest");
const LeaveType = require("../entities/leaveType");
const LeaveBalance = require("../entities/leaveBalance");
const { In, LessThanOrEqual, MoreThanOrEqual } = require("typeorm");
const holiday = require("../entities/holiday");
const { calculateDaysToRestore } = require("../utils/helper");
const auditService = require("./auditService");
const employee = require("../entities/employee");

const employeeRepo = AppDataSource.getRepository(employee);

const leaveService = {
  isOverlapping: async (empId, startDate, endDate) => {
    const repo = AppDataSource.getRepository(LeaveRequest);

    const overlappingRequests = await repo.find({
      where: {
        emp_id: empId,
        status: In(["approved", "pending"]),
        start_date: LessThanOrEqual(endDate),
        end_date: MoreThanOrEqual(startDate),
      },
    });

    return overlappingRequests.length > 0;
  },
  applyLeave: async (leaveData) => {
    const { emp_id, start_date, end_date } = leaveData;
    const isOverlapping = await leaveService.isOverlapping(
      emp_id,
      start_date,
      end_date
    );
    if (isOverlapping) {
      throw new Error(
        "You already have a leave request overlapping with the requested dates."
      );
    }
    const repo = AppDataSource.getRepository(LeaveRequest);
    const leave = repo.create(leaveData);
    await repo.save(leave);
    return leave.req_id;
  },

  cancelLeave: async (req_id) => {
    try {
      const repo = AppDataSource.getRepository(LeaveRequest);
      const leaveRequest = await repo.findOneBy({ req_id: req_id });

      if (!leaveRequest) {
        throw new Error(`Leave request with ID ${req_id} not found`);
      }

      if (
        leaveRequest.status === "approved" ||
        leaveRequest.status === "auto_approved"
      ) {
        const leave_balance = AppDataSource.getRepository(LeaveBalance);
        const record = await leave_balance.findOneBy({
          emp_id: leaveRequest.emp_id,
          leave_type_id: leaveRequest.leave_id,
        });

        if (!record) {
          throw new Error("Leave balance not found");
        }

        // Calculate days to restore based on cancellation timing
        const daysToRestore = await calculateDaysToRestore(
          leaveRequest.start_date,
          leaveRequest.end_date
        );

        if (daysToRestore === 0) {
          throw new Error(
            "Cannot cancel this leave as it has been already used."
          );
        }

        if (!(leaveRequest.leave_id === 4)) {
          record.used -= daysToRestore;
          record.remaining += daysToRestore;
        } else {
          // For LOP (leave_id === 4), subtract the days to restore from used
          record.used -= daysToRestore;
        }

        await leave_balance.save(record);

        // Log the partial cancellation details
        console.log(
          `Leave cancelled: Original days: ${leaveRequest.total_days}, Days restored: ${daysToRestore}`
        );
        // Create audit entry for cancellation
        await auditService.createAuditEntry({
          emp_id: leaveRequest.emp_id,
          req_id: leaveRequest.req_id,
          action: "cancelled",
          remarks: `Leave cancelled: Original days: ${leaveRequest.total_days},\n Days restored: ${daysToRestore}`,
        });
      } else {
        await auditService.createAuditEntry({
          emp_id: leaveRequest.emp_id,
          req_id: leaveRequest.req_id,
          action: "cancelled",
          remarks: `Leave cancelled: Leave cancelled before status approval...`,
        });
      }

      leaveRequest.status = "cancelled";
      await repo.save(leaveRequest);

      return { success: true, message: "Leave request cancelled successfully" };
    } catch (error) {
      console.error("Error cancelling leave request:", error);
      throw error;
    }
  },

  getUserLeaveRequests: async (empId) => {
    return await AppDataSource.getRepository(LeaveRequest).find({
      where: { emp_id: empId },
    });
  },

  getLeaveById: async (reqId) => {
    const record = await AppDataSource.getRepository(LeaveRequest).find({
      where: { req_id: reqId },
      relations: ["employee", "approver", "leaveType"],
    });
    return record[0];
  },

  getLeaveType: async () => {
    return await AppDataSource.getRepository(LeaveType).find();
  },
  
  getHolidays: async () => {
    return await AppDataSource.getRepository(holiday).find();
  },
  
  getAllLeaves: async () => {
    const allUsers = await employeeRepo.find({ relations: ["leaveRequests"] });
    return allUsers;
  },
  getLeaveCalendar: async (id) => {
    const employee = await employeeRepo.findOne({
      where: { Emp_ID: id },
      relations: ["leaveRequests"],
    });
    const managerOfEmployee = employee.Manager_ID;
    const peers = await employeeRepo.find({
      where: { Manager_ID: managerOfEmployee },
      relations: ["leaveRequests"],
    });
    const reportees = await employeeRepo.find({
      where: { Manager_ID: id },
      relations: ["leaveRequests"],
    });
    if (!managerOfEmployee) {
      return [employee, ...reportees];
    }
    return [...peers, ...reportees];
  },
};

module.exports = leaveService;
