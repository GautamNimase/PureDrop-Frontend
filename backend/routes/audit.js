const express = require('express');
const router = express.Router();
const { auditLogs, getNextId } = require('./auditLogsStore');

// GET /api/audit - fetch all audit logs
router.get('/', (req, res) => {
  res.json(auditLogs);
});

// POST /api/audit - add a new audit log (for testing/demo)
router.post('/', (req, res) => {
  const { User, Action, Timestamp, Details } = req.body;
  if (!User || !Action || !Timestamp || !Details) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const newLog = {
    LogID: getNextId(),
    User,
    Action,
    Timestamp,
    Details,
  };
  auditLogs.push(newLog);
  res.status(201).json(newLog);
});

module.exports = router; 