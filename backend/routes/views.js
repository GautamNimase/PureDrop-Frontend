const express = require('express');
const router = express.Router();

// Import data from other routes
const { users } = require('./users');
const { connections } = require('./connections');
const { readings } = require('./readings');
const { bills } = require('./bills');
const { alerts } = require('./alerts');
const { complaints } = require('./complaints');

// 1. User Overview View - user_overview
// Purpose: Quickly see user info along with their connection status and latest bill
router.get('/user-overview', (req, res) => {
  const userOverview = users.map(user => {
    // Get user's connections
    const userConnections = connections.filter(c => c.UserID === user.UserID);
    
    // Get user's readings through connections
    const userConnectionIds = userConnections.map(c => c.ConnectionID);
    const userReadings = readings.filter(r => userConnectionIds.includes(r.ConnectionID));
    const userReadingIds = userReadings.map(r => r.MeterReadingID);
    
    // Get user's bills through readings
    const userBills = bills.filter(b => userReadingIds.includes(b.MeterReadingID));
    
    // Get latest bill (most recent bill date)
    const latestBill = userBills.length > 0 
      ? userBills.reduce((latest, bill) => 
          new Date(bill.BillDate) > new Date(latest.BillDate) ? bill : latest
        )
      : null;
    
    // Get primary connection (first active connection or first connection)
    const primaryConnection = userConnections.find(c => c.Status === 'Active') || userConnections[0];
    
    return {
      UserID: user.UserID,
      Name: user.Name,
      Email: user.Email,
      Phone: user.Phone,
      Address: user.Address,
      ConnectionType: user.ConnectionType,
      ConnectionID: primaryConnection ? primaryConnection.ConnectionID : null,
      ConnectionStatus: primaryConnection ? primaryConnection.Status : null,
      MeterNumber: primaryConnection ? primaryConnection.MeterNumber : null,
      LatestBillID: latestBill ? latestBill.BillID : null,
      LatestBillDate: latestBill ? latestBill.BillDate : null,
      LatestBillAmount: latestBill ? latestBill.Amount : null,
      LatestBillStatus: latestBill ? latestBill.PaymentStatus : null,
      TotalConnections: userConnections.length,
      ActiveConnections: userConnections.filter(c => c.Status === 'Active').length,
      TotalBills: userBills.length,
      UnpaidBills: userBills.filter(b => b.PaymentStatus === 'Unpaid').length
    };
  });
  
  res.json(userOverview);
});

// 2. Outstanding Bills View - outstanding_bills
// Purpose: List all unpaid bills with user and connection info
router.get('/outstanding-bills', (req, res) => {
  const outstandingBills = bills
    .filter(bill => bill.PaymentStatus === 'Unpaid')
    .map(bill => {
      // Find the meter reading for this bill
      const meterReading = readings.find(r => r.MeterReadingID === bill.MeterReadingID);
      
      if (!meterReading) {
        return {
          BillID: bill.BillID,
          BillDate: bill.BillDate,
          Amount: bill.Amount,
          PaymentStatus: bill.PaymentStatus,
          Error: 'Meter reading not found'
        };
      }
      
      // Find the connection for this meter reading
      const connection = connections.find(c => c.ConnectionID === meterReading.ConnectionID);
      
      if (!connection) {
        return {
          BillID: bill.BillID,
          BillDate: bill.BillDate,
          Amount: bill.Amount,
          PaymentStatus: bill.PaymentStatus,
          Error: 'Connection not found'
        };
      }
      
      // Find the user for this connection
      const user = users.find(u => u.UserID === connection.UserID);
      
      if (!user) {
        return {
          BillID: bill.BillID,
          BillDate: bill.BillDate,
          Amount: bill.Amount,
          PaymentStatus: bill.PaymentStatus,
          Error: 'User not found'
        };
      }
      
      return {
        BillID: bill.BillID,
        BillDate: bill.BillDate,
        Amount: bill.Amount,
        PaymentStatus: bill.PaymentStatus,
        UserID: user.UserID,
        Name: user.Name,
        Email: user.Email,
        ConnectionID: connection.ConnectionID,
        MeterNumber: connection.MeterNumber,
        UnitsConsumed: meterReading.UnitsConsumed,
        ReadingDate: meterReading.ReadingDate
      };
    });
  
  res.json(outstandingBills);
});

// 3. High Consumption Alerts View - high_consumption_alerts
// Purpose: Show all high consumption alerts with user and connection info
router.get('/high-consumption-alerts', (req, res) => {
  const highConsumptionAlerts = alerts
    .filter(alert => alert.Type === 'High Consumption')
    .map(alert => {
      // Find the user for this alert
      const user = users.find(u => u.UserID === alert.UserID);
      
      if (!user) {
        return {
          AlertID: alert.AlertID,
          Type: alert.Type,
          Message: alert.Message,
          Status: alert.Status,
          Timestamp: alert.Timestamp,
          Error: 'User not found'
        };
      }
      
      // Find user's connections
      const userConnections = connections.filter(c => c.UserID === user.UserID);
      
      return {
        AlertID: alert.AlertID,
        Type: alert.Type,
        Message: alert.Message,
        Status: alert.Status,
        Timestamp: alert.Timestamp,
        UserID: user.UserID,
        Name: user.Name,
        ConnectionID: userConnections.length > 0 ? userConnections[0].ConnectionID : null,
        MeterNumber: userConnections.length > 0 ? userConnections[0].MeterNumber : null,
        TotalConnections: userConnections.length,
        ActiveConnections: userConnections.filter(c => c.Status === 'Active').length
      };
    });
  
  res.json(highConsumptionAlerts);
});

// 4. User Complaints View - user_complaints
// Purpose: List all complaints with user info and status
router.get('/user-complaints', (req, res) => {
  const userComplaints = complaints.map(complaint => {
    // Find the user for this complaint
    const user = users.find(u => u.UserID === complaint.UserID);
    
    if (!user) {
      return {
        ComplaintID: complaint.ComplaintID,
        Message: complaint.Description,
        Status: complaint.Status,
        Timestamp: complaint.Date,
        Error: 'User not found'
      };
    }
    
    return {
      ComplaintID: complaint.ComplaintID,
      Message: complaint.Description,
      Status: complaint.Status,
      Timestamp: complaint.Date,
      UserID: user.UserID,
      Name: user.Name,
      Email: user.Email,
      Phone: user.Phone,
      Address: user.Address,
      Response: complaint.Response || '',
      Type: complaint.Type
    };
  });
  
  res.json(userComplaints);
});

// 5. Connection Meter Readings View - connection_meter_readings
// Purpose: Show all meter readings with user and connection info
router.get('/connection-meter-readings', (req, res) => {
  const connectionMeterReadings = readings.map(reading => {
    // Find the connection for this reading
    const connection = connections.find(c => c.ConnectionID === reading.ConnectionID);
    
    if (!connection) {
      return {
        MeterReadingID: reading.MeterReadingID,
        ReadingDate: reading.ReadingDate,
        UnitsConsumed: reading.UnitsConsumed,
        Error: 'Connection not found'
      };
    }
    
    // Find the user for this connection
    const user = users.find(u => u.UserID === connection.UserID);
    
    if (!user) {
      return {
        MeterReadingID: reading.MeterReadingID,
        ReadingDate: reading.ReadingDate,
        UnitsConsumed: reading.UnitsConsumed,
        ConnectionID: connection.ConnectionID,
        MeterNumber: connection.MeterNumber,
        Error: 'User not found'
      };
    }
    
    return {
      MeterReadingID: reading.MeterReadingID,
      ReadingDate: reading.ReadingDate,
      UnitsConsumed: reading.UnitsConsumed,
      ConnectionID: connection.ConnectionID,
      MeterNumber: connection.MeterNumber,
      UserID: user.UserID,
      Name: user.Name,
      Email: user.Email,
      ConnectionStatus: connection.Status,
      ConnectionDate: connection.ConnectionDate,
      SourceID: connection.SourceID
    };
  });
  
  res.json(connectionMeterReadings);
});

// Additional view: Bill Payment History
router.get('/bill-payment-history', (req, res) => {
  const billPaymentHistory = bills.map(bill => {
    // Find the meter reading for this bill
    const meterReading = readings.find(r => r.MeterReadingID === bill.MeterReadingID);
    
    if (!meterReading) {
      return {
        BillID: bill.BillID,
        BillDate: bill.BillDate,
        Amount: bill.Amount,
        PaymentStatus: bill.PaymentStatus,
        Error: 'Meter reading not found'
      };
    }
    
    // Find the connection for this meter reading
    const connection = connections.find(c => c.ConnectionID === meterReading.ConnectionID);
    
    if (!connection) {
      return {
        BillID: bill.BillID,
        BillDate: bill.BillDate,
        Amount: bill.Amount,
        PaymentStatus: bill.PaymentStatus,
        Error: 'Connection not found'
      };
    }
    
    // Find the user for this connection
    const user = users.find(u => u.UserID === connection.UserID);
    
    if (!user) {
      return {
        BillID: bill.BillID,
        BillDate: bill.BillDate,
        Amount: bill.Amount,
        PaymentStatus: bill.PaymentStatus,
        Error: 'User not found'
      };
    }
    
    return {
      BillID: bill.BillID,
      BillDate: bill.BillDate,
      Amount: bill.Amount,
      PaymentStatus: bill.PaymentStatus,
      PaymentDate: bill.PaymentDate || null,
      PaymentMethod: bill.PaymentMethod || null,
      UserID: user.UserID,
      Name: user.Name,
      Email: user.Email,
      ConnectionID: connection.ConnectionID,
      MeterNumber: connection.MeterNumber,
      UnitsConsumed: meterReading.UnitsConsumed,
      ReadingDate: meterReading.ReadingDate
    };
  });
  
  res.json(billPaymentHistory);
});

// Additional view: System Alerts Summary
router.get('/system-alerts-summary', (req, res) => {
  const systemAlertsSummary = alerts.map(alert => {
    // Find the user for this alert
    const user = alert.UserID ? users.find(u => u.UserID === alert.UserID) : null;
    
    return {
      AlertID: alert.AlertID,
      Type: alert.Type,
      Message: alert.Message,
      Status: alert.Status,
      Timestamp: alert.Timestamp,
      UserID: alert.UserID,
      UserName: user ? user.Name : null,
      UserEmail: user ? user.Email : null,
      Severity: alert.Severity || 'Medium'
    };
  });
  
  res.json(systemAlertsSummary);
});

module.exports = { router }; 