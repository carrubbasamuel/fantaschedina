const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://fantaschedina.netlify.app', 
        'https://fantastic-semifreddo-123456.netlify.app', // Netlify auto-generated URL
        'https://carrubbasamuel.github.io' // GitHub Pages backup
      ]
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connesso'))
.catch((err) => console.error('Errore connessione MongoDB:', err));

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
