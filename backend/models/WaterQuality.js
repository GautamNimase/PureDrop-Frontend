const mongoose = require('mongoose');

const WaterQualitySchema = new mongoose.Schema({
  source: { type: mongoose.Schema.Types.ObjectId, ref: 'WaterSource', required: true },
  date: { type: Date, required: true },
  ph: { type: Number, required: true },
  contaminants: { type: String, default: 'None' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WaterQuality', WaterQualitySchema); 