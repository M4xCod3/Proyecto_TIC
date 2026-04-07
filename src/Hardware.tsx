import { motion } from "framer-motion";
import { CpuIcon, WifiIcon, ThermometerIcon, DatabaseIcon, MonitorIcon, ZapIcon } from "lucide-react";
import { Badge } from   "../src/ui/badge.tsx";
import './index.css';

const components = [
  {
    icon: CpuIcon,
    name: "Microcontrolador",
    model: "Arduino / ESP32",
    description: "Cerebro del sistema. Procesa las señales de los sensores y controla los actuadores en tiempo real.",
    tags: ["Procesamiento", "Control"],
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
  {
    icon: WifiIcon,
    name: "Módulo Wi-Fi",
    model: "ESP8266 / ESP32",
    description: "Conectividad inalámbrica para envío de datos a la nube y comunicación entre dispositivos.",
    tags: ["Conectividad", "IoT"],
    color: "text-accent",
    bg: "bg-accent/10 border-accent/20",
  },
  {
    icon: ThermometerIcon,
    name: "Sensores",
    model: "DHT22 / HC-SR04",
    description: "Capturan variables del entorno como temperatura, humedad, distancia y más para análisis.",
    tags: ["Monitoreo", "Datos"],
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
  },
  {
    icon: DatabaseIcon,
    name: "Plataforma Cloud",
    model: "Firebase / MQTT",
    description: "Almacenamiento y procesamiento de datos en la nube con visualización en tiempo real.",
    tags: ["Cloud", "Backend"],
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
  },
  {
    icon: MonitorIcon,
    name: "Dashboard",
    model: "Web / App",
    description: "Interfaz visual para monitorear el estado del sistema, ver métricas y controlar actuadores.",
    tags: ["UI", "Visualización"],
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
  {
    icon: ZapIcon,
    name: "Actuadores",
    model: "Relés / Servos",
    description: "Componentes que ejecutan acciones físicas basadas en las instrucciones del microcontrolador.",
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
        posible nuestro proyecto IoT.
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