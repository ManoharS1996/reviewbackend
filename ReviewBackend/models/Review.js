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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', ReviewSchema);