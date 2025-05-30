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
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Update', UpdateSchema);