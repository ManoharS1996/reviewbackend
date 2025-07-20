const express = require('express');
const router = express.Router();
const Update = require('../models/Update');
const ErrorResponse = require('../utils/errorResponse');

// GET all updates
router.get('/', async (req, res, next) => {
  try {
    const updates = await Update.find().sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      count: updates.length, 
      data: updates 
    });
  } catch (err) {
    next(err);
  }
});

// POST new update
router.post('/', async (req, res, next) => {
  try {
    const update = new Update(req.body);
    const savedUpdate = await update.save();
    res.status(201).json({ 
      success: true, 
      data: savedUpdate 
    });
  } catch (err) {
    next(err);
  }
});

// PUT update update
router.put('/:id', async (req, res, next) => {
  try {
    const update = await Update.findById(req.params.id);
    if (!update) {
      return next(new ErrorResponse('Update not found', 404));
    }

    const fields = ['appName', 'featuresAdded', 'startDate', 'endDate'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    const updatedUpdate = await update.save();
    res.status(200).json({ 
      success: true, 
      data: updatedUpdate 
    });
  } catch (err) {
    next(err);
  }
});

// DELETE update
router.delete('/:id', async (req, res, next) => {
  try {
    const update = await Update.findById(req.params.id);
    if (!update) {
      return next(new ErrorResponse('Update not found', 404));
    }

    await update.deleteOne();
    res.status(200).json({ 
      success: true, 
      data: {} 
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;