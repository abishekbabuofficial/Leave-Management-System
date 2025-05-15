require('dotenv').config(); // Load environment variables
const userRoutes = require('./routes/userRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const express = require('express');
const cors = require("cors");
const AppDataSource = require('./config/dataSource.js');
const app = express();
const PORT = process.env.PORT || 3000;
const authRoutes = require('./routes/authRoutes.js');
const authenticateJWT = require('./middlewares/authenticateJWT.js');
const logger = require('./utils/logger.js');
const errorHandler = require('./middlewares/errorHandler.js');

app.use(cors());

// Middleware
app.use(express.json());
app.use(errorHandler);
app.use('/api/auth', authRoutes);



// Routes
app.use('/api/users',authenticateJWT, userRoutes);
app.use('/api/leaves',authenticateJWT, leaveRoutes);
app.use('/api/approvals',authenticateJWT, approvalRoutes);

  AppDataSource.initialize()
  .then(() => {
    logger.info("Database connection established");
    app.listen(3000, () => logger.info("Server running on port 3000"));
  })
  .catch((err) => {
    logger.error("Error during Data Source initialization", err);
  });