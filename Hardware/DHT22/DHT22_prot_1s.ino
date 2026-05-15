#include <esp_now.h>
#include <WiFi.h>
#include <DHT.h>

// Definimos el pin G4 para el sensor
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// MAC del Hardware 1 (GPS) que obtuvimos antes
uint8_t broadcastAddress[] = {0xD4, 0xE9, 0xF4, 0xB3, 0x55, 0x1C}; 

typedef struct struct_message {
    float temperatura;
    float humedad;
} struct_message;

struct_message myData;
esp_now_peer_info_t peerInfo;

void setup() {
  Serial.begin(115200); // Velocidad recomendada para ESP32
  dht.begin();
  
  WiFi.mode(WIFI_STA); // Activar modo Wi-Fi para ESP-NOW

  if (esp_now_init() != ESP_OK) {
    Serial.println("Error inicializando ESP-NOW");
    return;
  }

  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = 0;  
  peerInfo.encrypt = false;
  
  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    Serial.println("Error al añadir receptor");
    return;
  }
}

void loop() {
  myData.temperatura = dht.readTemperature();
  myData.humedad = dht.readHumidity();

  if (isnan(myData.temperatura) || isnan(myData.humedad)) {
    Serial.println("Error leyendo el sensor en G4");
  } else {
    // Enviar datos por el aire al Hardware 1
    esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
    
    // Monitor local para ti
    Serial.print("Enviado a GPS -> Temp: ");
    Serial.print(myData.temperatura);
    Serial.print("C | Hum: ");
    Serial.print(myData.humedad);
    Serial.println("%");
  }

  delay(1000); // Sincronizado a 1 segundo para el reporte cuadrado
}
