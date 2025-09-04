const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  User: { type: String, required: true },
  Action: { type: String, required: true },
  Details: { type: String },
  Timestamp: { type: Date, default: Date.now },
  CreatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema); 