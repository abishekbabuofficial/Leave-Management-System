const { getRepository } = require("typeorm");
const AppDataSource = require("../config/dataSource.js");
const Employee = require("../entities/employee");
const LeaveBalance = require("../entities/leaveBalance");
const LeaveType = require("../entities/leaveType");
const { log } = require("winston");
const logger = require("../utils/logger");

const userService = {
  getUserById: async (empId) => {
    if (empId)
      return await AppDataSource.getRepository(Employee).findOneBy({
        Emp_ID: empId,
      });
    else return;
  },

  getUserLeaveBalance: async (empId) => {
    return await AppDataSource.getRepository(LeaveBalance)
      .createQueryBuilder("lb")
      .leftJoinAndSelect("lb.leaveType", "lt")
      .where("lb.emp_id = :empId", { empId })
      .getMany();
  },

  getReportees: async (managerId) => {
    const reportees = await AppDataSource.getRepository(Employee).find({
      where: { Manager_ID: managerId },
    });

    // Fetch leave balance for each reportee
    const reporteesWithLeaveBalance = await Promise.all(
      reportees.map(async (reportee) => {
        const leaveBalance = await userService.getUserLeaveBalance(
          reportee.Emp_ID
        );
        return {
          ...reportee,
          leaveBalance,
        };
      })
    );

    return reporteesWithLeaveBalance;
  },

  getAllUsers: async () => {
    const users = await AppDataSource.getRepository(Employee).find();

    // Fetch leave balance for each user
    const usersWithLeaveBalance = await Promise.all(
      users.map(async (user) => {
        const leaveBalance = await userService.getUserLeaveBalance(user.Emp_ID);
        const manager = await userService.getUserById(user.Manager_ID);
        return {
          ...user,
          leaveBalance,
          manager,
        };
      })
    );

    return usersWithLeaveBalance;
  },

  addEmployee: async (employeeData) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if employee with the same ID already exists
      const existingEmployee = await queryRunner.manager.findOne(Employee, {
        where: { Emp_ID: employeeData.Emp_ID },
      });

      if (existingEmployee) {
        throw new Error(
          `Employee with ID ${employeeData.Emp_ID} already exists`
        );
      }

      // Create new employee
      const newEmployee = {
        Emp_ID: employeeData.Emp_ID,
        Emp_name: employeeData.Emp_name,
        Role: employeeData.Role || "EMPLOYEE",
        Manager_ID: employeeData.Manager_ID,
        is_active: true,
        password: employeeData.password || null,
      };

      // Save the employee
      const savedEmployee = await queryRunner.manager.save(
        Employee,
        newEmployee
      );

      // Get all leave types
      const leaveTypes = await queryRunner.manager.find(LeaveType);

      // Current year
      const currentYear = new Date().getFullYear();

      // Create leave balances for each leave type
      for (const leaveType of leaveTypes) {
        const leaveBalance = {
          emp_id: savedEmployee.Emp_ID,
          leave_type_id: leaveType.leave_id,
          year: currentYear,
          total_allocated: leaveType.max_days,
          carried_forward: 0,
          used: 0,
          remaining: leaveType.max_days, // Initially, remaining = total_allocated
        };

        await queryRunner.manager.save(LeaveBalance, leaveBalance);
      }

      await queryRunner.commitTransaction();

      return savedEmployee;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(`Error adding employee: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  },

  updateEmployee: async (empId, employeeData) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if employee exists
      const existingEmployee = await queryRunner.manager.findOne(Employee, {
        where: { Emp_ID: empId },
      });

      if (!existingEmployee) {
        throw new Error(`Employee with ID ${empId} not found`);
      }

      // Update employee data
      const updatedEmployee = {
        ...existingEmployee,
        Emp_name: employeeData.Emp_name || existingEmployee.Emp_name,
        Role: employeeData.Role || existingEmployee.Role,
        Manager_ID: employeeData.Manager_ID || existingEmployee.Manager_ID,
        is_active:
          employeeData.is_active !== undefined
            ? employeeData.is_active
            : existingEmployee.is_active,
      };

      // Save the updated employee
      const savedEmployee = await queryRunner.manager.save(
        Employee,
        updatedEmployee
      );

      await queryRunner.commitTransaction();

      return savedEmployee;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(`Error updating employee: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  },

  // Search for managers by name or ID
  searchManagers: async (query) => {
    try {
      console.log(query)
      // Search for employees with manager or director roles whose name or ID contains the query
      const managers = await AppDataSource.getRepository(Employee)
        .createQueryBuilder("employee")
        .where(
          "(employee.Role = :managerRole OR employee.Role = :directorRole)"
        )
        .andWhere(
          "(employee.Emp_name ILIKE :query OR CAST(employee.Emp_ID AS TEXT) ILIKE :query)"
        )
        .setParameters({
          managerRole: "MANAGER",
          directorRole: "DIRECTOR",
          query: `%${query}%`,
        })
        .orderBy("employee.Emp_name", "ASC")
        .limit(10)
        .getMany();

      // console.log(managers);

      return managers;
    } catch (error) {
      logger.error(`Error searching managers: ${error.message}`);
      throw error;
    }
  },

  // Delete an employee and all related records
  deleteEmployee: async (empId) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if employee exists
      const existingEmployee = await queryRunner.manager.findOne(Employee, {
        where: { Emp_ID: empId },
      });

      if (!existingEmployee) {
        throw new Error(`Employee with ID ${empId} not found`);
      }

      // Check if employee has reportees
      const reportees = await queryRunner.manager.find(Employee, {
        where: { Manager_ID: empId },
      });

      if (reportees.length > 0) {
        throw new Error(`Cannot delete employee ${existingEmployee.Emp_name} as they have ${reportees.length} reportees. Please reassign the reportees first.`);
      }

      const LeaveRequest = require("../entities/leaveRequest");
      await queryRunner.manager.delete(LeaveRequest, { emp_id: empId });
      logger.info(`Deleted leave requests for employee ${empId}`);

      await queryRunner.manager.delete(LeaveBalance, { emp_id: empId });
      logger.info(`Deleted leave balances for employee ${empId}`);

      await queryRunner.manager.delete(Employee, { Emp_ID: empId });
      logger.info(`Deleted employee with ID ${empId}`);

      await queryRunner.commitTransaction();
      return { success: true, message: `Employee with ID ${empId} has been deleted successfully` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error(`Error deleting employee: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  },
};

module.exports = userService;
