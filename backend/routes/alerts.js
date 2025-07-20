const express = require('express');
const router = express.Router();
const { auditLogs, getNextId } = require('./auditLogsStore');
const pool = require('../config/database');

// In-memory alerts data (placeholder)
let alerts = [
  { AlertID: 1, Type: 'High Consumption', Message: 'Customer 1 exceeded monthly limit', Status: 'Active', Timestamp: '2023-06-01 14:30', UserID: 1 },
  { AlertID: 2, Type: 'Payment Overdue', Message: 'Bill 5 is overdue by 15 days', Status: 'Resolved', Timestamp: '2023-06-01 12:15', UserID: 2 },
  { AlertID: 3, Type: 'Water Quality', Message: 'pH levels below normal range', Status: 'Active', Timestamp: '2023-06-01 10:45' },
];
let nextId = 4;

// GET /api/alerts - fetch all alerts or by userId
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = 'SELECT * FROM alerts';
    let params = [];
    if (userId) {
      query += ' WHERE UserID = ?';
      params.push(userId);
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// POST /api/alerts - add a new alert (sp_CreateAlert implementation)
router.post('/', async (req, res) => {
  try {
    const { Type, Message, UserID, Status } = req.body;
    if (!Type || !Message || !Status) {
      return res.status(400).json({ error: 'Type, Message, and Status are required' });
    }
    // Validate user exists if UserID is provided
    if (UserID) {
      const [userRows] = await pool.query('SELECT * FROM users WHERE UserID = ?', [UserID]);
      if (userRows.length === 0) {
        return res.status(400).json({ error: 'User does not exist' });
      }
    }
    // Insert into database
    const [result] = await pool.query(
      'INSERT INTO alerts (Type, Message, Status, Timestamp, UserID) VALUES (?, ?, ?, NOW(), ?)',
      [Type, Message, Status, UserID || null]
    );
    // Fetch the inserted alert
    const [rows] = await pool.query('SELECT * FROM alerts WHERE AlertID = ?', [result.insertId]);
    const newAlert = rows[0];
    res.status(201).json(newAlert);
  } catch (err) {
    console.error('Error adding alert:', err);
    res.status(500).json({ error: 'Failed to add alert' });
  }
});

// PUT /api/alerts/:id - update an alert
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { Type, Message, Status, UserID } = req.body;
    if (!Type || !Message || !Status) {
      return res.status(400).json({ error: 'Type, Message, and Status are required' });
    }
    // Validate user exists if UserID is provided
    if (UserID) {
      const [userRows] = await pool.query('SELECT * FROM users WHERE UserID = ?', [UserID]);
      if (userRows.length === 0) {
        return res.status(400).json({ error: 'User does not exist' });
      }
    }
    // Update the alert in the database
    const [result] = await pool.query(
      'UPDATE alerts SET Type = ?, Message = ?, Status = ?, UserID = ? WHERE AlertID = ?',
      [Type, Message, Status, UserID || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    // Fetch the updated alert
    const [rows] = await pool.query('SELECT * FROM alerts WHERE AlertID = ?', [id]);
    const updatedAlert = rows[0];
    res.json(updatedAlert);
  } catch (err) {
    console.error('Error updating alert:', err);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// DELETE /api/alerts/:id - delete an alert
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [result] = await pool.query('DELETE FROM alerts WHERE AlertID = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    console.error('Error deleting alert:', err);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

module.exports = { router, alerts }; 