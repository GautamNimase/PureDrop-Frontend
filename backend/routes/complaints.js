const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// Get all complaints or by userId
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    if (userId) {
      query.user = userId;
    }
    const complaints = await Complaint.find(query).populate('user', 'name email');
    res.json(complaints);
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Get complaint by ID
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('user', 'name email');
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (err) {
    console.error('Error fetching complaint:', err);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

// Create a new complaint
router.post('/', async (req, res) => {
  try {
    const { user, type, description, status, response, date } = req.body;
    const complaint = new Complaint({
      user,
      type,
      description,
      status,
      response,
      date
    });
    await complaint.save();
    res.status(201).json({ message: 'Complaint created successfully', complaint });
  } catch (err) {
    console.error('Error creating complaint:', err);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// Update a complaint
router.put('/:id', async (req, res) => {
  try {
    const { user, type, description, status, response, date } = req.body;
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { user, type, description, status, response, date, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedComplaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json({ message: 'Complaint updated successfully', complaint: updatedComplaint });
  } catch (err) {
    console.error('Error updating complaint:', err);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

// Delete a complaint
router.delete('/:id', async (req, res) => {
  try {
    const deletedComplaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!deletedComplaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json({ message: 'Complaint deleted successfully' });
  } catch (err) {
    console.error('Error deleting complaint:', err);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

module.exports = router; 