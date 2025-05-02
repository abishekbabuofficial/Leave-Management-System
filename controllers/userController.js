const userService = require('../services/userService');

const getUserProfile = async (req, res) => {
  try {
    const { empId } = req.params;
    const user = await userService.getUserById(empId);
    const balances = await userService.getUserLeaveBalance(empId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user, leave_balances: balances });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getReportees = async (req, res) => {
  try {
    const { managerId } = req.params;
    const reportees = await userService.getReportees(managerId);
    res.json(reportees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUserProfile,
  getReportees
};
