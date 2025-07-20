const express = require('express');
const router = express.Router();
const { auditLogs, getNextId } = require('./auditLogsStore');
const { triggerAfterComplaintInsert, triggerAfterComplaintUpdate, triggerAfterComplaintDelete, triggerEscalateOldComplaints } = require('../utils/triggerFunctions');
const pool = require('../config/database');

// In-memory complaints data
let complaints = [
  {
    ComplaintID: 1,
    UserID: 1,
    Date: '2023-06-01',
    Type: 'Service',
    Description: 'No water supply for 2 days',
    Status: 'Open',
    Response: ''
  },
  {
    ComplaintID: 2,
    UserID: 2,
    Date: '2023-06-02',
    Type: 'Billing',
    Description: 'Incorrect bill amount for last month',
    Status: 'Closed',
    Response: 'Bill corrected and updated.'
  },
  {
    ComplaintID: 3,
    UserID: 3,
    Date: '2023-06-03',
    Type: 'Quality',
    Description: 'Water is muddy and smells bad',
    Status: 'In Progress',
    Response: 'Inspection scheduled.'
  }
];
let nextId = 4;

// GET /api/complaints - fetch all complaints
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM complaints');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// POST /api/complaints - add a new complaint
router.post('/', async (req, res) => {
  try {
    const { UserID, Date: ComplaintDate, Type, Description, Status, Response } = req.body;
    if (!UserID || !ComplaintDate || !Type || !Description || !Status) {
      return res.status(400).json({ error: 'All fields except Response are required' });
    }
    // Insert into database
    const [result] = await pool.query(
      'INSERT INTO complaints (UserID, Date, Type, Description, Status, Response) VALUES (?, ?, ?, ?, ?, ?)',
      [UserID, ComplaintDate, Type, Description, Status, Response || '']
    );
    // Fetch the inserted complaint
    const [rows] = await pool.query('SELECT * FROM complaints WHERE ComplaintID = ?', [result.insertId]);
    const newComplaint = rows[0];
    res.status(201).json(newComplaint);
  } catch (err) {
    console.error('Error adding complaint:', err);
    res.status(500).json({ error: 'Failed to add complaint' });
  }
});

// PUT /api/complaints/:id - update a complaint
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { UserID, Date: ComplaintDate, Type, Description, Status, Response } = req.body;
    if (!UserID || !ComplaintDate || !Type || !Description || !Status) {
      return res.status(400).json({ error: 'All fields except Response are required' });
    }
    // Update the complaint in the database
    const [result] = await pool.query(
      'UPDATE complaints SET UserID = ?, Date = ?, Type = ?, Description = ?, Status = ?, Response = ? WHERE ComplaintID = ?',
      [UserID, ComplaintDate, Type, Description, Status, Response || '', id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    // Fetch the updated complaint
    const [rows] = await pool.query('SELECT * FROM complaints WHERE ComplaintID = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating complaint:', err);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

// DELETE /api/complaints/:id - delete a complaint
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [result] = await pool.query('DELETE FROM complaints WHERE ComplaintID = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    console.error('Error deleting complaint:', err);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

module.exports = { router, complaints }; 