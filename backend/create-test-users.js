const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testUsers = [
  { username: 'mario', email: 'mario@test.it', password: '123456' },
  { username: 'luigi', email: 'luigi@test.it', password: '123456' },
  { username: 'peach', email: 'peach@test.it', password: '123456' },
];

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connesso a MongoDB');

    for (const userData of testUsers) {
      // Controlla se l'utente esiste già
      const existingUser = await User.findOne({ 
        $or: [{ email: userData.email }, { username: userData.username }] 
      });
      
      if (existingUser) {
        console.log(`⚠️ ${userData.username} esiste già`);
        continue;
      }

      // Hash della password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Crea l'utente
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        isAdmin: false,
        isApproved: false
      });

      await user.save();
      console.log(`✅ Creato utente: ${userData.username}`);
    }

    console.log('\n🎉 Utenti di test creati!');
    console.log('Ora puoi assegnare le squadre dal pannello admin.');
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    mongoose.disconnect();
  }
}

createTestUsers();
