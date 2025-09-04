const express = require('express');
const router = express.Router();
const WaterSource = require('../models/WaterSource');

// Get all water sources
router.get('/', async (req, res) => {
  try {
    const sources = await WaterSource.find();
    res.json(sources);
  } catch (err) {
    console.error('Error fetching water sources:', err);
    res.status(500).json({ error: 'Failed to fetch water sources' });
  }
});

// Get water source by ID
router.get('/:id', async (req, res) => {
  try {
    const source = await WaterSource.findById(req.params.id);
    if (!source) {
      return res.status(404).json({ error: 'Water source not found' });
    }
    res.json(source);
  } catch (err) {
    console.error('Error fetching water source:', err);
    res.status(500).json({ error: 'Failed to fetch water source' });
  }
});

// Create a new water source
router.post('/', async (req, res) => {
  try {
    const { name, type, capacity, status } = req.body;
    const source = new WaterSource({ name, type, capacity, status });
    await source.save();
    res.status(201).json({ message: 'Water source created successfully', source });
  } catch (err) {
    console.error('Error creating water source:', err);
    res.status(500).json({ error: 'Failed to create water source' });
  }
});

// Update a water source
router.put('/:id', async (req, res) => {
  try {
    const { name, type, capacity, status } = req.body;
    const updatedSource = await WaterSource.findByIdAndUpdate(
      req.params.id,
      { name, type, capacity, status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedSource) {
      return res.status(404).json({ error: 'Water source not found' });
    }
    res.json({ message: 'Water source updated successfully', source: updatedSource });
  } catch (err) {
    console.error('Error updating water source:', err);
    res.status(500).json({ error: 'Failed to update water source' });
  }
});

// Delete a water source
router.delete('/:id', async (req, res) => {
  try {
    const deletedSource = await WaterSource.findByIdAndDelete(req.params.id);
    if (!deletedSource) {
      return res.status(404).json({ error: 'Water source not found' });
    }
    res.json({ message: 'Water source deleted successfully' });
  } catch (err) {
    console.error('Error deleting water source:', err);
    res.status(500).json({ error: 'Failed to delete water source' });
  }
});

module.exports = router; 