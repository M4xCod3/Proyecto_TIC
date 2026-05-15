#include <esp_now.h>
#include <Wifi.h>
#include <TiniGPS++-h>
#include <HTTPClient.h>

// --- CONFIGURACIÓN WIFI ---
const char* ssid = "NetMoni";
const char* password = "M@xiMoni";

// --- CONFIGURACIÓN SUPABASE ---
const char* supabase_url = "https://cvuwrcvewaqpxibqlkud.supabase.co/rest/v1/pedidos_monitoreo";
const char* supabase_key = "sb_publishable_cM6OmE-IObCcjCb7FrAUuA_U62yS_1f";

TinyGPSPlus gps;
unsigned long lastUpdate = 0;

float tempRecibida = 0;
float humRecibida = 0;
unsigned long lastUpdate = 0;

typedef struct struct_message {
    float temperatura;
    float humedad;
} struct_message;


struct_message incomingData;

// Se activa cada vez que el Hardware 2 envía datos
void OnDataRecv(const uint8_t * mac, const uint8_t *data, int len) {
  memcpy(&incomingData, data, sizeof(incomingData));
  tempRecibida = incomingData.temperatura;
  humRecibida = incomingData.humedad;
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17); // Pines GPS: G16 y G17
  
  // Conectar a WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Conectado!");
  
  Serial.println("Log-Cold: Iniciando monitoreo GPS...");
}

