const  AppDataSource = require('../config/dataSource');
const  LeaveRequest = require('../entities/leaveRequest');
const  LeaveType = require('../entities/leaveType');

const leaveService = {
  applyLeave: async (leaveData) => {
    const repo = AppDataSource.getRepository(LeaveRequest);
    const leave = repo.create(leaveData);
    await repo.save(leave);
    return leave.req_id;
  },

  getUserLeaveRequests: async (empId) => {
    return await AppDataSource
      .getRepository(LeaveRequest)
      .find({ where: { emp_id: empId } });
  },

  getLeaveById: async (reqId) => {
    return await AppDataSource
      .getRepository(LeaveRequest)
      .findOneBy({ req_id: reqId });
  },

  getLeaveType: async (leaveId) => {
    return await AppDataSource
      .getRepository(LeaveType)
      .findOneBy({ leave_id: leaveId });
  }
};

module.exports = leaveService;
