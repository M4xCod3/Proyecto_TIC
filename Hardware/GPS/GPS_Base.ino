#include <esp_now.h>
#include <WiFi.h>
#include <TinyGPS++.h> // Corregido el include
#include <HTTPClient.h>

// --- CONFIGURACIÓN DE HARDWARE ---
#define BUZZER_PIN 25 // Conecta el pin positivo del buzzer aquí (ej: G25)

// --- CONFIGURACIÓN WIFI ---
const char* ssid = "Name_Net";
const char* password = "Password_Net";

// --- CONFIGURACIÓN SUPABASE ---
const char* supabase_url = "URL_supaBase";
const char* supabase_key = "public_key_supaBase";

// --- CONFIGURACIÓN DE PRUEBA PARA LA FERIA ---
// Cambia a "congelado", "comida" o "farmaceutica" para testear los umbrales en vivo
String tipo_pedido = "congelado"; 

TinyGPSPlus gps;

// Variables de telemetría recibida
float tempRecibida = 0;
float humRecibida = 0;

// --- CONTROL DE TIEMPOS (NON-BLOCKING) ---
unsigned long lastUpdate = 0;
const long intervaloEnvio = 15000; // Envío a Supabase cada 15 segundos

unsigned long prevMillisBuzzer = 0;
const long intervaloBuzzer = 300;  // Velocidad del pitido intermitente (300ms)

// --- ESTADOS ---
bool alertaActiva = false;
bool estadoBuzzer = LOW;

// Estructura para recibir datos del Nodo Sensor
typedef struct struct_message {
    float temperatura;
    float humedad;
} struct_message;

struct_message incomingData;

// Función para evaluar localmente si la temperatura recibida viola los rangos
bool evaluarAlerta(float temp) {
  if (tipo_pedido == "congelado" && temp > 10.0) return true;
  if (tipo_pedido == "comida" && temp < 20.0) return true;
  if (tipo_pedido == "farmaceutica" && (temp < 20.0 || temp > 30.0)) return true;
  return false;
}

// Callback que se activa al recibir datos por ESP-NOW
void OnDataRecv(const uint8_t * mac, const uint8_t *data, int len) {
  memcpy(&incomingData, data, sizeof(incomingData));
  tempRecibida = incomingData.temperatura;
  humRecibida = incomingData.humedad;

  Serial.printf("\n[ESP-NOW] Datos Recibidos -> Temp: %.2f C | Hum: %.2f %%\n", tempRecibida, humRecibida);

  // Evaluamos la alerta inmediatamente al recibir el dato
  alertaActiva = evaluarAlerta(tempRecibida);
  if (alertaActiva) {
    Serial.println("🚨 [ALERTA] ¡Carga fuera de rango térmico! Activando alarma en cabina.");
  } else {
    Serial.println("✅ [OK] Temperatura de la carga dentro de los márgenes seguros.");
  }
}

// Función encargada de subir los datos unificados a Supabase
void enviarASupabase(float lat, float lng) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(supabase_url);
    
    // Headers requeridos por Supabase
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", supabase_key);
    http.addHeader("Authorization", String("Bearer ") + supabase_key);
    
    // Construcción del JSON dinámico (puedes añadir campos según tu tabla)
    String jsonPayload = "{\"temperatura\":" + String(tempRecibida) + 
                         ",\"humedad\":" + String(humRecibida) + 
                         ",\"latitud\":" + String(lat, 6) + 
                         ",\"longitud\":" + String(lng, 6) + 
                         ",\"tipo_pedido\":\"" + tipo_pedido + "\"}";
                         
    int httpResponseCode = http.POST(jsonPayload);
    
    Serial.print("[HTTP] Código de respuesta Supabase: ");
    Serial.println(httpResponseCode);
    
    http.end();
  } else {
    Serial.println("⚠️ [HTTP] Error: Wi-Fi desconectado. Imposible subir a Supabase.");
  }
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17); // Pines GPS: G16 y G17
  
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW); // Asegurar que inicie apagado
  
  // Conectar a WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Conéctado exitosamente!");
  
  // Inicializar ESP-NOW
  WiFi.mode(WIFI_STA); // Modo estación requerido para convivir con el WiFi de subida
  if (esp_now_init() != ESP_OK) {
    Serial.println("Error inicializando ESP-NOW");
    return;
  }
  
  // Registrar el callback de recepción
  esp_now_register_recv_cb(OnDataRecv);
  
  Serial.println("Log-Cold: Inicializando monitoreo GPS y Alertas en Cabina...");
}

void loop() {
  // 1. Alimentar constantemente el objeto GPS con los datos de Serial2 (Crucial NO usar delays)
  while (Serial2.available() > 0) {
    gps.encode(Serial2.read());
  }

  unsigned long currentMillis = millis();

  // 2. Control de Intermitencia de Alerta (Hará sonar el buzzer estilo "Beep... Beep...")
  if (alertaActiva) {
    if (currentMillis - prevMillisBuzzer >= intervaloBuzzer) {
      prevMillisBuzzer = currentMillis;
      estadoBuzzer = !estadoBuzzer; // Alternar estado
      digitalWrite(BUZZER_PIN, estadoBuzzer);
    }
  } else {
    digitalWrite(BUZZER_PIN, LOW);
    estadoBuzzer = LOW;
  }

  // 3. Envío periódico de datos unificados a Supabase (Cada 15 segundos)
  if (currentMillis - lastUpdate >= intervaloEnvio) {
    lastUpdate = currentMillis;
    
    float latitud = gps.location.isValid() ? gps.location.lat() : 0.0;
    float longitud = gps.location.isValid() ? gps.location.lng() : 0.0;
    
    Serial.printf("[GPS] Ubicación Actual -> Lat: %.6f | Lng: %.6f\n", latitud, longitud);
    
    // Despachar el paquete de datos a la nube
    enviarASupabase(latitud, longitud);
  }
}