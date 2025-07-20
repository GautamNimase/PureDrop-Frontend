// Trigger functions for water management system
// These functions implement database triggers as JavaScript functions

const { auditLogs, getNextId } = require('../routes/auditLogsStore');

/**
 * Trigger: after_user_insert
 * Purpose: Log user creation in audit logs
 */
const triggerAfterUserInsert = (user) => {
  auditLogs.push({
    LogID: getNextId(),
    User: user.Name,
    Action: 'Create User',
    Timestamp: new Date().toISOString(),
    Details: `Created UserID ${user.UserID}`
  });
};

/**
 * Trigger: after_user_update
 * Purpose: Log user updates in audit logs
 */
const triggerAfterUserUpdate = (user) => {
  auditLogs.push({
    LogID: getNextId(),
    User: user.Name,
    Action: 'Update User',
    Timestamp: new Date().toISOString(),
    Details: `Updated UserID ${user.UserID}`
  });
};

/**
 * Trigger: after_user_delete
 * Purpose: Log user deletion in audit logs
 */
const triggerAfterUserDelete = (user) => {
  auditLogs.push({
    LogID: getNextId(),
    User: user.Name,
    Action: 'Delete User',
    Timestamp: new Date().toISOString(),
    Details: `Deleted UserID ${user.UserID}`
  });
};

/**
 * Trigger: after_meter_reading_insert
 * Purpose: Create high consumption alerts and automatic bill generation
 */
const triggerAfterMeterReadingInsert = (reading, connections, users, alerts, bills) => {
  // Find the connection for this reading
  const connection = connections.find(c => c.ConnectionID === reading.ConnectionID);
  if (!connection) return;
  
  // Find the user for this connection
  const user = users.find(u => u.UserID === connection.UserID);
  if (!user) return;
  
  // Check for high consumption (>100 units)
  if (reading.UnitsConsumed > 100) {
    alerts.push({
      AlertID: alerts.length ? Math.max(...alerts.map(a => a.AlertID)) + 1 : 1,
      Type: 'High Consumption',
      Message: `High consumption detected: ${reading.UnitsConsumed} units for ConnectionID ${reading.ConnectionID}`,
      Status: 'Active',
      Timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      UserID: user.UserID
    });
  }
  
  // Automatic bill generation
  const unitRate = 2.50; // Example rate per unit
  const billAmount = reading.UnitsConsumed * unitRate;
  
  bills.push({
    BillID: bills.length ? Math.max(...bills.map(b => b.BillID)) + 1 : 1,
    BillDate: new Date().toISOString().split('T')[0],
    Amount: billAmount,
    PaymentStatus: 'Unpaid',
    MeterReadingID: reading.MeterReadingID
  });
  
  // Audit log for reading creation
  auditLogs.push({
    LogID: getNextId(),
    User: user.Name,
    Action: 'Create Reading',
    Timestamp: new Date().toISOString(),
    Details: `Created MeterReadingID ${reading.MeterReadingID}`
  });
};

/**
 * Trigger: after_bill_update
 * Purpose: Create overdue alerts and resolve alerts on payment
 */
const triggerAfterBillUpdate = (bill, readings, connections, users, alerts) => {
  // Find the connection for this bill
  const reading = readings.find(r => r.MeterReadingID === bill.MeterReadingID);
  if (!reading) return;
  
  const connection = connections.find(c => c.ConnectionID === reading.ConnectionID);
  if (!connection) return;
  
  const user = users.find(u => u.UserID === connection.UserID);
  if (!user) return;
  
  // Check for overdue bills
  if (bill.PaymentStatus === 'Unpaid' && new Date(bill.BillDate) < new Date()) {
    alerts.push({
      AlertID: alerts.length ? Math.max(...alerts.map(a => a.AlertID)) + 1 : 1,
      Type: 'Payment Overdue',
      Message: `Bill ${bill.BillID} is overdue.`,
      Status: 'Active',
      Timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      UserID: user.UserID
    });
  }
  
  // Resolve alerts when bill is paid
  if (bill.PaymentStatus === 'Paid') {
    alerts.forEach(alert => {
      if (alert.Type === 'Payment Overdue' && 
          alert.UserID === user.UserID && 
          alert.Status === 'Active') {
        alert.Status = 'Resolved';
      }
    });
  }
  
  // Audit log for bill update
  auditLogs.push({
    LogID: getNextId(),
    User: user.Name,
    Action: 'Update Bill',
    Timestamp: new Date().toISOString(),
    Details: `Updated BillID ${bill.BillID}`
  });
};

/**
 * Trigger: after_connection_insert
 * Purpose: Log connection creation in audit logs
 */
const triggerAfterConnectionInsert = (connection, users) => {
  const user = users.find(u => u.UserID === connection.UserID);
  if (!user) return;
  
  auditLogs.push({
    LogID: getNextId(),
    User: user.Name,
    Action: 'Create Connection',
    Timestamp: new Date().toISOString(),
    Details: `Created ConnectionID ${connection.ConnectionID}`
  });
};

/**
 * Trigger: after_connection_update
 * Purpose: Log connection updates in audit logs
 */
const triggerAfterConnectionUpdate = (connection, users) => {
  const user = users.find(u => u.UserID === connection.UserID);
  if (!user) return;
  
  auditLogs.push({
    LogID: getNextId(),
    User: user.Name,
    Action: 'Update Connection',
    Timestamp: new Date().toISOString(),
    Details: `Updated ConnectionID ${connection.ConnectionID}`
  });
};

/**
 * Trigger: after_connection_delete
 * Purpose: Log connection deletion in audit logs
 */
const triggerAfterConnectionDelete = (connection, users) => {
  const user = users.find(u => u.UserID === connection.UserID);
  if (!user) return;
  
  auditLogs.push({
    LogID: getNextId(),
    User: user.Name,
    Action: 'Delete Connection',
    Timestamp: new Date().toISOString(),
    Details: `Deleted ConnectionID ${connection.ConnectionID}`
  });
};

/**
 * Trigger: after_bill_insert
 * Purpose: Log bill creation in audit logs
 */
const triggerAfterBillInsert = (bill, readings, connections, users) => {
  const reading = readings.find(r => r.MeterReadingID === bill.MeterReadingID);
  if (!reading) return;
  
  const connection = connections.find(c => c.ConnectionID === reading.ConnectionID);
  if (!connection) return;
  
  const user = users.find(u => u.UserID === connection.UserID);
  if (!user) return;
  
  auditLogs.push({
    LogID: getNextId(),
    User: user.Name,
    Action: 'Create Bill',
    Timestamp: new Date().toISOString(),
    Details: `Created BillID ${bill.BillID}`
  });
};

/**
 * Trigger: after_bill_delete
 * Purpose: Log bill deletion in audit logs
 */
const triggerAfterBillDelete = (bill, readings, connections, users) => {
  const reading = readings.find(r => r.MeterReadingID === bill.MeterReadingID);
  if (!reading) return;
  
  const connection = connections.find(c => c.ConnectionID === reading.ConnectionID);
  if (!connection) return;
  
  const user = users.find(u => u.UserID === connection.UserID);
  if (!user) return;
  
  auditLogs.push({
    LogID: getNextId(),
    User: user.Name,
    Action: 'Delete Bill',
    Timestamp: new Date().toISOString(),
    Details: `Deleted BillID ${bill.BillID}`
  });
};

/**
 * Trigger: after_complaint_insert
 * Purpose: Log complaint creation in audit logs
 */
const triggerAfterComplaintInsert = (complaint, users) => {
  const user = users.find(u => u.UserID === complaint.UserID);
  if (!user) return;
  
  auditLogs.push({
    LogID: getNextId(),
    User: user.Name,
    Action: 'Create Complaint',
    Timestamp: new Date().toISOString(),
    Details: `Created ComplaintID ${complaint.ComplaintID}`
  });
};

/**
 * Trigger: after_complaint_update
 * Purpose: Log complaint updates and handle escalation
 */
const triggerAfterComplaintUpdate = (complaint, users) => {
  const user = users.find(u => u.UserID === complaint.UserID);
  if (!user) return;
  
  auditLogs.push({
    LogID: getNextId(),
    User: user.Name,
    Action: 'Update Complaint',
    Timestamp: new Date().toISOString(),
    Details: `Updated ComplaintID ${complaint.ComplaintID}`
  });
};

/**
 * Trigger: after_complaint_delete
 * Purpose: Log complaint deletion in audit logs
 */
const triggerAfterComplaintDelete = (complaint, users) => {
  const user = users.find(u => u.UserID === complaint.UserID);
  if (!user) return;
  
  auditLogs.push({
    LogID: getNextId(),
    User: user.Name,
    Action: 'Delete Complaint',
    Timestamp: new Date().toISOString(),
    Details: `Deleted ComplaintID ${complaint.ComplaintID}`
  });
};

/**
 * Trigger: after_meter_reading_update
 * Purpose: Log meter reading updates in audit logs
 */
const triggerAfterMeterReadingUpdate = (reading, connections, users) => {
  const connection = connections.find(c => c.ConnectionID === reading.ConnectionID);
  if (!connection) return;
  
  const user = users.find(u => u.UserID === connection.UserID);
  if (!user) return;
  
  auditLogs.push({
    LogID: getNextId(),
    User: user.Name,
    Action: 'Update Reading',
    Timestamp: new Date().toISOString(),
    Details: `Updated MeterReadingID ${reading.MeterReadingID}`
  });
};

/**
 * Trigger: after_meter_reading_delete
 * Purpose: Log meter reading deletion in audit logs
 */
const triggerAfterMeterReadingDelete = (reading, connections, users) => {
  const connection = connections.find(c => c.ConnectionID === reading.ConnectionID);
  if (!connection) return;
  
  const user = users.find(u => u.UserID === connection.UserID);
  if (!user) return;
  
  auditLogs.push({
    LogID: getNextId(),
    User: user.Name,
    Action: 'Delete Reading',
    Timestamp: new Date().toISOString(),
    Details: `Deleted MeterReadingID ${reading.MeterReadingID}`
  });
};

/**
 * Trigger: after_employee_insert
 * Purpose: Log employee creation in audit logs
 */
const triggerAfterEmployeeInsert = (employee) => {
  auditLogs.push({
    LogID: getNextId(),
    User: employee.Name,
    Action: 'Create Employee',
    Timestamp: new Date().toISOString(),
    Details: `Created EmployeeID ${employee.EmployeeID}`
  });
};

/**
 * Trigger: after_employee_update
 * Purpose: Log employee updates in audit logs
 */
const triggerAfterEmployeeUpdate = (employee) => {
  auditLogs.push({
    LogID: getNextId(),
    User: employee.Name,
    Action: 'Update Employee',
    Timestamp: new Date().toISOString(),
    Details: `Updated EmployeeID ${employee.EmployeeID}`
  });
};

/**
 * Trigger: after_employee_delete
 * Purpose: Log employee deletion in audit logs
 */
const triggerAfterEmployeeDelete = (employee) => {
  auditLogs.push({
    LogID: getNextId(),
    User: employee.Name,
    Action: 'Delete Employee',
    Timestamp: new Date().toISOString(),
    Details: `Deleted EmployeeID ${employee.EmployeeID}`
  });
};

/**
 * Trigger: escalate_old_complaints
 * Purpose: Automatically escalate complaints older than 7 days
 */
const triggerEscalateOldComplaints = (complaints) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  complaints.forEach(complaint => {
    if (complaint.Status === 'Open' && new Date(complaint.Date) < sevenDaysAgo) {
      complaint.Status = 'Escalated';
    }
  });
};

/**
 * Trigger: suspend_user_on_unpaid_bills
 * Purpose: Suspend users with more than 2 unpaid bills
 */
const triggerSuspendUserOnUnpaidBills = (users, bills, readings, connections) => {
  users.forEach(user => {
    // Get user's connections
    const userConnections = connections.filter(c => c.UserID === user.UserID);
    const userConnectionIds = userConnections.map(c => c.ConnectionID);
    
    // Get user's readings
    const userReadings = readings.filter(r => userConnectionIds.includes(r.ConnectionID));
    const userReadingIds = userReadings.map(r => r.MeterReadingID);
    
    // Get user's unpaid bills
    const userUnpaidBills = bills.filter(b => 
      userReadingIds.includes(b.MeterReadingID) && b.PaymentStatus === 'Unpaid'
    );
    
    // Suspend user if more than 2 unpaid bills
    if (userUnpaidBills.length > 2) {
      user.Status = 'Suspended';
    }
  });
};

module.exports = {
  triggerAfterUserInsert,
  triggerAfterUserUpdate,
  triggerAfterUserDelete,
  triggerAfterMeterReadingInsert,
  triggerAfterBillUpdate,
  triggerAfterConnectionInsert,
  triggerAfterConnectionUpdate,
  triggerAfterConnectionDelete,
  triggerAfterBillInsert,
  triggerAfterBillDelete,
  triggerAfterComplaintInsert,
  triggerAfterComplaintUpdate,
  triggerAfterComplaintDelete,
  triggerAfterMeterReadingUpdate,
  triggerAfterMeterReadingDelete,
  triggerAfterEmployeeInsert,
  triggerAfterEmployeeUpdate,
  triggerAfterEmployeeDelete,
  triggerEscalateOldComplaints,
  triggerSuspendUserOnUnpaidBills
}; 