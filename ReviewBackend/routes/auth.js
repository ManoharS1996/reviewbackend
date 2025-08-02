const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

// @desc    Register new user
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { fullName, username, password } = req.body;

  try {
    if (!fullName || !username || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      username,
      password: hashedPassword
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      .status(201)
      .json({
        success: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username
        },
        token
      });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({
        success: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username
        },
        token
      });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    console.error('GetMe Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Logout user
// @route   GET /api/auth/logout
router.get('/logout', (req, res) => {
  res
    .clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    })
    .status(200)
    .json({ success: true, message: 'Logged out successfully' });
});

// @desc    Send verification code
// @route   POST /api/auth/send-verification-code
router.post('/send-verification-code', async (req, res) => {
  const { emails } = req.body;

  try {
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ success: false, message: 'Invalid email list' });
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // Send email with verification code
      await transporter.sendMail({
        from: `Deployment System <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
        to: emails.join(','),
        subject: 'Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1976d2; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Verification Code</h1>
            </div>
            <div style="padding: 20px;">
              <p>Your verification code for the deployment system is:</p>
              <div style="text-align: center; margin: 20px 0;">
                <span style="
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #f5f5f5;
                  border-radius: 4px;
                  font-size: 24px;
                  font-weight: bold;
                  letter-spacing: 2px;
                ">${verificationCode}</span>
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
            <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 0.8em; color: #666;">
              Deployment Management System - ${new Date().getFullYear()}
            </div>
          </div>
        `
      });

      res.status(200).json({
        success: true,
        message: 'Verification code sent',
        code: verificationCode
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification code'
      });
    }
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
