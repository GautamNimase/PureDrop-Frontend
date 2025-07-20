const express = require('express');
const router = express.Router();

// In-memory water quality data (placeholder)
let quality = [
  { QualityID: 1, SourceID: 1, Date: '2023-06-01', pH: 7.2, Contaminants: 'None' },
  { QualityID: 2, SourceID: 2, Date: '2023-06-02', pH: 6.8, Contaminants: 'Lead' },
  { QualityID: 3, SourceID: 3, Date: '2023-06-03', pH: 7.0, Contaminants: 'None' },
];
let nextId = 4;

// GET /api/quality - fetch all quality records
router.get('/', (req, res) => {
  res.json(quality);
});

// POST /api/quality - add a new quality record
router.post('/', (req, res) => {
  const { SourceID, Date, pH, Contaminants } = req.body;
  if (!SourceID || !Date || pH === undefined || !Contaminants) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const newQuality = {
    QualityID: nextId++,
    SourceID: Number(SourceID),
    Date,
    pH: Number(pH),
    Contaminants,
  };
  quality.push(newQuality);
  res.status(201).json(newQuality);
});

// PUT /api/quality/:id - update a quality record
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = quality.findIndex(q => q.QualityID === id);
  if (idx === -1) return res.status(404).json({ error: 'Quality record not found' });
  const { SourceID, Date, pH, Contaminants } = req.body;
  quality[idx] = { QualityID: id, SourceID: Number(SourceID), Date, pH: Number(pH), Contaminants };
  res.json(quality[idx]);
});

// DELETE /api/quality/:id - delete a quality record
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = quality.findIndex(q => q.QualityID === id);
  if (idx === -1) return res.status(404).json({ error: 'Quality record not found' });
  quality.splice(idx, 1);
  res.json({ message: 'Quality record deleted' });
});

module.exports = router; 