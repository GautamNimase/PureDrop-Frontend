const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const MeterReading = require('../models/MeterReading');
const Connection = require('../models/Connection');
const mongoose = require('mongoose');

// Get all bills or by userId
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    
    if (userId) {
      // Validate if userId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
      
      // Find all connections for this user
      const userConnections = await Connection.find({ UserID: userId }).select('_id');
      const connectionIds = userConnections.map(c => c._id);
      
      // Find all meter readings for these connections
      const readings = await MeterReading.find({ ConnectionID: { $in: connectionIds } }).select('_id');
      const readingIds = readings.map(r => r._id);
      
      query.MeterReadingID = { $in: readingIds };
    }
    
    const bills = await Bill.find(query)
      .populate({ 
        path: 'MeterReadingID', 
        populate: { 
          path: 'ConnectionID', 
          select: 'MeterNumber UserID', 
          populate: { 
            path: 'UserID', 
            select: 'Name Email' 
          } 
        } 
      });
    res.json(bills);
  } catch (err) {
    console.error('Error fetching bills:', err);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// Get bill by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid bill ID format' });
    }
    
    const bill = await Bill.findById(req.params.id)
      .populate({ 
        path: 'MeterReadingID', 
        populate: { 
          path: 'ConnectionID', 
          select: 'MeterNumber UserID', 
          populate: { 
            path: 'UserID', 
            select: 'Name Email' 
          } 
        } 
      });
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json(bill);
  } catch (err) {
    console.error('Error fetching bill:', err);
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
});

// Create a new bill
router.post('/', async (req, res) => {
  try {
    const { MeterReadingID, BillDate, Amount, PaymentStatus, PaymentDate, PaymentMethod } = req.body;
    const bill = new Bill({
      MeterReadingID,
      BillDate,
      Amount,
      PaymentStatus,
      PaymentDate,
      PaymentMethod
    });
    await bill.save();
    res.status(201).json({ message: 'Bill created successfully', bill });
  } catch (err) {
    console.error('Error creating bill:', err);
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

// Update a bill
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid bill ID format' });
    }
    
    const { MeterReadingID, BillDate, Amount, PaymentStatus, PaymentDate, PaymentMethod } = req.body;
    const updatedBill = await Bill.findByIdAndUpdate(
      req.params.id,
      { MeterReadingID, BillDate, Amount, PaymentStatus, PaymentDate, PaymentMethod, UpdatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedBill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json({ message: 'Bill updated successfully', bill: updatedBill });
  } catch (err) {
    console.error('Error updating bill:', err);
    res.status(500).json({ error: 'Failed to update bill' });
  }
});

// Delete a bill
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid bill ID format' });
    }
    
    const deletedBill = await Bill.findByIdAndDelete(req.params.id);
    if (!deletedBill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted successfully' });
  } catch (err) {
    console.error('Error deleting bill:', err);
    res.status(500).json({ error: 'Failed to delete bill' });
  }
});

// Process payment for a bill
router.post('/process-payment', async (req, res) => {
  try {
    const { billId, paymentAmount, paymentMethod } = req.body;
    if (!billId || !paymentAmount || !paymentMethod) {
      return res.status(400).json({ error: 'billId, paymentAmount, and paymentMethod are required' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(billId)) {
      return res.status(400).json({ error: 'Invalid bill ID format' });
    }
    
    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    if (paymentAmount < bill.Amount) {
      return res.status(400).json({ error: 'Payment amount is less than bill amount', required: bill.Amount, provided: paymentAmount });
    }
    bill.PaymentStatus = 'Paid';
    bill.PaymentDate = new Date();
    bill.PaymentMethod = paymentMethod;
    await bill.save();
    res.json({ success: true, message: 'Payment processed successfully', bill });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Get outstanding amount for a user
router.get('/outstanding/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    // Find all connections for this user
    const userConnections = await Connection.find({ UserID: userId }).select('_id');
    const connectionIds = userConnections.map(c => c._id);
    
    // Find all meter readings for these connections
    const readings = await MeterReading.find({ ConnectionID: { $in: connectionIds } }).select('_id');
    const readingIds = readings.map(r => r._id);
    
    // Find all unpaid/overdue bills for these readings
    const bills = await Bill.find({ 
      MeterReadingID: { $in: readingIds }, 
      PaymentStatus: { $in: ['Unpaid', 'Overdue'] } 
    });
    
    const outstandingAmount = bills.reduce((sum, b) => sum + (b.Amount || 0), 0);
    res.json({ userId, outstandingAmount, billCount: bills.length });
  } catch (err) {
    console.error('Error fetching outstanding bills:', err);
    res.status(500).json({ error: 'Failed to fetch outstanding bills' });
  }
});

module.exports = router; 