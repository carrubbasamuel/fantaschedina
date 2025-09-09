const mongoose = require('mongoose');
require('dotenv').config();

const Team = require('./models/Team');

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

async function initializeTeams() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connesso per l\'inizializzazione');

    // Controlla se esistono già squadre
    const existingTeams = await Team.find();
    if (existingTeams.length > 0) {
      console.log('Squadre già presenti nel database');
      return;
    }

    // Crea le squadre
    const teamDocs = teams.map(name => ({ name }));
    const createdTeams = await Team.insertMany(teamDocs);

    console.log('Squadre create con successo:');
    createdTeams.forEach(team => {
      console.log(`- ${team.name}`);
    });

  } catch (error) {
    console.error('Errore nell\'inizializzazione:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnesso da MongoDB');
  }
}

initializeTeams();
