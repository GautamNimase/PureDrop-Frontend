const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');
const User = require('../models/User');
const WaterSource = require('../models/WaterSource');
const mongoose = require('mongoose');

// Get all connections
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
    
    const connections = await Connection.find(query)
      .populate('UserID', 'Name Email')
      .populate('SourceID', 'Name Type');
    res.json(connections);
  } catch (err) {
    console.error('Error fetching connections:', err);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// Get connection by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid connection ID format' });
    }
    
    const connection = await Connection.findById(req.params.id)
      .populate('UserID', 'Name Email')
      .populate('SourceID', 'Name Type');
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    res.json(connection);
  } catch (err) {
    console.error('Error fetching connection:', err);
    res.status(500).json({ error: 'Failed to fetch connection' });
  }
});

// Create a new connection
router.post('/', async (req, res) => {
  try {
    const { UserID, SourceID, MeterNumber, ConnectionDate, Status } = req.body;
    
    // Check for duplicate meter number
    const existing = await Connection.findOne({ MeterNumber });
    if (existing) {
      return res.status(409).json({ error: 'Meter number already exists' });
    }
    
    const connection = new Connection({
      UserID,
      SourceID,
      MeterNumber,
      ConnectionDate,
      Status
    });
    await connection.save();
    res.status(201).json({ message: 'Connection created successfully', connection });
  } catch (err) {
    console.error('Error creating connection:', err);
    res.status(500).json({ error: 'Failed to create connection' });
  }
});

// Update a connection
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid connection ID format' });
    }
    
    const { UserID, SourceID, MeterNumber, ConnectionDate, Status } = req.body;
    const updatedConnection = await Connection.findByIdAndUpdate(
      req.params.id,
      { UserID, SourceID, MeterNumber, ConnectionDate, Status, UpdatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedConnection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    res.json({ message: 'Connection updated successfully', connection: updatedConnection });
  } catch (err) {
    console.error('Error updating connection:', err);
    res.status(500).json({ error: 'Failed to update connection' });
  }
});

// Delete a connection
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid connection ID format' });
    }
    
    const deletedConnection = await Connection.findByIdAndDelete(req.params.id);
    if (!deletedConnection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    res.json({ message: 'Connection deleted successfully' });
  } catch (err) {
    console.error('Error deleting connection:', err);
    res.status(500).json({ error: 'Failed to delete connection' });
  }
});

module.exports = router; 