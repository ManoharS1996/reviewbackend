const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  appName: {
    type: String,
    required: [true, 'Please add an app name']
  },
  feedback: {
    type: String,
    required: [true, 'Please add feedback']
  },
  recommendations: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  reviewedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Review', ReviewSchema);