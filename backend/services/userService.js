const { getRepository } = require('typeorm');
const AppDataSource = require('../config/dataSource.js');
const  Employee  = require('../entities/employee');
const LeaveBalance  = require('../entities/leaveBalance');
const LeaveType = require('../entities/leaveType');
const { log } = require('winston');

const userService = {
  getUserById: async (empId) => {
    if(empId)
    return await AppDataSource.getRepository(Employee).findOneBy({ Emp_ID: empId });
    else
    return
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
