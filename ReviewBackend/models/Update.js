const mongoose = require('mongoose');

const UpdateSchema = new mongoose.Schema({
  appName: {
    type: String,
    required: [true, 'Please add an app name']
  },
  featuresAdded: {
    type: String,
    required: [true, 'Please add features']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add end date']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Update', UpdateSchema);