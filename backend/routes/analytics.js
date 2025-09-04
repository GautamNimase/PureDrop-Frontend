const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Connection = require('../models/Connection');
const MeterReading = require('../models/MeterReading');
const Bill = require('../models/Bill');
const Alert = require('../models/Alert');
const Complaint = require('../models/Complaint');
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
router.get('/summary', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeConnections = await Connection.countDocuments({ status: 'Active' });
    const pendingBills = await Bill.countDocuments({ paymentStatus: 'Unpaid' });
    const overdueBills = await Bill.countDocuments({ paymentStatus: 'Overdue' });
    const totalReadings = await MeterReading.countDocuments();
    const activeAlerts = await Alert.countDocuments({ status: 'Active' });
    const activeComplaints = await Complaint.countDocuments({ status: { $in: ['Open', 'In Progress'] } });
    const totalOutstanding = await Bill.aggregate([
      { $match: { paymentStatus: { $in: ['Unpaid', 'Overdue'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const averageSystemConsumption = await MeterReading.aggregate([
      { $group: { _id: null, avg: { $avg: '$unitsConsumed' } } }
    ]);

    res.json({
      totalUsers,
      activeConnections,
      pendingBills,
      overdueBills,
      totalReadings,
      activeAlerts,
      activeComplaints,
      totalOutstanding: totalOutstanding[0]?.total || 0,
      averageSystemConsumption: averageSystemConsumption[0]?.avg || 0
    });
  } catch (err) {
    console.error('Error fetching summary analytics:', err);
    res.status(500).json({ error: 'Failed to fetch summary analytics' });
  }
});

// GET /api/analytics/user/:userId - get detailed analytics for a specific user
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const userConnections = await Connection.find({ user: userId });
    const connectionIds = userConnections.map(c => c._id);
    const userReadings = await MeterReading.find({ connection: { $in: connectionIds } });
    const readingIds = userReadings.map(r => r._id);
    const userBills = await Bill.find({ meterReading: { $in: readingIds } });
    const userAlerts = await Alert.find({ user: userId });

    const analytics = {
      userId,
      connections: {
        total: userConnections.length,
        active: userConnections.filter(c => c.status === 'Active').length,
        inactive: userConnections.filter(c => c.status === 'Inactive').length
      },
      consumption: {
        totalReadings: userReadings.length,
        totalConsumption: userReadings.reduce((sum, r) => sum + r.unitsConsumed, 0),
        averageConsumption: userReadings.length > 0
          ? userReadings.reduce((sum, r) => sum + r.unitsConsumed, 0) / userReadings.length
          : 0,
      },
      billing: {
        totalBills: userBills.length,
        paidBills: userBills.filter(b => b.paymentStatus === 'Paid').length,
        unpaidBills: userBills.filter(b => b.paymentStatus === 'Unpaid').length,
        overdueBills: userBills.filter(b => b.paymentStatus === 'Overdue').length,
        totalAmount: userBills.reduce((sum, b) => sum + b.amount, 0),
        outstandingAmount: userBills.filter(b => b.paymentStatus !== 'Paid').reduce((sum, b) => sum + b.amount, 0)
      },
      alerts: {
        total: userAlerts.length,
        active: userAlerts.filter(a => a.status === 'Active').length,
        resolved: userAlerts.filter(a => a.status === 'Resolved').length,
      }
    };
    res.json(analytics);
  } catch (err) {
    console.error('Error fetching user analytics:', err);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// GET /api/analytics/consumption/:connectionId - get consumption analysis for a connection
router.get('/consumption/:connectionId', async (req, res) => {
  const connectionId = req.params.connectionId;
  try {
    const connectionReadings = await MeterReading.find({ connection: connectionId });

    if (connectionReadings.length === 0) {
      return res.status(404).json({ error: 'No readings found for this connection' });
    }

    const analysis = {
      connectionId,
      totalReadings: connectionReadings.length,
      averageConsumption: connectionReadings.reduce((sum, r) => sum + r.unitsConsumed, 0) / connectionReadings.length,
      highestConsumption: Math.max(...connectionReadings.map(r => r.unitsConsumed)),
      lowestConsumption: Math.min(...connectionReadings.map(r => r.unitsConsumed)),
      totalConsumption: connectionReadings.reduce((sum, r) => sum + r.unitsConsumed, 0),
    };

    res.json(analysis);
  } catch (err) {
    console.error('Error fetching consumption analytics:', err);
    res.status(500).json({ error: 'Failed to fetch consumption analytics' });
  }
});

// GET /api/analytics/billing/overdue - get overdue bills analysis
router.get('/billing/overdue', async (req, res) => {
  try {
    const overdueBills = await Bill.find({ paymentStatus: 'Overdue' });

    const analysis = {
      totalOverdue: overdueBills.length,
      totalOverdueAmount: overdueBills.reduce((sum, b) => sum + b.amount, 0),
      overdueBills: overdueBills.map(bill => ({
        ...bill.toObject(),
      }))
    };

    res.json(analysis);
  } catch (err) {
    console.error('Error fetching overdue bills analytics:', err);
    res.status(500).json({ error: 'Failed to fetch overdue bills analytics' });
  }
});

// GET /api/analytics/alerts/summary - get alerts summary
router.get('/alerts/summary', async (req, res) => {
  try {
    const total = await Alert.countDocuments();
    const active = await Alert.countDocuments({ status: 'Active' });
    const resolved = await Alert.countDocuments({ status: 'Resolved' });
    const byType = await Alert.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const bySeverity = await Alert.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    const alertSummary = {
      total,
      active,
      resolved,
      byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      bySeverity: bySeverity.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
    };

    res.json(alertSummary);
  } catch (err) {
    console.error('Error fetching alerts summary:', err);
    res.status(500).json({ error: 'Failed to fetch alerts summary' });
  }
});

module.exports = router; 