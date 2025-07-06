const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const { sendDeploymentNotification } = require('../utils/email');

router.get('/', async (req, res, next) => {
  try {
    const schedules = await Schedule.find().sort({ deploymentDate: -1 });
    res.status(200).json({ success: true, count: schedules.length, data: schedules });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const schedule = new Schedule(req.body);
    const savedSchedule = await schedule.save();

    try {
      const sentTo = await sendDeploymentNotification(savedSchedule, req.body.developers);
      savedSchedule.developersNotified = true;
      savedSchedule.notificationDetails = {
        sentAt: new Date(),
        recipients: sentTo
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

router.put('/:id', async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return next(new Error('Schedule not found'));

    const fields = ['appName', 'deploymentDate', 'timings', 'status', 'notes', 'developers'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) schedule[field] = req.body[field];
    });

    const updatedSchedule = await schedule.save();
    res.status(200).json({ success: true, data: updatedSchedule });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return next(new Error('Schedule not found'));

    await schedule.deleteOne(); // ✅ Fixed: Replaced deprecated .remove() with .deleteOne()
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
