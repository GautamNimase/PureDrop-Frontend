const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

// GET /api/audit - fetch all audit logs
router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// POST /api/audit - add a new audit log
router.post('/', async (req, res) => {
  try {
    const { user, action, details } = req.body;
    const newLog = new AuditLog({
      user,
      action,
      details
    });
    await newLog.save();
    res.status(201).json(newLog);
  } catch (err) {
    console.error('Error creating audit log:', err);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

module.exports = router; 