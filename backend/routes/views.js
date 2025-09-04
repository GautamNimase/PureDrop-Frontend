const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Connection = require('../models/Connection');
const Bill = require('../models/Bill');
const Alert = require('../models/Alert');
const Complaint = require('../models/Complaint');
const MeterReading = require('../models/MeterReading');

// 1. User Overview View - user_overview
router.get('/user-overview', async (req, res) => {
  try {
    const userOverview = await User.aggregate([
      {
        $lookup: {
          from: 'connections',
          localField: '_id',
          foreignField: 'user',
          as: 'connections'
        }
      },
      {
        $lookup: {
          from: 'bills',
          localField: 'connections.meterReading',
          foreignField: 'meterReading',
          as: 'bills'
        }
      },
      {
        $project: {
          UserID: '$_id',
          Name: '$full_name',
          Email: '$email',
          Phone: '$phone_number',
          Address: '$address',
          ConnectionStatus: { $arrayElemAt: ['$connections.status', 0] },
          MeterNumber: { $arrayElemAt: ['$connections.meterNumber', 0] },
          LatestBillAmount: { $max: '$bills.amount' },
          LatestBillDate: { $max: '$bills.billDate' },
          TotalConnections: { $size: '$connections' },
          UnpaidBills: {
            $size: {
              $filter: {
                input: '$bills',
                as: 'bill',
                cond: { $eq: ['$$bill.paymentStatus', 'Unpaid'] }
              }
            }
          }
        }
      }
    ]);
    res.json(userOverview);
  } catch (err) {
    console.error('Error fetching user overview:', err);
    res.status(500).json({ error: 'Failed to fetch user overview' });
  }
});

// 2. Outstanding Bills View - outstanding_bills
router.get('/outstanding-bills', async (req, res) => {
  try {
    const outstandingBills = await Bill.aggregate([
      {
        $match: { paymentStatus: 'Unpaid' }
      },
      {
        $lookup: {
          from: 'meterreadings',
          localField: 'meterReading',
          foreignField: '_id',
          as: 'meterReading'
        }
      },
      { $unwind: '$meterReading' },
      {
        $lookup: {
          from: 'connections',
          localField: 'meterReading.connection',
          foreignField: '_id',
          as: 'connection'
        }
      },
      { $unwind: '$connection' },
      {
        $lookup: {
          from: 'users',
          localField: 'connection.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          BillID: '$_id',
          BillDate: '$billDate',
          Amount: '$amount',
          PaymentStatus: '$paymentStatus',
          UserID: '$user._id',
          Name: '$user.full_name',
          Email: '$user.email',
          ConnectionID: '$connection._id',
          MeterNumber: '$connection.meterNumber',
          UnitsConsumed: '$meterReading.unitsConsumed',
          ReadingDate: '$meterReading.readingDate'
        }
      }
    ]);
    res.json(outstandingBills);
  } catch (err) {
    console.error('Error fetching outstanding bills:', err);
    res.status(500).json({ error: 'Failed to fetch outstanding bills' });
  }
});

// 3. High Consumption Alerts View - high_consumption_alerts
router.get('/high-consumption-alerts', async (req, res) => {
  try {
    const highConsumptionAlerts = await Alert.aggregate([
      {
        $match: { type: 'High Consumption' }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'connections',
          localField: 'user._id',
          foreignField: 'user',
          as: 'connections'
        }
      },
      {
        $project: {
          AlertID: '$_id',
          Type: '$type',
          Message: '$message',
          Status: '$status',
          Timestamp: '$createdAt',
          UserID: '$user._id',
          Name: '$user.full_name',
          TotalConnections: { $size: '$connections' },
        }
      }
    ]);
    res.json(highConsumptionAlerts);
  } catch (err) {
    console.error('Error fetching high consumption alerts:', err);
    res.status(500).json({ error: 'Failed to fetch high consumption alerts' });
  }
});

// 4. User Complaints View - user_complaints
router.get('/user-complaints', async (req, res) => {
  try {
    const userComplaints = await Complaint.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          ComplaintID: '$_id',
          Message: '$description',
          Status: '$status',
          Timestamp: '$date',
          UserID: '$user._id',
          Name: '$user.full_name',
          Email: '$user.email',
          Phone: '$user.phone_number',
          Address: '$user.address',
          Response: '$response',
          Type: '$type'
        }
      }
    ]);
    res.json(userComplaints);
  } catch (err) {
    console.error('Error fetching user complaints:', err);
    res.status(500).json({ error: 'Failed to fetch user complaints' });
  }
});

// 5. Connection Meter Readings View - connection_meter_readings
router.get('/connection-meter-readings', async (req, res) => {
  try {
    const connectionMeterReadings = await MeterReading.aggregate([
      {
        $lookup: {
          from: 'connections',
          localField: 'connection',
          foreignField: '_id',
          as: 'connection'
        }
      },
      { $unwind: '$connection' },
      {
        $lookup: {
          from: 'users',
          localField: 'connection.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          MeterReadingID: '$_id',
          ReadingDate: '$readingDate',
          UnitsConsumed: '$unitsConsumed',
          ConnectionID: '$connection._id',
          MeterNumber: '$connection.meterNumber',
          UserID: '$user._id',
          Name: '$user.full_name',
          Email: '$user.email',
          ConnectionStatus: '$connection.status',
          ConnectionDate: '$connection.connectionDate',
          SourceID: '$connection.source'
        }
      }
    ]);
    res.json(connectionMeterReadings);
  } catch (err) {
    console.error('Error fetching connection meter readings:', err);
    res.status(500).json({ error: 'Failed to fetch connection meter readings' });
  }
});

// Additional view: Bill Payment History
router.get('/bill-payment-history', async (req, res) => {
  try {
    const billPaymentHistory = await Bill.aggregate([
      {
        $lookup: {
          from: 'meterreadings',
          localField: 'meterReading',
          foreignField: '_id',
          as: 'meterReading'
        }
      },
      { $unwind: '$meterReading' },
      {
        $lookup: {
          from: 'connections',
          localField: 'meterReading.connection',
          foreignField: '_id',
          as: 'connection'
        }
      },
      { $unwind: '$connection' },
      {
        $lookup: {
          from: 'users',
          localField: 'connection.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          BillID: '$_id',
          BillDate: '$billDate',
          Amount: '$amount',
          PaymentStatus: '$paymentStatus',
          PaymentDate: '$paymentDate',
          PaymentMethod: '$paymentMethod',
          UserID: '$user._id',
          Name: '$user.full_name',
          Email: '$user.email',
          ConnectionID: '$connection._id',
          MeterNumber: '$connection.meterNumber',
          UnitsConsumed: '$meterReading.unitsConsumed',
          ReadingDate: '$meterReading.readingDate'
        }
      }
    ]);
    res.json(billPaymentHistory);
  } catch (err) {
    console.error('Error fetching bill payment history:', err);
    res.status(500).json({ error: 'Failed to fetch bill payment history' });
  }
});

// Additional view: System Alerts Summary
router.get('/system-alerts-summary', async (req, res) => {
  try {
    const systemAlertsSummary = await Alert.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          AlertID: '$_id',
          Type: '$type',
          Message: '$message',
          Status: '$status',
          Timestamp: '$createdAt',
          UserID: '$user._id',
          UserName: '$user.full_name',
          UserEmail: '$user.email',
          Severity: '$severity'
        }
      }
    ]);
    res.json(systemAlertsSummary);
  } catch (err) {
    console.error('Error fetching system alerts summary:', err);
    res.status(500).json({ error: 'Failed to fetch system alerts summary' });
  }
});

module.exports = router; 