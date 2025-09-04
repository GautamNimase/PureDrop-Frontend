const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const mongoose = require('mongoose');

// Get all alerts or by userId
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    
    if (userId) {
      // Validate if userId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
      query.UserID = userId;
    }
    
    const alerts = await Alert.find(query).populate('UserID', 'Name Email');
    res.json(alerts);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get alert by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid alert ID format' });
    }
    
    const alert = await Alert.findById(req.params.id).populate('UserID', 'Name Email');
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (err) {
    console.error('Error fetching alert:', err);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

// Create a new alert
router.post('/', async (req, res) => {
  try {
    const { Type, Message, Status, Severity, UserID } = req.body;
    const alert = new Alert({
      Type,
      Message,
      Status,
      Severity,
      UserID
    });
    await alert.save();
    res.status(201).json({ message: 'Alert created successfully', alert });
  } catch (err) {
    console.error('Error creating alert:', err);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Update an alert
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid alert ID format' });
    }
    
    const { Type, Message, Status, Severity, UserID } = req.body;
    const updatedAlert = await Alert.findByIdAndUpdate(
      req.params.id,
      { Type, Message, Status, Severity, UserID, UpdatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ message: 'Alert updated successfully', alert: updatedAlert });
  } catch (err) {
    console.error('Error updating alert:', err);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Delete an alert
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid alert ID format' });
    }
    
    const deletedAlert = await Alert.findByIdAndDelete(req.params.id);
    if (!deletedAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ message: 'Alert deleted successfully' });
  } catch (err) {
    console.error('Error deleting alert:', err);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

module.exports = router; 