const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  leaveType: {
    type: String,
    enum: ['annual', 'sick', 'unpaid'],
    required: true,
  },
  fromDate:  { type: Date, required: true },
  toDate:    { type: Date, required: true },
  totalDays: { type: Number, required: true },
  reason:    { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt:  { type: Date, default: null },
  reviewNote:  { type: String, default: '' },
  emailSent:   { type: Boolean, default: false },
}, { timestamps: true });

// Auto-calculate totalDays before save
leaveSchema.pre('save', function (next) {
  if (this.isModified('fromDate') || this.isModified('toDate')) {
    const diff = (this.toDate - this.fromDate) / (1000 * 60 * 60 * 24);
    this.totalDays = Math.max(1, Math.round(diff) + 1);
  }
  next();
});

module.exports = mongoose.model('Leave', leaveSchema);