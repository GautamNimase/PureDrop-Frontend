const express = require('express');
const router = express.Router();
const { auditLogs, getNextId } = require('./auditLogsStore');
const { triggerAfterEmployeeInsert, triggerAfterEmployeeUpdate, triggerAfterEmployeeDelete } = require('../utils/triggerFunctions');
const pool = require('../config/database');

// In-memory employees data (placeholder)
let employees = [
  { EmployeeID: 1, Name: 'Alice Johnson', Role: 'Manager', Contact: 'alice@example.com' },
  { EmployeeID: 2, Name: 'Bob Smith', Role: 'Technician', Contact: 'bob@example.com' },
  { EmployeeID: 3, Name: 'Carol Lee', Role: 'Clerk', Contact: 'carol@example.com' },
];
let nextId = 4;

// GET /api/employees - fetch all employees
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// POST /api/employees - add a new employee
router.post('/', async (req, res) => {
  try {
    const { Name, Role, Contact } = req.body;
    if (!Name || !Role || !Contact) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    // Insert into database
    const [result] = await pool.query(
      'INSERT INTO employees (Name, Role, Contact) VALUES (?, ?, ?)',
      [Name, Role, Contact]
    );
    // Fetch the inserted employee
    const [rows] = await pool.query('SELECT * FROM employees WHERE EmployeeID = ?', [result.insertId]);
    const newEmployee = rows[0];
    res.status(201).json(newEmployee);
  } catch (err) {
    console.error('Error adding employee:', err);
    res.status(500).json({ error: 'Failed to add employee' });
  }
});

// PUT /api/employees/:id - update an employee
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { Name, Role, Contact } = req.body;
    if (!Name || !Role || !Contact) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    // Update the employee in the database
    const [result] = await pool.query(
      'UPDATE employees SET Name = ?, Role = ?, Contact = ? WHERE EmployeeID = ?',
      [Name, Role, Contact, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    // Fetch the updated employee
    const [rows] = await pool.query('SELECT * FROM employees WHERE EmployeeID = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// DELETE /api/employees/:id - delete an employee
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [result] = await pool.query('DELETE FROM employees WHERE EmployeeID = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

module.exports = { router, employees }; 