require('dotenv').config(); // Load environment variables
const userRoutes = require('./routes/userRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const uploadRoute = require('./routes/upload.js');
const AppDataSource = require('./config/dataSource.js');
const logger = require('./utils/logger.js');
const express = require('express');
const cors = require("cors");
const app = express();
const PORT = process.env.PORT ;
const authRoutes = require('./routes/authRoutes.js');
const authenticateJWT = require('./middlewares/authenticateJWT.js');
const errorHandler = require('./middlewares/errorHandler.js');
const leaveAccrualJob = require("./cron/leaveAccrualJob.js");
const seeder = require("./seeder.js");

app.use(cors());
app.use(express.json());

// Middleware
app.use(errorHandler);
app.use('/api/auth', authRoutes);



// Routes
app.use('/api/users',authenticateJWT, userRoutes);
app.use('/api/leaves',authenticateJWT, leaveRoutes);
app.use('/api/approvals',authenticateJWT, approvalRoutes);
app.use('/api', uploadRoute);

// Start cron job for leave accrual
leaveAccrualJob();
logger.info("Leave accrual cron job activated")

// Seed data into the database (optional)
// seeder();



// Initialize the database connection
  AppDataSource.initialize()
  .then(() => {
    logger.info("Database connection established");
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    logger.error("Error during Data Source initialization", err);
  });