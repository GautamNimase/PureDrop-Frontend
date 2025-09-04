// Billing calculation functions for water management system

const RATE_PER_UNIT = 15.50; // Base rate per unit
const HIGH_CONSUMPTION_THRESHOLD = 100; // Units
const OVERDUE_THRESHOLD_DAYS = 30; // Days

/**
 * Calculate bill amount based on units consumed
 * @param {number} unitsConsumed - Units of water consumed
 * @param {number} ratePerUnit - Rate per unit (default: 15.50)
 * @returns {number} Calculated bill amount
 */
const calculateBillAmount = (unitsConsumed, ratePerUnit = RATE_PER_UNIT) => {
  if (!unitsConsumed || unitsConsumed < 0) return 0;
  
  let amount = unitsConsumed * ratePerUnit;
  
  // Apply surcharge for high consumption
  if (unitsConsumed > 200) {
    amount *= 1.1; // 10% surcharge for very high consumption
  } else if (unitsConsumed > 150) {
    amount *= 1.05; // 5% surcharge for high consumption
  } else if (unitsConsumed < 50) {
    amount *= 0.95; // 5% discount for low consumption
  }
  
  return Math.round(amount * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate overdue days for a bill
 * @param {string} billDate - Bill date (YYYY-MM-DD format)
 * @param {string} paymentStatus - Payment status
 * @returns {number} Number of overdue days
 */
const calculateOverdueDays = (billDate, paymentStatus) => {
  if (paymentStatus === 'Paid') return 0;
  
  const billDateObj = new Date(billDate);
  const today = new Date();
  const diffTime = today - billDateObj;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};

/**
 * Calculate late fee based on overdue days
 * @param {number} billAmount - Original bill amount
 * @param {number} overdueDays - Number of overdue days
 * @returns {number} Late fee amount
 */
const calculateLateFee = (billAmount, overdueDays) => {
  if (overdueDays <= 0) return 0;
  
  let lateFee = 0;
  
  if (overdueDays > 60) {
    lateFee = billAmount * 0.10; // 10% after 60 days
  } else if (overdueDays > 30) {
    lateFee = billAmount * 0.05; // 5% after 30 days
  } else if (overdueDays > 15) {
    lateFee = billAmount * 0.02; // 2% after 15 days
  }
  
  return Math.round(lateFee * 100) / 100;
};

/**
 * Check if bill is overdue
 * @param {string} billDate - Bill date
 * @param {string} paymentStatus - Payment status
 * @returns {boolean} True if overdue
 */
const isOverdue = (billDate, paymentStatus) => {
  if (paymentStatus === 'Paid') return false;
  
  const overdueDays = calculateOverdueDays(billDate, paymentStatus);
  return overdueDays > OVERDUE_THRESHOLD_DAYS;
};

/**
 * Get total outstanding amount for a user
 * @param {Array} userBills - Array of user's bills
 * @returns {number} Total outstanding amount
 */
const getUserOutstandingAmount = (userBills) => {
  return userBills
    .filter(bill => bill.PaymentStatus === 'Unpaid' || bill.PaymentStatus === 'Overdue')
    .reduce((total, bill) => {
      const overdueDays = calculateOverdueDays(bill.BillDate, bill.PaymentStatus);
      const lateFee = calculateLateFee(bill.Amount, overdueDays);
      return total + bill.Amount + lateFee;
    }, 0);
};

/**
 * Auto-calculate bill amount from meter reading
 * @param {number} meterReadingId - Meter reading ID
 * @param {Array} readings - Array of all meter readings
 * @returns {number} Calculated bill amount
 */
const calculateBillFromReading = (meterReadingId, readings) => {
  const reading = readings.find(r => r.MeterReadingID === parseInt(meterReadingId));
  if (!reading) return 0;
  
  return calculateBillAmount(reading.UnitsConsumed);
};

module.exports = {
  calculateBillAmount,
  calculateOverdueDays,
  calculateLateFee,
  isOverdue,
  getUserOutstandingAmount,
  calculateBillFromReading,
  RATE_PER_UNIT,
  HIGH_CONSUMPTION_THRESHOLD,
  OVERDUE_THRESHOLD_DAYS
}; 