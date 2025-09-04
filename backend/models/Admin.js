const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  PasswordHash: { type: String, required: true },
  Phone: { type: String },
  Status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Suspended'], 
    default: 'Active' 
  },
  CreatedAt: { type: Date, default: Date.now },
  UpdatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
AdminSchema.pre('save', function(next) {
  this.UpdatedAt = new Date();
  next();
});

module.exports = mongoose.model('Admin', AdminSchema); 