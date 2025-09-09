const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS molto permissivo per debugging
app.use(cors({
  origin: true, // Permetti tutto temporaneamente
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Debug info
console.log('� Starting server...');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'set' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'set' : 'NOT SET');

// Health check PRIMA di tutto
app.get('/', (req, res) => {
  res.json({ 
    message: 'Fantaschedine API is working! v2.0',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      PORT: process.env.PORT || 'not set',
      MONGODB_URI: process.env.MONGODB_URI ? 'configured' : 'MISSING',
      JWT_SECRET: process.env.JWT_SECRET ? 'configured' : 'MISSING'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongoStatus: mongoose.connection.readyState,
    timestamp: new Date().toISOString()
  });
});

// Debug CORS
app.get('/cors-test', (req, res) => {
  res.json({ 
    message: 'CORS test endpoint',
    origin: req.headers.origin || 'no origin',
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Database connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not configured');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Non fermare il server se MongoDB non funziona
  }
};

connectDB();

// Routes - solo se MongoDB è connesso
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/bets', require('./routes/bets'));
app.use('/api/gamedays', require('./routes/gamedays'));

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Access: http://0.0.0.0:${PORT}`);
});
