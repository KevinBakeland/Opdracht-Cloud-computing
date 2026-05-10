#!/bin/bash

# Kleuren voor de output 
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}>>> CI/CD proces starten voor Smart Gateway...${NC}"

# 1. Oude containers stoppen en verwijderen [cite: 45]
echo "Stopping old containers..."
docker compose down

# 2. De nieuwste versies bouwen (indien nodig) [cite: 44]
echo "Building/pulling latest images..."
docker compose pull
docker compose build

# 3. De stack opnieuw opstarten [cite: 46]
echo "Restarting stack in detached mode..."
docker compose up -d

# 4. Status check [cite: 32]
echo -e "${GREEN}>>> Systeem succesvol uitgerold! Status van de services:${NC}"
docker compose ps