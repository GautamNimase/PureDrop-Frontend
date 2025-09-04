const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Type: { 
    type: String, 
    enum: ['Service', 'Billing', 'Quality', 'Technical'], 
    required: true 
  },
  Description: { type: String, required: true },
  Status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved', 'Escalated'], 
    default: 'Open' 
  },
  Response: { type: String },
  Date: { type: Date, required: true },
  CreatedAt: { type: Date, default: Date.now },
  UpdatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
ComplaintSchema.pre('save', function(next) {
  this.UpdatedAt = new Date();
  next();
});

// Audit logging
ComplaintSchema.post('save', function(doc, next) {
  const AuditLog = require('./AuditLog');
  const log = new AuditLog({
    User: 'admin',
    Action: 'Create Complaint',
    Details: `Created ComplaintID ${doc._id}`
  });
  log.save();
  next();
});

module.exports = mongoose.model('Complaint', ComplaintSchema); 