require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection with enhanced logging
const connectDB = async () => {
  try {
    console.log('⌛ Attempting to connect to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database name: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    mongoose.connection.on('connected', () => {
      console.log('📌 Mongoose default connection open');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ Mongoose default connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose default connection disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 Mongoose default connection disconnected through app termination');
      process.exit(0);
    });

  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('🔌 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Initialize DB connection
connectDB();

// Routes
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/updates', require('./routes/updates'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const status = dbStatus === 1 ? 'healthy' : 'unhealthy';
  
  res.json({
    status,
    database: dbStatus === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Access the server at http://localhost:${PORT}`);
});