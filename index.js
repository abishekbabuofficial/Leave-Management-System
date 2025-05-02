require('dotenv').config(); // Load environment variables
const userRoutes = require('./routes/userRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const express = require('express');
const AppDataSource = require('./config/dataSource.js'); // Your TypeORM config
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/approvals', approvalRoutes);

// Initialize DB and Start Server
// AppDataSource.initialize()
//   .then(() => {
//     console.log('Database connected successfully');
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error('Error during Data Source initialization', err);
//   });

  AppDataSource.initialize()
  .then(() => {
    console.log("Database connection established");
    app.listen(3000, () => console.log("Server running on port 3000"));
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });