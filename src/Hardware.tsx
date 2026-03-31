import { motion } from "framer-motion";
import { CpuIcon, WifiIcon, ThermometerIcon, DatabaseIcon, MonitorIcon, ZapIcon } from "lucide-react";
import { Badge } from "../assets/badge.tsx";

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
    <section id="hardware" className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-secondary/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,oklch(0.65_0.28_285/0.04),transparent)]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-widest mb-4">
            <span className="w-6 h-px bg-primary" />
            Componentes
            <span className="w-6 h-px bg-primary" />
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-4">
            Hardware del{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              sistema
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Conoce los componentes electrónicos y tecnologías que hacen
            posible nuestro proyecto IoT.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {components.map((comp, i) => (
            <motion.div
              key={comp.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-all duration-300 overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_0%,oklch(0.72_0.22_195/0.06),transparent_60%)]" />

              <div
                className={`relative w-12 h-12 rounded-xl border ${comp.bg} flex items-center justify-center mb-5`}
              >
                <comp.icon className={`w-5 h-5 ${comp.color}`} />
              </div>

              <div className="relative">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{comp.name}</h3>
                </div>
                <p className="text-xs text-primary font-mono mb-3">{comp.model}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {comp.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {comp.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs font-medium px-2 py-0.5"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Architecture diagram hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 p-6 rounded-xl border border-dashed border-border bg-card/50 text-center"
        >
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">Arquitectura del sistema:</span>{" "}
            Sensores → Microcontrolador → Módulo Wi-Fi → Cloud → Dashboard
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {["Sensores", "→", "MCU", "→", "Wi-Fi", "→", "Cloud", "→", "Dashboard"].map(
              (item, i) => (
                <span
                  key={i}
                  className={
                    item === "→"
                      ? "text-muted-foreground"
                      : "px-3 py-1 rounded-full text-xs font-medium bg-primary/10 border border-primary/20 text-primary"
                  }
                >
                  {item}
                </span>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}