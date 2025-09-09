const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token non trovato, accesso negato' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId)
      .populate('team', 'name')
      .select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token non valido' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token non valido' });
  }
};

module.exports = auth;
