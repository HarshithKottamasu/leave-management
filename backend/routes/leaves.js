const express = require('express');
const Leave = require('../models/Leave');
const User  = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendLeaveStatusEmail, sendManagerNotificationEmail } = require('../middleware/emailService');

const router = express.Router();

// GET /api/leaves — employee sees own; manager sees team; hr_admin sees all
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (req.user.role === 'manager') {
      // Find employees under this manager
      const team = await User.find({ managerId: req.user._id }).select('_id');
      query.employee = { $in: team.map((u) => u._id) };
    }
    // hr_admin: no filter — sees all

    const leaves = await Leave.find(query)
      .populate('employee', 'name email department')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/leaves — submit new leave request
router.post('/', protect, async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;

    // Check balance (not for unpaid)
    if (leaveType !== 'unpaid') {
      const balance = req.user.balance[leaveType];
      const days    = Math.round((new Date(toDate) - new Date(fromDate)) / 86400000) + 1;
      if (balance < days)
        return res.status(400).json({ success: false, message: `Insufficient ${leaveType} leave balance` });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      fromDate,
      toDate,
      reason,
    });

    // Notify manager via email
    if (req.user.managerId) {
      const manager = await User.findById(req.user.managerId);
      if (manager) {
        sendManagerNotificationEmail({
          to: manager.email,
          managerName: manager.name,
          employee: req.user,
          leave,
        }).catch(console.error);
      }
    }

    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/leaves/:id/status — approve or reject (manager / hr_admin)
router.patch(
  '/:id/status',
  protect,
  authorize('manager', 'hr_admin'),
  async (req, res) => {
    try {
      const { status, reviewNote } = req.body;
      if (!['approved', 'rejected'].includes(status))
        return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });

      const leave = await Leave.findById(req.params.id).populate('employee');
      if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
      if (leave.status !== 'pending')
        return res.status(400).json({ success: false, message: 'Leave already reviewed' });

      leave.status     = status;
      leave.reviewedBy = req.user._id;
      leave.reviewedAt = new Date();
      leave.reviewNote = reviewNote || '';
      await leave.save();

      // Deduct balance if approved
      if (status === 'approved' && leave.leaveType !== 'unpaid') {
        await User.findByIdAndUpdate(leave.employee._id, {
          $inc: { [`balance.${leave.leaveType}`]: -leave.totalDays },
        });
      }

      // Send email to employee
      sendLeaveStatusEmail({
        to:           leave.employee.email,
        employeeName: leave.employee.name,
        status,
        leave,
        reviewNote,
      }).catch(console.error);

      leave.emailSent = true;
      await leave.save();

      res.json({ success: true, data: leave });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/leaves/:id — employee cancels own pending leave
router.delete('/:id', protect, async (req, res) => {
  try {
    const leave = await Leave.findOne({ _id: req.params.id, employee: req.user._id });
    if (!leave) return res.status(404).json({ success: false, message: 'Not found' });
    if (leave.status !== 'pending')
      return res.status(400).json({ success: false, message: 'Cannot cancel a reviewed request' });
    await leave.deleteOne();
    res.json({ success: true, message: 'Leave request cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;