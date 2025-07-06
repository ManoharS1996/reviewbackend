const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  appName: {
    type: String,
    required: [true, 'Please add an app name']
  },
  deploymentDate: {
    type: Date,
    required: [true, 'Please add a deployment date']
  },
  timeSlot: {
    type: String,
    required: [true, 'Please add a time slot']
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Failed'],
    default: 'Scheduled'
  },
  developers: {
    type: [String],
    required: [true, 'Please add at least one developer']
  },
  notes: {
    type: String
  },
  developersNotified: {
    type: Boolean,
    default: false
  },
  notificationDetails: {
    sentAt: Date,
    recipients: [String]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', ScheduleSchema);