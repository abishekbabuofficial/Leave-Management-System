// data-source.js
const { DataSource } = require("typeorm");

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: 3306,
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "leave_system",
  synchronize: false,
  logging: true,
  entities: [
    require('../entities/employee'),
    require('../entities/leaveType'),
    require('../entities/leaveBalance'),
    require('../entities/leaveRequest'),
  ],
});

module.exports = AppDataSource;
