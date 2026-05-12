import React from 'react';
import { 
  ArrowLeft, 
  Cpu, 
  Wifi, 
  Cloud, 
  Zap, 
  ShieldCheck, 
  Box,
  Globe
} from 'lucide-react';

interface DetalleTecnico {
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
  specs: string[];
  color: string;
}

const especificaciones: DetalleTecnico[] = [
  {
    titulo: "Arquitectura de Red",
    descripcion: "Sistema híbrido diseñado para optimizar el consumo energético y el alcance.",
    icon: <Wifi size={24} />,
    specs: ["Protocolo ESP-NOW (Nodo a Gateway)", "WiFi 802.11 b/g/n (Gateway a Cloud)", "Topología Estrella"],
    color: "#3b82f6"
  },
  {
    titulo: "Procesamiento (Edge)",
    descripcion: "Gestión local de datos y filtrado de señales antes del envío.",
    icon: <Cpu size={24} />,
    specs: ["Microcontrolador ESP32-WROOM", "Lectura sensores DHT22 (Temp/Hum)", "Manejo de estados con Deep Sleep"],
    color: "#6366f1"
  },
  {
    titulo: "Backend & Cloud",
    descripcion: "Infraestructura escalable para el almacenamiento de telemetría.",
    icon: <Cloud size={24} />,
    specs: ["Base de Datos PostgreSQL (Supabase)", "API RESTful para POST automático", "Políticas RLS de seguridad"],
    color: "#10b981"
  },
  {
    titulo: "Flujo de Datos",
    descripcion: "Trayectoria del dato desde el sensor hasta la visualización.",
    icon: <Zap size={24} />,
    specs: ["Muestreo cada 30 segundos", "Validación de respuesta HTTP 201", "Conversión JSON en tiempo real"],
    color: "#f59e0b"
  }
];

const IMP: React.FC = () => {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="imp-container">
      <style>{`
        .imp-container {
          background-color: #020617;
          color: #e2e8f0;
          min-height: 100vh;
          padding: 4rem 1rem;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .imp-header {
          max-width: 900px;
          margin: 0 auto 4rem auto;
          text-align: center;
        }
        .imp-title {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
        }
        .imp-title span { color: #10b981; }
        
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
        }
        .btn-back:hover {
          background: #1e293b;
          color: #10b981;
          border-color: #10b981;
          transform: translateX(-4px);
        }

        .imp-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .imp-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid #1e293b;
          border-radius: 1.25rem;
          padding: 2rem;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .imp-card:hover {
          transform: translateY(-5px);
          border-color: #10b981;
        }

        .spec-list {
          margin-top: 1.5rem;
          list-style: none;
          padding: 0;
        }
        .spec-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: #94a3b8;
          margin-bottom: 0.75rem;
        }
        .spec-dot {
          width: 8px;
          height: 2px;
          border-radius: 2px;
        }

        .architecture-banner {
          max-width: 1100px;
          margin: 4rem auto 0 auto;
          background: linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
          border: 1px dashed #334155;
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
        }
      `}</style>

      <button onClick={handleBack} className="btn-back">
        <ArrowLeft size={18} />
        Volver
      </button>

      <div className="imp-header">
        <h1 className="imp-title">Implementación <span>Técnica</span></h1>
        <p className="text-slate-400">Detalle de la infraestructura y protocolos que sostienen a Log-Cold.</p>
      </div>

      <div className="imp-grid">
        {especificaciones.map((spec, index) => (
          <div key={index} className="imp-card">
            <div style={{ color: spec.color, marginBottom: '1.25rem' }}>
              {spec.icon}
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '0.75rem' }}>{spec.titulo}</h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.5' }}>{spec.descripcion}</p>
            
            <ul className="spec-list">
              {spec.specs.map((item, i) => (
                <li key={i} className="spec-item">
                  <div className="spec-dot" style={{ backgroundColor: spec.color }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="architecture-banner">
        <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Estatus de Comunicación</h4>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#10b981' }}>● ESP-NOW OK</div>
          <div style={{ fontSize: '0.8rem', color: '#10b981' }}>● HTTPS SUPABASE OK</div>
          <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>● JSON PARSING OK</div>
        </div>
      </div>
    </div>
  );
};

export default IMP;