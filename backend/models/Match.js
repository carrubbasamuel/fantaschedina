const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  gameday: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gameday',
    required: true
  },
  homeTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  awayTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  matchNumber: {
    type: Number,
    required: true
  },
  result: {
    type: String,
    enum: ['1', 'X', '2', null],
    default: null
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', matchSchema);
