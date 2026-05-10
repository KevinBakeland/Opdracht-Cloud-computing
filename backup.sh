#!/bin/bash

# Map waar de backups worden opgeslagen
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="influxdb_backup_$TIMESTAMP.tar.gz"

# Maak de backup-map aan als deze nog niet bestaat
mkdir -p $BACKUP_DIR

echo "📦 Starten van backup van InfluxDB data..."

# Maak een gecomprimeerd archief van de influxdb map
# We gebruiken 'sudo' omdat Docker-bestanden vaak root-rechten hebben
sudo tar -czf $BACKUP_DIR/$BACKUP_NAME ./influxdb

echo "✅ Backup voltooid: $BACKUP_DIR/$BACKUP_NAME"

# Optioneel: Verwijder backups ouder dan 7 dagen om ruimte te besparen
find $BACKUP_DIR -type f -name "*.tar.gz" -mtime +7 -exec rm {} \;
echo "🧹 Oude backups opgeruimd."
