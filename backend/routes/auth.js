const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Registration
router.post('/user/signup', async (req, res) => {
  try {
    const { name, email, password, phone, address, connectionType } = req.body;
    const existingUser = await User.findOne({ Email: email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      Name: name,
      Email: email,
      PasswordHash: passwordHash,
      Phone: phone,
      Address: address,
      ConnectionType: connectionType || 'Residential'
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, email: user.Email, name: user.Name, role: 'user' } });
  } catch (err) {
    console.error('User registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ Email: email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', user: { id: user._id, email: user.Email, name: user.Name, role: 'user' }, token });
  } catch (err) {
    console.error('User login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin Registration
router.post('/admin/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingAdmin = await Admin.findOne({ Email: email });
    if (existingAdmin) {
      return res.status(409).json({ error: 'Admin already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = new Admin({
      Name: name,
      Email: email,
      Phone: phone,
      PasswordHash: passwordHash
    });
    await admin.save();
    res.status(201).json({ message: 'Admin registered successfully', admin: { id: admin._id, email: admin.Email, name: admin.Name, role: 'admin' } });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ Email: email });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, admin.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', admin: { id: admin._id, email: admin.Email, name: admin.Name, role: 'admin' }, token });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router; 