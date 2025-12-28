const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  amount: {
    type: Number,
    required: [true, 'Commission amount is required'],
    min: 0
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  loanAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'cancelled'],
    default: 'pending'
  },
  paidAt: Date,
  notes: String,
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
commissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate commission amount before saving
commissionSchema.pre('save', function(next) {
  if (this.isModified('loanAmount') || this.isModified('rate')) {
    this.amount = (this.loanAmount * this.rate) / 100;
  }
  next();
});

module.exports = mongoose.model('Commission', commissionSchema);
