const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const AppDataSource = require("./config/dataSource");
const Employee = require("./entities/employee");
const leaveBalance = require("./entities/leaveBalance");
const leaveType = require("./entities/leaveType");

require("dotenv").config({ path: "./env" });

console.log(Employee);


// connecting to redis server
const connection = new IORedis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.log("Connected to Redis!");
});

console.log("Connecting to Redis...");

const worker = new Worker(
  "data-import",
  async (job) => {
    const rows = job.data.rows;
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      // Query runner started as a transaction with concurrency control
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const employeeRepo = queryRunner.manager.getRepository(Employee);
        const savedEmployees = await employeeRepo.save(rows);

        const leaveTypes = await queryRunner.manager.find(leaveType);
        const currentYear = new Date().getFullYear();

        const leaveBalances = [];
        for (const emp of savedEmployees) {
          for (const leaveType of leaveTypes) {
            leaveBalances.push({
              emp_id: emp.Emp_ID,
              leave_type_id: leaveType.leave_id,
              year: currentYear,
              total_allocated: leaveType.max_days,
              carried_forward: 0,
              used: 0,
              remaining: leaveType.max_days,
            });
          }
        }

        const leaveRepo = queryRunner.manager.getRepository(leaveBalance);
        await leaveRepo.save(leaveBalances);

        await queryRunner.commitTransaction();
        console.log(`Inserted ${savedEmployees.length} employees and their leave balances.`);
      } catch (innerErr) {
        await queryRunner.rollbackTransaction();
        console.error("Transaction failed:", innerErr.message);
        throw innerErr;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error(error);
      throw new Error(
        `Error in inserting data: ${error.sqlMessage || error.message}`
      );
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(` Job ${job.id} completed`);
});

worker.on("failed", (job, failedReason) => {
  console.error(`Job ${job.id} failed`, failedReason);
});
