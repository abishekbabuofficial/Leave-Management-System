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

    // Fetch leave balance for each reportee
    const reporteesWithLeaveBalance = await Promise.all(reportees.map(async (reportee) => {
      const leaveBalance = await userService.getUserLeaveBalance(reportee.Emp_ID);
      return {
        ...reportee,
        leaveBalance
      };
    }));

    return reporteesWithLeaveBalance;
  },

  getAllUsers: async () => {
    const users = await AppDataSource.getRepository(Employee).find();

    // Fetch leave balance for each user
    const usersWithLeaveBalance = await Promise.all(users.map(async (user) => {
      const leaveBalance = await userService.getUserLeaveBalance(user.Emp_ID);
      return {
        ...user,
        leaveBalance
      };
    }));

    return usersWithLeaveBalance;
  }

};

module.exports = userService;
