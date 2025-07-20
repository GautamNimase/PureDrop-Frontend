const express = require('express');
const router = express.Router();
const { auditLogs, getNextId } = require('./auditLogsStore');
const { triggerAfterConnectionInsert, triggerAfterConnectionUpdate, triggerAfterConnectionDelete } = require('../utils/triggerFunctions');
const pool = require('../config/database');

// In-memory water connections data (placeholder)
let connections = [
  { ConnectionID: 1, UserID: 1, ConnectionDate: '2023-01-01', MeterNumber: 'MTR001', Status: 'Active', SourceID: 1 },
  { ConnectionID: 2, UserID: 2, ConnectionDate: '2023-02-15', MeterNumber: 'MTR002', Status: 'Inactive', SourceID: 2 },
];
let nextId = 3;

// GET /api/connections - fetch all connections or by userId
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = 'SELECT * FROM connections';
    let params = [];
    if (userId) {
      query += ' WHERE UserID = ?';
      params.push(userId);
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching connections:', err);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// POST /api/connections - add a new connection (sp_CreateConnection implementation)
router.post('/', async (req, res) => {
  try {
    const { UserID, ConnectionDate, MeterNumber, Status, SourceID } = req.body;
    if (!UserID || !ConnectionDate || !MeterNumber || !Status || !SourceID) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    // Check if user exists
    const [userRows] = await pool.query('SELECT * FROM users WHERE UserID = ?', [UserID]);
    if (userRows.length === 0) {
      return res.status(400).json({ error: 'User does not exist' });
    }
    // Check if meter number already exists
    const [meterRows] = await pool.query('SELECT * FROM connections WHERE MeterNumber = ?', [MeterNumber]);
    if (meterRows.length > 0) {
      return res.status(400).json({ error: 'Meter number already exists' });
    }
    // Insert into database
    const [result] = await pool.query(
      'INSERT INTO connections (UserID, ConnectionDate, MeterNumber, Status, SourceID) VALUES (?, ?, ?, ?, ?)',
      [UserID, ConnectionDate, MeterNumber, Status, SourceID]
    );
    // Fetch the inserted connection
    const [rows] = await pool.query('SELECT * FROM connections WHERE ConnectionID = ?', [result.insertId]);
    const newConnection = rows[0];
    res.status(201).json(newConnection);
  } catch (err) {
    console.error('Error adding connection:', err);
    res.status(500).json({ error: 'Failed to add connection' });
  }
});

// PUT /api/connections/:id - update a connection
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { UserID, ConnectionDate, MeterNumber, Status, SourceID } = req.body;
    if (!UserID || !ConnectionDate || !MeterNumber || !Status || !SourceID) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    // Check if user exists
    const [userRows] = await pool.query('SELECT * FROM users WHERE UserID = ?', [UserID]);
    if (userRows.length === 0) {
      return res.status(400).json({ error: 'User does not exist' });
    }
    // Check if meter number already exists (excluding current connection)
    const [meterRows] = await pool.query('SELECT * FROM connections WHERE MeterNumber = ? AND ConnectionID != ?', [MeterNumber, id]);
    if (meterRows.length > 0) {
      return res.status(400).json({ error: 'Meter number already exists' });
    }
    // Update the connection in the database
    const [result] = await pool.query(
      'UPDATE connections SET UserID = ?, ConnectionDate = ?, MeterNumber = ?, Status = ?, SourceID = ? WHERE ConnectionID = ?',
      [UserID, ConnectionDate, MeterNumber, Status, SourceID, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    // Fetch the updated connection
    const [rows] = await pool.query('SELECT * FROM connections WHERE ConnectionID = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating connection:', err);
    res.status(500).json({ error: 'Failed to update connection' });
  }
});

// DELETE /api/connections/:id - delete a connection
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [result] = await pool.query('DELETE FROM connections WHERE ConnectionID = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    res.json({ message: 'Connection deleted' });
  } catch (err) {
    console.error('Error deleting connection:', err);
    res.status(500).json({ error: 'Failed to delete connection' });
  }
});

module.exports = { router, connections }; 