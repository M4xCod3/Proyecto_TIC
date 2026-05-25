import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import './index2.css';
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
      "Implementamos arquitectura de Edge Computing con microcontroladores ESP32 y el protocolo inalámbrico ESP-NOW. Logramos un enlace local robusto, de alta precisión y ultra bajo consumo que elimina por completo el 'punto ciego' en subterráneos o zonas sin señal móvil , operando de manera independiente a planes de datos o redes tradicionales.",
  },
  {
    icon: TargetIcon,
    title: "Objetivo claro",
    description:
      "Erradicar la incertidumbre en la cadena de frío mediante la captura automatizada de telemetría ambiental (temperatura y humedad) y coordenadas GPS en tiempo real. Buscamos transformar datos crudos en reportes históricos e inalterables , facilitando auditorías normativas y disparando alertas proactivas antes de que ocurra la pérdida."
  },
  {
    icon: UsersIcon,
    title: "Trabajo en equipo",
    description:
      "Unimos capacidades multidisciplinarias para abarcar de extremo a extremo el ciclo completo del producto. Nuestro equipo coordinó con éxito desde el diseño de hardware dedicado y firmware en C++, hasta el despliegue de la infraestructura en la nube con Supabase y el desarrollo de un dashboard moderno optimizado en React + Astro."
  },
  {
    icon: TrendingUpIcon,
    title: "Impacto real",
    description:
      "El 15% de los despachos globales sufren fallas térmicas críticas en un mercado que mueve US$284.000 millones. Log-Cold democratiza la trazabilidad para PyMEs farmacéuticas y gastronómicas con hardware ESP32 de ultra bajo costo frente a competidores corporativos caros. Evitar la pérdida de un solo lote de vacunas, insulina o alimentos de alto valor financia por completo la implementación del sistema."
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
            Una solución IoT distribuida y de alta precisión, diseñada específicamente para auditar
             de extremo a extremo la cadena de frío y eliminar la incertidumbre térmica en el 
             transporte de activos médicos, vacunas y productos farmacéuticos críticos.
          </p>

          <p className="about-text">
            Somos un equipo de estudiantes desarrollando una solución IoT
            innovadora como parte de nuestro proyecto TIC.
          </p>
        </motion.div>
      </div>

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