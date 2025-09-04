const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  MeterReadingID: { type: mongoose.Schema.Types.ObjectId, ref: 'MeterReading', required: true },
  BillDate: { type: Date, required: true },
  Amount: { type: Number, required: true },
  PaymentStatus: { 
    type: String, 
    enum: ['Paid', 'Unpaid', 'Overdue'], 
    default: 'Unpaid' 
  },
  PaymentDate: { type: Date },
  PaymentMethod: { type: String },
  CreatedAt: { type: Date, default: Date.now },
  UpdatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
BillSchema.pre('save', function(next) {
  this.UpdatedAt = new Date();
  next();
});

// Audit logging and overdue alerts
BillSchema.post('save', async function(doc, next) {
  const AuditLog = require('./AuditLog');
  const Alert = require('./Alert');
  
  // Create audit log
  const log = new AuditLog({
    User: 'admin',
    Action: 'Create Bill',
    Details: `Created BillID ${doc._id}`
  });
  await log.save();
  
  // Create overdue alert if bill is overdue
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  if (doc.BillDate < thirtyDaysAgo && doc.PaymentStatus === 'Unpaid') {
    const alert = new Alert({
      Type: 'Payment Overdue',
      Message: `Bill ${doc._id} is overdue by ${Math.floor((new Date() - doc.BillDate) / (1000 * 60 * 60 * 24))} days`,
      Status: 'Active',
      Severity: 'High'
    });
    await alert.save();
  }
  
  next();
});

module.exports = mongoose.model('Bill', BillSchema); 