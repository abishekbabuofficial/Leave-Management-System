const userService = require("../services/userService");
const logger = require("../utils/logger");

const getUserProfile = async (req, res) => {
  try {
    const { emp_ID } = req.user;
    const user = await userService.getUserById(emp_ID);
    const balances = await userService.getUserLeaveBalance(emp_ID);
    const manager = await userService.getUserById(user.Manager_ID);

    if (!user) {
      logger.warn(`User with ID ${emp_ID} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user, leave_balances: balances, manager });
  } catch (err) {
    logger.error(`${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const getReportees = async (req, res) => {
  try {
    const { emp_ID } = req.user;
    const reportees = await userService.getReportees(emp_ID);
    res.json(reportees);
  } catch (err) {
    logger.error(`${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { emp_ID } = req.user;
    const users = await userService.getAllUsers(emp_ID);
    res.json(users);
  } catch (err) {
    logger.error(`${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const getUserLeaveBalance = async (req, res) => {
  try {
    const { emp_ID } = req.user;
    const balances = await userService.getUserLeaveBalance(emp_ID);
    res.json(balances);
  } catch (err) {
    logger.error(`${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const addEmployee = async (req, res) => {
  try {
    const employeeData = req.body;

    // Validate required fields
    if (!employeeData.Emp_ID || !employeeData.Emp_name) {
      return res
        .status(400)
        .json({ message: "Employee ID and name are required" });
    }

    const newEmployee = await userService.addEmployee(employeeData);

    res.status(201).json({
      message: "Employee added successfully",
      employee: newEmployee,
    });
  } catch (err) {
    logger.error(`Error adding employee: ${err.message}`);

    // Handle duplicate employee error
    if (err.message.includes("already exists")) {
      return res.status(409).json({ message: err.message });
    }

    res
      .status(500)
      .json({ message: "Failed to add employee", error: err.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employeeData = req.body;

    // Validate employee ID
    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    const updatedEmployee = await userService.updateEmployee(
      employeeId,
      employeeData
    );

    res.json({
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (err) {
    logger.error(`Error updating employee: ${err.message}`);

    // Handle employee not found error
    if (err.message.includes("not found")) {
      return res.status(404).json({ message: err.message });
    }

    res
      .status(500)
      .json({ message: "Failed to update employee", error: err.message });
  }
};

// Search for managers by name
const searchManagers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        message: "Search query must be at least 2 characters long",
      });
    }

    const managers = await userService.searchManagers(query);
    res.json(managers);
  } catch (err) {
    logger.error(`Error searching managers: ${err.message}`);
    res.status(500).json({
      message: "Failed to search managers",
      error: err.message,
    });
  }
};

// Delete an employee
const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Validate employee ID
    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // Only HR should be able to delete employees
    if (req.user.Role !== "HR") {
      return res.status(403).json({ message: "Only HR can delete employees" });
    }

    const result = await userService.deleteEmployee(employeeId);
    res.json({
      message: result.message,
      success: result.success,
    });
  } catch (err) {
    logger.error(`Error deleting employee: ${err.message}`);

    // Handle specific errors
    if (err.message.includes("not found")) {
      return res.status(404).json({ message: err.message });
    }

    if (err.message.includes("reportees")) {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({
      message: "Failed to delete employee",
      error: err.message,
    });
  }
};

module.exports = {
  getUserProfile,
  getReportees,
  getUserLeaveBalance,
  getAllUsers,
  addEmployee,
  updateEmployee,
  searchManagers,
  deleteEmployee,
};
