const mongoose = require('mongoose');
const User = require('./models/User');
const Team = require('./models/Team');
require('dotenv').config();

async function assignTeam() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connesso a MongoDB');

    // Trova l'utente admin (samuel)
    const user = await User.findOne({ username: 'samuel' });
    if (!user) {
      console.log('❌ Utente samuel non trovato');
      return;
    }

    // Trova una squadra (prendo Scarsenal)
    const team = await Team.findOne({ name: 'Scarsenal' });
    if (!team) {
      console.log('❌ Squadra Scarsenal non trovata');
      return;
    }

    // Assegna la squadra
    await User.findByIdAndUpdate(user._id, { team: team._id });
    
    console.log(`🎉 Squadra assegnata!`);
    console.log(`✅ ${user.username} ora gioca per ${team.name}`);

    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    mongoose.disconnect();
  }
}

assignTeam();
