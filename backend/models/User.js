const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  PasswordHash: { type: String, required: true },
  Phone: { type: String },
  Address: { type: String },
  ConnectionType: {
    type: String,
    enum: ['Residential', 'Commercial', 'Industrial'],
    default: 'Residential'
  },
  Status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
  },
  CreatedAt: { type: Date, default: Date.now },
  UpdatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
UserSchema.pre('save', function(next) {
  this.UpdatedAt = new Date();
  next();
});

// Audit logging post-save
UserSchema.post('save', function(doc, next) {
  const AuditLog = require('./AuditLog');
  const log = new AuditLog({
    User: 'admin',
    Action: 'Create User',
    Details: `Created UserID ${doc._id}`
  });
  log.save();
  next();
});

// Audit logging post-update
UserSchema.post('findOneAndUpdate', function(doc, next) {
  const AuditLog = require('./AuditLog');
  const log = new AuditLog({
    User: 'admin',
    Action: 'Update User',
    Details: `Updated UserID ${doc._id}`
  });
  log.save();
  next();
});

// Audit logging post-delete
UserSchema.post('findOneAndDelete', function(doc, next) {
  const AuditLog = require('./AuditLog');
  const log = new AuditLog({
    User: 'admin',
    Action: 'Delete User',
    Details: `Deleted UserID ${doc._id}`
  });
  log.save();
  next();
});

module.exports = mongoose.model('User', UserSchema); 