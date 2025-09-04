// Date and time functions for water management system

/**
 * Get billing period from reading date
 * @param {string} readingDate - Reading date (YYYY-MM-DD format)
 * @returns {string} Billing period (YYYY-MM format)
 */
const getBillingPeriod = (readingDate) => {
  if (!readingDate) return null;
  
  const date = new Date(readingDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  return `${year}-${month}`;
};

/**
 * Check if a date is overdue
 * @param {string} billDate - Bill date
 * @param {string} paymentStatus - Payment status
 * @returns {boolean} True if overdue
 */
const isOverdue = (billDate, paymentStatus) => {
  if (paymentStatus === 'Paid') return false;
  
  const billDateObj = new Date(billDate);
  const today = new Date();
  const diffTime = today - billDateObj;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 30; // 30 days threshold
};

/**
 * Get days between two dates
 * @param {string} startDate - Start date (YYYY-MM-DD format)
 * @param {string} endDate - End date (YYYY-MM-DD format)
 * @returns {number} Number of days between dates
 */
const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get current month and year
 * @returns {Object} Current month and year
 */
const getCurrentPeriod = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    monthName: now.toLocaleString('default', { month: 'long' }),
    period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  };
};

/**
 * Get date range for last N months
 * @param {number} months - Number of months to look back
 * @returns {Object} Start and end dates
 */
const getDateRange = (months = 6) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

/**
 * Format date for display
 * @param {string} date - Date string
 * @param {string} format - Format type ('short', 'long', 'month')
 * @returns {string} Formatted date
 */
const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'month':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    default:
      return dateObj.toLocaleDateString('en-US');
  }
};

/**
 * Check if date is in current month
 * @param {string} date - Date to check
 * @returns {boolean} True if in current month
 */
const isCurrentMonth = (date) => {
  if (!date) return false;
  
  const checkDate = new Date(date);
  const now = new Date();
  
  return checkDate.getMonth() === now.getMonth() && 
         checkDate.getFullYear() === now.getFullYear();
};

/**
 * Get month name from date
 * @param {string} date - Date string
 * @returns {string} Month name
 */
const getMonthName = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleString('default', { month: 'long' });
};

/**
 * Check if date is valid
 * @param {string} date - Date to validate
 * @returns {boolean} True if valid date
 */
const isValidDate = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Get quarter from date
 * @param {string} date - Date string
 * @returns {number} Quarter number (1-4)
 */
const getQuarter = (date) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  const month = dateObj.getMonth() + 1;
  
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
};

module.exports = {
  getBillingPeriod,
  isOverdue,
  getDaysBetween,
  getCurrentPeriod,
  getDateRange,
  formatDate,
  isCurrentMonth,
  getMonthName,
  isValidDate,
  getQuarter
}; 