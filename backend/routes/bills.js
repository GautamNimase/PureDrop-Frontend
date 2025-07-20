const express = require('express');
const router = express.Router();
const { auditLogs, getNextId } = require('./auditLogsStore');
const { readings } = require('./readings');
const { connections } = require('./connections');
const { calculateBillFromReading, calculateOverdueDays, isOverdue, getUserOutstandingAmount } = require('../utils/billingFunctions');
const { validateBillData } = require('../utils/validationFunctions');
const { triggerAfterBillInsert, triggerAfterBillUpdate, triggerAfterBillDelete } = require('../utils/triggerFunctions');
const pool = require('../config/database');

// In-memory bills data (placeholder)
let bills = [
  { BillID: 1, BillDate: '2023-04-01', Amount: 250, PaymentStatus: 'Paid', MeterReadingID: 1 },
  { BillID: 2, BillDate: '2023-04-02', Amount: 180, PaymentStatus: 'Unpaid', MeterReadingID: 2 },
];
let nextId = 3;

// GET /api/bills - fetch all bills or by userId
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let billsQuery = '';
    let params = [];
    if (userId) {
      // Fetch bills for a specific user by joining connections, readings, and bills
      billsQuery = `
        SELECT b.*, r.ConnectionID, c.UserID
        FROM bills b
        JOIN meter_readings r ON b.MeterReadingID = r.MeterReadingID
        JOIN connections c ON r.ConnectionID = c.ConnectionID
        WHERE c.UserID = ?
      `;
      params = [userId];
    } else {
      // Fetch all bills with related info
      billsQuery = `
        SELECT b.*, r.ConnectionID, c.UserID
        FROM bills b
        JOIN meter_readings r ON b.MeterReadingID = r.MeterReadingID
        JOIN connections c ON r.ConnectionID = c.ConnectionID
      `;
    }
    const [rows] = await pool.query(billsQuery, params);
    // Add calculated fields
    const billsWithCalculations = rows.map(bill => ({
      ...bill,
      overdueDays: calculateOverdueDays(bill.BillDate, bill.PaymentStatus),
      isOverdue: isOverdue(bill.BillDate, bill.PaymentStatus)
    }));
    res.json(billsWithCalculations);
  } catch (err) {
    console.error('Error fetching bills:', err);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// GET /api/bills/outstanding/:userId - get outstanding amount for user
router.get('/outstanding/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    // Find all bills for this user (join connections, meter_readings, bills)
    const [rows] = await pool.query(`
      SELECT b.*
      FROM bills b
      JOIN meter_readings r ON b.MeterReadingID = r.MeterReadingID
      JOIN connections c ON r.ConnectionID = c.ConnectionID
      WHERE c.UserID = ?
    `, [userId]);
    // Calculate outstanding amount and bill count
    const outstandingBills = rows.filter(b => b.PaymentStatus === 'Unpaid' || b.PaymentStatus === 'Overdue');
    const outstandingAmount = outstandingBills.reduce((sum, b) => sum + (b.Amount || 0), 0);
    res.json({
      userId,
      outstandingAmount,
      billCount: outstandingBills.length
    });
  } catch (err) {
    console.error('Error fetching outstanding bills:', err);
    res.status(500).json({ error: 'Failed to fetch outstanding bills' });
  }
});

// POST /api/bills - add a new bill
router.post('/', async (req, res) => {
  try {
    const { BillDate, Amount, PaymentStatus, MeterReadingID } = req.body;
    // Validate input data
    const validationErrors = validateBillData({ BillDate, Amount, PaymentStatus, MeterReadingID });
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }
    // Calculate amount if not provided
    let calculatedAmount = Amount;
    if ((!Amount || Amount === 0) && MeterReadingID) {
      // You may want to implement this with a stored procedure or JS logic
      // For now, fallback to 0 if not provided
      calculatedAmount = 0;
    }
    // Insert into database
    const [result] = await pool.query(
      'INSERT INTO bills (BillDate, Amount, PaymentStatus, MeterReadingID) VALUES (?, ?, ?, ?)',
      [BillDate, calculatedAmount, PaymentStatus, MeterReadingID]
    );
    // Fetch the inserted bill
    const [rows] = await pool.query('SELECT * FROM bills WHERE BillID = ?', [result.insertId]);
    const newBill = rows[0];
    res.status(201).json(newBill);
  } catch (err) {
    console.error('Error adding bill:', err);
    res.status(500).json({ error: 'Failed to add bill' });
  }
});

// POST /api/bills/process-payment - sp_ProcessPayment implementation
router.post('/process-payment', async (req, res) => {
  try {
    const { BillID, PaymentAmount, PaymentMethod } = req.body;
    if (!BillID || !PaymentAmount || !PaymentMethod) {
      return res.status(400).json({ error: 'BillID, PaymentAmount, and PaymentMethod are required' });
    }
    // Fetch the bill
    const [billRows] = await pool.query('SELECT * FROM bills WHERE BillID = ?', [BillID]);
    if (billRows.length === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    const bill = billRows[0];
    if (PaymentAmount < bill.Amount) {
      return res.status(400).json({
        error: 'Payment amount is less than bill amount',
        required: bill.Amount,
        provided: PaymentAmount
      });
    }
    // Update the bill as paid
    const paymentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await pool.query(
      'UPDATE bills SET PaymentStatus = ?, PaymentDate = ?, PaymentMethod = ? WHERE BillID = ?',
      ['Paid', paymentDate, PaymentMethod, BillID]
    );
    // Fetch the updated bill
    const [updatedRows] = await pool.query('SELECT * FROM bills WHERE BillID = ?', [BillID]);
    res.json({
      success: true,
      message: 'Payment processed successfully',
      bill: updatedRows[0]
    });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// PUT /api/bills/:id - update a bill
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { BillDate, Amount, PaymentStatus, MeterReadingID } = req.body;
    // Validate input data
    const validationErrors = validateBillData({ BillDate, Amount, PaymentStatus, MeterReadingID });
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }
    // Calculate amount if needed
    let calculatedAmount = Amount;
    if ((!Amount || Amount === 0) && MeterReadingID) {
      calculatedAmount = 0;
    }
    // Update the bill in the database
    const [result] = await pool.query(
      'UPDATE bills SET BillDate = ?, Amount = ?, PaymentStatus = ?, MeterReadingID = ? WHERE BillID = ?',
      [BillDate, calculatedAmount, PaymentStatus, MeterReadingID, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    // Fetch the updated bill
    const [rows] = await pool.query('SELECT * FROM bills WHERE BillID = ?', [id]);
    const updatedBill = rows[0];
    res.json(updatedBill);
  } catch (err) {
    console.error('Error updating bill:', err);
    res.status(500).json({ error: 'Failed to update bill' });
  }
});

// DELETE /api/bills/:id - delete a bill
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [result] = await pool.query('DELETE FROM bills WHERE BillID = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted' });
  } catch (err) {
    console.error('Error deleting bill:', err);
    res.status(500).json({ error: 'Failed to delete bill' });
  }
});

module.exports = { router, bills }; 