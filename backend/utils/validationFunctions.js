// Validation functions for water management system

/**
 * Validate meter number format (2 letters + 6 digits)
 * @param {string} meterNumber - Meter number to validate
 * @returns {boolean} True if valid format
 */
const validateMeterNumber = (meterNumber) => {
  if (!meterNumber || typeof meterNumber !== 'string') return false;
  
  // Pattern: 2 letters followed by 6 digits
  const meterPattern = /^[A-Z]{2}[0-9]{6}$/;
  return meterPattern.test(meterNumber.toUpperCase());
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  // Basic email validation pattern
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailPattern.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check if it's 10 digits (standard phone number)
  return digitsOnly.length === 10;
};

/**
 * Validate connection type
 * @param {string} connectionType - Connection type to validate
 * @returns {boolean} True if valid connection type
 */
const validateConnectionType = (connectionType) => {
  const validTypes = ['Residential', 'Commercial', 'Industrial', 'Agricultural'];
  return validTypes.includes(connectionType);
};

/**
 * Validate payment status
 * @param {string} paymentStatus - Payment status to validate
 * @returns {boolean} True if valid payment status
 */
const validatePaymentStatus = (paymentStatus) => {
  const validStatuses = ['Paid', 'Unpaid', 'Overdue', 'Pending'];
  return validStatuses.includes(paymentStatus);
};

/**
 * Validate alert type
 * @param {string} alertType - Alert type to validate
 * @returns {boolean} True if valid alert type
 */
const validateAlertType = (alertType) => {
  const validTypes = [
    'High Consumption', 
    'Payment Overdue', 
    'Water Quality', 
    'System Maintenance',
    'Leak Detection',
    'Meter Reading Due'
  ];
  return validTypes.includes(alertType);
};

/**
 * Validate complaint status
 * @param {string} complaintStatus - Complaint status to validate
 * @returns {boolean} True if valid complaint status
 */
const validateComplaintStatus = (complaintStatus) => {
  const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
  return validStatuses.includes(complaintStatus);
};

/**
 * Validate complaint type
 * @param {string} complaintType - Complaint type to validate
 * @returns {boolean} True if valid complaint type
 */
const validateComplaintType = (complaintType) => {
  const validTypes = [
    'Water Quality', 
    'Billing Issue', 
    'Service Interruption', 
    'Meter Problem',
    'Connection Issue',
    'Other'
  ];
  return validTypes.includes(complaintType);
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} date - Date to validate
 * @returns {boolean} True if valid date format
 */
const validateDateFormat = (date) => {
  if (!date || typeof date !== 'string') return false;
  
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(date)) return false;
  
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Validate numeric value
 * @param {any} value - Value to validate
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @returns {boolean} True if valid numeric value
 */
const validateNumeric = (value, min = null, max = null) => {
  const num = Number(value);
  if (isNaN(num)) return false;
  
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  
  return true;
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} True if field is not empty
 */
const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

/**
 * Validate user data
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation result with errors
 */
const validateUserData = (userData) => {
  const errors = {};
  
  if (!validateRequired(userData.Name)) {
    errors.Name = 'Name is required';
  }
  
  if (!validateRequired(userData.Address)) {
    errors.Address = 'Address is required';
  }
  
  if (!validatePhone(userData.Phone)) {
    errors.Phone = 'Valid phone number is required (10 digits)';
  }
  
  if (!validateEmail(userData.Email)) {
    errors.Email = 'Valid email address is required';
  }
  
  if (!validateConnectionType(userData.ConnectionType)) {
    errors.ConnectionType = 'Valid connection type is required';
  }
  
  return errors;
};

/**
 * Validate bill data
 * @param {Object} billData - Bill data to validate
 * @returns {Object} Validation result with errors
 */
const validateBillData = (billData) => {
  const errors = {};

  if (!validateDateFormat(billData.BillDate)) {
    errors.BillDate = 'Valid date is required (YYYY-MM-DD)';
  }

  // Allow Amount to be 0 or missing (for backend calculation)
  if (billData.Amount !== undefined && billData.Amount !== null && !validateNumeric(billData.Amount, 0)) {
    errors.Amount = 'Valid amount is required (non-negative number)';
  }

  if (!validatePaymentStatus(billData.PaymentStatus)) {
    errors.PaymentStatus = 'Valid payment status is required';
  }

  if (!validateNumeric(billData.MeterReadingID, 1)) {
    errors.MeterReadingID = 'Valid meter reading ID is required';
  }

  return errors;
};

/**
 * Validate meter reading data
 * @param {Object} readingData - Meter reading data to validate
 * @returns {Object} Validation result with errors
 */
const validateMeterReadingData = (readingData) => {
  const errors = {};
  
  if (!validateDateFormat(readingData.ReadingDate)) {
    errors.ReadingDate = 'Valid date is required (YYYY-MM-DD)';
  }
  
  if (!validateNumeric(readingData.UnitsConsumed, 0)) {
    errors.UnitsConsumed = 'Valid units consumed is required (non-negative number)';
  }
  
  if (!validateNumeric(readingData.ConnectionID, 1)) {
    errors.ConnectionID = 'Valid connection ID is required';
  }
  
  return errors;
};

module.exports = {
  validateMeterNumber,
  validateEmail,
  validatePhone,
  validateConnectionType,
  validatePaymentStatus,
  validateAlertType,
  validateComplaintStatus,
  validateComplaintType,
  validateDateFormat,
  validateNumeric,
  validateRequired,
  validateUserData,
  validateBillData,
  validateMeterReadingData
}; 