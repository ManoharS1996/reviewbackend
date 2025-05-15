require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connected successfully');
}).on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});

// Routes
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/updates', require('./routes/updates'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
