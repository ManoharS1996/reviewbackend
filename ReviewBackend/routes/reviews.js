const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');

router.get('/', protect, async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewedBy: req.user.id })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', [
  protect,
  [
    check('appName', 'Please add an app name').not().isEmpty(),
    check('feedback', 'Please add feedback').not().isEmpty(),
    check('rating', 'Please add a rating between 1 and 5').isInt({ min: 1, max: 5 })
  ]
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  try {
    const review = new Review({
      ...req.body,
      reviewedBy: req.user.id
    });

    const savedReview = await review.save();
    res.status(201).json({
      success: true,
      data: savedReview
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', protect, async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return next(new ErrorResponse('Review not found', 404));
    }

    // Make sure user is review owner
    if (review.reviewedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this review', 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new ErrorResponse('Review not found', 404));
    }

    // Make sure user is review owner
    if (review.reviewedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this review', 401));
    }

    await review.remove();
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;