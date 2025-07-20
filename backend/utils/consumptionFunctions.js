// Consumption analysis functions for water management system

const HIGH_CONSUMPTION_THRESHOLD = 100; // Units
const ABNORMAL_CONSUMPTION_MULTIPLIER = 1.5; // 50% higher than average

/**
 * Calculate average consumption for a connection
 * @param {number} connectionId - Connection ID
 * @param {Array} readings - Array of all meter readings
 * @param {number} months - Number of months to look back (default: 6)
 * @returns {number} Average consumption
 */
const calculateAverageConsumption = (connectionId, readings, months = 6) => {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);
  
  const connectionReadings = readings.filter(reading => {
    return reading.ConnectionID === connectionId && 
           new Date(reading.ReadingDate) >= cutoffDate;
  });
  
  if (connectionReadings.length === 0) return 0;
  
  const totalConsumption = connectionReadings.reduce((sum, reading) => {
    return sum + Number(reading.UnitsConsumed);
  }, 0);
  
  return Math.round((totalConsumption / connectionReadings.length) * 100) / 100;
};

/**
 * Check if consumption is high based on threshold
 * @param {number} unitsConsumed - Units consumed
 * @returns {boolean} True if high consumption
 */
const isHighConsumption = (unitsConsumed) => {
  return Number(unitsConsumed) > HIGH_CONSUMPTION_THRESHOLD;
};

/**
 * Check if consumption is abnormal compared to average
 * @param {number} unitsConsumed - Current units consumed
 * @param {number} connectionId - Connection ID
 * @param {Array} readings - Array of all meter readings
 * @returns {boolean} True if abnormal consumption
 */
const isAbnormalConsumption = (unitsConsumed, connectionId, readings) => {
  const averageConsumption = calculateAverageConsumption(connectionId, readings, 3);
  
  if (averageConsumption === 0) {
    return isHighConsumption(unitsConsumed);
  }
  
  return Number(unitsConsumed) > (averageConsumption * ABNORMAL_CONSUMPTION_MULTIPLIER);
};

/**
 * Get consumption trend for a connection
 * @param {number} connectionId - Connection ID
 * @param {Array} readings - Array of all meter readings
 * @param {number} months - Number of months to analyze
 * @returns {Object} Consumption trend data
 */
const getConsumptionTrend = (connectionId, readings, months = 6) => {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);
  
  const connectionReadings = readings
    .filter(reading => {
      return reading.ConnectionID === connectionId && 
             new Date(reading.ReadingDate) >= cutoffDate;
    })
    .sort((a, b) => new Date(a.ReadingDate) - new Date(b.ReadingDate));
  
  if (connectionReadings.length < 2) {
    return { trend: 'stable', change: 0, readings: connectionReadings.length };
  }
  
  const firstReading = connectionReadings[0];
  const lastReading = connectionReadings[connectionReadings.length - 1];
  
  const firstAverage = Number(firstReading.UnitsConsumed);
  const lastAverage = Number(lastReading.UnitsConsumed);
  
  const change = ((lastAverage - firstAverage) / firstAverage) * 100;
  
  let trend = 'stable';
  if (change > 10) trend = 'increasing';
  else if (change < -10) trend = 'decreasing';
  
  return {
    trend,
    change: Math.round(change * 100) / 100,
    readings: connectionReadings.length,
    firstReading: firstReading.ReadingDate,
    lastReading: lastReading.ReadingDate
  };
};

/**
 * Get monthly consumption summary for a user
 * @param {number} userId - User ID
 * @param {Array} connections - Array of all connections
 * @param {Array} readings - Array of all meter readings
 * @param {number} months - Number of months to analyze
 * @returns {Array} Monthly consumption data
 */
const getUserMonthlyConsumption = (userId, connections, readings, months = 6) => {
  const userConnectionIds = connections
    .filter(c => c.UserID === userId)
    .map(c => c.ConnectionID);
  
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);
  
  const userReadings = readings.filter(reading => {
    return userConnectionIds.includes(reading.ConnectionID) &&
           new Date(reading.ReadingDate) >= cutoffDate;
  });
  
  // Group by month
  const monthlyData = {};
  
  userReadings.forEach(reading => {
    const date = new Date(reading.ReadingDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        totalConsumption: 0,
        readingCount: 0,
        averageConsumption: 0
      };
    }
    
    monthlyData[monthKey].totalConsumption += Number(reading.UnitsConsumed);
    monthlyData[monthKey].readingCount += 1;
  });
  
  // Calculate averages
  Object.values(monthlyData).forEach(month => {
    month.averageConsumption = Math.round((month.totalConsumption / month.readingCount) * 100) / 100;
  });
  
  return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * Check if consumption requires alert
 * @param {number} unitsConsumed - Units consumed
 * @param {number} connectionId - Connection ID
 * @param {Array} readings - Array of all meter readings
 * @returns {Object} Alert information
 */
const checkConsumptionAlert = (unitsConsumed, connectionId, readings) => {
  const isHigh = isHighConsumption(unitsConsumed);
  const isAbnormal = isAbnormalConsumption(unitsConsumed, connectionId, readings);
  
  if (isHigh || isAbnormal) {
    return {
      shouldAlert: true,
      type: 'High Consumption',
      message: `High consumption detected: ${unitsConsumed} units for ConnectionID ${connectionId}`,
      severity: isHigh ? 'high' : 'medium'
    };
  }
  
  return { shouldAlert: false };
};

module.exports = {
  calculateAverageConsumption,
  isHighConsumption,
  isAbnormalConsumption,
  getConsumptionTrend,
  getUserMonthlyConsumption,
  checkConsumptionAlert,
  HIGH_CONSUMPTION_THRESHOLD,
  ABNORMAL_CONSUMPTION_MULTIPLIER
}; 