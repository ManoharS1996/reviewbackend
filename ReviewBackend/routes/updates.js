const express = require('express');
const router = express.Router();
const Update = require('../models/Update');

router.get('/', async (req, res, next) => {
  try {
    const updates = await Update.find().sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: updates.length, data: updates });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const update = new Update(req.body);
    const savedUpdate = await update.save();
    res.status(201).json({ success: true, data: savedUpdate });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const update = await Update.findById(req.params.id);
    if (!update) return next(new Error('Update not found'));

    const fields = ['title', 'description', 'status', 'priority'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    const updatedUpdate = await update.save();
    res.status(200).json({ success: true, data: updatedUpdate });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const update = await Update.findById(req.params.id);
    if (!update) return next(new Error('Update not found'));

    await update.deleteOne(); // ✅ FIXED deprecated .remove()
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
