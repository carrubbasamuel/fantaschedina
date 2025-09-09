const express = require('express');
const Match = require('../models/Match');
const Bet = require('../models/Bet');
const auth = require('../middleware/auth');

const router = express.Router();

// Crea nuova partita
router.post('/', auth, async (req, res) => {
  try {
    // Verifica se l'utente è admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Accesso negato' });
    }

    const { gamedayId, homeTeam, awayTeam, matchNumber } = req.body;

    // Verifica che le squadre siano diverse
    if (homeTeam === awayTeam) {
      return res.status(400).json({ message: 'Una squadra non può giocare contro se stessa' });
    }

    // Verifica che non ci siano già 4 partite per questa giornata
    const existingMatches = await Match.find({ gameday: gamedayId });
    if (existingMatches.length >= 4) {
      return res.status(400).json({ message: 'Una giornata può avere massimo 4 partite' });
    }

    // Verifica che le squadre non siano già impegnate in questa giornata
    const teamAlreadyPlaying = existingMatches.some(match => 
      match.homeTeam.toString() === homeTeam || 
      match.awayTeam.toString() === homeTeam ||
      match.homeTeam.toString() === awayTeam || 
      match.awayTeam.toString() === awayTeam
    );

    if (teamAlreadyPlaying) {
      return res.status(400).json({ message: 'Una o entrambe le squadre stanno già giocando in questa giornata' });
    }

    const match = new Match({
      gameday: gamedayId,
      homeTeam,
      awayTeam,
      matchNumber: matchNumber || existingMatches.length + 1
    });

    await match.save();
    
    const populatedMatch = await Match.findById(match._id)
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name');

    res.status(201).json(populatedMatch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

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
