const express = require('express');
const router = express.Router();
const { auditLogs, getNextId } = require('./auditLogsStore');
const { alerts } = require('./alerts');
const { connections } = require('./connections');
const { checkConsumptionAlert, isHighConsumption, calculateAverageConsumption } = require('../utils/consumptionFunctions');
const { validateMeterReadingData } = require('../utils/validationFunctions');
const { triggerAfterMeterReadingInsert, triggerAfterMeterReadingUpdate, triggerAfterMeterReadingDelete } = require('../utils/triggerFunctions');
const pool = require('../config/database');

// In-memory meter readings data (placeholder)
let readings = [
  { MeterReadingID: 1, ReadingDate: '2023-03-01', UnitsConsumed: 120, ConnectionID: 1 },
  { MeterReadingID: 2, ReadingDate: '2023-03-02', UnitsConsumed: 80, ConnectionID: 2 },
];
let nextId = 3;

// GET /api/readings - fetch all readings or by userId
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = 'SELECT * FROM meter_readings';
    let params = [];
    if (userId) {
      query += ' WHERE ConnectionID IN (SELECT ConnectionID FROM connections WHERE UserID = ?)';
      params.push(userId);
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching readings:', err);
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
});

// GET /api/readings/:id - fetch a specific reading
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await pool.query('SELECT * FROM meter_readings WHERE MeterReadingID = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Reading not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching reading:', err);
    res.status(500).json({ error: 'Failed to fetch reading' });
  }
});

// POST /api/readings - add a new reading
router.post('/', async (req, res) => {
  try {
    const { ReadingDate, UnitsConsumed, ConnectionID } = req.body;
    // Validate input data
    const validationErrors = validateMeterReadingData({ ReadingDate, UnitsConsumed, ConnectionID });
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }
    // Insert into database
    const [result] = await pool.query(
      'INSERT INTO meter_readings (ReadingDate, UnitsConsumed, ConnectionID) VALUES (?, ?, ?)',
      [ReadingDate, UnitsConsumed, ConnectionID]
    );
    // Fetch the inserted reading
    const [rows] = await pool.query('SELECT * FROM meter_readings WHERE MeterReadingID = ?', [result.insertId]);
    const newReading = rows[0];
    res.status(201).json(newReading);
  } catch (err) {
    console.error('Error adding reading:', err);
    res.status(500).json({ error: 'Failed to add reading' });
  }
});

// PUT /api/readings/:id - update a reading
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { ReadingDate, UnitsConsumed, ConnectionID } = req.body;
    // Validate input data
    const validationErrors = validateMeterReadingData({ ReadingDate, UnitsConsumed, ConnectionID });
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }
    // Update the reading in the database
    const [result] = await pool.query(
      'UPDATE meter_readings SET ReadingDate = ?, UnitsConsumed = ?, ConnectionID = ? WHERE MeterReadingID = ?',
      [ReadingDate, UnitsConsumed, ConnectionID, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reading not found' });
    }
    // Fetch the updated reading
    const [rows] = await pool.query('SELECT * FROM meter_readings WHERE MeterReadingID = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating reading:', err);
    res.status(500).json({ error: 'Failed to update reading' });
  }
});

// DELETE /api/readings/:id - delete a reading
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [result] = await pool.query('DELETE FROM meter_readings WHERE MeterReadingID = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reading not found' });
    }
    res.json({ message: 'Reading deleted' });
  } catch (err) {
    console.error('Error deleting reading:', err);
    res.status(500).json({ error: 'Failed to delete reading' });
  }
});

module.exports = { router, readings }; 