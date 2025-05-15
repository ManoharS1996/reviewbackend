const mongoose = require('mongoose');

const UpdateSchema = new mongoose.Schema({
  appName: {
    type: String,
    required: true
  },
  featuresAdded: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Update', UpdateSchema);
