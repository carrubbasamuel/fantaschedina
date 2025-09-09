const express = require('express');
const Bet = require('../models/Bet');
const Match = require('../models/Match');
const Gameday = require('../models/Gameday');
const auth = require('../middleware/auth');

const router = express.Router();

// Crea nuova scommessa
router.post('/', auth, async (req, res) => {
  try {
    // Verifica che l'utente sia approvato e abbia una squadra
    if (!req.user.isApproved || !req.user.team) {
      return res.status(403).json({ 
        message: 'Devi aspettare che l\'admin ti assegni una squadra prima di poter giocare le schedine' 
      });
    }

    const { gamedayId, predictions } = req.body;

    // Controlla se la giornata esiste ed è attiva
    const gameday = await Gameday.findById(gamedayId);
    if (!gameday || !gameday.isActive) {
      return res.status(400).json({ message: 'Giornata non valida o non attiva' });
    }

    // Controlla se l'utente ha già scommesso per questa giornata
    const existingBet = await Bet.findOne({ user: req.user.id, gameday: gamedayId });
    if (existingBet) {
      return res.status(400).json({ message: 'Hai già scommesso per questa giornata' });
    }

    // Valida le predizioni
    const matches = await Match.find({ gameday: gamedayId });
    if (predictions.length !== matches.length) {
      return res.status(400).json({ message: 'Devi fare una predizione per ogni partita' });
    }

    for (const prediction of predictions) {
      if (!['1', 'X', '2'].includes(prediction.prediction)) {
        return res.status(400).json({ message: 'Predizione non valida' });
      }
      
      const matchExists = matches.some(m => m._id.toString() === prediction.match);
      if (!matchExists) {
        return res.status(400).json({ message: 'Partita non valida' });
      }
    }

    const bet = new Bet({
      user: req.user.id,
      gameday: gamedayId,
      predictions
    });

    await bet.save();

    const populatedBet = await Bet.findById(bet._id)
      .populate('user', 'username')
      .populate('gameday', 'number name')
      .populate('predictions.match', 'homeTeam awayTeam matchNumber');

    res.status(201).json(populatedBet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Ottieni scommesse utente
router.get('/my-bets', auth, async (req, res) => {
  try {
    const bets = await Bet.find({ user: req.user.id })
      .populate('gameday', 'number name')
      .populate('predictions.match')
      .sort({ createdAt: -1 });

    res.json(bets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Ottieni scommessa per giornata specifica
router.get('/gameday/:gamedayId', auth, async (req, res) => {
  try {
    const bet = await Bet.findOne({ 
      user: req.user.id, 
      gameday: req.params.gamedayId 
    })
    .populate('gameday', 'number name')
    .populate({
      path: 'predictions.match',
      populate: {
        path: 'homeTeam awayTeam',
        select: 'name'
      }
    });

    if (!bet) {
      return res.status(404).json({ message: 'Nessuna scommessa trovata per questa giornata' });
    }

    res.json(bet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Ottieni classifica per giornata
router.get('/leaderboard/:gamedayId', async (req, res) => {
  try {
    const bets = await Bet.find({ 
      gameday: req.params.gamedayId,
      isEvaluated: true 
    })
    .populate('user', 'username')
    .sort({ score: -1, createdAt: 1 });

    const leaderboard = bets.map((bet, index) => ({
      position: index + 1,
      username: bet.user.username,
      score: bet.score,
      predictions: bet.predictions.length
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Ottieni classifica generale
router.get('/leaderboard', async (req, res) => {
  try {
    const results = await Bet.aggregate([
      { $match: { isEvaluated: true } },
      {
        $group: {
          _id: '$user',
          totalScore: { $sum: '$score' },
          gamesPlayed: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $sort: { totalScore: -1, averageScore: -1 } }
    ]);

    const leaderboard = results.map((result, index) => ({
      position: index + 1,
      username: result.user.username,
      totalScore: result.totalScore,
      gamesPlayed: result.gamesPlayed,
      averageScore: Math.round(result.averageScore * 100) / 100
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router;
