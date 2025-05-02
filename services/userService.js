const { getRepository } = require('typeorm');
const AppDataSource = require('../config/dataSource.js');
const  Employee  = require('../entities/employee');
const LeaveBalance  = require('../entities/leaveBalance');
const LeaveType = require('../entities/leaveType');

const userService = {
  getUserById: async (empId) => {
    return await AppDataSource.getRepository(Employee).findOneBy({ Emp_ID: empId });
  },

  getUserLeaveBalance: async (empId) => {
    return await AppDataSource
      .getRepository(LeaveBalance)
      .createQueryBuilder('lb')
      .leftJoinAndSelect('lb.leaveType', 'lt')
      .where('lb.emp_id = :empId', { empId })
      .getMany();
  },

  getReportees: async (managerId) => {
    return await AppDataSource.getRepository(Employee).find({ where: { Manager_ID: managerId } });
  }
};

module.exports = userService;
