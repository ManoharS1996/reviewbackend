const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');
const { sendStatusNotification } = require('../utils/email');

// GET all schedules
router.get('/', async (req, res, next) => {
  try {
    const schedules = await Schedule.find().sort({ deploymentDate: -1 });
    res.status(200).json({ success: true, count: schedules.length, data: schedules });
  } catch (err) {
    next(err);
  }
});

// POST new schedule
router.post('/', async (req, res, next) => {
  try {
    const schedule = new Schedule(req.body);
    const savedSchedule = await schedule.save();

    try {
      await sendStatusNotification(savedSchedule, 'Scheduled');
      savedSchedule.developersNotified = true;
      savedSchedule.notificationDetails = {
        sentAt: new Date(),
        recipients: savedSchedule.developers,
      };
      await savedSchedule.save();
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    res.status(201).json({ success: true, data: savedSchedule });
  } catch (err) {
    next(err);
  }
});

// PUT full update schedule by ID
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid schedule ID format' });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const oldStatus = schedule.status;
    const newStatus = req.body.status || oldStatus;

    const updatableFields = ['appName', 'deploymentDate', 'timeSlot', 'status', 'notes', 'developers'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) schedule[field] = req.body[field];
    });

    if (newStatus !== oldStatus) {
      try {
        await sendStatusNotification(schedule, newStatus);
        schedule.developersNotified = true;
        schedule.notificationDetails = {
          sentAt: new Date(),
          recipients: schedule.developers,
        };
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    }

    const updatedSchedule = await schedule.save();
    res.status(200).json({ success: true, data: updatedSchedule });
  } catch (err) {
    next(err);
  }
});

// PATCH partial update schedule by ID
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid schedule ID' });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const originalStatus = schedule.status;
    Object.assign(schedule, req.body);

    if (req.body.status && req.body.status !== originalStatus) {
      try {
        await sendStatusNotification(schedule, req.body.status);
        schedule.developersNotified = true;
        schedule.notificationDetails = {
          sentAt: new Date(),
          recipients: schedule.developers,
        };
      } catch (emailErr) {
        console.error('Notification Error:', emailErr);
      }
    }

    const updated = await schedule.save();
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE schedule by ID
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid schedule ID format' });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    await schedule.deleteOne();
    res.status(200).json({ success: true, message: 'Schedule deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST manual notification trigger
router.post('/:id/notify', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid schedule ID format' });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    await sendStatusNotification(schedule, schedule.status);

    schedule.developersNotified = true;
    schedule.notificationDetails = {
      sentAt: new Date(),
      recipients: schedule.developers,
    };
    await schedule.save();

    res.status(200).json({ success: true, message: 'Notification sent', data: schedule });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
