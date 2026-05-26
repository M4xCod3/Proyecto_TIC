import { useState, useEffect, useRef } from "react";
import React from "react";
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
  PackageIcon,
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

const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

export const styles = {
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
    flexWrap: "wrap", // Permite que el estado baje si la pantalla es muy angosta (móviles viejos)
    gap: "8px",
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
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as React.CSSProperties,

  title: {
    fontSize: isMobile ? "18px" : "20px", // Texto un pelo más chico en móviles
    fontWeight: "bold",
    color: "#22d3ee",
    margin: 0,
  } as React.CSSProperties,

  subtitle: {
    fontSize: "13px",
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
    boxShadow: "0 0 8px #4ade80",
  } as React.CSSProperties,

  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: isMobile ? "12px" : "16px", // Menos espacio muerto en las esquinas de celulares
    display: "grid",
    // CAMBIO CLAVE: Si es móvil usa 1 sola columna. Si es desktop usa 2 columnas (2fr 1fr)
    gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", 
    gap: "16px",
  } as React.CSSProperties,

  // Mantenemos este por compatibilidad, aunque la lógica ya se integró directo en 'main'
  mainDesktop: {
    gridTemplateColumns: "2fr 1fr",
  } as React.CSSProperties,

  leftColumn: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
    width: "100%", // Asegura que no desborde horizontalmente
  } as React.CSSProperties,

  statsGrid: {
    display: "grid",
    // En móviles muy chicos las estadísticas bajan una por fila para no apretar los números
    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
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
    fontSize: isMobile ? "20px" : "24px", // Se ajusta para que calce bien en pantallas chicas
    fontWeight: "bold",
    margin: 0,
  } as React.CSSProperties,

  card: {
    backgroundColor: "#1e293b",
    borderRadius: "8px",
    border: "1px solid #334155",
    overflow: "hidden",
    width: "100%",
  } as React.CSSProperties,

  cardHeader: {
    padding: "12px",
    borderBottom: "1px solid #334155",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#1e293b",
  } as React.CSSProperties,

  mapContainer: {
    height: isMobile ? "260px" : "350px", // Un mapa un poco más bajo en móviles para no comerse toda la pantalla vertical
    width: "100%",
    backgroundColor: "#334155",
  } as React.CSSProperties,

  tableContainer: {
    overflowX: "auto" as const, // Permite scroll horizontal si la tabla de datos del tracker es muy ancha
    maxHeight: "300px",
    overflowY: "auto" as const,
    WebkitOverflowScrolling: "touch" as const, // Scroll fluido en iOS/Android
  } as React.CSSProperties,

  table: {
    width: "100%",
    fontSize: "13px", // Reducimos un punto para que quepan más datos de telemetría sin romper columnas
    borderCollapse: "collapse" as const,
    minWidth: isMobile ? "500px" : "auto", // Fuerza scroll horizontal interno en lugar de achatar celdas
  } as React.CSSProperties,

  th: {
    backgroundColor: "#334155",
    padding: "8px 12px",
    textAlign: "left" as const,
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
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
    height: isMobile ? "450px" : "600px", // Reducido para que conviva mejor con el resto del layout móvil abajo
    width: "100%",
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
    padding: "16px", // Evita que la caja de login/búsqueda pegue en los bordes del celular
  } as React.CSSProperties,

  centerContent: {
    textAlign: "center" as const,
    padding: isMobile ? "12px" : "32px",
    maxWidth: "450px",
    width: "100%",
  } as React.CSSProperties,

  searchBox: {
    backgroundColor: "#1e293b",
    padding: isMobile ? "20px 16px" : "32px", // Menos padding en celular para aprovechar espacio
    borderRadius: "12px",
    border: "1px solid #334155",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
    width: "100%",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,

  searchTitle: {
    fontSize: isMobile ? "20px" : "24px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#ffffff",
  } as React.CSSProperties,

  searchInput: {
    width: "100%",
    backgroundColor: "#0f172a",
    border: "1px solid #475569",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#ffffff",
    fontSize: "16px",
    marginTop: isMobile ? "16px" : "24px",
    marginBottom: "16px",
    outline: "none",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,

  searchMainButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#0891b2",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background-color 0.2s",
  } as React.CSSProperties,

  badge: {
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "12px",
  } as React.CSSProperties,
};

export default function Analytics() {
  const [activePedidoId, setActivePedidoId] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  
  const [data, setData] = useState<PedidoMonitoreo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Efecto principal que carga los datos SOLO cuando hay un ID activo
  useEffect(() => {
    if (!activePedidoId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      if (!supabase) {
        setError("Supabase no configurado");
        setLoading(false);
        return;
      }

      try {
        // Consultamos solo los datos del pedido ingresado
        const { data: pedidos, error: queryError } = await supabase
          .from("pedidos_monitoreo")
          .select("*")
          .eq("id_pedido", activePedidoId)
          .order("created_at", { ascending: false })
          .limit(500);

        if (queryError) {
          setError("Error: " + queryError.message);
          setLoading(false);
          return;
        }

        setData(pedidos || []);
        
        // Mensaje de bienvenida del chat personalizado
        setChatMessages([
          { role: "assistant", content: `Hola! Soy el asistente de Log-Cold. Estoy monitoreando el pedido #${activePedidoId}. ¿Qué necesitas saber?` }
        ]);
        
        setLoading(false);

        // Suscripción en tiempo real solo para este pedido específico
        const channel = supabase
          .channel(`pedido_realtime_${activePedidoId}`)
          .on(
            "postgres_changes",
            { 
              event: "INSERT", 
              schema: "public", 
              table: "pedidos_monitoreo",
              filter: `id_pedido=eq.${activePedidoId}`
            },
            (payload) => {
              const newRecord = payload.new as PedidoMonitoreo;
              setData(prev => [newRecord, ...prev].slice(0, 500));
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
  }, [activePedidoId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActivePedidoId(searchInput.trim());
    }
  };

  const handleReset = () => {
    setActivePedidoId("");
    setSearchInput("");
    setData([]);
    setChatMessages([]);
  };

  const analyzeData = () => {
    if (data.length === 0) return null;
    const latest = data[0];
    const avgTemp = data.reduce((sum, d) => sum + d.temperatura, 0) / data.length;
    const avgHum = data.reduce((sum, d) => sum + d.humedad, 0) / data.length;
    const alertCount = data.filter(d => d.alerta !== "OK").length;
    let status = "OPTIMO";
    if (latest.temperatura < 2 || latest.temperatura > 8) status = "ALERTA TEMPERATURA";
    if (latest.humedad < 60 || latest.humedad > 95) status = "ALERTA HUMEDAD";
    if (latest.alerta !== "OK") status = "ALERTA ACTIVA";
    return { status, latest, avgTemp, avgHum, alertCount, total: data.length };
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
        response = "No hay datos disponibles para este pedido aún.";
      } else {
        if (lowerMsg.includes("estado") || lowerMsg.includes("como")) {
          response = `Estado: ${analysis.status}\nTemp: ${analysis.latest.temperatura.toFixed(1)}C\nHumedad: ${analysis.latest.humedad.toFixed(1)}%\nUbicacion: ${analysis.latest.latitud.toFixed(4)}, ${analysis.latest.longitud.toFixed(4)}`;
        } else if (lowerMsg.includes("temp")) {
          response = `Temperatura actual: ${analysis.latest.temperatura.toFixed(1)}C\nPromedio del viaje: ${analysis.avgTemp.toFixed(1)}C\nRango optimo: 2-8C`;
        } else if (lowerMsg.includes("hum")) {
          response = `Humedad actual: ${analysis.latest.humedad.toFixed(1)}%\nPromedio del viaje: ${analysis.avgHum.toFixed(1)}%\nRango optimo: 60-95%`;
        } else if (lowerMsg.includes("ubic") || lowerMsg.includes("gps") || lowerMsg.includes("donde")) {
          response = `Ubicacion GPS actual:\nLat: ${analysis.latest.latitud.toFixed(6)}\nLon: ${analysis.latest.longitud.toFixed(6)}`;
        } else if (lowerMsg.includes("alerta") || lowerMsg.includes("problema")) {
          response = analysis.alertCount > 0 ? `Se han registrado ${analysis.alertCount} alertas térmicas en este trayecto.` : "El trayecto se ha mantenido sin alertas, todo OK.";
        } else {
          response = "Puedo informarte sobre: estado general, temperatura, humedad, ubicación GPS o alertas del pedido.";
        }
      }
      setChatMessages(prev => [...prev, { role: "assistant", content: response }]);
    }, 400);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-CL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  // 1. PANTALLA DE INGRESO (Login del Tracking)
  if (!activePedidoId) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.centerContent}>
          <div style={styles.searchBox}>
            <PackageIcon style={{ width: 48, height: 48, color: "#22d3ee", margin: "0 auto 16px" }} />
            <h2 style={styles.searchTitle}>Tracking Log-Cold</h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
              Ingresa el identificador de tu paquete para monitorear la cadena de frío en tiempo real.
            </p>
            
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Ej: 1001"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={styles.searchInput}
                autoFocus
              />
              <button 
                type="submit" 
                style={{
                  ...styles.searchMainButton,
                  opacity: searchInput.trim() ? 1 : 0.5,
                  cursor: searchInput.trim() ? "pointer" : "not-allowed"
                }}
                disabled={!searchInput.trim()}
              >
                <SearchIcon style={{ width: 20, height: 20 }} />
                Rastrear Pedido
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // PANTALLAS DE CARGA Y ERROR PARA EL DASHBOARD
  if (loading) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.centerContent}>
          <RefreshCwIcon style={{ width: 48, height: 48, color: "#22d3ee", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          <p style={{ color: "#94a3b8", marginTop: 16 }}>Sincronizando telemetría del pedido #{activePedidoId}...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.centerContent}>
          <AlertTriangleIcon style={{ width: 48, height: 48, color: "#f87171", margin: "0 auto" }} />
          <h2 style={{ margin: "16px 0 8px" }}>Error de Conexión</h2>
          <p style={{ color: "#94a3b8" }}>{error}</p>
          <button onClick={handleReset} style={{...styles.searchMainButton, marginTop: "24px"}}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.centerContent}>
          <PackageIcon style={{ width: 48, height: 48, color: "#fbbf24", margin: "0 auto" }} />
          <h2 style={{ margin: "16px 0 8px" }}>Pedido No Encontrado</h2>
          <p style={{ color: "#94a3b8" }}>No hemos recibido datos de telemetría para el pedido <strong>#{activePedidoId}</strong>. Asegúrate de que el Gateway esté encendido y transmitiendo.</p>
          <button onClick={handleReset} style={{...styles.searchMainButton, marginTop: "24px"}}>Buscar otro pedido</button>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD PRINCIPAL (Con datos)
  const latestData = data[0];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <button onClick={handleReset} style={styles.backButton} title="Buscar otro pedido">
              <ArrowLeftIcon style={{ width: 20, height: 20 }} />
            </button>
            <div>
              <h1 style={styles.title}>Pedido #{activePedidoId}</h1>
              <p style={styles.subtitle}>Log-Cold Tracking System</p>
            </div>
          </div>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot} />
            <span style={{ fontSize: 14, color: "#4ade80", fontWeight: 600 }}>En Tránsito</span>
          </div>
        </div>
      </header>

      <main style={{ ...styles.main, ...(isDesktop ? styles.mainDesktop : {}) }}>
        <div style={styles.leftColumn}>
          
          {/* Stats Principales */}
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
                <span>Ubicación GPS</span>
              </div>
              <p style={{ fontSize: 12, fontFamily: "monospace", color: "#e2e8f0", marginTop: "4px" }}>
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
                <span>Cadena de Frío</span>
              </div>
              <p style={{ ...styles.statValue, fontSize: 18, color: latestData.alerta === "OK" ? "#4ade80" : "#f87171" }}>
                {latestData.alerta}
              </p>
            </div>
          </div>

          {/* Mapa Corregido */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <MapPinIcon style={{ width: 18, height: 18, color: "#22d3ee" }} />
              Ubicación en Tiempo Real
            </div>
            <div style={styles.mapContainer}>
              <iframe
                key={`${latestData.latitud}-${latestData.longitud}`}
                title="Mapa de Tracking"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${latestData.longitud - 0.005},${latestData.latitud - 0.005},${latestData.longitud + 0.005},${latestData.latitud + 0.005}&layer=mapnik&marker=${latestData.latitud},${latestData.longitud}`}
              />
            </div>
          </div>

          {/* Historial (Tabla) */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>Historial de Telemetría</div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Hora Local</th>
                    <th style={styles.th}>Temp</th>
                    <th style={styles.th}>Humedad</th>
                    <th style={styles.th}>Sensor ID</th>
                    <th style={styles.th}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.id}>
                      <td style={styles.td}>{formatDate(row.created_at)}</td>
                      <td style={{ ...styles.td, color: row.temperatura >= 2 && row.temperatura <= 8 ? "#22d3ee" : "#f87171", fontWeight: 500 }}>
                        {row.temperatura.toFixed(1)}°C
                      </td>
                      <td style={{ ...styles.td, color: row.humedad >= 60 && row.humedad <= 95 ? "#60a5fa" : "#fbbf24" }}>
                        {row.humedad.toFixed(1)}%
                      </td>
                      <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 12, color: "#94a3b8" }}>
                        {row.hardware_id}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: row.alerta === "OK" ? "rgba(74, 222, 128, 0.15)" : "rgba(248, 113, 113, 0.15)",
                          color: row.alerta === "OK" ? "#4ade80" : "#f87171",
                          border: `1px solid ${row.alerta === "OK" ? "rgba(74, 222, 128, 0.3)" : "rgba(248, 113, 113, 0.3)"}`
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

        {/* Chat de Asistencia */}
        <div style={styles.chatContainer}>
          <div style={styles.cardHeader}>
            <BotIcon style={{ width: 20, height: 20, color: "#22d3ee" }} />
            Soporte IA del Pedido
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
                placeholder="Consulta el estado térmico..."
                style={styles.chatInput}
              />
              <button onClick={handleSendMessage} style={styles.chatButton}>
                <SendIcon style={{ width: 20, height: 20 }} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
              Pregunta por: estado, temperatura, alertas o ubicación.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}