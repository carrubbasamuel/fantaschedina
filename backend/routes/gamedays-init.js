const express = require('express');
const Gameday = require('../models/Gameday');
const Match = require('../models/Match');
const Team = require('../models/Team');
const auth = require('../middleware/auth');

const router = express.Router();

// Dati delle 35 giornate (dalla 3a alla 38a di Serie A)
const gamedaysData = [
  // 3a giornata
  { number: 3, name: "3ª Giornata - Serie A", startDate: "2024-09-14", endDate: "2024-09-16" },
  { number: 4, name: "4ª Giornata - Serie A", startDate: "2024-09-21", endDate: "2024-09-23" },
  { number: 5, name: "5ª Giornata - Serie A", startDate: "2024-09-28", endDate: "2024-09-30" },
  { number: 6, name: "6ª Giornata - Serie A", startDate: "2024-10-05", endDate: "2024-10-07" },
  { number: 7, name: "7ª Giornata - Serie A", startDate: "2024-10-19", endDate: "2024-10-21" },
  { number: 8, name: "8ª Giornata - Serie A", startDate: "2024-10-26", endDate: "2024-10-28" },
  { number: 9, name: "9ª Giornata - Serie A", startDate: "2024-11-02", endDate: "2024-11-04" },
  { number: 10, name: "10ª Giornata - Serie A", startDate: "2024-11-09", endDate: "2024-11-11" },
  { number: 11, name: "11ª Giornata - Serie A", startDate: "2024-11-23", endDate: "2024-11-25" },
  { number: 12, name: "12ª Giornata - Serie A", startDate: "2024-11-30", endDate: "2024-12-02" },
  { number: 13, name: "13ª Giornata - Serie A", startDate: "2024-12-07", endDate: "2024-12-09" },
  { number: 14, name: "14ª Giornata - Serie A", startDate: "2024-12-14", endDate: "2024-12-16" },
  { number: 15, name: "15ª Giornata - Serie A", startDate: "2024-12-21", endDate: "2024-12-23" },
  { number: 16, name: "16ª Giornata - Serie A", startDate: "2024-12-28", endDate: "2024-12-30" },
  { number: 17, name: "17ª Giornata - Serie A", startDate: "2025-01-04", endDate: "2025-01-06" },
  { number: 18, name: "18ª Giornata - Serie A", startDate: "2025-01-11", endDate: "2025-01-13" },
  { number: 19, name: "19ª Giornata - Serie A", startDate: "2025-01-18", endDate: "2025-01-20" },
  { number: 20, name: "20ª Giornata - Serie A", startDate: "2025-01-25", endDate: "2025-01-27" },
  { number: 21, name: "21ª Giornata - Serie A", startDate: "2025-02-01", endDate: "2025-02-03" },
  { number: 22, name: "22ª Giornata - Serie A", startDate: "2025-02-08", endDate: "2025-02-10" },
  { number: 23, name: "23ª Giornata - Serie A", startDate: "2025-02-15", endDate: "2025-02-17" },
  { number: 24, name: "24ª Giornata - Serie A", startDate: "2025-02-22", endDate: "2025-02-24" },
  { number: 25, name: "25ª Giornata - Serie A", startDate: "2025-03-01", endDate: "2025-03-03" },
  { number: 26, name: "26ª Giornata - Serie A", startDate: "2025-03-08", endDate: "2025-03-10" },
  { number: 27, name: "27ª Giornata - Serie A", startDate: "2025-03-15", endDate: "2025-03-17" },
  { number: 28, name: "28ª Giornata - Serie A", startDate: "2025-03-22", endDate: "2025-03-24" },
  { number: 29, name: "29ª Giornata - Serie A", startDate: "2025-04-05", endDate: "2025-04-07" },
  { number: 30, name: "30ª Giornata - Serie A", startDate: "2025-04-12", endDate: "2025-04-14" },
  { number: 31, name: "31ª Giornata - Serie A", startDate: "2025-04-19", endDate: "2025-04-21" },
  { number: 32, name: "32ª Giornata - Serie A", startDate: "2025-04-26", endDate: "2025-04-28" },
  { number: 33, name: "33ª Giornata - Serie A", startDate: "2025-05-03", endDate: "2025-05-05" },
  { number: 34, name: "34ª Giornata - Serie A", startDate: "2025-05-10", endDate: "2025-05-12" },
  { number: 35, name: "35ª Giornata - Serie A", startDate: "2025-05-17", endDate: "2025-05-19" },
  { number: 36, name: "36ª Giornata - Serie A", startDate: "2025-05-24", endDate: "2025-05-26" },
  { number: 37, name: "37ª Giornata - Serie A", startDate: "2025-05-31", endDate: "2025-06-02" },
  { number: 38, name: "38ª Giornata - Serie A", startDate: "2025-06-07", endDate: "2025-06-09" }
];

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

// Inizializza tutte le giornate
router.post('/initialize', auth, async (req, res) => {
  try {
    // Verifica se l'utente è admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Accesso negato' });
    }

    // Controlla se esistono già giornate
    const existingGamedays = await Gameday.find();
    if (existingGamedays.length > 0) {
      return res.status(400).json({ 
        message: 'Le giornate sono già state inizializzate',
        existing: existingGamedays.length 
      });
    }

    // Crea tutte le giornate
    const gamedays = await Gameday.insertMany(gamedaysData);
    
    console.log(`${gamedays.length} giornate create con successo`);
    res.json({ 
      message: `${gamedays.length} giornate create con successo`,
      gamedays: gamedays
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// ... resto del codice esistente ...

module.exports = router;
