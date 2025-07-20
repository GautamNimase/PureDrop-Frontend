const express = require('express');
const router = express.Router();
const { auditLogs, getNextId } = require('./auditLogsStore');
const { validateUserData, validateMeterNumber, validateEmail, validatePhone } = require('../utils/validationFunctions');
const { 
  triggerAfterUserInsert, 
  triggerAfterUserUpdate, 
  triggerAfterUserDelete 
} = require('../utils/triggerFunctions');
const pool = require('../config/database');

// In-memory users data (placeholder)
let users = [
  { UserID: 1, Name: 'John Doe', Address: '123 Main St', Phone: '1234567890', Email: 'john@example.com', ConnectionType: 'Residential' },
  { UserID: 2, Name: 'Jane Smith', Address: '456 Oak Ave', Phone: '0987654321', Email: 'jane@example.com', ConnectionType: 'Commercial' },
];
let nextId = 3;

// GET /api/users - fetch all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - fetch a specific user
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await pool.query('SELECT * FROM users WHERE UserID = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/users/:id/summary - sp_GetUserSummary implementation
router.get('/:id/summary', (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Find the user
  const user = users.find(u => u.UserID === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Import required data
  const { connections } = require('./connections');
  const { readings } = require('./readings');
  const { bills } = require('./bills');
  const { alerts } = require('./alerts');
  const { complaints } = require('./complaints');
  const { getUserOutstandingAmount, calculateOverdueDays, isOverdue } = require('../utils/billingFunctions');
  
  // Get user's connections
  const userConnections = connections.filter(c => c.UserID === userId);
  const totalConnections = userConnections.length;
  const activeConnections = userConnections.filter(c => c.Status === 'Active').length;
  
  // Get user's readings through connections
  const userConnectionIds = userConnections.map(c => c.ConnectionID);
  const userReadings = readings.filter(r => userConnectionIds.includes(r.ConnectionID));
  const userReadingIds = userReadings.map(r => r.MeterReadingID);
  
  // Get user's bills through readings
  const userBills = bills.filter(b => userReadingIds.includes(b.MeterReadingID));
  const totalBills = userBills.length;
  const unpaidBills = userBills.filter(b => b.PaymentStatus === 'Unpaid').length;
  const overdueBills = userBills.filter(b => isOverdue(b.BillDate, b.PaymentStatus)).length;
  
  // Calculate outstanding amount
  const outstandingAmount = getUserOutstandingAmount(userBills);
  
  // Get user's alerts
  const userAlerts = alerts.filter(a => a.UserID === userId);
  const totalAlerts = userAlerts.length;
  const activeAlerts = userAlerts.filter(a => a.Status === 'Active').length;
  
  // Get user's complaints
  const userComplaints = complaints.filter(c => c.UserID === userId);
  const totalComplaints = userComplaints.length;
  const activeComplaints = userComplaints.filter(c => c.Status === 'Open' || c.Status === 'In Progress').length;
  
  // Calculate consumption statistics
  const totalConsumption = userReadings.reduce((sum, reading) => sum + reading.UnitsConsumed, 0);
  const averageConsumption = userReadings.length > 0 ? totalConsumption / userReadings.length : 0;
  
  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentReadings = userReadings.filter(r => new Date(r.ReadingDate) >= thirtyDaysAgo).length;
  const recentBills = userBills.filter(b => new Date(b.BillDate) >= thirtyDaysAgo).length;
  const recentAlerts = userAlerts.filter(a => new Date(a.Timestamp) >= thirtyDaysAgo).length;
  
  const userSummary = {
    UserID: user.UserID,
    Name: user.Name,
    Email: user.Email,
    ConnectionType: user.ConnectionType,
    
    // Connection Statistics
    TotalConnections: totalConnections,
    ActiveConnections: activeConnections,
    InactiveConnections: totalConnections - activeConnections,
    
    // Billing Statistics
    TotalBills: totalBills,
    UnpaidBills: unpaidBills,
    OverdueBills: overdueBills,
    OutstandingAmount: outstandingAmount,
    
    // Consumption Statistics
    TotalReadings: userReadings.length,
    TotalConsumption: totalConsumption,
    AverageConsumption: averageConsumption,
    
    // Alert Statistics
    TotalAlerts: totalAlerts,
    ActiveAlerts: activeAlerts,
    ResolvedAlerts: totalAlerts - activeAlerts,
    
    // Complaint Statistics
    TotalComplaints: totalComplaints,
    ActiveComplaints: activeComplaints,
    ResolvedComplaints: totalComplaints - activeComplaints,
    
    // Recent Activity (Last 30 Days)
    RecentReadings: recentReadings,
    RecentBills: recentBills,
    RecentAlerts: recentAlerts,
    
    // Connection Details
    Connections: userConnections.map(conn => ({
      ConnectionID: conn.ConnectionID,
      MeterNumber: conn.MeterNumber,
      Status: conn.Status,
      ConnectionDate: conn.ConnectionDate,
      SourceID: conn.SourceID
    })),
    
    // Recent Bills
    RecentBillsList: userBills
      .sort((a, b) => new Date(b.BillDate) - new Date(a.BillDate))
      .slice(0, 5)
      .map(bill => ({
        BillID: bill.BillID,
        BillDate: bill.BillDate,
        Amount: bill.Amount,
        PaymentStatus: bill.PaymentStatus,
        OverdueDays: calculateOverdueDays(bill.BillDate, bill.PaymentStatus),
        IsOverdue: isOverdue(bill.BillDate, bill.PaymentStatus)
      })),
    
    // Recent Alerts
    RecentAlertsList: userAlerts
      .sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp))
      .slice(0, 5)
      .map(alert => ({
        AlertID: alert.AlertID,
        Type: alert.Type,
        Message: alert.Message,
        Status: alert.Status,
        Timestamp: alert.Timestamp
      }))
  };
  
  res.json(userSummary);
});

// POST /api/users - add a new user
router.post('/', async (req, res) => {
  try {
    const { Name, Address, Phone, Email, ConnectionType } = req.body;
    // Validate input data
    const validationErrors = validateUserData({ Name, Address, Phone, Email, ConnectionType });
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }
    // Check if email already exists
    const [existingRows] = await pool.query('SELECT * FROM users WHERE LOWER(Email) = LOWER(?)', [Email]);
    if (existingRows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    // Insert into database
    const [result] = await pool.query(
      'INSERT INTO users (Name, Address, Phone, Email, ConnectionType) VALUES (?, ?, ?, ?, ?)',
      [Name, Address, Phone, Email, ConnectionType]
    );
    // Fetch the inserted user
    const [rows] = await pool.query('SELECT * FROM users WHERE UserID = ?', [result.insertId]);
    const newUser = rows[0];
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// PUT /api/users/:id - update a user
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { Name, Address, Phone, Email, ConnectionType } = req.body;
    // Validate input data
    const validationErrors = validateUserData({ Name, Address, Phone, Email, ConnectionType });
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }
    // Check if email already exists (excluding current user)
    const [existingRows] = await pool.query('SELECT * FROM users WHERE LOWER(Email) = LOWER(?) AND UserID != ?', [Email, id]);
    if (existingRows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    // Update the user in the database
    const [result] = await pool.query(
      'UPDATE users SET Name = ?, Address = ?, Phone = ?, Email = ?, ConnectionType = ? WHERE UserID = ?',
      [Name, Address, Phone, Email, ConnectionType, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Fetch the updated user
    const [rows] = await pool.query('SELECT * FROM users WHERE UserID = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - delete a user
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [result] = await pool.query('DELETE FROM users WHERE UserID = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /api/users/search/:query - search users by name or email
router.get('/search/:query', (req, res) => {
  const query = req.params.query.toLowerCase();
  const filtered = users.filter(user => 
    user.Name.toLowerCase().includes(query) || 
    user.Email.toLowerCase().includes(query)
  );
  res.json(filtered);
});

module.exports = { router, users }; 