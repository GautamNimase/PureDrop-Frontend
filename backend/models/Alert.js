const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  Type: { type: String, required: true },
  Message: { type: String, required: true },
  Status: { 
    type: String, 
    enum: ['Active', 'Resolved'], 
    default: 'Active' 
  },
  Severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  Timestamp: { type: Date, default: Date.now },
  CreatedAt: { type: Date, default: Date.now },
  UpdatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
AlertSchema.pre('save', function(next) {
  this.UpdatedAt = new Date();
  next();
});

module.exports = mongoose.model('Alert', AlertSchema); 