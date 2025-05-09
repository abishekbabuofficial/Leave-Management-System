const AppDataSource = require("../config/dataSource");
const leaveRequest = require("../entities/leaveRequest");
const LeaveRequest = require("../entities/leaveRequest");
const LeaveType = require("../entities/leaveType");
const { In } = require("typeorm");

const leaveService = {
  applyLeave: async (leaveData) => {
    const repo = AppDataSource.getRepository(LeaveRequest);
    const leave = repo.create(leaveData);
    await repo.save(leave);
    return leave.req_id;
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
    const requests =  await AppDataSource.getRepository(LeaveRequest).find({
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
    const requests =  await AppDataSource.getRepository(LeaveRequest).find({
      where: { emp_id: empId,
        status: "approved", },
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
