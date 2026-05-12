import React from 'react';
import { 
  ArrowLeft, 
  FlaskConical, 
  CheckCircle, 
  AlertTriangle, 
  Gauge, 
  Signal, 
  Thermometer,
  FileText
} from 'lucide-react';

interface TestCard {
  id: string;
  categoria: string;
  metrica: string;
  resultado: string;
  estado: 'pass' | 'warning';
  icon: React.ReactNode;
}

const resultados: TestCard[] = [
  {
    id: "T-01",
    categoria: "Precisión de Sensores",
    metrica: "Desviación DHT22 vs Patrón",
    resultado: "±0.3°C / ±2% HR",
    estado: 'pass',
    icon: <Thermometer size={24} />
  },
  {
    id: "T-02",
    categoria: "Latencia de Red",
    metrica: "ESP-NOW a Gateway (15m)",
    resultado: "45ms avg",
    estado: 'pass',
    icon: <Signal size={24} />
  },
  {
    id: "T-03",
    categoria: "Integridad Cloud",
    metrica: "Escritura en Supabase",
    resultado: "HTTP 201 (100% Success)",
    estado: 'pass',
    icon: <CheckCircle size={24} />
  },
  {
    id: "T-04",
    categoria: "Consumo Energético",
    metrica: "Modo Deep Sleep",
    resultado: "12µA (Dentro de RNF)",
    estado: 'pass',
    icon: <Gauge size={24} />
  }
];

const PRUEB: React.FC = () => {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="prueb-container">
      <style>{`
        .prueb-container {
          background-color: #020617;
          color: #e2e8f0;
          min-height: 100vh;
          padding: 4rem 1rem;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .prueb-header {
          max-width: 800px;
          margin: 0 auto 4rem auto;
          text-align: center;
        }
        .prueb-title {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
        }
        .prueb-title span { color: #f43f5e; }
        
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
          color: #f43f5e;
          border-color: #f43f5e;
        }

        .test-grid {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 1.5rem;
        }

        @media (max-width: 640px) {
          .test-grid { grid-template-columns: 1fr; }
        }

        .test-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          position: relative;
        }

        .test-id {
          font-family: monospace;
          color: #475569;
          font-size: 0.75rem;
          position: absolute;
          top: 1rem;
          right: 1.25rem;
        }

        .icon-box {
          background: rgba(244, 63, 94, 0.1);
          color: #f43f5e;
          padding: 1rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .result-badge {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          border-radius: 0.25rem;
          border: 1px solid rgba(16, 185, 129, 0.2);
          margin-top: 0.5rem;
          display: inline-block;
        }

        .report-summary {
          max-width: 1000px;
          margin: 3rem auto;
          background: rgba(244, 63, 94, 0.03);
          border: 1px solid rgba(244, 63, 94, 0.1);
          border-radius: 1rem;
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 2rem;
        }
      `}</style>

      <button onClick={handleBack} className="btn-back">
        <ArrowLeft size={18} />
        Volver
      </button>

      <div className="prueb-header">
        <h1 className="prueb-title">Pruebas de <span>Validación</span></h1>
        <p className="text-slate-400">Resultados auditables de estrés, conectividad y precisión del sistema Log-Cold.</p>
      </div>

      <div className="test-grid">
        {resultados.map((test) => (
          <div key={test.id} className="test-card">
            <span className="test-id">{test.id}</span>
            <div className="icon-box">
              {test.icon}
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>{test.categoria}</p>
              <h3 style={{ fontSize: '1.2rem', color: 'white', margin: '0.25rem 0' }}>{test.metrica}</h3>
              <p style={{ color: '#f43f5e', fontWeight: 'bold' }}>{test.resultado}</p>
              <div className="result-badge">SUCCESSFUL TEST</div>
            </div>
          </div>
        ))}
      </div>

      <div className="report-summary">
        <FileText size={48} color="#f43f5e" style={{ opacity: 0.5 }} />
        <div>
          <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Conclusión del Peritaje</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            El sistema cumple con el 100% de los Requerimientos No Funcionales (RNF) establecidos. 
            La persistencia de datos en Supabase no presenta pérdida de paquetes en pruebas de 24 horas continuas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PRUEB;