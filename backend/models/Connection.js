const mongoose = require('mongoose');

const ConnectionSchema = new mongoose.Schema({
  UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  SourceID: { type: mongoose.Schema.Types.ObjectId, ref: 'WaterSource', required: true },
  MeterNumber: { type: String, required: true, unique: true },
  ConnectionDate: { type: Date, required: true },
  Status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Suspended'], 
    default: 'Active' 
  },
  CreatedAt: { type: Date, default: Date.now },
  UpdatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
ConnectionSchema.pre('save', function(next) {
  this.UpdatedAt = new Date();
  next();
});

// Audit logging
ConnectionSchema.post('save', function(doc, next) {
  const AuditLog = require('./AuditLog');
  const log = new AuditLog({
    User: 'admin',
    Action: 'Create Connection',
    Details: `Created ConnectionID ${doc._id}`
  });
  log.save();
  next();
});

module.exports = mongoose.model('Connection', ConnectionSchema); 