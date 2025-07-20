const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
// app.set('trust proxy', true); // Commented out for local development to avoid express-rate-limit error
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database connection
const db = require('./config/database');
const { testConnection } = require('./utils/databaseUtils');

// Initialize database
const { initializeDatabase } = require('./database/init');

// Routes
const usersRoute = require('./routes/users');
app.use('/api/users', usersRoute.router);
const waterSourcesRoute = require('./routes/waterSources');
app.use('/api/water-sources', waterSourcesRoute.router);
const connectionsRoute = require('./routes/connections');
app.use('/api/connections', connectionsRoute.router);
const readingsRoute = require('./routes/readings');
app.use('/api/readings', readingsRoute.router);
const billsRoute = require('./routes/bills');
app.use('/api/bills', billsRoute.router);
const employeesRoute = require('./routes/employees');
app.use('/api/employees', employeesRoute.router);
const alertsRoute = require('./routes/alerts');
app.use('/api/alerts', alertsRoute.router);
app.use('/api/complaints', require('./routes/complaints').router);
app.use('/api/consumption', require('./routes/consumption'));
app.use('/api/quality', require('./routes/quality'));
app.use('/api/audit', require('./routes/audit'));

// Analytics route - import properly
const analyticsRoute = require('./routes/analytics');
app.use('/api/analytics', analyticsRoute.router);

// Views route - database views as API endpoints
const viewsRoute = require('./routes/views');
app.use('/api/views', viewsRoute.router);

// Add authentication routes
const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute);

// Summary stats endpoint
app.get('/api/summary', async (req, res) => {
  try {
    const { executeStoredProcedure } = require('./utils/databaseUtils');
    const summary = await executeStoredProcedure('sp_GetSystemSummary');
    res.json(summary[0]);
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ error: 'Failed to get system summary' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const isConnected = await testConnection();
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
    const { getDatabaseStats } = require('./utils/databaseUtils');
    const stats = await getDatabaseStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get database stats' });
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
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔌 Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Database connection failed. Please check your MySQL configuration.');
      console.log('📋 Make sure MySQL is running and update your .env file with correct credentials.');
      process.exit(1);
    }
    
    console.log('✅ Database connection successful!');
    
    // Initialize database schema (only if needed)
    console.log('📋 Initializing database schema...');
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📊 Database stats: http://localhost:${PORT}/api/stats`);
      console.log(`📋 API Documentation: http://localhost:${PORT}/api/views/user-overview`);
    });
    
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer(); 