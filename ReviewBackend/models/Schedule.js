const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  appName: {
    type: String,
    required: true
  },
  deploymentDate: {
    type: Date,
    required: true
  },
  timings: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed'],
    default: 'Scheduled'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
