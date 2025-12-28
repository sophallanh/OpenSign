const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileKey: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  signers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'signed', 'declined'],
      default: 'pending'
    },
    signedAt: Date,
    signatureData: String
  }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'partially_signed', 'completed', 'declined'],
    default: 'draft'
  },
  loanDetails: {
    amount: Number,
    type: String,
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Document', documentSchema);
