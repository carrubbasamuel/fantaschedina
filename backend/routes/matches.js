const express = require('express');
const Match = require('../models/Match');
const Bet = require('../models/Bet');
const auth = require('../middleware/auth');

const router = express.Router();

// Ottieni partite per giornata
router.get('/gameday/:gamedayId', async (req, res) => {
  try {
    const matches = await Match.find({ gameday: req.params.gamedayId })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .sort({ matchNumber: 1 });

    res.json(matches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Aggiorna risultato partita
router.put('/:id/result', auth, async (req, res) => {
  try {
    const { result } = req.body;

    if (!['1', 'X', '2'].includes(result)) {
      return res.status(400).json({ message: 'Risultato non valido' });
    }

    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { 
        result,
        isCompleted: true
      },
      { new: true }
    ).populate('homeTeam', 'name').populate('awayTeam', 'name');

    if (!match) {
      return res.status(404).json({ message: 'Partita non trovata' });
    }

    // Controlla se tutte le partite della giornata sono completate
    const allMatches = await Match.find({ gameday: match.gameday });
    const allCompleted = allMatches.every(m => m.isCompleted);

    if (allCompleted) {
      // Calcola i punteggi delle scommesse per questa giornata
      await calculateBetScores(match.gameday);
    }

    res.json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Funzione per calcolare i punteggi delle scommesse
async function calculateBetScores(gamedayId) {
  try {
    const matches = await Match.find({ gameday: gamedayId });
    const bets = await Bet.find({ gameday: gamedayId }).populate('predictions.match');

    for (const bet of bets) {
      let score = 0;
      
      for (const prediction of bet.predictions) {
        const match = matches.find(m => m._id.toString() === prediction.match._id.toString());
        if (match && match.result === prediction.prediction) {
          score += 1;
        }
      }

      bet.score = score;
      bet.isEvaluated = true;
      await bet.save();
    }
  } catch (error) {
    console.error('Errore nel calcolo punteggi:', error);
  }
}

module.exports = router;
