const mongoose = require('mongoose');

const MeterReadingSchema = new mongoose.Schema({
  ConnectionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Connection', required: true },
  ReadingDate: { type: Date, required: true },
  UnitsConsumed: { type: Number, required: true },
  CreatedAt: { type: Date, default: Date.now },
  UpdatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
MeterReadingSchema.pre('save', function(next) {
  this.UpdatedAt = new Date();
  next();
});

// Audit logging and automatic bill generation
MeterReadingSchema.post('save', async function(doc, next) {
  const AuditLog = require('./AuditLog');
  const Bill = require('./Bill');
  const Alert = require('./Alert');
  
  // Create audit log
  const log = new AuditLog({
    User: 'admin',
    Action: 'Create Meter Reading',
    Details: `Created MeterReadingID ${doc._id}`
  });
  await log.save();
  
  // Generate automatic bill
  const billAmount = doc.UnitsConsumed * 15.50; // Rate per unit
  const bill = new Bill({
    MeterReadingID: doc._id,
    BillDate: new Date(),
    Amount: billAmount,
    PaymentStatus: 'Unpaid'
  });
  await bill.save();
  
  // Create high consumption alert if >100 units
  if (doc.UnitsConsumed > 100) {
    const alert = new Alert({
      Type: 'High Consumption',
      Message: `Customer exceeded monthly limit with ${doc.UnitsConsumed} units`,
      Status: 'Active',
      Severity: 'Medium'
    });
    await alert.save();
  }
  
  next();
});

module.exports = mongoose.model('MeterReading', MeterReadingSchema); 