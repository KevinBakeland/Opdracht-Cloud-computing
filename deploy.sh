#!/bin/bash

echo "🚀 Start CI/CD Deployment Proces..."

# 1. Pull de laatste wijzigingen
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# 2. Stop de huidige stack
echo "🛑 Stopping current stack..."
docker compose down

# 3. Start de stack opnieuw op
echo "🏗️ Building and starting new containers..."
docker compose up -d --build

# 4. Wacht even tot Node-RED is opgestart
echo "⏳ Wachten tot Node-RED klaar is..."
sleep 5

# 5. Installeer de ontbrekende Node-RED libraries automatisch
echo "📦 Installing Node-RED dependencies..."
docker exec -t nodered npm install node-red-contrib-influxdb node-red-dashboard

# 6. Herstart Node-RED om de libraries te laden
echo "🔄 Herstarten van Node-RED..."
docker restart nodered

# 7. Opschonen van oude images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo ">>> Systeem succesvol uitgerold en geconfigureerd! 🚀"