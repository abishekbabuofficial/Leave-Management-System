const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authorizeRoles = require("../middlewares/authorizeRoles");

// View user profile with leave balances
router.get(
  "/profile",
  authorizeRoles("EMPLOYEE", "MANAGER", "DIRECTOR", "HR"),
  userController.getUserProfile
);

// Get reportees for a manager
router.get(
  "/reportees",
  authorizeRoles("MANAGER", "DIRECTOR", "HR"),
  userController.getReportees
);

// Get all users for a HR
router.get("/all-users", authorizeRoles("HR"), userController.getAllUsers);

// Get user leave balances
router.get(
  "/leave-balance",
  authorizeRoles("EMPLOYEE", "MANAGER", "DIRECTOR", "HR"),
  userController.getUserLeaveBalance
);

// Add a new employee (HR only)
router.post("/add-employee", authorizeRoles("HR"), userController.addEmployee);

// Update an existing employee (HR only)
router.put(
  "/update-employee/:employeeId",
  authorizeRoles("HR"),
  userController.updateEmployee
);

// Search for managers by name
router.get(
  "/search-managers",
  authorizeRoles("EMPLOYEE", "MANAGER", "DIRECTOR", "HR"),
  userController.searchManagers
);

// Delete an employee (HR only)
router.delete(
  "/delete-employee/:employeeId",
  authorizeRoles("HR"),
  userController.deleteEmployee
);

module.exports = router;
