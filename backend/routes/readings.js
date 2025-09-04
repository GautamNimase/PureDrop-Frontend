const express = require('express');
const router = express.Router();
const MeterReading = require('../models/MeterReading');
const Connection = require('../models/Connection');
const mongoose = require('mongoose');

// Get all readings or by userId
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
      query.ConnectionID = { $in: connectionIds };
    }
    
    const readings = await MeterReading.find(query)
      .populate({ 
        path: 'ConnectionID', 
        select: 'MeterNumber UserID', 
        populate: { 
          path: 'UserID', 
          select: 'Name Email' 
        } 
      });
    res.json(readings);
  } catch (err) {
    console.error('Error fetching readings:', err);
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
});

// Get reading by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid reading ID format' });
    }
    
    const reading = await MeterReading.findById(req.params.id)
      .populate({ 
        path: 'ConnectionID', 
        select: 'MeterNumber UserID', 
        populate: { 
          path: 'UserID', 
          select: 'Name Email' 
        } 
      });
    if (!reading) {
      return res.status(404).json({ error: 'Reading not found' });
    }
    res.json(reading);
  } catch (err) {
    console.error('Error fetching reading:', err);
    res.status(500).json({ error: 'Failed to fetch reading' });
  }
});

// Create a new reading
router.post('/', async (req, res) => {
  try {
    const { ConnectionID, ReadingDate, UnitsConsumed } = req.body;
    const reading = new MeterReading({
      ConnectionID,
      ReadingDate,
      UnitsConsumed
    });
    await reading.save();
    res.status(201).json({ message: 'Reading created successfully', reading });
  } catch (err) {
    console.error('Error creating reading:', err);
    res.status(500).json({ error: 'Failed to create reading' });
  }
});

// Update a reading
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid reading ID format' });
    }
    
    const { ConnectionID, ReadingDate, UnitsConsumed } = req.body;
    const updatedReading = await MeterReading.findByIdAndUpdate(
      req.params.id,
      { ConnectionID, ReadingDate, UnitsConsumed, UpdatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedReading) {
      return res.status(404).json({ error: 'Reading not found' });
    }
    res.json({ message: 'Reading updated successfully', reading: updatedReading });
  } catch (err) {
    console.error('Error updating reading:', err);
    res.status(500).json({ error: 'Failed to update reading' });
  }
});

// Delete a reading
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid reading ID format' });
    }
    
    const deletedReading = await MeterReading.findByIdAndDelete(req.params.id);
    if (!deletedReading) {
      return res.status(404).json({ error: 'Reading not found' });
    }
    res.json({ message: 'Reading deleted successfully' });
  } catch (err) {
    console.error('Error deleting reading:', err);
    res.status(500).json({ error: 'Failed to delete reading' });
  }
});

module.exports = router; 