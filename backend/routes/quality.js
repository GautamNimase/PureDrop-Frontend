const express = require('express');
const router = express.Router();
const WaterQuality = require('../models/WaterQuality');

// GET /api/quality - fetch all quality records
router.get('/', async (req, res) => {
  try {
    const quality = await WaterQuality.find().populate('source', 'name type');
  res.json(quality);
  } catch (err) {
    console.error('Error fetching quality records:', err);
    res.status(500).json({ error: 'Failed to fetch quality records' });
  }
});

// POST /api/quality - add a new quality record
router.post('/', async (req, res) => {
  try {
    const { source, date, ph, contaminants } = req.body;
    const newQuality = new WaterQuality({
      source,
      date,
      ph,
      contaminants
    });
    await newQuality.save();
    res.status(201).json(newQuality);
  } catch (err) {
    console.error('Error creating quality record:', err);
    res.status(500).json({ error: 'Failed to create quality record' });
  }
});

// PUT /api/quality/:id - update a quality record
router.put('/:id', async (req, res) => {
  try {
    const { source, date, ph, contaminants } = req.body;
    const updatedQuality = await WaterQuality.findByIdAndUpdate(
      req.params.id,
      { source, date, ph, contaminants },
      { new: true, runValidators: true }
    );
    if (!updatedQuality) {
      return res.status(404).json({ error: 'Quality record not found' });
    }
    res.json(updatedQuality);
  } catch (err) {
    console.error('Error updating quality record:', err);
    res.status(500).json({ error: 'Failed to update quality record' });
  }
});

// DELETE /api/quality/:id - delete a quality record
router.delete('/:id', async (req, res) => {
  try {
    const deletedQuality = await WaterQuality.findByIdAndDelete(req.params.id);
    if (!deletedQuality) {
      return res.status(404).json({ error: 'Quality record not found' });
    }
  res.json({ message: 'Quality record deleted' });
  } catch (err) {
    console.error('Error deleting quality record:', err);
    res.status(500).json({ error: 'Failed to delete quality record' });
  }
});

module.exports = router; 