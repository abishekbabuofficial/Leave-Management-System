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
    const reportees = await AppDataSource.getRepository(Employee).find({ where: { Manager_ID: managerId } });

    // Fetch leave balance for each reportee and combine the data
    const reporteesWithLeaveBalance = await Promise.all(reportees.map(async (reportee) => {
      const leaveBalance = await userService.getUserLeaveBalance(reportee.Emp_ID);
      return {
        ...reportee,
        leaveBalance
      };
    }));

    return reporteesWithLeaveBalance;
  }
};

module.exports = userService;
