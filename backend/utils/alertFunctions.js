// Alert management functions for water management system

/**
 * Check if high consumption alert should be created
 * @param {number} unitsConsumed - Units consumed
 * @param {number} connectionId - Connection ID
 * @param {Array} readings - Array of all meter readings
 * @returns {boolean} True if alert should be created
 */
const shouldCreateHighConsumptionAlert = (unitsConsumed, connectionId, readings) => {
  const { isHighConsumption, isAbnormalConsumption } = require('./consumptionFunctions');
  
  return isHighConsumption(unitsConsumed) || isAbnormalConsumption(unitsConsumed, connectionId, readings);
};

/**
 * Check if overdue alert should be created
 * @param {string} billDate - Bill date
 * @param {string} paymentStatus - Payment status
 * @returns {boolean} True if alert should be created
 */
const shouldCreateOverdueAlert = (billDate, paymentStatus) => {
  if (paymentStatus === 'Paid') return false;
  
  const billDateObj = new Date(billDate);
  const today = new Date();
  const diffTime = today - billDateObj;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 15; // Alert after 15 days overdue
};

/**
 * Check if leak detection alert should be created
 * @param {number} currentReading - Current meter reading
 * @param {number} previousReading - Previous meter reading
 * @param {number} daysBetween - Days between readings
 * @returns {boolean} True if potential leak detected
 */
const shouldCreateLeakAlert = (currentReading, previousReading, daysBetween) => {
  if (!previousReading || daysBetween <= 0) return false;
  
  const consumption = currentReading - previousReading;
  const dailyConsumption = consumption / daysBetween;
  
  // Alert if daily consumption is unusually high (more than 50 units per day)
  return dailyConsumption > 50;
};

/**
 * Check if meter reading due alert should be created
 * @param {string} lastReadingDate - Last reading date
 * @param {number} daysThreshold - Days threshold for alert
 * @returns {boolean} True if reading is due
 */
const shouldCreateReadingDueAlert = (lastReadingDate, daysThreshold = 30) => {
  if (!lastReadingDate) return true; // No previous reading
  
  const lastDate = new Date(lastReadingDate);
  const today = new Date();
  const diffTime = today - lastDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > daysThreshold;
};

/**
 * Check if water quality alert should be created
 * @param {Object} qualityData - Water quality data
 * @returns {boolean} True if quality issues detected
 */
const shouldCreateQualityAlert = (qualityData) => {
  if (!qualityData) return false;
  
  const { pH, turbidity, chlorine, hardness } = qualityData;
  
  // Check if any quality parameters are out of normal range
  return (
    (pH && (pH < 6.5 || pH > 8.5)) ||
    (turbidity && turbidity > 5) ||
    (chlorine && (chlorine < 0.2 || chlorine > 4)) ||
    (hardness && hardness > 500)
  );
};

/**
 * Determine alert severity level
 * @param {string} alertType - Type of alert
 * @param {Object} alertData - Alert data
 * @returns {string} Severity level ('low', 'medium', 'high', 'critical')
 */
const determineAlertSeverity = (alertType, alertData) => {
  switch (alertType) {
    case 'High Consumption':
      const consumption = alertData.unitsConsumed || 0;
      if (consumption > 200) return 'critical';
      if (consumption > 150) return 'high';
      if (consumption > 100) return 'medium';
      return 'low';
      
    case 'Payment Overdue':
      const overdueDays = alertData.overdueDays || 0;
      if (overdueDays > 60) return 'critical';
      if (overdueDays > 30) return 'high';
      if (overdueDays > 15) return 'medium';
      return 'low';
      
    case 'Leak Detection':
      return 'high';
      
    case 'Water Quality':
      return 'critical';
      
    case 'System Maintenance':
      return 'medium';
      
    case 'Meter Reading Due':
      return 'low';
      
    default:
      return 'medium';
  }
};

/**
 * Generate alert message based on type and data
 * @param {string} alertType - Type of alert
 * @param {Object} alertData - Alert data
 * @returns {string} Generated alert message
 */
const generateAlertMessage = (alertType, alertData) => {
  switch (alertType) {
    case 'High Consumption':
      return `High consumption detected: ${alertData.unitsConsumed} units for ConnectionID ${alertData.connectionId}`;
      
    case 'Payment Overdue':
      return `Bill for date ${alertData.billDate} is overdue by ${alertData.overdueDays} days`;
      
    case 'Leak Detection':
      return `Potential leak detected: ${alertData.dailyConsumption} units per day consumption`;
      
    case 'Water Quality':
      return `Water quality issue detected: ${alertData.issue} levels are outside normal range`;
      
    case 'System Maintenance':
      return `System maintenance required: ${alertData.maintenanceType}`;
      
    case 'Meter Reading Due':
      return `Meter reading is due: Last reading was ${alertData.daysSinceLastReading} days ago`;
      
    default:
      return `Alert: ${alertType}`;
  }
};

/**
 * Check if alert should be escalated
 * @param {Object} alert - Alert object
 * @param {number} escalationDays - Days before escalation
 * @returns {boolean} True if alert should be escalated
 */
const shouldEscalateAlert = (alert, escalationDays = 7) => {
  if (alert.Status === 'Resolved') return false;
  
  const alertDate = new Date(alert.Timestamp);
  const today = new Date();
  const diffTime = today - alertDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > escalationDays;
};

/**
 * Get alert priority score
 * @param {Object} alert - Alert object
 * @returns {number} Priority score (1-10)
 */
const getAlertPriority = (alert) => {
  const severityScores = {
    'critical': 10,
    'high': 8,
    'medium': 5,
    'low': 2
  };
  
  const typeScores = {
    'Water Quality': 10,
    'Leak Detection': 9,
    'High Consumption': 7,
    'Payment Overdue': 6,
    'System Maintenance': 4,
    'Meter Reading Due': 3
  };
  
  const severityScore = severityScores[alert.Severity] || 5;
  const typeScore = typeScores[alert.Type] || 5;
  
  return Math.round((severityScore + typeScore) / 2);
};

/**
 * Group alerts by type
 * @param {Array} alerts - Array of alerts
 * @returns {Object} Grouped alerts
 */
const groupAlertsByType = (alerts) => {
  return alerts.reduce((groups, alert) => {
    const type = alert.Type || 'Other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(alert);
    return groups;
  }, {});
};

/**
 * Get alert statistics
 * @param {Array} alerts - Array of alerts
 * @returns {Object} Alert statistics
 */
const getAlertStatistics = (alerts) => {
  const total = alerts.length;
  const active = alerts.filter(a => a.Status === 'Active').length;
  const resolved = alerts.filter(a => a.Status === 'Resolved').length;
  
  const bySeverity = {
    critical: alerts.filter(a => a.Severity === 'critical').length,
    high: alerts.filter(a => a.Severity === 'high').length,
    medium: alerts.filter(a => a.Severity === 'medium').length,
    low: alerts.filter(a => a.Severity === 'low').length
  };
  
  const byType = groupAlertsByType(alerts);
  const typeStats = Object.keys(byType).reduce((stats, type) => {
    stats[type] = byType[type].length;
    return stats;
  }, {});
  
  return {
    total,
    active,
    resolved,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    bySeverity,
    byType: typeStats
  };
};

module.exports = {
  shouldCreateHighConsumptionAlert,
  shouldCreateOverdueAlert,
  shouldCreateLeakAlert,
  shouldCreateReadingDueAlert,
  shouldCreateQualityAlert,
  determineAlertSeverity,
  generateAlertMessage,
  shouldEscalateAlert,
  getAlertPriority,
  groupAlertsByType,
  getAlertStatistics
}; 