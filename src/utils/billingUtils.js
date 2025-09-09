// Billing utility functions for automatic bill generation

// Fixed rate per unit (in currency units)
export const FIXED_RATE_PER_UNIT = 5.50; // $5.50 per unit

// Bill generation configuration
export const BILL_CONFIG = {
  FIXED_RATE_PER_UNIT: 5.50,
  BILL_DUE_DAYS: 30, // Bills are due 30 days after generation
  TAX_RATE: 0.08, // 8% tax rate
  SERVICE_CHARGE: 10.00 // Fixed service charge per bill
};

/**
 * Generate a bill automatically when a meter reading is added
 * @param {Object} reading - The meter reading object
 * @param {Object} connection - The connection object
 * @returns {Object} Generated bill object
 */
export const generateBillFromReading = (reading, connection) => {
  const unitsConsumed = Number(reading.UnitsConsumed) || 0;
  const baseAmount = unitsConsumed * BILL_CONFIG.FIXED_RATE_PER_UNIT;
  const taxAmount = baseAmount * BILL_CONFIG.TAX_RATE;
  const totalAmount = baseAmount + taxAmount + BILL_CONFIG.SERVICE_CHARGE;
  
  // Calculate bill date (same as reading date)
  const billDate = new Date(reading.ReadingDate);
  
  // Calculate due date (30 days after bill date)
  const dueDate = new Date(billDate);
  dueDate.setDate(dueDate.getDate() + BILL_CONFIG.BILL_DUE_DAYS);
  
  const bill = {
    _id: `B${Date.now()}`, // Generate unique bill ID
    BillNumber: `BILL-${Date.now().toString().slice(-8)}`, // Generate bill number
    BillDate: billDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
    DueDate: dueDate.toISOString().split('T')[0],
    Amount: parseFloat(totalAmount.toFixed(2)),
    BaseAmount: parseFloat(baseAmount.toFixed(2)),
    TaxAmount: parseFloat(taxAmount.toFixed(2)),
    ServiceCharge: BILL_CONFIG.SERVICE_CHARGE,
    UnitsConsumed: unitsConsumed,
    RatePerUnit: BILL_CONFIG.FIXED_RATE_PER_UNIT,
    TaxRate: BILL_CONFIG.TAX_RATE,
    PaymentStatus: 'Unpaid',
    MeterReadingID: reading._id,
    ConnectionID: connection._id || connection.ConnectionID,
    UserID: connection.UserID,
    createdAt: new Date().toISOString(),
    // Additional bill details
    BillDetails: {
      UnitsConsumed: unitsConsumed,
      RatePerUnit: BILL_CONFIG.FIXED_RATE_PER_UNIT,
      BaseAmount: parseFloat(baseAmount.toFixed(2)),
      ServiceCharge: BILL_CONFIG.SERVICE_CHARGE,
      TaxRate: BILL_CONFIG.TAX_RATE,
      TaxAmount: parseFloat(taxAmount.toFixed(2)),
      TotalAmount: parseFloat(totalAmount.toFixed(2))
    }
  };
  
  return bill;
};

/**
 * Calculate bill amount for given units consumed
 * @param {number} unitsConsumed - Number of units consumed
 * @returns {Object} Bill calculation breakdown
 */
export const calculateBillAmount = (unitsConsumed) => {
  const baseAmount = unitsConsumed * BILL_CONFIG.FIXED_RATE_PER_UNIT;
  const taxAmount = baseAmount * BILL_CONFIG.TAX_RATE;
  const totalAmount = baseAmount + taxAmount + BILL_CONFIG.SERVICE_CHARGE;
  
  return {
    unitsConsumed,
    ratePerUnit: BILL_CONFIG.FIXED_RATE_PER_UNIT,
    baseAmount: parseFloat(baseAmount.toFixed(2)),
    serviceCharge: BILL_CONFIG.SERVICE_CHARGE,
    taxRate: BILL_CONFIG.TAX_RATE,
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2))
  };
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

/**
 * Get bill status based on due date
 * @param {string} dueDate - Due date in YYYY-MM-DD format
 * @param {string} paymentStatus - Current payment status
 * @returns {string} Calculated bill status
 */
export const getBillStatus = (dueDate, paymentStatus) => {
  if (paymentStatus === 'Paid') return 'Paid';
  
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Overdue';
  if (diffDays <= 7) return 'Due Soon';
  return 'Unpaid';
};
