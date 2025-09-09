# 🚀 Fantaschedine - Deployment Guide

## 📋 Deploy su Netlify

### 1. Configurazione Netlify:
- **Site Settings**: Connect to Git → GitHub → `carrubbasamuel/fantaschedina`
- **Base Directory**: `frontend`
- **Build Command**: `npm run build`
- **Publish Directory**: `frontend/build`

### 2. Environment Variables:
```
REACT_APP_API_URL=https://fantaschedina.onrender.com/api
```

### 3. Build Settings:
- **Node Version**: 18.x
- **Build Command**: `npm run build`
- **Deploy Context**: Production

### 4. Domain Settings:
- **Primary Domain**: `fantaschedina.netlify.app`
- **Custom Domain**: (opzionale)

## 🔧 Deploy su Render (Backend)

### 1. Web Service Settings:
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 2. Environment Variables:
```
PORT=10000
MONGODB_URI=mongodb+srv://jeckoitaly_db_user:KABiHZoCLh2VgJZG@cluster0.zkxgypk.mongodb.net/fantaschedine
JWT_SECRET=fantaschedine_secret_key_2024
NODE_ENV=production
```

## 🎯 URLs finali:
- **Frontend**: https://fantaschedina.netlify.app
- **Backend**: https://fantaschedina.onrender.com
