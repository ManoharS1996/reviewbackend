const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @route   POST /api/auth/register
// @desc    Register user
router.post('/register', async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return next(new ErrorResponse('User already exists', 400));
    }

    user = new User({ name, email, password });
    await user.save();

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const payload = {
    id: user._id
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });

  res.status(statusCode).json({
    success: true,
    token
  });
};

module.exports = router;
