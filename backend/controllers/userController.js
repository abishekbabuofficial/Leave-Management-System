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

    res.json({ user, leave_balances: balances ,manager});
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

const getUserLeaveBalance = async (req,res)=>{
  try{
    const {emp_ID}=req.user
    const balances = await userService.getUserLeaveBalance(emp_ID);
    res.json(balances)
  }
  catch (err) {
    logger.error(`${err.message}`);
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  getUserProfile,
  getReportees,
  getUserLeaveBalance,
  getAllUsers,
};
