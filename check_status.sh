#!/bin/bash

# Pad naar je logbestand
LOGFILE="/root/logs.txt"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

echo "--- Check uitgevoerd op: $TIMESTAMP ---" >> $LOGFILE

# 1. Log de algemene status van alle containers
docker ps --format "table {{.Names}}\t{{.Status}}" >> $LOGFILE

# 2. Foutdetectie: Check of er containers zijn die NIET draaien
# We tellen hoeveel containers er in de docker-compose file staan vs hoeveel er 'Up' zijn
RUNNING=$(docker ps -q | wc -l)
TOTAL=$(docker ps -a -q | wc -l)

if [ "$RUNNING" -lt "$TOTAL" ]; then
    echo "⚠️ ALERT: Een of meer services zijn gestopt! ($RUNNING/$TOTAL draaiend)" >> $LOGFILE
    # Optioneel: stuur hier een mail of bericht als je dat wilt
else
    echo "✅ Systeemstatus: Alle services draaien correct." >> $LOGFILE
fi

echo "--------------------------------------" >> $LOGFILE
