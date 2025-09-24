const AppDataSource = require("../config/dataSource");
const cron = require("node-cron");
const leaveBalance = require("../entities/leaveBalance");
const accrualPolicy = require("../entities/accrualPolicy");
const employee = require("../entities/employee");
const logger = require("../utils/logger");

const runLeaveAccrual = async () => {
  const connection = AppDataSource;

  try {
    if (!connection.isInitialized) {
      await connection.initialize();
    }

    const leaveBalanceRepo = connection.getRepository(leaveBalance);
    const accrualPolicyRepo = connection.getRepository(accrualPolicy);
    const employeeRepo = connection.getRepository(employee);

    // Get all active employees
    const employees = await employeeRepo.find({
      where: { is_active: true },
    });

    logger.info(
      `Processing leave accrual for ${employees.length} active employees...`
    );

    for (const employee of employees) {
      const policies = await accrualPolicyRepo.find({
        where: { Role: employee.Role },
        relations: ["leaveType"],
      });

      if (policies.length === 0) {
        logger.warn(
          `No accrual policies found for employee ${employee.Emp_ID} with role ${employee.Role}`
        );
        continue;
      }

      for (const policy of policies) {
        if (!policy.total_days_year || policy.total_days_year <= 0) {
          logger.warn(
            `Invalid total_days_year for policy ${policy.id}, skipping...`
          );
          continue;
        }

        const monthlyAccrual = parseFloat(
          (policy.total_days_year / 12).toFixed(2)
        );
        console.log("monthlyAccrual", monthlyAccrual, typeof monthlyAccrual);

        let balance = await leaveBalanceRepo.findOne({
          where: {
            emp_id: employee.Emp_ID,
            leave_type_id: policy.leave_id,
          },
          relations: ["employee", "leaveType"],
        });

        if (balance) {
          balance.total_allocated =
            parseFloat(balance.total_allocated || 0) + monthlyAccrual;
          balance.remaining =
            parseFloat(balance.remaining || 0) + monthlyAccrual;

          await leaveBalanceRepo.save(balance);
          logger.info(
            `Updated balance for employee ${employee.Emp_ID}, leave type ${policy.leave_id}: +${monthlyAccrual} days`
          );
        } else {
          await leaveBalanceRepo.save({
            emp_id: employee.Emp_ID,
            leave_type_id: policy.leave_id,
            total_allocated: parseFloat(monthlyAccrual),
            used: 0,
            remaining: parseFloat(monthlyAccrual),
          });
          logger.info(
            `Created new balance for employee ${employee.Emp_ID}, leave type ${policy.leave_id}: ${monthlyAccrual} days`
          );
        }
      }
    }

    logger.info(
      `Monthly leave accrual completed for ${employees.length} employees.`
    );
  } catch (error) {
    logger.error("Error during leave accrual:", error);
    throw error;
  }
};

module.exports = () => {
  // Schedule: Run at 00:00 on the 1st of every month
  cron.schedule("0 0 1 * *", () => {
    logger.info("Running monthly leave accrual...");
    runLeaveAccrual().catch((err) => logger.error("Accrual error:", err));
  });
};
