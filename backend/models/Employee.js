const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Role: { type: String, required: true },
  Contact: { type: String },
  Status: { 
    type: String, 
    enum: ['Active', 'Inactive'], 
    default: 'Active' 
  },
  CreatedAt: { type: Date, default: Date.now },
  UpdatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
EmployeeSchema.pre('save', function(next) {
  this.UpdatedAt = new Date();
  next();
});

// Audit logging
EmployeeSchema.post('save', function(doc, next) {
  const AuditLog = require('./AuditLog');
  const log = new AuditLog({
    User: 'admin',
    Action: 'Create Employee',
    Details: `Created EmployeeID ${doc._id}`
  });
  log.save();
  next();
});

module.exports = mongoose.model('Employee', EmployeeSchema); 