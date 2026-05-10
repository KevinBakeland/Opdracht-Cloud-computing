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

# 3. De stack opnieuw opstarten [cite: 46]
echo "Restarting stack in detached mode..."
docker compose up -d

# 4. Status check [cite: 32]
echo -e "${GREEN}>>> Systeem succesvol uitgerold! Status van de services:${NC}"
docker compose ps