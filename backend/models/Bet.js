const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameday: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gameday',
    required: true
  },
  predictions: [{
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true
    },
    prediction: {
      type: String,
      enum: ['1', 'X', '2'],
      required: true
    }
  }],
  score: {
    type: Number,
    default: 0
  },
  isEvaluated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bet', betSchema);
