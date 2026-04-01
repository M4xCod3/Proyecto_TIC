import { motion } from "framer-motion";
import { ArrowDownIcon, CircuitBoardIcon, WifiIcon, CpuIcon } from "lucide-react";
import { Button } from "./ui/button.tsx";
import './index.css';

const floatingIcons = [
  { icon: CircuitBoardIcon, delay: 0, x: "10%", y: "25%" },
  { icon: WifiIcon, delay: 0.4, x: "85%", y: "20%" },
  { icon: CpuIcon, delay: 0.8, x: "80%", y: "65%" },
];

export default function Hero() {
  const handleScroll = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
  id="hero"
  className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
>
  {/* 🔥 BACKGROUND PRO */}
  <div className="absolute inset-0">
    {/* Grid */}
    <div
      className="absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,200,255,0.2) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,200,255,0.2) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }}
    />

    {/* Glow central */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,200,255,0.15),transparent_60%)]" />

    {/* Blobs */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-[120px]" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
  </div>

  {/* 🔥 ICONOS FLOTANTES */}
  {floatingIcons.map(({ icon: Icon, delay, x, y }, i) => (
    <motion.div
      key={i}
      className="
        absolute hidden lg:flex items-center justify-center
        w-14 h-14 rounded-xl
        border border-white/10
        bg-white/5 backdrop-blur-md
        shadow-lg
      "
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.4, 0.7, 0.4],
        scale: [1, 1.05, 1],
        y: [0, -10, 0],
      }}
      transition={{
        opacity: { delay, duration: 3, repeat: Infinity },
        scale: { delay, duration: 3, repeat: Infinity },
        y: { delay, duration: 3, repeat: Infinity },
      }}
    >
      <Icon className="w-5 h-5 text-cyan-400" />
    </motion.div>
  ))}

  {/* 🔥 CONTENIDO */}
  <div className="relative z-10 text-center px-6 max-w-4xl mx-auto backdrop-blur-[1px]">
    
    {/* Badge */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="
        inline-flex items-center gap-2 px-4 py-1.5 rounded-full
        border border-cyan-400/30
        bg-cyan-400/10
        text-cyan-400 text-sm font-medium mb-8
      "
    >
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      Proyecto TIC — IoT
    </motion.div>

    {/* Título */}
    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.7 }}
      className="
        text-5xl sm:text-6xl md:text-7xl
        font-bold tracking-tight leading-[1.1] mb-6
        text-white
        drop-shadow-[0_0_20px_rgba(0,200,255,0.3)]
      "
    >
      Conectando el{" "}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
        mundo real
      </span>{" "}
      con la tecnología
    </motion.h1>

    {/* Descripción */}
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
    >
      Solución IoT innovadora que integra sensores, automatización y
      monitoreo en tiempo real para transportar alimentos refrigerados.
    </motion.p>

    {/* Botones */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.6 }}
      className="flex flex-col sm:flex-row gap-4 justify-center"
    >
      <Button
        size="lg"
        onClick={() => handleScroll("#about")}
        className="
          bg-gradient-to-r from-cyan-400 to-blue-500
          text-white
          hover:opacity-90
          font-semibold px-8
          shadow-lg shadow-cyan-500/30
        "
      >
        Descubrir el proyecto
      </Button>

      <Button
        size="lg"
        variant="secondary"
        onClick={() => handleScroll("#contact")}
        className="
          bg-white/5 backdrop-blur-md
          border border-white/10
          text-white
          hover:bg-white/10
          font-semibold px-8
        "
      >
        Contactar al equipo
      </Button>
    </motion.div>

    {/* Stats */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.6 }}
      className="mt-16 flex flex-wrap justify-center gap-8"
    >
      {[
        { value: "IoT", label: "Tecnología" },
        { value: "24/7", label: "Monitoreo" },
        { value: "100%", label: "Open Source" },
      ].map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-2xl font-bold text-cyan-400">
            {stat.value}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">
            {stat.label}
          </div>
        </div>
      ))}
    </motion.div>
  </div>

  {/* Scroll */}
  <motion.button
    onClick={() => handleScroll("#about")}
    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
    animate={{ y: [0, 8, 0] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  >
    <ArrowDownIcon className="w-5 h-5" />
  </motion.button>
</section>
  );
}