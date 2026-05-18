import { useState, useEffect, useRef } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  MapPinIcon,
  ThermometerIcon,
  DropletIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  SendIcon,
  BotIcon,
  RefreshCwIcon,
  ArrowLeftIcon,
  SearchIcon,
} from "lucide-react";

interface PedidoMonitoreo {
  id: number;
  created_at: string;
  latitud: number;
  longitud: number;
  temperatura: number;
  humedad: number;
  alerta: string;
  hardware_id: string;
  id_pedido?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontFamily: "'Segoe UI', sans-serif",
  } as React.CSSProperties,
  header: {
    backgroundColor: "#1e293b",
    borderBottom: "1px solid #334155",
    padding: "12px 16px",
  } as React.CSSProperties,
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  } as React.CSSProperties,
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  } as React.CSSProperties,
  backButton: {
    padding: "8px",
    backgroundColor: "transparent",
    border: "none",
    color: "#ffffff",
    cursor: "pointer",
    borderRadius: "8px",
  } as React.CSSProperties,
  title: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#22d3ee",
    margin: 0,
  } as React.CSSProperties,
  subtitle: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: 0,
  } as React.CSSProperties,
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as React.CSSProperties,
  statusDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#4ade80",
    borderRadius: "50%",
  } as React.CSSProperties,
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "16px",
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
  } as React.CSSProperties,
  mainDesktop: {
    gridTemplateColumns: "2fr 1fr",
  } as React.CSSProperties,
  leftColumn: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  } as React.CSSProperties,
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
  } as React.CSSProperties,
  statCard: {
    backgroundColor: "#1e293b",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid #334155",
  } as React.CSSProperties,
  statLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#94a3b8",
    fontSize: "12px",
    marginBottom: "4px",
  } as React.CSSProperties,
  statValue: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
  } as React.CSSProperties,
  card: {
    backgroundColor: "#1e293b",
    borderRadius: "8px",
    border: "1px solid #334155",
    overflow: "hidden",
  } as React.CSSProperties,
  cardHeader: {
    padding: "12px",
    borderBottom: "1px solid #334155",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as React.CSSProperties,
  filterContainer: {
    padding: "12px",
    borderBottom: "1px solid #334155",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap" as const,
  } as React.CSSProperties,
  filterSelect: {
    backgroundColor: "#334155",
    border: "1px solid #475569",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
  } as React.CSSProperties,
  clearButton: {
    padding: "8px 16px",
    backgroundColor: "#475569",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    cursor: "pointer",
  } as React.CSSProperties,
  mapContainer: {
    height: "300px",
  } as React.CSSProperties,
  tableContainer: {
    overflowX: "auto" as const,
    maxHeight: "300px",
    overflowY: "auto" as const,
  } as React.CSSProperties,
  table: {
    width: "100%",
    fontSize: "14px",
    borderCollapse: "collapse" as const,
  } as React.CSSProperties,
  th: {
    backgroundColor: "#334155",
    padding: "8px 12px",
    textAlign: "left" as const,
    position: "sticky" as const,
    top: 0,
  } as React.CSSProperties,
  td: {
    padding: "8px 12px",
    borderTop: "1px solid #334155",
  } as React.CSSProperties,
  chatContainer: {
    backgroundColor: "#1e293b",
    borderRadius: "8px",
    border: "1px solid #334155",
    display: "flex",
    flexDirection: "column" as const,
    height: "500px",
  } as React.CSSProperties,
  chatMessages: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "12px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  } as React.CSSProperties,
  chatInputContainer: {
    padding: "12px",
    borderTop: "1px solid #334155",
  } as React.CSSProperties,
  chatInputRow: {
    display: "flex",
    gap: "8px",
  } as React.CSSProperties,
  chatInput: {
    flex: 1,
    backgroundColor: "#334155",
    border: "1px solid #475569",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
  } as React.CSSProperties,
  chatButton: {
    padding: "8px 12px",
    backgroundColor: "#0891b2",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    cursor: "pointer",
  } as React.CSSProperties,
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0891b2",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "8px 12px",
    maxWidth: "85%",
    fontSize: "14px",
  } as React.CSSProperties,
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#334155",
    color: "#e2e8f0",
    borderRadius: "8px",
    padding: "8px 12px",
    maxWidth: "85%",
    fontSize: "14px",
    whiteSpace: "pre-wrap" as const,
  } as React.CSSProperties,
  centerScreen: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
  } as React.CSSProperties,
  centerContent: {
    textAlign: "center" as const,
    padding: "24px",
    maxWidth: "400px",
  } as React.CSSProperties,
  retryButton: {
    padding: "8px 16px",
    backgroundColor: "#0891b2",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    cursor: "pointer",
    marginTop: "16px",
  } as React.CSSProperties,
  badge: {
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "12px",
  } as React.CSSProperties,
  filterInfo: {
    padding: "8px 12px",
    backgroundColor: "#334155",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#94a3b8",
  } as React.CSSProperties,
  pedidoInputContainer: {
    backgroundColor: "#1e293b",
    borderRadius: "8px",
    border: "1px solid #334155",
    padding: "32px",
    textAlign: "center" as const,
  } as React.CSSProperties,
  pedidoInput: {
    backgroundColor: "#334155",
    border: "1px solid #475569",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#ffffff",
    fontSize: "16px",
    outline: "none",
    width: "100%",
    maxWidth: "300px",
    marginTop: "16px",
  } as React.CSSProperties,
  submitButton: {
    padding: "12px 24px",
    backgroundColor: "#0891b2",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    cursor: "pointer",
    marginTop: "16px",
    fontSize: "16px",
  } as React.CSSProperties,
  errorText: {
    color: "#f87171",
    fontSize: "14px",
    marginTop: "12px",
  } as React.CSSProperties,
};

export default function Analytics() {
  const [allData, setAllData] = useState<PedidoMonitoreo[]>([]);
  const [filteredData, setFilteredData] = useState<PedidoMonitoreo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hola! Soy el asistente de Log-Cold. Por favor, ingresa el número de tu pedido para comenzar." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  
  // Estado para el filtro de hardware
  const [filterHardwareId, setFilterHardwareId] = useState("");
  const [availableHardwareIds, setAvailableHardwareIds] = useState<string[]>([]);
  
  // Estado para controlar si ya se ingresó el número de pedido
  const [pedidoIngresado, setPedidoIngresado] = useState(false);
  const [numeroPedidoInput, setNumeroPedidoInput] = useState("");
  const [pedidoError, setPedidoError] = useState("");

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError("Supabase no configurado");
        setLoading(false);
        return;
      }

      try {
        const { data: pedidos, error: queryError } = await supabase
          .from("pedidos_monitoreo")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500);

        if (queryError) {
          setError("Error: " + queryError.message);
          setLoading(false);
          return;
        }

        const data = pedidos || [];
        setAllData(data);
        
        // Extraer Hardware IDs únicos
        const hardwareIds = [...new Set(data.map(item => item.hardware_id).filter(Boolean))] as string[];
        setAvailableHardwareIds(hardwareIds);
        
        setLoading(false);

        const channel = supabase
          .channel("pedidos_realtime")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "pedidos_monitoreo" },
            (payload) => {
              const newRecord = payload.new as PedidoMonitoreo;
              setAllData(prev => {
                const updated = [newRecord, ...prev].slice(0, 500);
                if (newRecord.hardware_id && !hardwareIds.includes(newRecord.hardware_id)) {
                  setAvailableHardwareIds(prevIds => [...new Set([...prevIds, newRecord.hardware_id])]);
                }
                return updated;
              });
            }
          )
          .subscribe();

        return () => {
          channel.unsubscribe();
        };
      } catch (err) {
        setError("Error: " + (err instanceof Error ? err.message : "Desconocido"));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Aplicar filtros cuando cambia el hardware filter
  useEffect(() => {
    if (!pedidoIngresado) return;
    
    let filtered = allData.filter(item => item.id_pedido === numeroPedidoInput);
    
    if (filterHardwareId) {
      filtered = filtered.filter(item => item.hardware_id === filterHardwareId);
    }
    
    setFilteredData(filtered);
  }, [allData, filterHardwareId, pedidoIngresado, numeroPedidoInput]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSubmitPedido = () => {
    if (!numeroPedidoInput.trim()) {
      setPedidoError("Por favor, ingresa un número de pedido.");
      return;
    }
    
    // Verificar si el pedido existe en los datos
    const pedidoExiste = allData.some(item => item.id_pedido === numeroPedidoInput);
    
    if (!pedidoExiste) {
      setPedidoError(`No se encontró el pedido "${numeroPedidoInput}". Verifica el número e inténtalo nuevamente.`);
      return;
    }
    
    setPedidoError("");
    setPedidoIngresado(true);
    
    setChatMessages([
      { role: "assistant", content: `Hola! Soy el asistente de Log-Cold. Estás monitoreando el pedido ${numeroPedidoInput}. Puedes consultarme sobre: estado, temperatura, humedad, ubicación, alertas, hardware. ¿Qué deseas saber?` }
    ]);
  };

  const latestData = filteredData[0];

  const analyzeData = () => {
    if (filteredData.length === 0) return null;
    const latest = filteredData[0];
    const avgTemp = filteredData.reduce((sum, d) => sum + d.temperatura, 0) / filteredData.length;
    const avgHum = filteredData.reduce((sum, d) => sum + d.humedad, 0) / filteredData.length;
    const alertCount = filteredData.filter(d => d.alerta !== "OK").length;
    let status = "OPTIMO";
    if (latest.temperatura < 2 || latest.temperatura > 8) status = "ALERTA TEMPERATURA";
    if (latest.humedad < 60 || latest.humedad > 95) status = "ALERTA HUMEDAD";
    if (latest.alerta !== "OK") status = "ALERTA ACTIVA";
    return { status, latest, avgTemp, avgHum, alertCount, total: filteredData.length };
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);

    setTimeout(() => {
      let response = "";
      const lowerMsg = userMessage.toLowerCase();
      const analysis = analyzeData();

      if (!analysis) {
        response = filteredData.length === 0 
          ? "No hay datos disponibles para el pedido seleccionado."
          : "No hay datos disponibles.";
      } else {
        if (lowerMsg.includes("estado") || lowerMsg.includes("como")) {
          response = `Estado: ${analysis.status}\nTemp: ${analysis.latest.temperatura.toFixed(1)}C\nHumedad: ${analysis.latest.humedad.toFixed(1)}%\nUbicacion: ${analysis.latest.latitud.toFixed(4)}, ${analysis.latest.longitud.toFixed(4)}\nHardware ID: ${analysis.latest.hardware_id}`;
        } else if (lowerMsg.includes("temp")) {
          response = `Temperatura actual: ${analysis.latest.temperatura.toFixed(1)}C\nPromedio: ${analysis.avgTemp.toFixed(1)}C\nRango optimo: 2-8C`;
        } else if (lowerMsg.includes("hum")) {
          response = `Humedad actual: ${analysis.latest.humedad.toFixed(1)}%\nPromedio: ${analysis.avgHum.toFixed(1)}%\nRango optimo: 60-95%`;
        } else if (lowerMsg.includes("ubic") || lowerMsg.includes("gps") || lowerMsg.includes("donde")) {
          response = `Ubicacion GPS:\nLat: ${analysis.latest.latitud.toFixed(6)}\nLon: ${analysis.latest.longitud.toFixed(6)}`;
        } else if (lowerMsg.includes("alerta")) {
          response = analysis.alertCount > 0 ? `Hay ${analysis.alertCount} alertas en ${analysis.total} lecturas.` : "No hay alertas activas.";
        } else if (lowerMsg.includes("hardware")) {
          response = `Hardware ID: ${analysis.latest.hardware_id}`;
        } else {
          response = "Pregunta sobre: estado, temperatura, humedad, ubicacion, alertas, hardware";
        }
      }
      setChatMessages(prev => [...prev, { role: "assistant", content: response }]);
    }, 300);
  };

  const clearFilters = () => {
    setFilterHardwareId("");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-CL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.centerContent}>
          <RefreshCwIcon style={{ width: 48, height: 48, color: "#22d3ee", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#94a3b8", marginTop: 16 }}>Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.centerContent}>
          <AlertTriangleIcon style={{ width: 48, height: 48, color: "#f87171" }} />
          <h2 style={{ margin: "16px 0 8px" }}>Error</h2>
          <p style={{ color: "#94a3b8" }}>{error}</p>
          <button onClick={() => window.location.reload()} style={styles.retryButton}>Reintentar</button>
        </div>
      </div>
    );
  }

  // Si no se ha ingresado el número de pedido, mostrar pantalla de ingreso
  if (!pedidoIngresado) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerLeft}>
              <a href="/" style={styles.backButton}>
                <ArrowLeftIcon style={{ width: 20, height: 20 }} />
              </a>
              <div>
                <h1 style={styles.title}>Log-Cold Analytics</h1>
                <p style={styles.subtitle}>Monitoreo en tiempo real</p>
              </div>
            </div>
          </div>
        </header>
        <main style={{ ...styles.main, justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 80px)" }}>
          <div style={{ maxWidth: "500px", width: "100%" }}>
            <div style={styles.pedidoInputContainer}>
              <BotIcon style={{ width: 48, height: 48, color: "#22d3ee", marginBottom: 16 }} />
              <h2 style={{ fontSize: "20px", marginBottom: 8 }}>Bienvenido a Log-Cold</h2>
              <p style={{ color: "#94a3b8", marginBottom: 16 }}>
                Para acceder al monitoreo de tu pedido, por favor ingresa tu número de pedido.
              </p>
              <input
                type="text"
                value={numeroPedidoInput}
                onChange={(e) => setNumeroPedidoInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitPedido()}
                placeholder="Ej: 1001"
                style={styles.pedidoInput}
              />
              {pedidoError && <p style={styles.errorText}>{pedidoError}</p>}
              <div>
                <button onClick={handleSubmitPedido} style={styles.submitButton}>
                  Acceder al monitoreo
                </button>
              </div>
            </div>
          </div>
        </main>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (allData.length === 0) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.centerContent}>
          <AlertTriangleIcon style={{ width: 48, height: 48, color: "#fbbf24" }} />
          <h2 style={{ margin: "16px 0 8px" }}>Sin datos en tiempo real</h2>
          <p style={{ color: "#94a3b8" }}>No hay datos de telemetria disponibles.</p>
          <button onClick={() => window.location.reload()} style={styles.retryButton}>Reintentar</button>
        </div>
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerLeft}>
              <a href="/" style={styles.backButton}>
                <ArrowLeftIcon style={{ width: 20, height: 20 }} />
              </a>
              <div>
                <h1 style={styles.title}>Log-Cold Analytics</h1>
                <p style={styles.subtitle}>Monitoreo en tiempo real - Pedido: {numeroPedidoInput}</p>
              </div>
            </div>
            <div style={styles.statusBadge}>
              <span style={styles.statusDot} />
              <span style={{ fontSize: 14, color: "#4ade80" }}>Conectado</span>
            </div>
          </div>
        </header>
        <main style={{ ...styles.main, justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 80px)" }}>
          <div style={styles.card}>
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
              <AlertTriangleIcon style={{ width: 48, height: 48, marginBottom: 16 }} />
              <p>No hay registros para el pedido {numeroPedidoInput}</p>
              <button onClick={() => window.location.reload()} style={{ ...styles.retryButton, marginTop: 16 }}>Volver a intentar</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const hasActiveFilter = filterHardwareId !== "";

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <a href="/" style={styles.backButton}>
              <ArrowLeftIcon style={{ width: 20, height: 20 }} />
            </a>
            <div>
              <h1 style={styles.title}>Log-Cold Analytics</h1>
              <p style={styles.subtitle}>Monitoreo en tiempo real - Pedido: {numeroPedidoInput}</p>
            </div>
          </div>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot} />
            <span style={{ fontSize: 14, color: "#4ade80" }}>Conectado</span>
          </div>
        </div>
      </header>

      <main style={{ ...styles.main, ...(isDesktop ? styles.mainDesktop : {}) }}>
        <div style={styles.leftColumn}>
          {/* Filtro solo por Hardware */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <SearchIcon style={{ width: 16, height: 16, color: "#22d3ee" }} />
              Filtrar por Hardware
            </div>
            <div style={styles.filterContainer}>
              <select
                value={filterHardwareId}
                onChange={(e) => setFilterHardwareId(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">Todos los hardware</option>
                {availableHardwareIds.map(hid => (
                  <option key={hid} value={hid}>{hid}</option>
                ))}
              </select>
              
              {hasActiveFilter && (
                <button onClick={clearFilters} style={styles.clearButton}>
                  Limpiar filtro
                </button>
              )}
            </div>
            {hasActiveFilter && (
              <div style={{ padding: "0 12px 12px 12px" }}>
                <div style={styles.filterInfo}>
                  Mostrando {filteredData.length} registros · Hardware: {filterHardwareId}
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div style={{ ...styles.statsGrid, gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)" }}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>
                <ThermometerIcon style={{ width: 16, height: 16 }} />
                <span>Temperatura</span>
              </div>
              <p style={{ ...styles.statValue, color: "#22d3ee" }}>{latestData.temperatura.toFixed(1)}°C</p>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>
                <DropletIcon style={{ width: 16, height: 16 }} />
                <span>Humedad</span>
              </div>
              <p style={{ ...styles.statValue, color: "#60a5fa" }}>{latestData.humedad.toFixed(1)}%</p>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>
                <MapPinIcon style={{ width: 16, height: 16 }} />
                <span>Ubicacion</span>
              </div>
              <p style={{ fontSize: 12, fontFamily: "monospace", color: "#4ade80" }}>
                {latestData.latitud.toFixed(4)}<br />{latestData.longitud.toFixed(4)}
              </p>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>
                {latestData.alerta === "OK" ? (
                  <CheckCircleIcon style={{ width: 16, height: 16, color: "#4ade80" }} />
                ) : (
                  <AlertTriangleIcon style={{ width: 16, height: 16, color: "#f87171" }} />
                )}
                <span>Estado</span>
              </div>
              <p style={{ ...styles.statValue, fontSize: 18, color: latestData.alerta === "OK" ? "#4ade80" : "#f87171" }}>
                {latestData.alerta}
              </p>
            </div>
          </div>

          {/* Mapa */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <MapPinIcon style={{ width: 16, height: 16, color: "#22d3ee" }} />
              Ubicacion GPS
            </div>
            <div style={styles.mapContainer}>
              <iframe
                title="Mapa"
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${latestData.longitud - 0.01},${latestData.latitud - 0.01},${latestData.longitud + 0.01},${latestData.latitud + 0.01}&layer=mapnik&marker=${latestData.latitud},${latestData.longitud}`}
              />
            </div>
          </div>

          {/* Tabla de historial */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>Historial de Datos</div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Fecha</th>
                    <th style={styles.th}>Temp</th>
                    <th style={styles.th}>Humedad</th>
                    <th style={styles.th}>Ubicacion</th>
                    <th style={styles.th}>Hardware ID</th>
                    <th style={styles.th}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => (
                    <tr key={row.id}>
                      <td style={styles.td}>{formatDate(row.created_at)}</td>
                      <td style={{ ...styles.td, color: row.temperatura >= 2 && row.temperatura <= 8 ? "#22d3ee" : "#f87171" }}>
                        {row.temperatura.toFixed(1)}°C
                      </td>
                      <td style={{ ...styles.td, color: row.humedad >= 60 && row.humedad <= 95 ? "#60a5fa" : "#fbbf24" }}>
                        {row.humedad.toFixed(1)}%
                      </td>
                      <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 12, color: "#94a3b8" }}>
                        {row.latitud.toFixed(4)}, {row.longitud.toFixed(4)}
                      </td>
                      <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 12, color: "#94a3b8" }}>
                        {row.hardware_id}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: row.alerta === "OK" ? "rgba(74, 222, 128, 0.2)" : "rgba(248, 113, 113, 0.2)",
                          color: row.alerta === "OK" ? "#4ade80" : "#f87171",
                        }}>
                          {row.alerta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div style={styles.chatContainer}>
          <div style={styles.cardHeader}>
            <BotIcon style={{ width: 20, height: 20, color: "#22d3ee" }} />
            Asistente Log-Cold
            <span style={{ fontSize: 12, backgroundColor: "#0891b2", padding: "2px 8px", borderRadius: 12, marginLeft: 8 }}>
              Pedido: {numeroPedidoInput}
            </span>
          </div>
          <div style={styles.chatMessages}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={msg.role === "user" ? styles.userMessage : styles.assistantMessage}>
                {msg.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={styles.chatInputContainer}>
            <div style={styles.chatInputRow}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Pregunta sobre tu pedido..."
                style={styles.chatInput}
              />
              <button onClick={handleSendMessage} style={styles.chatButton}>
                <SendIcon style={{ width: 20, height: 20 }} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
              Prueba: estado, temperatura, humedad, ubicacion, alertas, hardware
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}