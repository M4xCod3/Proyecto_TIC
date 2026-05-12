import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import './index.css';
import {
  LightbulbIcon,
  TargetIcon,
  UsersIcon,
  TrendingUpIcon,
} from "lucide-react";

const features = [
  {
    icon: LightbulbIcon,
    title: "Innovación",
    description:
      "Implementamos un sistema de monitoreo basado en el protocolo ESP-NOW y microcontroladores ESP32,permitiendo una comunicación robusta y de bajo consumo que no depende exclusivamente de redes WiFi convencionales.",
  },
  {
    icon: TargetIcon,
    title: "Objetivo claro",
    description:
      "Nuestra meta es eliminar la incertidumbre de los delivery. Automatizamos la captura de telemetría (temperatura, humedad y ubicación) para ofrecer reportes históricos auditables y alertas en tiempo real.",
  },
  {
    icon: UsersIcon,
    title: "Trabajo en equipo",
    description:
      "Desarrollamos el ciclo completo del producto: desde el diseño del hardware y firmware en C++, hasta la infraestructura de datos en Supabase y una interfaz de gestión moderna para el usuario final.",
  },
  {
    icon: TrendingUpIcon,
    title: "Impacto real",
    description:
      "Diseñado específicamente para PyMEs farmacéuticas y de delivery gastronómico. Log-Cold democratiza el acceso a tecnología de alta precisión, reduciendo mermas y asegurando el cumplimiento de normativas sanitarias.",
  },
];

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: typeof LightbulbIcon;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group p-6 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-card/80 transition-all duration-300"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="about" className="about-section">
  <div className="about-bg" />

  <div className="about-container">
    <div className="about-grid">
      
      {/* LEFT */}
      <div ref={ref}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="about-badge">
            <span className="line" />
            Sobre el proyecto
          </span>

          <h2 className="about-title">
            ¿Qué es{" "}
            <span className="gradient-text">
              LogCold?
            </span>
          </h2>

          <p className="about-text">
            Una solución IoT integral diseñada para garantizar la integridad 
            de la cadena de frío en el transporte de productos críticos.
          </p>

          <p className="about-text">
            Somos un equipo de estudiantes desarrollando una solución IoT
            innovadora como parte de nuestro proyecto TIC.
          </p>
        </motion.div>
      </div>

      {/* RIGHT */}
      <div className="about-cards">
        {features.map((feat, i) => (
          <FeatureCard key={feat.title} {...feat} index={i} />
        ))}
      </div>

    </div>
  </div>
</section>
  );
}