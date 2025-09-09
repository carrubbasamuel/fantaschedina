const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Debug environment variables
console.log('🔍 Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Permetti richieste senza origin (es. app mobile)
    if (!origin) return callback(null, true);
    
    // In development permetti localhost
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production permetti domini specifici o netlify
    if (origin.includes('netlify.app') || 
        origin.includes('fantaschedina.netlify.app') ||
        origin.includes('carrubbasamuel.github.io')) {
      return callback(null, true);
    }
    
    callback(new Error('Non autorizzato da CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Database connection with retry logic
const connectDB = async () => {
  try {
    console.log('Tentativo connessione MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log('MongoDB connesso con successo');
  } catch (error) {
    console.error('Errore connessione MongoDB:', error.message);
    console.error('URI utilizzato:', process.env.MONGODB_URI ? 'URI presente' : 'URI mancante');
    // Retry dopo 5 secondi
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/bets', require('./routes/bets'));
app.use('/api/gamedays', require('./routes/gamedays'));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Fantaschedine API is running!', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server avviato sulla porta ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
