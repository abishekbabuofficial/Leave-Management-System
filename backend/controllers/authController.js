const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userService = require("../services/userService");
const AppDataSource = require("../config/dataSource");
const Employee = require("../entities/employee");
const logger = require("../utils/logger");
const { log } = require("winston");
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

const login = async (req, res) => {
  const { emp_id, password } = req.body;

  try {
    const user = await userService.getUserById(emp_id);
    if (!user) {
      logger.warn(`User with ID ${emp_id} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password); // assuming hashed passwords
    if (!isMatch){
      logger.warn("Invalid Credentials");
      return res.status(401).json({ message: "Invalid credentials" });}

    const token = jwt.sign(
      { emp_ID: user.Emp_ID, Role: user.Role, Emp_name: user.Emp_name },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const signup = async (req, res) => {
  try {
    const { emp_id, password } = req.body;

    // Validate inputs
    if (!emp_id || !password) {
      logger.warn("Emp_id and password are required");
      return res
        .status(400)
        .json({ message: "emp_id and password are required" });
    }

    const userRepo = AppDataSource.getRepository(Employee);
    const user = await userRepo.findOneBy({ Emp_ID: emp_id });

    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (user.password) {
      logger.warn("Password already set. Please log in.");
      return res
        .status(400)
        .json({ message: "Password already set. Please log in." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await userRepo.save(user);
    logger.info("Password set successfully. You can now log in.");
    res.json({ message: "Password set successfully. You can now log in." });
  } catch (err) {
    logger.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { login, signup };
