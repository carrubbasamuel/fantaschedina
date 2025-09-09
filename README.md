# 🏆 Fantaschedine

Un'app web completa per gestire le "fantaschedine" del fantacalcio, dove gli utenti possono pronosticare i risultati delle partite tra le squadre del fantacalcio.

## 🎯 Funzionalità

- **8 squadre del fantacalcio**: Scarsenal, FC LO SQUALO, FC Tremili, dark shark, fc juventus, fresco26, ludopatikos, siramilan
- **4 partite per giornata**: Generate automaticamente tra le 8 squadre
- **Sistema di pronostici**: Gli utenti possono scommettere 1, X, 2 per ogni partita
- **Calcolo automatico punteggi**: 1 punto per ogni risultato indovinato
- **Classifica generale**: Basata sul punteggio totale di tutte le giornate
- **Storico schedine**: Visualizzazione di tutte le schedine giocate
- **Autenticazione utente**: Registrazione e login sicuri

## 🛠️ Stack Tecnologico

- **Frontend**: React 18 + TypeScript + Bootstrap + React Router
- **Backend**: Node.js + Express + MongoDB + JWT
- **Database**: MongoDB con Mongoose

## 🚀 Installazione e Avvio

### Prerequisiti
- Node.js (v14 o superiore)
- MongoDB (locale o remoto)
- npm o yarn

### 1. Clona il repository
```bash
git clone <repository-url>
cd fantaschedine
```

### 2. Configura il Backend
```bash
cd backend
npm install

# Configura le variabili d'ambiente
cp .env.example .env
# Modifica il file .env con le tue configurazioni
```

### 3. Configura il Frontend
```bash
cd ../frontend
npm install

# Il file .env è già configurato per puntare a localhost:5000
```

### 4. Avvia MongoDB
Assicurati che MongoDB sia in esecuzione:
```bash
# Se hai MongoDB installato localmente
mongod

# O usa MongoDB Atlas per una soluzione cloud
```

### 5. Avvia l'applicazione

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

L'app sarà disponibile su:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📊 Come Giocare

1. **Registrati** o effettua il **Login**
2. Vai alla **Dashboard** per vedere la giornata attiva
3. Clicca su **"Nuova Schedina"** per fare i tuoi pronostici
4. Seleziona **1** (vittoria casa), **X** (pareggio), o **2** (vittoria trasferta) per ogni partita
5. **Salva la schedina** - non potrai più modificarla!
6. Attendi che l'admin inserisca i risultati delle partite
7. Controlla la **Classifica** per vedere la tua posizione
8. Visualizza le tue **Schedine** passate nella sezione dedicata

## 🎮 Funzionalità Admin

L'admin può:
- Inizializzare le squadre del fantacalcio
- Creare nuove giornate
- Attivare/disattivare giornate
- Inserire i risultati delle partite
- Visualizzare tutte le statistiche

## 📱 Screenshots

[TODO: Aggiungi screenshots dell'app]

## 🔧 API Endpoints

### Autenticazione
- `POST /api/auth/register` - Registrazione utente
- `POST /api/auth/login` - Login utente
- `GET /api/auth/profile` - Profilo utente

### Squadre
- `GET /api/teams` - Lista squadre
- `POST /api/teams/initialize` - Inizializza squadre

### Giornate
- `GET /api/gamedays` - Lista giornate
- `GET /api/gamedays/active` - Giornata attiva
- `POST /api/gamedays` - Crea giornata
- `PUT /api/gamedays/:id/activate` - Attiva giornata

### Partite
- `GET /api/matches/gameday/:id` - Partite per giornata
- `PUT /api/matches/:id/result` - Aggiorna risultato

### Scommesse
- `POST /api/bets` - Crea schedina
- `GET /api/bets/my-bets` - Le mie schedine
- `GET /api/bets/leaderboard` - Classifica generale
- `GET /api/bets/gameday/:id` - Schedina per giornata

## 🤝 Contribuire

1. Fork il progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.

## 🐛 Bug Report e Feature Request

Per segnalare bug o richiedere nuove funzionalità, apri una issue su GitHub.

---

**Divertiti con le Fantaschedine! ⚽🎉**
