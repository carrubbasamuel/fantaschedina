#!/bin/bash

# Build script per Netlify
echo "🚀 Building Fantaschedine Frontend..."

# Installa dipendenze
npm ci --only=production

# Build del progetto
npm run build

# Verifica che la build sia andata a buon fine
if [ -d "build" ]; then
  echo "✅ Build completata con successo!"
  echo "📁 Files in build directory:"
  ls -la build/
else
  echo "❌ Build fallita!"
  exit 1
fi
