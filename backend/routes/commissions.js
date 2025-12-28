const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Commission = require('../models/Commission');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendCommissionNotification } = require('../utils/email');

// @route   POST /api/commissions
// @desc    Create a new commission
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), [
  body('referrer').notEmpty().withMessage('Referrer is required'),
  body('lead').notEmpty().withMessage('Lead is required'),
  body('loanAmount').isNumeric().withMessage('Valid loan amount is required'),
  body('rate').isNumeric().withMessage('Valid commission rate is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const commission = await Commission.create(req.body);

    await commission.populate('referrer', 'name email');
    await commission.populate('lead', 'name email company');

    // Update referrer's total commission earned
    if (commission.status === 'paid') {
      await User.findByIdAndUpdate(commission.referrer._id, {
        $inc: { totalCommissionEarned: commission.amount }
      });
    }

    res.status(201).json({
      success: true,
      commission
    });
  } catch (error) {
    console.error('Create commission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/commissions
// @desc    Get all commissions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    // Filter by user role
    if (req.user.role === 'referrer' || req.user.role === 'user') {
      query.referrer = req.user._id;
    }

    // Apply status filter
    if (status) query.status = status;

    const commissions = await Commission.find(query)
      .populate('referrer', 'name email')
      .populate('lead', 'name email company loanAmount')
      .sort({ createdAt: -1 });

    // Calculate totals
    const totals = {
      total: 0,
      pending: 0,
      approved: 0,
      paid: 0
    };

    commissions.forEach(commission => {
      totals.total += commission.amount;
      if (commission.status === 'pending') totals.pending += commission.amount;
      if (commission.status === 'approved') totals.approved += commission.amount;
      if (commission.status === 'paid') totals.paid += commission.amount;
    });

    res.json({
      success: true,
      count: commissions.length,
      totals,
      commissions
    });
  } catch (error) {
    console.error('Get commissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/commissions/:id
// @desc    Get single commission
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const commission = await Commission.findById(req.params.id)
      .populate('referrer', 'name email')
      .populate('lead', 'name email company loanAmount')
      .populate('document', 'title status');

    if (!commission) {
      return res.status(404).json({ message: 'Commission not found' });
    }

    // Check access permissions
    const hasAccess = req.user.role === 'admin' ||
                      commission.referrer._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to access this commission' });
    }

    res.json({
      success: true,
      commission
    });
  } catch (error) {
    console.error('Get commission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/commissions/:id
// @desc    Update commission status
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    let commission = await Commission.findById(req.params.id)
      .populate('referrer', 'name email')
      .populate('lead', 'name email');

    if (!commission) {
      return res.status(404).json({ message: 'Commission not found' });
    }

    const oldStatus = commission.status;
    const newStatus = req.body.status;

    // Update commission fields
    if (req.body.status) commission.status = req.body.status;
    if (req.body.notes) commission.notes = req.body.notes;

    // Set paidAt if status changes to paid
    if (newStatus === 'paid' && oldStatus !== 'paid') {
      commission.paidAt = Date.now();

      // Update referrer's total commission earned
      await User.findByIdAndUpdate(commission.referrer._id, {
        $inc: { totalCommissionEarned: commission.amount }
      });

      // Send notification email
      try {
        await sendCommissionNotification(
          commission.referrer.email,
          commission.amount,
          commission.lead.name
        );
      } catch (emailError) {
        console.error('Failed to send commission notification:', emailError);
      }
    }

    await commission.save();

    res.json({
      success: true,
      commission
    });
  } catch (error) {
    console.error('Update commission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/commissions/:id
// @desc    Delete a commission
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const commission = await Commission.findById(req.params.id);

    if (!commission) {
      return res.status(404).json({ message: 'Commission not found' });
    }

    // If commission was paid, deduct from user's total
    if (commission.status === 'paid') {
      await User.findByIdAndUpdate(commission.referrer, {
        $inc: { totalCommissionEarned: -commission.amount }
      });
    }

    await commission.deleteOne();

    res.json({
      success: true,
      message: 'Commission deleted successfully'
    });
  } catch (error) {
    console.error('Delete commission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
