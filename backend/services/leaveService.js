const AppDataSource = require("../config/dataSource");
const LeaveRequest = require("../entities/leaveRequest");
const LeaveType = require("../entities/leaveType");
const LeaveBalance = require("../entities/leaveBalance");
const { In, LessThanOrEqual, MoreThanOrEqual } = require("typeorm");

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
    const isOverlapping = await leaveService.isOverlapping(emp_id, start_date, end_date);
    if (isOverlapping) {
      throw new Error("You already have a leave request overlapping with the requested dates.");
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
      if (leaveRequest.status === "approved" || leaveRequest.status === "auto_approved") {
        const leave_balance = AppDataSource.getRepository(LeaveBalance);
        const record = await leave_balance.findOneBy({
          emp_id: leaveRequest.emp_id,
          leave_type_id: leaveRequest.leave_id,
        });

        if (!record) {
          throw new Error("Leave balance not found");
        }
        if (!(leaveRequest.leave_id === 4)){
        record.used -= leaveRequest.total_days;
        record.remaining += leaveRequest.total_days;}
        else{
            record.used -= leaveRequest.total_days;
        }

        await leave_balance.save(record);
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
    return await AppDataSource.getRepository(LeaveRequest).findOneBy({
      req_id: reqId,
    });
  },

  getLeaveType: async () => {
    return await AppDataSource.getRepository(LeaveType).find();
  },
  getAllLeaves: async () => {
    const employees = await AppDataSource.getRepository("Employee").find();
    const requests = await AppDataSource.getRepository(LeaveRequest).find({
      where: { status: "approved" },
    });

    const empLeaves = requests.map((request) => {
      const empWithLeaves = employees.filter(
        (employee) => request.emp_id === employee.Emp_ID
      );
      return {
        ...request,
        empDetails: empWithLeaves[0],
      };
    });

    return empLeaves;
  },

  getApprovedLeaves: async (managerId) => {
    const reportees = await AppDataSource.getRepository("Employee").find({
      where: { Manager_ID: managerId },
    });
    const reporteeIds = reportees.map((reportee) => reportee.Emp_ID);

    const requests = await AppDataSource.getRepository(LeaveRequest).find({
      where: {
        emp_id: In(reporteeIds),
        status: "approved",
      },
    });

    const reporteeLeaves = requests.map((request) => {
      const reporteesWithLeaves = reportees.filter(
        (reportee) => request.emp_id === reportee.Emp_ID
      );
      return {
        ...request,
        empDetails: reporteesWithLeaves[0],
      };
    });

    return reporteeLeaves;
  },

  getUserApprovedLeaves: async (empId) => {
    const employees = await AppDataSource.getRepository("Employee").find();
    const requests = await AppDataSource.getRepository(LeaveRequest).find({
      where: { emp_id: empId, status: "approved" },
    });
    const empLeaves = requests.map((request) => {
      const empWithLeaves = employees.filter(
        (employee) => request.emp_id === employee.Emp_ID
      );
      return {
        ...request,
        empDetails: empWithLeaves[0],
      };
    });

    return empLeaves;
  },
};

module.exports = leaveService;
