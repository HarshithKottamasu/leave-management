const express = require('express');
const Leave = require('../models/Leave');
const User  = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/reports/monthly?month=5&year=2026
// Returns per-employee utilisation consumed by month (HR admin only)
router.get('/monthly', protect, authorize('hr_admin', 'manager'), async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0);

    // Aggregate leave days per employee per type
    const pipeline = [
      {
        $match: {
          status: 'approved',
          fromDate: { $lte: end },
          toDate:   { $gte: start },
        },
      },
      {
        $group: {
          _id: { employee: '$employee', leaveType: '$leaveType' },
          totalDays: { $sum: '$totalDays' },
        },
      },
    ];

    const raw = await Leave.aggregate(pipeline);

    // Map into employee-keyed object
    const dataMap = {};
    raw.forEach(({ _id, totalDays }) => {
      const eid = _id.employee.toString();
      if (!dataMap[eid]) dataMap[eid] = { annual: 0, sick: 0, unpaid: 0 };
      dataMap[eid][_id.leaveType] = totalDays;
    });

    const users = await User.find({}).select('name email department balance');
    const report = users.map((u) => {
      const used = dataMap[u._id.toString()] || { annual: 0, sick: 0, unpaid: 0 };
      return {
        id:         u._id,
        name:       u.name,
        email:      u.email,
        department: u.department,
        balance:    u.balance,
        used,
        utilisation: Math.round(
          ((used.annual + used.sick + used.unpaid) / (u.balance.annual + u.balance.sick + 1)) * 100
        ),
      };
    });

    res.json({
      success: true,
      month,
      year,
      data: report,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reports/summary — quick totals for dashboard widgets
router.get('/summary', protect, authorize('hr_admin'), async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [pending, approvedMonth, rejectedMonth, onLeaveToday] = await Promise.all([
      Leave.countDocuments({ status: 'pending' }),
      Leave.countDocuments({ status: 'approved', createdAt: { $gte: startOfMonth } }),
      Leave.countDocuments({ status: 'rejected', createdAt: { $gte: startOfMonth } }),
      Leave.countDocuments({ status: 'approved', fromDate: { $lte: now }, toDate: { $gte: now } }),
    ]);

    res.json({ success: true, data: { pending, approvedMonth, rejectedMonth, onLeaveToday } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;