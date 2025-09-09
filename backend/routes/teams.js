const express = require('express');
const Team = require('../models/Team');
const auth = require('../middleware/auth');

const router = express.Router();

// Ottieni tutte le squadre
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().sort({ points: -1, name: 1 });
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Crea squadra (solo per admin - per ora accessibile a tutti)
router.post('/', auth, async (req, res) => {
  try {
    const { name, logo } = req.body;

    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ message: 'Squadra già esistente' });
    }

    const team = new Team({
      name,
      logo: logo || ''
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Inizializza le squadre del fantacalcio
router.post('/initialize', async (req, res) => {
  try {
    const teams = [
      'Scarsenal',
      'FC LO SQUALO',
      'FC Tremili',
      'dark shark',
      'fc juventus',
      'fresco26',
      'ludopatikos',
      'siramilan'
    ];

    const existingTeams = await Team.find();
    if (existingTeams.length > 0) {
      return res.status(400).json({ message: 'Squadre già inizializzate' });
    }

    const teamDocs = teams.map(name => ({ name }));
    const createdTeams = await Team.insertMany(teamDocs);

    res.json({
      message: 'Squadre inizializzate con successo',
      teams: createdTeams
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router;
