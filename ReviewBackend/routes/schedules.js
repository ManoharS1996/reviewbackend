const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');

// GET all schedules
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ deploymentDate: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a schedule
router.post('/', async (req, res) => {
  const { appName, deploymentDate, timings, status, notes } = req.body;

  const schedule = new Schedule({
    appName,
    deploymentDate,
    timings,
    status,
    notes
  });

  try {
    const newSchedule = await schedule.save();
    res.status(201).json(newSchedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update a schedule
router.patch('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    if (req.body.appName !== undefined) schedule.appName = req.body.appName;
    if (req.body.deploymentDate !== undefined) schedule.deploymentDate = req.body.deploymentDate;
    if (req.body.timings !== undefined) schedule.timings = req.body.timings;
    if (req.body.status !== undefined) schedule.status = req.body.status;
    if (req.body.notes !== undefined) schedule.notes = req.body.notes;

    const updatedSchedule = await schedule.save();
    res.json(updatedSchedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a schedule
router.delete('/:id', async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
