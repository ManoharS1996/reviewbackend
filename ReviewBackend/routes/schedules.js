const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Schedule = require('../models/Schedule');
const { protect, authorize } = require('../middleware/auth');
const { sendDeploymentNotification } = require('../utils/email');
const ErrorResponse = require('../utils/errorResponse');

router.post('/', [
  protect,
  authorize('admin'),
  [
    check('appName', 'Please add an app name').not().isEmpty(),
    check('deploymentDate', 'Please add a valid deployment date').isISO8601(),
    check('timings', 'Please add deployment timings').not().isEmpty(),
    check('developers', 'Please select at least one developer').isArray({ min: 1 })
  ]
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  try {
    const schedule = new Schedule({
      ...req.body,
      scheduledBy: req.user.id
    });

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

router.get('/', protect, async (req, res, next) => {
  try {
    const schedules = await Schedule.find().sort({ deploymentDate: -1 });
    res.status(200).json({ success: true, count: schedules.length, data: schedules });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', [protect, authorize('admin')], async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return next(new ErrorResponse('Schedule not found', 404));

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

router.delete('/:id', [protect, authorize('admin')], async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return next(new ErrorResponse('Schedule not found', 404));

    await schedule.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
