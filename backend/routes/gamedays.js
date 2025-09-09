const express = require('express');
const Gameday = require('../models/Gameday');
const Match = require('../models/Match');
const Team = require('../models/Team');
const auth = require('../middleware/auth');

const router = express.Router();

// Ottieni tutte le giornate
router.get('/', async (req, res) => {
  try {
    const gamedays = await Gameday.find().sort({ number: 1 });
    res.json(gamedays);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Ottieni giornata attiva
router.get('/active', async (req, res) => {
  try {
    const activeGameday = await Gameday.findOne({ isActive: true });
    if (!activeGameday) {
      return res.status(404).json({ message: 'Nessuna giornata attiva' });
    }

    const matches = await Match.find({ gameday: activeGameday._id })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .sort({ matchNumber: 1 });

    res.json({
      gameday: activeGameday,
      matches
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Crea nuova giornata
router.post('/', auth, async (req, res) => {
  try {
    const { number, name, startDate, endDate } = req.body;

    const existingGameday = await Gameday.findOne({ number });
    if (existingGameday) {
      return res.status(400).json({ message: 'Giornata già esistente' });
    }

    const gameday = new Gameday({
      number,
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    await gameday.save();

    // Genera automaticamente le partite per questa giornata
    await generateMatches(gameday._id);

    res.status(201).json(gameday);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Attiva giornata
router.put('/:id/activate', auth, async (req, res) => {
  try {
    // Disattiva tutte le giornate
    await Gameday.updateMany({}, { isActive: false });

    // Attiva la giornata specificata
    const gameday = await Gameday.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!gameday) {
      return res.status(404).json({ message: 'Giornata non trovata' });
    }

    res.json(gameday);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Funzione per generare le partite della giornata
async function generateMatches(gamedayId) {
  const teams = await Team.find().sort({ name: 1 });
  
  if (teams.length !== 8) {
    throw new Error('Devono esserci esattamente 8 squadre');
  }

  // Genera 4 partite casuali
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
  const matches = [];

  for (let i = 0; i < 4; i++) {
    const homeTeam = shuffledTeams[i * 2];
    const awayTeam = shuffledTeams[i * 2 + 1];

    const match = new Match({
      gameday: gamedayId,
      homeTeam: homeTeam._id,
      awayTeam: awayTeam._id,
      matchNumber: i + 1
    });

    matches.push(match);
  }

  await Match.insertMany(matches);
  return matches;
}

module.exports = router;
