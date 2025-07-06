const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

router.get('/', async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const review = new Review(req.body);
    const savedReview = await review.save();
    res.status(201).json({ success: true, data: savedReview });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new Error('Review not found'));

    const fields = ['author', 'comment', 'rating', 'appName'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) review[field] = req.body[field];
    });

    const updatedReview = await review.save();
    res.status(200).json({ success: true, data: updatedReview });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new Error('Review not found'));

    await review.deleteOne(); // ✅ Fixed deprecated .remove()
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
