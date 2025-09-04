const express = require('express');
const router = express.Router();

// Example: GET /api/consumption
router.get('/', (req, res) => {
  res.json({ message: 'Consumption route works!' });
});

module.exports = router; 