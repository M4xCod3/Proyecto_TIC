import React from 'react';
import { 
  ArrowLeft, 
  Hammer, 
  Wrench, 
  Layers, 
  Cpu, 
  Terminal, 
  HardDrive,
  Activity
} from 'lucide-react';

interface PasoConstruccion {
  paso: string;
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
  herramientas: string[];
}

const pasos: PasoConstruccion[] = [
  {
    paso: "01",
    titulo: "Prototipado de Hardware",
    descripcion: "Montaje del circuito base utilizando el ESP32 DevKit V1 y sensores de telemetría.",
    icon: <Hammer size={24} />,
    herramientas: ["Protoboard", "Jumpers", "Sensor DHT22", "Módulo GPS NEO-6M"],
  },
  {
    paso: "02",
    titulo: "Configuración de Entorno",
    descripcion: "Preparación del IDE y gestión de librerías críticas para la comunicación.",
    icon: <Terminal size={24} />,
    herramientas: ["Arduino IDE / PlatformIO", "Librerías ESP-NOW", "TinyGPS++"],
  },
  {
    paso: "03",
    titulo: "Ensamblaje de Nodos",
    descripcion: "Estructuración de la jerarquía: Nodo Carga (Sensor) y Nodo Gateway (Receptor).",
    icon: <Layers size={24} />,
    herramientas: ["Direcciones MAC fijas", "Gestión de Antenas", "Carcasa Protectora"],
  },
  {
    paso: "04",
    titulo: "Setup de Persistencia",
    descripcion: "Creación de la estructura de datos para recibir los paquetes JSON del sistema.",
    icon: <HardDrive size={24} />,
    herramientas: ["SQL Editor", "Tablas de Telemetría", "Configuración de API Keys"],
  }
];

const CONS: React.FC = () => {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="cons-container">
      <style>{`
        .cons-container {
          background-color: #020617;
          color: #e2e8f0;
          min-height: 100vh;
          padding: 4rem 1rem;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .cons-header {
          max-width: 800px;
          margin: 0 auto 4rem auto;
          text-align: center;
        }
        .cons-title {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
        }
        .cons-title span { color: #f59e0b; }
        
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
          color: #f59e0b;
          border-color: #f59e0b;
        }

        .cons-list {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .cons-item {
          display: flex;
          gap: 2rem;
          background: rgba(30, 41, 59, 0.3);
          border-left: 4px solid #f59e0b;
          padding: 2rem;
          border-radius: 0 1rem 1rem 0;
          position: relative;
          overflow: hidden;
        }

        .cons-number {
          font-size: 4rem;
          font-weight: 900;
          color: rgba(245, 158, 11, 0.1);
          position: absolute;
          right: 1rem;
          top: -0.5rem;
          line-height: 1;
        }

        .tool-tag {
          display: inline-block;
          background: rgba(245, 158, 11, 0.1);
          color: #fbbf24;
          padding: 0.2rem 0.6rem;
          border-radius: 0.4rem;
          font-size: 0.75rem;
          margin-right: 0.5rem;
          margin-top: 0.5rem;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        @media (max-width: 640px) {
          .cons-item { flex-direction: column; gap: 1rem; }
        }
      `}</style>

      <button onClick={handleBack} className="btn-back">
        <ArrowLeft size={18} />
        Volver
      </button>

      <div className="cons-header">
        <h1 className="cons-title">Construcción del <span>Sistema</span></h1>
        <p className="text-slate-400">Proceso de ensamblaje físico y configuración lógica del ecosistema IoT.</p>
      </div>

      <div className="cons-list">
        {pasos.map((paso, index) => (
          <div key={index} className="cons-item">
            <div className="cons-number">{paso.paso}</div>
            <div style={{ color: '#f59e0b', flexShrink: 0 }}>
              {paso.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem' }}>{paso.titulo}</h3>
              <p style={{ color: '#94a3b8', maxWidth: '600px', marginBottom: '1rem' }}>{paso.descripcion}</p>
              <div>
                {paso.herramientas.map((h, i) => (
                  <span key={i} className="tool-tag">{h}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '4rem', color: '#475569' }}>
        <p style={{ fontSize: '0.8rem' }}>🔧 Log-Cold v1.0.2 - Hardware Open Source y Software Propietario</p>
      </div>
    </div>
  );
};

export default CONS;