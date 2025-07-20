const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');
const { sendStatusNotification } = require('../utils/email');
const ErrorResponse = require('../utils/errorResponse');

// GET all schedules
router.get('/', async (req, res, next) => {
  try {
    const schedules = await Schedule.find().sort({ deploymentDate: -1 });
    res.status(200).json({ 
      success: true, 
      count: schedules.length, 
      data: schedules 
    });
  } catch (err) {
    next(err);
  }
});

// POST new schedule
router.post('/', async (req, res, next) => {
  try {
    const schedule = new Schedule(req.body);
    const savedSchedule = await schedule.save();

    // Send notification in background
    try {
      await sendStatusNotification(savedSchedule, 'Scheduled');
      savedSchedule.developersNotified = true;
      savedSchedule.notificationDetails = {
        sentAt: new Date(),
        recipients: savedSchedule.developers,
        status: 'Scheduled'
      };
      await savedSchedule.save();
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    res.status(201).json({ 
      success: true, 
      data: savedSchedule 
    });
  } catch (err) {
    next(err);
  }
});

// PATCH update schedule status
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, failureReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorResponse('Invalid schedule ID', 400));
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return next(new ErrorResponse('Schedule not found', 404));
    }

    const originalStatus = schedule.status;
    schedule.status = status || originalStatus;
    
    if (status === 'Failed') {
      schedule.failureReason = failureReason;
    }

    const updatedSchedule = await schedule.save();

    // Send notification if status changed
    if (status && status !== originalStatus) {
      try {
        await sendStatusNotification(updatedSchedule, status);
        updatedSchedule.developersNotified = true;
        updatedSchedule.notificationDetails = {
          sentAt: new Date(),
          recipients: updatedSchedule.developers,
          status: status
        };
        await updatedSchedule.save();
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    }

    res.status(200).json({ 
      success: true, 
      data: updatedSchedule 
    });
  } catch (err) {
    next(err);
  }
});

// DELETE schedule
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorResponse('Invalid schedule ID', 400));
    }

    const schedule = await Schedule.findByIdAndDelete(id);
    if (!schedule) {
      return next(new ErrorResponse('Schedule not found', 404));
    }

    res.status(200).json({ 
      success: true, 
      message: 'Schedule deleted successfully' 
    });
  } catch (err) {
    next(err);
  }
});

// POST manual notification
router.post('/:id/notify', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorResponse('Invalid schedule ID', 400));
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return next(new ErrorResponse('Schedule not found', 404));
    }

    await sendStatusNotification(schedule, schedule.status);

    schedule.developersNotified = true;
    schedule.notificationDetails = {
      sentAt: new Date(),
      recipients: schedule.developers,
      status: schedule.status
    };
    await schedule.save();

    res.status(200).json({ 
      success: true, 
      message: 'Notification sent', 
      data: schedule 
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;