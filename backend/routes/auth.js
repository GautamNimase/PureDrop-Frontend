const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// User Signup
router.post('/user/signup', async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }
  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE Email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (Name, Email, PasswordHash, Phone, Address) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, phone || '', address || '']
    );
    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// User Login
router.post('/user/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE Email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const user = users[0];
    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user.UserID, role: 'user' }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token, user: { id: user.UserID, name: user.Name, email: user.Email, role: 'user' } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin Signup
router.post('/admin/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }
  try {
    const [existing] = await pool.query('SELECT * FROM admins WHERE Email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO admins (Name, Email, PasswordHash, Phone) VALUES (?, ?, ?, ?)',
      [name, email, hash, phone || '']
    );
    return res.status(201).json({ message: 'Admin registered successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const [admins] = await pool.query('SELECT * FROM admins WHERE Email = ?', [email]);
    if (admins.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const admin = admins[0];
    const match = await bcrypt.compare(password, admin.PasswordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: admin.AdminID, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token, admin: { id: admin.AdminID, name: admin.Name, email: admin.Email, role: 'admin' } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 