#!/bin/bash

echo "🚀 Start CI/CD Deployment Proces..."

# 1. Pull de laatste wijzigingen
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# 2. Stop de huidige stack
echo "🛑 Stopping current stack..."
sudo docker compose down

# 3. Zorg dat de mappen bestaan + juiste rechten
echo "📁 Mappen en rechten instellen..."

mkdir -p influxdb3/data influxdb3/plugins
mkdir -p influxdb3-ui/db influxdb3-ui/config

# InfluxDB 3 Core mag schrijven
sudo chmod -R 777 influxdb3/

# Explorer rechten
sudo chown -R 1500:1500 influxdb3-ui/

# 4. Start de stack opnieuw
echo "🏗️ Starting containers..."
sudo docker compose up -d --build

# 5. Wachten op services
echo "⏳ Wachten tot services starten..."
sleep 15


# 6. Controleer InfluxDB
echo "🔍 Controleren of InfluxDB actief is..."

until curl -s http://localhost:8181/health | grep -q "OK"; do
    echo "⏳ InfluxDB nog niet klaar..."
    sleep 5
done

echo "✅ InfluxDB actief"


# 7. Maak InfluxDB database automatisch aan
echo "🗄️ Database portfolio controleren..."

sudo docker exec influxdb influxdb3 create database portfolio 2>/dev/null || true

echo "✅ Database portfolio klaar"


# 8. Installeer Node-RED libraries
echo "📦 Installing Node-RED dependencies..."
sudo docker exec -t nodered npm install \
    node-red-contrib-influxdb


# 9. Herstart Node-RED
echo "🔄 Herstarten van Node-RED..."
sudo docker restart nodered


echo ""
echo "======================================"
echo "✅ Systeem succesvol uitgerold! 🚀"
echo "======================================"
echo ""

IP=$(hostname -I | awk '{print $1}')

echo "👉 Dashboard:          http://$IP"
echo "👉 InfluxDB Explorer:  http://$IP:8888"
echo "👉 Node-RED:           http://$IP:1880"
echo "👉 Portainer:          http://$IP:9000"

echo ""
echo "📊 InfluxDB database: portfolio"