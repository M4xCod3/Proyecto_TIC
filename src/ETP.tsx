import React from 'react';
import { CheckCircle2, Clock, Code2, Cpu, Database, Layout, ShieldCheck, Microscope, ArrowLeftIcon } from 'lucide-react';

// Definición de la interfaz para las etapas (Tipado fuerte con TSX)
interface Etapa {
  id: number;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  icon: React.ReactNode;
  status: 'completado' | 'en-progreso' | 'pendiente';
  detalles: string[];
  color: string;
}

const etapas: Etapa[] = [
  {
    id: 1,
    titulo: "Fase de Investigación",
    subtitulo: "Definición del Problema",
    descripcion: "Identificación de mermas en la cadena de frío para PyMEs farmacéuticas y gastronómicas.",
    icon: <Microscope className="w-6 h-6" />,
    status: 'completado',
    detalles: ["Análisis de mercado", "Entrevistas con contrapartes", "Definición de RNF"],
    color: "bg-blue-500"
  },
  {
    id: 2,
    titulo: "Diseño de Arquitectura",
    subtitulo: "Hardware y Protocolos",
    descripcion: "Selección del ESP32 y diseño de la red híbrida basada en el protocolo ESP-NOW y WiFi.",
    icon: <Cpu className="w-6 h-6" />,
    status: 'completado',
    detalles: ["Diagrama de flujo de datos", "Selección de sensores DHT22/GPS", "Esquema de alimentación"],
    color: "bg-indigo-500"
  },
  {
    id: 3,
    titulo: "Desarrollo del Firmware",
    subtitulo: "Programación en C++",
    descripcion: "Codificación lógica en Arduino IDE para la lectura de sensores y gestión de estados de conexión.",
    icon: <Code2 className="w-6 h-6" />,
    status: 'completado',
    detalles: ["Librería TinyGPS++", "Gestión de tareas (Multitasking)", "Handshake HTTP"],
    color: "bg-cyan-500"
  },
  {
    id: 4,
    titulo: "Integración Cloud",
    subtitulo: "Backend con Supabase",
    descripcion: "Configuración de tablas relacionales y API REST para la persistencia de telemetría.",
    icon: <Database className="w-6 h-6" />,
    status: 'completado',
    detalles: ["Configuración de PostgreSQL", "Políticas de seguridad (RLS)", "Pruebas de respuesta 201"],
    color: "bg-emerald-500"
  },
  {
    id: 5,
    titulo: "Desarrollo de Interfaz",
    subtitulo: "Frontend en Astro",
    descripcion: "Creación del Dashboard interactivo para la visualización de métricas y alertas.",
    icon: <Layout className="w-6 h-6" />,
    status: 'en-progreso',
    detalles: ["Componentes TSX", "Integración Tailwind", "Visualización de mapas"],
    color: "bg-purple-500"
  },
  {
    id: 6,
    titulo: "Validación y Pruebas",
    subtitulo: "Garantía de Calidad",
    descripcion: "Pruebas de campo para verificar latencia, precisión de GPS y estabilidad de red.",
    icon: <ShieldCheck className="w-6 h-6" />,
    status: 'pendiente',
    detalles: ["Pruebas de estrés térmico", "Verificación de latencia < 5s", "Informe final de impacto"],
    color: "bg-amber-500"
  }
];


const ETP: React.FC = () => {
  const handleBack = () => {
    window.history.back();
  };
  return (
    <div className="etp-container">
      <style>{`
        .btn-back {
          position: fixed;
          top: 1.5rem;
          left: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid #334155;
          color: #94a3b8;
          padding: 0.6rem 1rem;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
          z-index: 100;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .btn-back:hover {
          background: #1e293b;
          color: #3b82f6;
          border-color: #3b82f6;
          transform: translateX(-4px);
        }
        .etp-container {
          background-color: #020617;
          color: #e2e8f0;
          min-height: 100 screen;
          padding: 4rem 1rem;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .etp-header {
          max-width: 800px;
          margin: 0 auto 4rem auto;
          text-align: center;
        }
        .etp-title {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
        }
        .etp-title span { color: #3b82f6; }
        .etp-timeline {
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
        }
        .etp-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          border: 1px solid #1e293b;
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          transition: border-color 0.3s;
        }
        .etp-card:hover { border-color: #3b82f6; }
        .etp-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 1rem;
        }
        .status-completado { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .status-progreso { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); animation: pulse 2s infinite; }
        .status-pendiente { background: rgba(71, 85, 105, 0.1); color: #94a3b8; border: 1px solid rgba(71, 85, 105, 0.2); }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .etp-detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #94a3b8;
          margin-top: 0.5rem;
        }
        .dot { width: 6px; height: 6px; background: #334155; border-radius: 50%; }
      `}</style>

      <button onClick={handleBack} className="btn-back">
        <ArrowLeftIcon size={18} />
        Volver
      </button>

      <div className="etp-header">
        <h1 className="etp-title">Etapas del Proyecto <span>Log-Cold</span></h1>
        <p>Cronograma técnico: Desde la idea hasta la validación con Supabase.</p>
      </div>

      <div className="etp-timeline">
        {etapas.map((etapa) => (
          <div key={etapa.id} className="etp-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ color: etapa.color }}>{etapa.icon}</div>
              <span style={{ fontSize: '0.8rem', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {etapa.subtitulo}
              </span>
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'white', margin: '0.5rem 0' }}>{etapa.titulo}</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{etapa.descripcion}</p>
            
            <div style={{ marginTop: '1rem' }}>
              {etapa.detalles.map((d, i) => (
                <div key={i} className="etp-detail-item">
                  <div className="dot" /> {d}
                </div>
              ))}
            </div>

            <div className={`etp-badge status-${etapa.status === 'en-progreso' ? 'progreso' : etapa.status}`}>
              {etapa.status === 'completado' && <CheckCircle2 size={12} style={{ marginRight: '4px' }} />}
              {etapa.status === 'en-progreso' && <Clock size={12} style={{ marginRight: '4px' }} />}
              {etapa.status.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ETP;