const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Example protected POST route
router.post('/', protect, (req, res) => {
  res.json({ success: true, data: `Schedule saved for user ${req.user.email}` });
});

module.exports = router;
