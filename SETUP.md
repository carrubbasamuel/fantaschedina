# 🚀 Setup Rapido Fantaschedine

## ✅ Cosa è stato creato:

### Backend (Node.js + Express + MongoDB)
- ✅ Server Express con tutte le API
- ✅ Modelli MongoDB per User, Team, Gameday, Match, Bet
- ✅ Autenticazione JWT
- ✅ Routes per gestire squadre, giornate, partite, schedine
- ✅ Middleware di autenticazione
- ✅ Calcolo automatico dei punteggi

### Frontend (React + TypeScript + Bootstrap)
- ✅ Interfaccia completa con autenticazione
- ✅ Dashboard utente
- ✅ Creazione e gestione schedine
- ✅ Classifica generale
- ✅ Storico schedine personali
- ✅ Design responsive con Bootstrap

## 🔧 Per completare il setup:

### 1. Avvia MongoDB
```bash
# Se hai MongoDB installato:
brew services start mongodb/brew/mongodb-community

# O usa Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest

# O usa MongoDB Atlas (cloud) - gratuito
```

### 2. Inizializza le squadre
```bash
cd backend
node init-teams.js
```

### 3. Crea la prima giornata (opzionale)
Usa l'API o crea uno script:
```javascript
// POST /api/gamedays
{
  "number": 1,
  "name": "1ª Giornata",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-07T23:59:59Z"
}
```

## 🎮 Come usare l'app:

### Per gli utenti:
1. **Registrati** su `/register`
2. **Accedi** su `/login`
3. **Gioca la schedina** su `/bet`
4. **Controlla la classifica** su `/leaderboard`
5. **Vedi le tue schedine** su `/my-bets`

### Per l'admin:
1. **Crea giornate** con le API
2. **Attiva giornate** per permettere le scommesse
3. **Inserisci risultati** delle partite
4. **Disattiva giornate** completate

## 📱 URL dell'app:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🛠️ API di esempio:

### Inizializza squadre:
```bash
curl -X POST http://localhost:5000/api/teams/initialize
```

### Crea giornata:
```bash
curl -X POST http://localhost:5000/api/gamedays \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "number": 1,
    "name": "1ª Giornata",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-07T23:59:59Z"
  }'
```

### Attiva giornata:
```bash
curl -X PUT http://localhost:5000/api/gamedays/GAMEDAY_ID/activate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎯 Funzionalità implementate:

- ✅ Autenticazione utente completa
- ✅ Gestione 8 squadre del fantacalcio
- ✅ Creazione automatica 4 partite per giornata
- ✅ Sistema di pronostici 1/X/2
- ✅ Calcolo automatico punteggi
- ✅ Classifica generale e per giornata
- ✅ Storico schedine personali
- ✅ Interfaccia responsive
- ✅ Protezione delle route
- ✅ Gestione errori
- ✅ Validazione dati

## 🚨 Note importanti:

1. **MongoDB deve essere in esecuzione** per il backend
2. **Inizializza le squadre** prima dell'uso
3. **Crea e attiva una giornata** per permettere le scommesse
4. **Solo un admin può inserire i risultati** delle partite
5. **Le schedine non sono modificabili** dopo il salvataggio

## 🎉 L'app è pronta per l'uso!

Tutti i file sono stati creati e configurati. Segui i passi sopra per completare il setup e iniziare a giocare!
