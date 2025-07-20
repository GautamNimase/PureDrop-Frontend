const express = require('express');
const router = express.Router();
const { users } = require('./users');
const { connections } = require('./connections');
const { readings } = require('./readings');
const { bills } = require('./bills');
const { alerts } = require('./alerts');
const { complaints } = require('./complaints');
const { 
  calculateAverageConsumption, 
  getUserMonthlyConsumption, 
  getConsumptionTrend 
} = require('../utils/consumptionFunctions');
const { 
  getUserOutstandingAmount, 
  calculateOverdueDays, 
  isOverdue 
} = require('../utils/billingFunctions');

// GET /api/analytics/summary - get system summary with calculations
router.get('/summary', (req, res) => {
  const totalUsers = users.length;
  const totalEmployees = 0; // Add when employees route is available
  const activeConnections = connections.filter(c => c.Status === 'Active').length;
  const pendingBills = bills.filter(b => b.PaymentStatus === 'Unpaid').length;
  const overdueBills = bills.filter(b => isOverdue(b.BillDate, b.PaymentStatus)).length;
  const totalReadings = readings.length;
  const totalSources = 0; // Add when water sources route is available
  const activeAlerts = alerts.filter(a => a.Status === 'Active').length;
  const activeComplaints = complaints.filter(c => c.Status === 'Open' || c.Status === 'In Progress').length;

  // Calculate total outstanding amount
  const totalOutstanding = bills
    .filter(b => b.PaymentStatus === 'Unpaid' || b.PaymentStatus === 'Overdue')
    .reduce((total, bill) => {
      const overdueDays = calculateOverdueDays(bill.BillDate, bill.PaymentStatus);
      return total + bill.Amount;
    }, 0);

  // Calculate average consumption across all connections
  const allConsumptions = readings.map(r => r.UnitsConsumed);
  const averageSystemConsumption = allConsumptions.length > 0 
    ? allConsumptions.reduce((sum, consumption) => sum + consumption, 0) / allConsumptions.length 
    : 0;

  res.json({
    totalUsers,
    totalEmployees,
    activeConnections,
    pendingBills,
    overdueBills,
    totalReadings,
    totalSources,
    activeAlerts,
    activeComplaints,
    totalOutstanding: Math.round(totalOutstanding * 100) / 100,
    averageSystemConsumption: Math.round(averageSystemConsumption * 100) / 100
  });
});

// GET /api/analytics/user/:userId - get detailed analytics for a specific user
router.get('/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  
  // Get user's connections
  const userConnections = connections.filter(c => c.UserID === userId);
  const userConnectionIds = userConnections.map(c => c.ConnectionID);
  
  // Get user's readings
  const userReadings = readings.filter(r => userConnectionIds.includes(r.ConnectionID));
  
  // Get user's bills
  const userReadingIds = userReadings.map(r => r.MeterReadingID);
  const userBills = bills.filter(b => userReadingIds.includes(b.MeterReadingID));
  
  // Get user's alerts
  const userAlerts = alerts.filter(a => a.UserID === userId);
  
  // Calculate analytics
  const analytics = {
    userId,
    connections: {
      total: userConnections.length,
      active: userConnections.filter(c => c.Status === 'Active').length,
      inactive: userConnections.filter(c => c.Status === 'Inactive').length
    },
    consumption: {
      totalReadings: userReadings.length,
      totalConsumption: userReadings.reduce((sum, r) => sum + r.UnitsConsumed, 0),
      averageConsumption: userReadings.length > 0 
        ? userReadings.reduce((sum, r) => sum + r.UnitsConsumed, 0) / userReadings.length 
        : 0,
      highestConsumption: userReadings.length > 0 
        ? Math.max(...userReadings.map(r => r.UnitsConsumed)) 
        : 0,
      lowestConsumption: userReadings.length > 0 
        ? Math.min(...userReadings.map(r => r.UnitsConsumed)) 
        : 0
    },
    billing: {
      totalBills: userBills.length,
      paidBills: userBills.filter(b => b.PaymentStatus === 'Paid').length,
      unpaidBills: userBills.filter(b => b.PaymentStatus === 'Unpaid').length,
      overdueBills: userBills.filter(b => isOverdue(b.BillDate, b.PaymentStatus)).length,
      totalAmount: userBills.reduce((sum, b) => sum + b.Amount, 0),
      outstandingAmount: getUserOutstandingAmount(userBills)
    },
    alerts: {
      total: userAlerts.length,
      active: userAlerts.filter(a => a.Status === 'Active').length,
      resolved: userAlerts.filter(a => a.Status === 'Resolved').length,
      highConsumption: userAlerts.filter(a => a.Type === 'High Consumption').length,
      overdue: userAlerts.filter(a => a.Type === 'Payment Overdue').length
    }
  };
  
  res.json(analytics);
});

// GET /api/analytics/consumption/:connectionId - get consumption analysis for a connection
router.get('/consumption/:connectionId', (req, res) => {
  const connectionId = parseInt(req.params.connectionId);
  
  const connectionReadings = readings.filter(r => r.ConnectionID === connectionId);
  
  if (connectionReadings.length === 0) {
    return res.status(404).json({ error: 'No readings found for this connection' });
  }
  
  // Get consumption trend
  const trend = getConsumptionTrend(connectionId, readings, 6);
  
  // Calculate monthly consumption
  const monthlyConsumption = getUserMonthlyConsumption(
    connections.find(c => c.ConnectionID === connectionId)?.UserID || 0,
    connections,
    readings,
    6
  );
  
  const analysis = {
    connectionId,
    totalReadings: connectionReadings.length,
    averageConsumption: calculateAverageConsumption(connectionId, readings, 6),
    recentAverage: calculateAverageConsumption(connectionId, readings, 3),
    highestConsumption: Math.max(...connectionReadings.map(r => r.UnitsConsumed)),
    lowestConsumption: Math.min(...connectionReadings.map(r => r.UnitsConsumed)),
    totalConsumption: connectionReadings.reduce((sum, r) => sum + r.UnitsConsumed, 0),
    highConsumptionCount: connectionReadings.filter(r => r.UnitsConsumed > 100).length,
    trend,
    monthlyConsumption
  };
  
  res.json(analysis);
});

// GET /api/analytics/billing/overdue - get overdue bills analysis
router.get('/billing/overdue', (req, res) => {
  const overdueBills = bills.filter(b => isOverdue(b.BillDate, b.PaymentStatus));
  
  const analysis = {
    totalOverdue: overdueBills.length,
    totalOverdueAmount: overdueBills.reduce((sum, b) => sum + b.Amount, 0),
    averageOverdueDays: overdueBills.length > 0 
      ? overdueBills.reduce((sum, b) => sum + calculateOverdueDays(b.BillDate, b.PaymentStatus), 0) / overdueBills.length 
      : 0,
    maxOverdueDays: overdueBills.length > 0 
      ? Math.max(...overdueBills.map(b => calculateOverdueDays(b.BillDate, b.PaymentStatus))) 
      : 0,
    overdueBills: overdueBills.map(bill => ({
      ...bill,
      overdueDays: calculateOverdueDays(bill.BillDate, bill.PaymentStatus)
    }))
  };
  
  res.json(analysis);
});

// GET /api/analytics/alerts/summary - get alerts summary
router.get('/alerts/summary', (req, res) => {
  const alertSummary = {
    total: alerts.length,
    active: alerts.filter(a => a.Status === 'Active').length,
    resolved: alerts.filter(a => a.Status === 'Resolved').length,
    byType: {
      'High Consumption': alerts.filter(a => a.Type === 'High Consumption').length,
      'Payment Overdue': alerts.filter(a => a.Type === 'Payment Overdue').length,
      'Water Quality': alerts.filter(a => a.Type === 'Water Quality').length,
      'System Maintenance': alerts.filter(a => a.Type === 'System Maintenance').length
    },
    bySeverity: {
      high: alerts.filter(a => a.Severity === 'high').length,
      medium: alerts.filter(a => a.Severity === 'medium').length,
      low: alerts.filter(a => a.Severity === 'low').length
    }
  };
  
  res.json(alertSummary);
});

module.exports = { router }; 