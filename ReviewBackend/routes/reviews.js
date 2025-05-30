const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');

// @route    GET /api/reviews
// @desc     Get all reviews
// @access   Private
router.get('/', protect, async (req, res, next) => {
  try {
    const reviews = await Review.find().populate('reviewedBy', 'email').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
});

// @route    POST /api/reviews
// @desc     Create a review
// @access   Private
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

// Other routes (PATCH, DELETE) similarly updated with auth

module.exports = router;