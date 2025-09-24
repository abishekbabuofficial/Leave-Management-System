const AppDataSource = require("./config/dataSource");
const policy = require("./data/policy");

module.exports = async () => {
  await AppDataSource.initialize();
       const policyRepo = AppDataSource.getRepository(require("./entities/accrualPolicy"));

  console.log("Seeding started...");

  // Insert Roles
//   const role = await roleRepo.save(roles);

  // Insert Leave Types
//   const leaveTypes = await leaveTypeRepo.save(leaveType);

  // Insert Employees
//   const employees = await employeeRepo.save(employee);

  // Insert Auth
//   await authRepo.save(auth);

  // Insert Holidays
//   await holidayRepo.save(holiday);

  // Insert Leave Balance
//   await leaveBalanceRepo.save(leaveBalance);

  // Insert Policy
  await policyRepo.save(policy);


  console.log("Seeding completed.");
  process.exit(0);
};

