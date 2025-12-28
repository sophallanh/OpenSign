const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/leads
// @desc    Create a new lead
// @access  Private
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Lead name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('loanAmount').isNumeric().withMessage('Valid loan amount is required'),
  body('loanType').isIn(['business', 'equipment', 'real_estate', 'working_capital', 'other'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const lead = await Lead.create({
      ...req.body,
      referrer: req.body.referrer || req.user._id,
      assignedTo: req.body.assignedTo
    });

    await lead.populate('referrer', 'name email');
    await lead.populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leads
// @desc    Get all leads
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, loanType, source } = req.query;
    const query = {};

    // Filter by user role
    if (req.user.role === 'referrer') {
      query.referrer = req.user._id;
    } else if (req.user.role === 'user') {
      query.$or = [
        { referrer: req.user._id },
        { assignedTo: req.user._id }
      ];
    }

    // Apply filters
    if (status) query.status = status;
    if (loanType) query.loanType = loanType;
    if (source) query.source = source;

    const leads = await Lead.find(query)
      .populate('referrer', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leads/:id
// @desc    Get single lead
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('referrer', 'name email')
      .populate('assignedTo', 'name email')
      .populate('documents')
      .populate('notes.createdBy', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check access permissions
    const hasAccess = req.user.role === 'admin' ||
                      lead.referrer?._id.toString() === req.user._id.toString() ||
                      lead.assignedTo?._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to access this lead' });
    }

    res.json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leads/:id
// @desc    Update a lead
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check permissions
    const canUpdate = req.user.role === 'admin' ||
                      lead.referrer?.toString() === req.user._id.toString() ||
                      lead.assignedTo?.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }

    // Update lead
    const allowedUpdates = ['name', 'email', 'phone', 'company', 'loanAmount', 'loanType', 
                           'status', 'assignedTo', 'expectedCloseDate', 'source'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        lead[field] = req.body[field];
      }
    });

    await lead.save();
    await lead.populate('referrer', 'name email');
    await lead.populate('assignedTo', 'name email');

    res.json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leads/:id/notes
// @desc    Add a note to a lead
// @access  Private
router.post('/:id/notes', protect, [
  body('content').trim().notEmpty().withMessage('Note content is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check permissions
    const canAddNote = req.user.role === 'admin' ||
                       lead.referrer?.toString() === req.user._id.toString() ||
                       lead.assignedTo?.toString() === req.user._id.toString();

    if (!canAddNote) {
      return res.status(403).json({ message: 'Not authorized to add notes to this lead' });
    }

    lead.notes.push({
      content: req.body.content,
      createdBy: req.user._id
    });

    await lead.save();
    await lead.populate('notes.createdBy', 'name email');

    res.json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/leads/:id
// @desc    Delete a lead
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    await lead.deleteOne();

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
