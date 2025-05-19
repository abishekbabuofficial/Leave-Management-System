// const { Queue } = require("bullmq");
// const IORedis = require("ioredis");

// // connecting to redis server
// const connection = new IORedis({
//   host: "localhost",
//   port: 6379,
//   maxRetriesPerRequest: null,
// });

// connection.on("connect", () => console.log("Redis connected"));
// connection.on("error", (err) => console.error("Redis connection error:", err));

// const dataImportQueue = new Queue("data-import", {
//   connection,
//   defaultJobOptions: {
//     attempts: 3,
//     backoff: {
//       type: "exponential",
//       delay: 1000,
//     },
//   },
// });

// module.exports = dataImportQueue;
