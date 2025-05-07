const userService = require("../services/userService");
const logger = require("../utils/logger");

const getUserProfile = async (req, res) => {
  try {
    const { empId } = req.params;
    const user = await userService.getUserById(empId);
    const balances = await userService.getUserLeaveBalance(empId);
    const manager = await userService.getUserById(user.Manager_ID);

    if (!user) {
      logger.warn(`User with ID ${empId} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user, leave_balances: balances ,manager});
  } catch (err) {
    logger.error(`${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

const getReportees = async (req, res) => {
  try {
    const { empId } = req.params;
    const reportees = await userService.getReportees(empId);
    res.json(reportees);
  } catch (err) {
    logger.error(`${err.message}`);
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  getUserProfile,
  getReportees,
};
