const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  appName: {
    type: String,
    required: true
  },
  feedback: {
    type: String,
    required: true
  },
  recommendations: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', ReviewSchema);
