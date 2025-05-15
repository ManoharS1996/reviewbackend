const express = require('express');
const router = express.Router();
const Update = require('../models/Update');

// GET all updates
router.get('/', async (req, res) => {
  try {
    const updates = await Update.find().sort({ startDate: -1 });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create an update
router.post('/', async (req, res) => {
  const { appName, featuresAdded, startDate, endDate } = req.body;

  const update = new Update({
    appName,
    featuresAdded,
    startDate,
    endDate
  });

  try {
    const newUpdate = await update.save();
    res.status(201).json(newUpdate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update an update
router.patch('/:id', async (req, res) => {
  try {
    const update = await Update.findById(req.params.id);
    if (!update) return res.status(404).json({ message: 'Update not found' });

    if (req.body.appName !== undefined) update.appName = req.body.appName;
    if (req.body.featuresAdded !== undefined) update.featuresAdded = req.body.featuresAdded;
    if (req.body.startDate !== undefined) update.startDate = req.body.startDate;
    if (req.body.endDate !== undefined) update.endDate = req.body.endDate;

    const updatedUpdate = await update.save();
    res.json(updatedUpdate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an update
router.delete('/:id', async (req, res) => {
  try {
    await Update.findByIdAndDelete(req.params.id);
    res.json({ message: 'Update deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
