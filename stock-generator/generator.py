import random
import time
import json
import paho.mqtt.client as mqtt

# MQTT instellingen
MQTT_BROKER = "mosquitto"
MQTT_PORT = 1883
MQTT_TOPIC = "stocks/price"

# MQTT client maken
client = mqtt.Client()

print("🔌 Verbinden met MQTT broker...", flush=True)

client.connect(MQTT_BROKER, MQTT_PORT, 60)

print("✅ Verbonden met Mosquitto!", flush=True)


# Startprijzen
stocks = {
    "AAPL": 100.0,
    "TSLA": 100.0,
    "KEVB": 100.0,
    "CATS": 100.0
}

print("📈 Stock Generator gestart!", flush=True)


while True:
    print("\n===== Stock Update =====", flush=True)

    for symbol in stocks:
        # Willekeurige wijziging tussen -1% en +1%
        change = random.uniform(-0.01, 0.01)

        # Nieuwe prijs berekenen
        stocks[symbol] *= (1 + change)

        # Afronden
        stocks[symbol] = round(stocks[symbol], 2)

        # Bericht maken
        message = {
            "symbol": symbol,
            "price": stocks[symbol]
        }

        # Versturen via MQTT
        client.publish(
            MQTT_TOPIC,
            json.dumps(message)
        )

        print(f"📤 Verzonden: {message}", flush=True)

    time.sleep(5)