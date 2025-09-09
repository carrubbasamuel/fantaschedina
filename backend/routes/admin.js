const express = require('express');
const User = require('../models/User');
const Team = require('../models/Team');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware per verificare che l'utente sia admin
const adminAuth = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Accesso negato: solo admin' });
  }
  next();
};

// Ottieni tutti gli utenti (solo admin)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .populate('team', 'name')
      .select('-password')
      .sort({ createdAt: -1 });

    // Mappa _id in id per compatibilità frontend
    const mappedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      team: user.team,
      isApproved: user.isApproved,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    }));

    res.json(mappedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Assegna squadra a un utente (solo admin)
router.put('/users/:userId/assign-team', auth, adminAuth, async (req, res) => {
  try {
    const { teamId } = req.body;
    const { userId } = req.params;

    // Verifica che la squadra esista
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Squadra non trovata' });
    }

    // Verifica che la squadra non sia già assegnata
    const existingAssignment = await User.findOne({ team: teamId, _id: { $ne: userId } });
    if (existingAssignment) {
      return res.status(400).json({ message: 'Squadra già assegnata a un altro utente' });
    }

    // Assegna la squadra e approva l'utente
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        team: teamId,
        isApproved: true
      },
      { new: true }
    ).populate('team', 'name').select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Rimuovi squadra da un utente (solo admin)
router.put('/users/:userId/remove-team', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        team: null,
        isApproved: false
      },
      { new: true }
    ).populate('team', 'name').select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Ottieni squadre disponibili (non assegnate)
router.get('/available-teams', auth, adminAuth, async (req, res) => {
  try {
    const assignedTeamIds = await User.find({ team: { $ne: null } }).distinct('team');
    const availableTeams = await Team.find({ _id: { $nin: assignedTeamIds } });

    res.json(availableTeams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Elimina utente (solo admin)
router.delete('/users/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 Tentativo eliminazione utente:', userId);

    // Verifica che l'utente da eliminare non sia admin
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      console.log('❌ Utente non trovato:', userId);
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    console.log('✅ Utente trovato:', userToDelete.username, 'Admin:', userToDelete.isAdmin);

    if (userToDelete.isAdmin) {
      console.log('❌ Tentativo di eliminare admin');
      return res.status(400).json({ message: 'Non puoi eliminare un amministratore' });
    }

    // Elimina l'utente (la squadra si libera automaticamente)
    const result = await User.findByIdAndDelete(userId);
    console.log('✅ Utente eliminato:', result?.username);

    res.json({ message: 'Utente eliminato con successo' });
  } catch (error) {
    console.error('❌ Errore eliminazione:', error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router;
