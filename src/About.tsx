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
      "Aplicamos tecnologías emergentes de IoT para resolver problemas reales con soluciones creativas y eficientes.",
  },
  {
    icon: TargetIcon,
    title: "Objetivo claro",
    description:
      "Nuestro proyecto tiene metas definidas: automatizar, monitorear y mejorar procesos con datos en tiempo real.",
  },
  {
    icon: UsersIcon,
    title: "Trabajo en equipo",
    description:
      "Un equipo multidisciplinario con habilidades complementarias en hardware, software y diseño.",
  },
  {
    icon: TrendingUpIcon,
    title: "Impacto real",
    description:
      "Buscamos que nuestra solución tenga impacto tangible y escalable en la comunidad.",
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
              nuestro proyecto?
            </span>
          </h2>

          <p className="about-text">
            Somos un equipo de estudiantes desarrollando una solución IoT
            innovadora como parte de nuestro proyecto TIC...
          </p>

          <p className="about-text">
            Nuestro objetivo es demostrar cómo la tecnología puede resolver
            problemas cotidianos...
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