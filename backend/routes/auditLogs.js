const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

// Get all audit logs
router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find();
    res.json(logs);
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit log by ID
router.get('/:id', async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'Audit log not found' });
    }
    res.json(log);
  } catch (err) {
    console.error('Error fetching audit log:', err);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// Create a new audit log
router.post('/', async (req, res) => {
  try {
    const { user, action, details } = req.body;
    const log = new AuditLog({ user, action, details });
    await log.save();
    res.status(201).json({ message: 'Audit log created successfully', log });
  } catch (err) {
    console.error('Error creating audit log:', err);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

// Delete an audit log
router.delete('/:id', async (req, res) => {
  try {
    const deletedLog = await AuditLog.findByIdAndDelete(req.params.id);
    if (!deletedLog) {
      return res.status(404).json({ error: 'Audit log not found' });
    }
    res.json({ message: 'Audit log deleted successfully' });
  } catch (err) {
    console.error('Error deleting audit log:', err);
    res.status(500).json({ error: 'Failed to delete audit log' });
  }
});

module.exports = router; 