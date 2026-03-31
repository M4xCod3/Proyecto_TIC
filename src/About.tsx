import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
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
    <section id="about" className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,oklch(0.72_0.22_195/0.04),transparent)]" />
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div ref={ref}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-widest mb-4">
                <span className="w-6 h-px bg-primary" />
                Sobre el proyecto
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-6">
                ¿Qué es{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  nuestro proyecto?
                </span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Somos un equipo de estudiantes desarrollando una solución IoT
                innovadora como parte de nuestro proyecto TIC. Integramos
                sensores, microcontroladores y plataformas en la nube para crear
                un sistema de monitoreo y automatización inteligente.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nuestro objetivo es demostrar cómo la tecnología puede resolver
                problemas cotidianos de manera eficiente, conectando el mundo
                físico con el digital a través de datos y automatización.
              </p>
            </motion.div>
          </div>

          {/* Right: feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feat, i) => (
              <FeatureCard key={feat.title} {...feat} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}