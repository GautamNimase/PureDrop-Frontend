const connectDB = require('./config/mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB(app);

// Rate limiting
app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
const usersRoute = require('./routes/users');
app.use('/api/users', usersRoute);
const waterSourcesRoute = require('./routes/waterSources');
app.use('/api/water-sources', waterSourcesRoute);
const connectionsRoute = require('./routes/connections');
app.use('/api/connections', connectionsRoute);
const readingsRoute = require('./routes/readings');
app.use('/api/readings', readingsRoute);
const billsRoute = require('./routes/bills');
app.use('/api/bills', billsRoute);
const employeesRoute = require('./routes/employees');
app.use('/api/employees', employeesRoute);
const alertsRoute = require('./routes/alerts');
app.use('/api/alerts', alertsRoute);
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/consumption', require('./routes/consumption'));
app.use('/api/quality', require('./routes/quality'));
app.use('/api/audit', require('./routes/audit'));

// Analytics route
const analyticsRoute = require('./routes/analytics');
app.use('/api/analytics', analyticsRoute);

// Views route - MongoDB aggregation endpoints
const viewsRoute = require('./routes/views');
app.use('/api/views', viewsRoute);

// Add authentication routes
const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute);

// Summary stats endpoint
app.get('/api/summary', async (req, res) => {
  try {
    const User = require('./models/User');
    const Employee = require('./models/Employee');
    const Connection = require('./models/Connection');
    const Bill = require('./models/Bill');
    const Alert = require('./models/Alert');
    const Complaint = require('./models/Complaint');

    const summary = {
      users: await User.countDocuments(),
      employees: await Employee.countDocuments(),
      connections: await Connection.countDocuments(),
      bills: await Bill.countDocuments(),
      alerts: await Alert.countDocuments(),
      complaints: await Complaint.countDocuments()
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    res.json({ 
      status: isConnected ? 'OK' : 'ERROR',
      message: isConnected ? 'Water System API is running' : 'Database connection failed',
      timestamp: new Date().toISOString(),
      database: isConnected ? 'Connected' : 'Disconnected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Database stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const User = require('./models/User');
    const Employee = require('./models/Employee');
    const Connection = require('./models/Connection');
    const MeterReading = require('./models/MeterReading');
    const Bill = require('./models/Bill');
    const Alert = require('./models/Alert');
    const Complaint = require('./models/Complaint');
    const AuditLog = require('./models/AuditLog');

    const stats = {
      users: await User.countDocuments(),
      employees: await Employee.countDocuments(),
      connections: await Connection.countDocuments(),
      meter_readings: await MeterReading.countDocuments(),
      bills: await Bill.countDocuments(),
      alerts: await Alert.countDocuments(),
      complaints: await Complaint.countDocuments(),
      audit_logs: await AuditLog.countDocuments()
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}` 
  });
});

module.exports = app; 