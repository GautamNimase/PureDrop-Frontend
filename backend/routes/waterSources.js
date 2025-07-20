const express = require('express');
const router = express.Router();
const { auditLogs, getNextId } = require('./auditLogsStore');
const pool = require('../config/database');

// In-memory water sources data (placeholder)
let sources = [
  { SourceID: 1, Name: 'River A', Type: 'River', Capacity: 10000 },
  { SourceID: 2, Name: 'Lake B', Type: 'Lake', Capacity: 8000 },
  { SourceID: 3, Name: 'Well C', Type: 'Well', Capacity: 2000 },
];
let nextId = 4;

// GET /api/water-sources - fetch all sources
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM water_sources');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching water sources:', err);
    res.status(500).json({ error: 'Failed to fetch water sources' });
  }
});

// POST /api/water-sources - add a new source
router.post('/', async (req, res) => {
  try {
    const { Name, Type, Capacity } = req.body;
    if (!Name || !Type || Capacity === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    // Insert into database
    const [result] = await pool.query(
      'INSERT INTO water_sources (Name, Type, Capacity) VALUES (?, ?, ?)',
      [Name, Type, Capacity]
    );
    // Fetch the inserted source
    const [rows] = await pool.query('SELECT * FROM water_sources WHERE SourceID = ?', [result.insertId]);
    const newSource = rows[0];
    res.status(201).json(newSource);
  } catch (err) {
    console.error('Error adding water source:', err);
    res.status(500).json({ error: 'Failed to add water source' });
  }
});

// PUT /api/water-sources/:id - update a source
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { Name, Type, Capacity } = req.body;
    if (!Name || !Type || Capacity === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    // Update the source in the database
    const [result] = await pool.query(
      'UPDATE water_sources SET Name = ?, Type = ?, Capacity = ? WHERE SourceID = ?',
      [Name, Type, Capacity, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Source not found' });
    }
    // Fetch the updated source
    const [rows] = await pool.query('SELECT * FROM water_sources WHERE SourceID = ?', [id]);
    const updatedSource = rows[0];
    res.json(updatedSource);
  } catch (err) {
    console.error('Error updating water source:', err);
    res.status(500).json({ error: 'Failed to update water source' });
  }
});

// DELETE /api/water-sources/:id - delete a source
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [result] = await pool.query('DELETE FROM water_sources WHERE SourceID = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Source not found' });
    }
    res.json({ message: 'Source deleted' });
  } catch (err) {
    console.error('Error deleting water source:', err);
    res.status(500).json({ error: 'Failed to delete water source' });
  }
});

module.exports = { router, sources }; 