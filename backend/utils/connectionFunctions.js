// Connection management functions for water management system

/**
 * Check if user can have more connections
 * @param {number} userId - User ID
 * @param {Array} connections - Array of all connections
 * @param {number} maxConnections - Maximum connections allowed per user
 * @returns {boolean} True if user can have more connections
 */
const canUserHaveMoreConnections = (userId, connections, maxConnections = 3) => {
  const userConnections = connections.filter(c => c.UserID === userId);
  return userConnections.length < maxConnections;
};

/**
 * Get user's active connections
 * @param {number} userId - User ID
 * @param {Array} connections - Array of all connections
 * @returns {Array} Active connections for user
 */
const getUserActiveConnections = (userId, connections) => {
  return connections.filter(c => c.UserID === userId && c.Status === 'Active');
};

/**
 * Get connection summary for a user
 * @param {number} userId - User ID
 * @param {Array} connections - Array of all connections
 * @returns {Object} Connection summary
 */
const getUserConnectionSummary = (userId, connections) => {
  const userConnections = connections.filter(c => c.UserID === userId);
  
  return {
    total: userConnections.length,
    active: userConnections.filter(c => c.Status === 'Active').length,
    inactive: userConnections.filter(c => c.Status === 'Inactive').length,
    suspended: userConnections.filter(c => c.Status === 'Suspended').length,
    connections: userConnections
  };
};

/**
 * Validate connection data
 * @param {Object} connectionData - Connection data to validate
 * @returns {Object} Validation result with errors
 */
const validateConnectionData = (connectionData) => {
  const errors = {};
  
  if (!connectionData.UserID) {
    errors.UserID = 'User ID is required';
  }
  
  if (!connectionData.ConnectionDate) {
    errors.ConnectionDate = 'Connection date is required';
  }
  
  if (!connectionData.MeterNumber) {
    errors.MeterNumber = 'Meter number is required';
  }
  
  if (!connectionData.Status) {
    errors.Status = 'Status is required';
  }
  
  if (!connectionData.SourceID) {
    errors.SourceID = 'Source ID is required';
  }
  
  // Validate meter number format
  const { validateMeterNumber } = require('./validationFunctions');
  if (connectionData.MeterNumber && !validateMeterNumber(connectionData.MeterNumber)) {
    errors.MeterNumber = 'Invalid meter number format (should be 2 letters + 6 digits)';
  }
  
  // Validate status
  const validStatuses = ['Active', 'Inactive', 'Suspended', 'Pending'];
  if (connectionData.Status && !validStatuses.includes(connectionData.Status)) {
    errors.Status = 'Invalid status';
  }
  
  return errors;
};

/**
 * Check if meter number is already in use
 * @param {string} meterNumber - Meter number to check
 * @param {Array} connections - Array of all connections
 * @param {number} excludeConnectionId - Connection ID to exclude from check
 * @returns {boolean} True if meter number is already in use
 */
const isMeterNumberInUse = (meterNumber, connections, excludeConnectionId = null) => {
  return connections.some(c => 
    c.MeterNumber === meterNumber && 
    c.ConnectionID !== excludeConnectionId
  );
};

/**
 * Get connection status history
 * @param {number} connectionId - Connection ID
 * @param {Array} auditLogs - Array of audit logs
 * @returns {Array} Status change history
 */
const getConnectionStatusHistory = (connectionId, auditLogs) => {
  return auditLogs
    .filter(log => 
      log.Action.includes('Connection') && 
      log.Details.includes(`ConnectionID ${connectionId}`)
    )
    .sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));
};

/**
 * Calculate connection age
 * @param {string} connectionDate - Connection date
 * @returns {number} Age in days
 */
const calculateConnectionAge = (connectionDate) => {
  const connectionDateObj = new Date(connectionDate);
  const today = new Date();
  const diffTime = today - connectionDateObj;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get connections by source
 * @param {number} sourceId - Source ID
 * @param {Array} connections - Array of all connections
 * @returns {Array} Connections for the source
 */
const getConnectionsBySource = (sourceId, connections) => {
  return connections.filter(c => c.SourceID === sourceId);
};

/**
 * Get source utilization
 * @param {number} sourceId - Source ID
 * @param {Array} connections - Array of all connections
 * @param {Array} sources - Array of all sources
 * @returns {Object} Source utilization data
 */
const getSourceUtilization = (sourceId, connections, sources) => {
  const sourceConnections = getConnectionsBySource(sourceId, connections);
  const source = sources.find(s => s.SourceID === sourceId);
  
  if (!source) return null;
  
  return {
    sourceId,
    sourceName: source.Name,
    totalConnections: sourceConnections.length,
    activeConnections: sourceConnections.filter(c => c.Status === 'Active').length,
    capacity: source.Capacity,
    utilizationRate: source.Capacity > 0 ? Math.round((sourceConnections.length / source.Capacity) * 100) : 0
  };
};

/**
 * Check if connection should be suspended
 * @param {Object} connection - Connection object
 * @param {Array} bills - Array of all bills
 * @param {number} overdueThreshold - Days threshold for suspension
 * @returns {boolean} True if connection should be suspended
 */
const shouldSuspendConnection = (connection, bills, overdueThreshold = 90) => {
  // Get bills for this connection
  const connectionBills = bills.filter(b => {
    // This would need to be implemented based on your data structure
    // For now, we'll use a simple check
    return b.ConnectionID === connection.ConnectionID;
  });
  
  // Check for severely overdue bills
  const { calculateOverdueDays } = require('./billingFunctions');
  
  return connectionBills.some(bill => {
    const overdueDays = calculateOverdueDays(bill.BillDate, bill.PaymentStatus);
    return overdueDays > overdueThreshold;
  });
};

/**
 * Get connection performance metrics
 * @param {number} connectionId - Connection ID
 * @param {Array} readings - Array of all meter readings
 * @returns {Object} Performance metrics
 */
const getConnectionPerformance = (connectionId, readings) => {
  const connectionReadings = readings.filter(r => r.ConnectionID === connectionId);
  
  if (connectionReadings.length === 0) {
    return {
      totalReadings: 0,
      averageConsumption: 0,
      reliability: 0,
      lastReading: null
    };
  }
  
  const consumptions = connectionReadings.map(r => Number(r.UnitsConsumed));
  const averageConsumption = consumptions.reduce((sum, val) => sum + val, 0) / consumptions.length;
  
  // Calculate reliability based on reading frequency
  const sortedReadings = connectionReadings.sort((a, b) => new Date(a.ReadingDate) - new Date(b.ReadingDate));
  const lastReading = sortedReadings[sortedReadings.length - 1];
  const firstReading = sortedReadings[0];
  
  const daysBetween = (new Date(lastReading.ReadingDate) - new Date(firstReading.ReadingDate)) / (1000 * 60 * 60 * 24);
  const expectedReadings = Math.ceil(daysBetween / 30); // Assuming monthly readings
  const reliability = Math.min((connectionReadings.length / expectedReadings) * 100, 100);
  
  return {
    totalReadings: connectionReadings.length,
    averageConsumption: Math.round(averageConsumption * 100) / 100,
    reliability: Math.round(reliability),
    lastReading: lastReading.ReadingDate,
    highestConsumption: Math.max(...consumptions),
    lowestConsumption: Math.min(...consumptions)
  };
};

/**
 * Generate connection report
 * @param {Array} connections - Array of all connections
 * @param {Array} users - Array of all users
 * @param {Array} sources - Array of all sources
 * @returns {Object} Connection report
 */
const generateConnectionReport = (connections, users, sources) => {
  const totalConnections = connections.length;
  const activeConnections = connections.filter(c => c.Status === 'Active').length;
  const inactiveConnections = connections.filter(c => c.Status === 'Inactive').length;
  const suspendedConnections = connections.filter(c => c.Status === 'Suspended').length;
  
  const connectionsByType = connections.reduce((acc, connection) => {
    const user = users.find(u => u.UserID === connection.UserID);
    const connectionType = user ? user.ConnectionType : 'Unknown';
    
    if (!acc[connectionType]) {
      acc[connectionType] = 0;
    }
    acc[connectionType]++;
    
    return acc;
  }, {});
  
  const sourceUtilization = sources.map(source => 
    getSourceUtilization(source.SourceID, connections, sources)
  ).filter(Boolean);
  
  return {
    summary: {
      total: totalConnections,
      active: activeConnections,
      inactive: inactiveConnections,
      suspended: suspendedConnections,
      utilizationRate: Math.round((activeConnections / totalConnections) * 100)
    },
    byType: connectionsByType,
    sourceUtilization,
    recentConnections: connections
      .sort((a, b) => new Date(b.ConnectionDate) - new Date(a.ConnectionDate))
      .slice(0, 10)
  };
};

module.exports = {
  canUserHaveMoreConnections,
  getUserActiveConnections,
  getUserConnectionSummary,
  validateConnectionData,
  isMeterNumberInUse,
  getConnectionStatusHistory,
  calculateConnectionAge,
  getConnectionsBySource,
  getSourceUtilization,
  shouldSuspendConnection,
  getConnectionPerformance,
  generateConnectionReport
}; 