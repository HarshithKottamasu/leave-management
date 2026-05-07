const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const leaveBalanceSchema = new mongoose.Schema({
  annual:  { type: Number, default: 21 },
  sick:    { type: Number, default: 10 },
  unpaid:  { type: Number, default: 0 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true, minlength: 6, select: false },
  role:       { type: String, enum: ['employee', 'manager', 'hr_admin'], default: 'employee' },
  department: { type: String, default: 'General' },
  managerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  balance:    { type: leaveBalanceSchema, default: () => ({}) },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);