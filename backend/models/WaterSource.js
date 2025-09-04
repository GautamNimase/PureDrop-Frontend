const mongoose = require('mongoose');

const WaterSourceSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Type: { 
    type: String, 
    enum: ['Reservoir', 'Well', 'River', 'Lake'], 
    required: true 
  },
  Capacity: { type: Number },
  Status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Maintenance'], 
    default: 'Active' 
  },
  CreatedAt: { type: Date, default: Date.now },
  UpdatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
WaterSourceSchema.pre('save', function(next) {
  this.UpdatedAt = new Date();
  next();
});

module.exports = mongoose.model('WaterSource', WaterSourceSchema); 