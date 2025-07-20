// Statistical functions for water management system

/**
 * Calculate mean (average) of an array of numbers
 * @param {Array} numbers - Array of numbers
 * @returns {number} Mean value
 */
const calculateMean = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  
  const sum = numbers.reduce((acc, num) => acc + Number(num), 0);
  return Math.round((sum / numbers.length) * 100) / 100;
};

/**
 * Calculate median of an array of numbers
 * @param {Array} numbers - Array of numbers
 * @returns {number} Median value
 */
const calculateMedian = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100;
  }
  
  return Math.round(sorted[mid] * 100) / 100;
};

/**
 * Calculate standard deviation
 * @param {Array} numbers - Array of numbers
 * @returns {number} Standard deviation
 */
const calculateStandardDeviation = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  
  const mean = calculateMean(numbers);
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  const variance = calculateMean(squaredDiffs);
  
  return Math.round(Math.sqrt(variance) * 100) / 100;
};

/**
 * Calculate percentage change between two values
 * @param {number} oldValue - Old value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  
  const change = ((newValue - oldValue) / oldValue) * 100;
  return Math.round(change * 100) / 100;
};

/**
 * Calculate growth rate over time
 * @param {Array} values - Array of values over time
 * @returns {number} Growth rate percentage
 */
const calculateGrowthRate = (values) => {
  if (!values || values.length < 2) return 0;
  
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  
  return calculatePercentageChange(firstValue, lastValue);
};

/**
 * Calculate moving average
 * @param {Array} values - Array of values
 * @param {number} window - Window size for moving average
 * @returns {Array} Moving average values
 */
const calculateMovingAverage = (values, window = 3) => {
  if (!values || values.length < window) return [];
  
  const result = [];
  for (let i = window - 1; i < values.length; i++) {
    const windowValues = values.slice(i - window + 1, i + 1);
    const average = calculateMean(windowValues);
    result.push(average);
  }
  
  return result;
};

/**
 * Calculate percentile
 * @param {Array} numbers - Array of numbers
 * @param {number} percentile - Percentile (0-100)
 * @returns {number} Percentile value
 */
const calculatePercentile = (numbers, percentile) => {
  if (!numbers || numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  
  if (index === Math.floor(index)) {
    return sorted[index];
  }
  
  const lower = sorted[Math.floor(index)];
  const upper = sorted[Math.ceil(index)];
  const weight = index - Math.floor(index);
  
  return Math.round((lower * (1 - weight) + upper * weight) * 100) / 100;
};

/**
 * Calculate correlation coefficient between two arrays
 * @param {Array} x - First array of values
 * @param {Array} y - Second array of values
 * @returns {number} Correlation coefficient (-1 to 1)
 */
const calculateCorrelation = (x, y) => {
  if (!x || !y || x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((acc, val) => acc + val, 0);
  const sumY = y.reduce((acc, val) => acc + val, 0);
  const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  const sumX2 = x.reduce((acc, val) => acc + val * val, 0);
  const sumY2 = y.reduce((acc, val) => acc + val * val, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (denominator === 0) return 0;
  
  return Math.round((numerator / denominator) * 1000) / 1000;
};

/**
 * Calculate consumption statistics for a connection
 * @param {Array} readings - Array of meter readings
 * @returns {Object} Statistical summary
 */
const calculateConsumptionStats = (readings) => {
  if (!readings || readings.length === 0) {
    return {
      count: 0,
      total: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      q25: 0,
      q75: 0
    };
  }
  
  const consumptions = readings.map(r => Number(r.UnitsConsumed));
  
  return {
    count: readings.length,
    total: consumptions.reduce((sum, val) => sum + val, 0),
    mean: calculateMean(consumptions),
    median: calculateMedian(consumptions),
    min: Math.min(...consumptions),
    max: Math.max(...consumptions),
    stdDev: calculateStandardDeviation(consumptions),
    q25: calculatePercentile(consumptions, 25),
    q75: calculatePercentile(consumptions, 75)
  };
};

/**
 * Calculate billing statistics
 * @param {Array} bills - Array of bills
 * @returns {Object} Billing statistics
 */
const calculateBillingStats = (bills) => {
  if (!bills || bills.length === 0) {
    return {
      totalBills: 0,
      totalAmount: 0,
      averageAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      overdueAmount: 0,
      paymentRate: 0
    };
  }
  
  const amounts = bills.map(b => Number(b.Amount));
  const paidBills = bills.filter(b => b.PaymentStatus === 'Paid');
  const unpaidBills = bills.filter(b => b.PaymentStatus === 'Unpaid');
  const overdueBills = bills.filter(b => b.PaymentStatus === 'Overdue');
  
  return {
    totalBills: bills.length,
    totalAmount: amounts.reduce((sum, val) => sum + val, 0),
    averageAmount: calculateMean(amounts),
    paidAmount: paidBills.reduce((sum, b) => sum + b.Amount, 0),
    unpaidAmount: unpaidBills.reduce((sum, b) => sum + b.Amount, 0),
    overdueAmount: overdueBills.reduce((sum, b) => sum + b.Amount, 0),
    paymentRate: Math.round((paidBills.length / bills.length) * 100)
  };
};

/**
 * Calculate trend analysis
 * @param {Array} values - Array of values over time
 * @returns {Object} Trend analysis
 */
const calculateTrend = (values) => {
  if (!values || values.length < 2) {
    return {
      trend: 'stable',
      slope: 0,
      strength: 0
    };
  }
  
  const n = values.length;
  const x = Array.from({length: n}, (_, i) => i);
  const y = values;
  
  const correlation = calculateCorrelation(x, y);
  const slope = correlation * (calculateStandardDeviation(y) / calculateStandardDeviation(x));
  
  let trend = 'stable';
  if (slope > 0.1) trend = 'increasing';
  else if (slope < -0.1) trend = 'decreasing';
  
  return {
    trend,
    slope: Math.round(slope * 1000) / 1000,
    strength: Math.abs(correlation)
  };
};

module.exports = {
  calculateMean,
  calculateMedian,
  calculateStandardDeviation,
  calculatePercentageChange,
  calculateGrowthRate,
  calculateMovingAverage,
  calculatePercentile,
  calculateCorrelation,
  calculateConsumptionStats,
  calculateBillingStats,
  calculateTrend
}; 