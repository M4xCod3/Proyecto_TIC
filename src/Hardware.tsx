import { motion } from "framer-motion";
import { CpuIcon, WifiIcon, ThermometerIcon, DatabaseIcon, MonitorIcon, ZapIcon } from "lucide-react";
import { Badge } from   "../src/ui/badge.tsx";
import './index.css';

const components = [
  {
    icon: CpuIcon,
    name: "Microcontrolador",
    model: "ESP32 devKit V1",
    description: "Es el núcleo del sistema. Elegido por su procesador de doble núcleo y su conectividad integrada, permite gestionar la lectura de sensores, el protocolo ESP-NOW y la comunicación WiFi de forma simultánea.",
    tags: ["Procesamiento", "Control"],
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
  {
    icon: WifiIcon,
    name: "Módulo Conectividad",
    model: "ESP-NOW + WiFi",
    description: "Implementamos una arquitectura híbrida: ESP-NOW para una comunicación robusta y de bajo consumo entre nodos, y WiFi (HTTP) para la sincronización directa con el backend sin necesidad de gateways complejos.",
    tags: ["Conectividad", "IoT"],
    color: "text-accent",
    bg: "bg-accent/10 border-accent/20",
  },
  {
    icon: ThermometerIcon,
    name: "Sensores",
    model: "DHT22 / NEO-6M GPS",
    description: "Capturamos telemetría crítica con alta precisión: temperatura y humedad ambiental mediante el DHT22, y geolocalización en tiempo real a través del módulo GPS NEO-6M para trazabilidad total de la ruta.",
    tags: ["Monitoreo", "Datos"],
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
  },
  {
    icon: DatabaseIcon,
    name: "Plataforma Cloud",
    model: "Supabase (PostgreSQL)",
    description: "Utilizamos Supabase para el almacenamiento relacional de los datos. La integración mediante API REST permite una persistencia de datos segura, escalable y con capacidad de respuesta en tiempo real.",
    tags: ["Cloud", "Backend"],
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
  },
  {
    icon: MonitorIcon,
    name: "Dashboard",
    model: "Astro + Tailwind CSS & APP",
    description: "Interfaz web moderna y responsiva construida con Astro. Permite la visualización de métricas históricas, monitoreo de la cadena de frío y gestión de alertas para la toma de decisiones proactivas.",
    tags: ["UI", "Visualización"],
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
  {
    icon: ZapIcon,
    name: "Actuadores",
    model: "LED y Alertas Lógicas",
    description: "El sistema cuenta con indicadores de estado para validar la conexión y el envío de datos. Además, integra un motor de reglas lógico que dispara alertas automáticas cuando los rangos de temperatura exceden los límites permitidos.",
    tags: ["Control", "Automatización"],
    color: "text-accent",
    bg: "bg-accent/10 border-accent/20",
  },
];

export default function Hardware() {
  return (
    <section id="hardware" className="hardware-section">
  {/* Fondo */}
  <div className="hardware-bg"></div>

  <div className="hardware-container">
    
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="hardware-header"
    >
      <span className="hardware-subtitle">
        <span className="line" />
        Componentes
        <span className="line" />
      </span>

      <h2 className="hardware-title">
        Hardware del sistema <span className="gradient-text"></span>
      </h2>

      <p className="hardware-description">
        Conoce los componentes electrónicos y tecnologías que hacen
        posible LogCold.
      </p>
    </motion.div>

    {/* Grid */}
    <div className="hardware-grid">
      {components.map((comp, i) => (
        <motion.div
          key={comp.name}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
          className="hardware-card"
        >
          <div className="card-glow"></div>

          <div className="hardware-icon">
            <comp.icon />
          </div>

          <div>
            <h3 className="hardware-card-title">{comp.name}</h3>
            <p className="hardware-model">{comp.model}</p>
            <p className="hardware-text">{comp.description}</p>

            <div className="hardware-tags">
              {comp.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Arquitectura */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="hardware-architecture"
    >
      <p>
        <span className="highlight">Arquitectura del sistema:</span>{" "}
        Sensores → MCU → Wi-Fi → Cloud → Dashboard
      </p>
    </motion.div>

  </div>
</section>
  );
}