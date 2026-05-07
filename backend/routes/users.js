const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/users — HR admin gets all; manager gets their team
router.get('/', protect, authorize('manager', 'hr_admin'), async (req, res) => {
  try {
    let query = req.user.role === 'manager' ? { managerId: req.user._id } : {};
    const users = await User.find(query).select('-password').sort({ name: 1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/calendar — who's on leave (company-wide calendar)
router.get('/calendar', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const Leave = require('../models/Leave');
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0);
    const leaves = await Leave.find({
      status: 'approved',
      fromDate: { $lte: end },
      toDate:   { $gte: start },
    }).populate('employee', 'name department');
    res.json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/users/:id/balance — HR admin adjusts balance
router.patch('/:id/balance', protect, authorize('hr_admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { balance: req.body.balance },
      { new: true }
    );
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;