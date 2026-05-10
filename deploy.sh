#!/bin/bash

echo "🚀 Start CI/CD Deployment Proces..."

# 1. Haal de nieuwste code op van GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# 2. Stop de huidige stack
echo "🛑 Stopping current stack..."
docker compose down

# 3. Bouw en start opnieuw
echo "🏗️ Building and starting new containers..."
docker compose up --build -d

# 4. Opruimen
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment succesvol afgerond!"
docker ps
