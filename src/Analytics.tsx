import React, { useState, useEffect, useRef } from "react";
// 🌟 1. Importación oficial de Supabase
import { createClient } from "@supabase/supabase-js";

import { 
  Package as PackageIcon, 
  Search as SearchIcon, 
  RefreshCw as RefreshCwIcon, 
  AlertTriangle as AlertTriangleIcon, 
  ArrowLeft as ArrowLeftIcon, 
  Thermometer as ThermometerIcon, 
  Droplet as DropletIcon, 
  MapPin as MapPinIcon, 
  CheckCircle as CheckCircleIcon, 
  Bot as BotIcon, 
  Send as SendIcon 
} from "lucide-react";

// 🌟 2. Inicialización segura del cliente con soporte para Astro y Vite
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ ALERTA LOG-COLD: No se encontraron las variables de entorno de Supabase en tu archivo .env");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interfaces de la Base de Datos y Componentes
interface PedidoMonitoreo {
  idx: number;
  id: number;
  created_at: string;
  latitud: number;
  longitud: number;
  temperatura: number;
  humedad: number;
  alerta: string;
  hardware_id: string;
  id_pedido: string; 
  id_local: string;  
}

interface LocalItem {
  id: string;         // UUID del local
  nombre_local: string; // Columna real de tu tabla 'locales'
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Analytics() {
  // Estados de control de Filtros de Búsqueda
  const [activePedidoId, setActivePedidoId] = useState<string>("");
  const [activeLocalId, setActiveLocalId] = useState<string>(""); 
  const [searchInput, setSearchInput] = useState<string>(""); 
  const [localInput, setLocalInput] = useState<string>("");     

  // Lista de locales cargados desde Supabase
  const [localesList, setLocalesList] = useState<LocalItem[]>([]);

  // Estados del Dashboard de Datos
  const [data, setData] = useState<PedidoMonitoreo[]>([]);
  const [pedidoEstado, setPedidoEstado] = useState<string>("En tránsito");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados del Asistente Virtual
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // EFECTO 1: Carga inicial de locales desde Supabase
  useEffect(() => {
    const cargarLocales = async () => {
      try {
        const { data: locales, error: localesError } = await supabase
          .from("locales")
          .select("id, nombre_local") 
          .order("nombre_local", { ascending: true });

        if (!localesError && locales) {
          setLocalesList(locales);
        } else if (localesError) {
          console.error("Error de query en Supabase:", localesError.message);
        }
      } catch (err) {
        console.error("Error crítico de red al obtener los locales:", err);
      }
    };

    cargarLocales();
  }, []);

  // EFECTO 2: Consulta de Telemetría Realtime con payload tipado explícitamente
  useEffect(() => {
    if (!activePedidoId || !activeLocalId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: pedidos, error: queryError } = await supabase
          .from("pedidos_monitoreo")
          .select("*")
          .eq("id_pedido", activePedidoId)
          .eq("id_local", activeLocalId) 
          .order("created_at", { ascending: false })
          .limit(500);

        if (queryError) {
          setError("Error en la consulta: " + queryError.message);
          setLoading(false);
          return;
        }

        setData(pedidos || []);
        
        const nombreLocal = localesList.find(l => l.id === activeLocalId)?.nombre_local || "Local seleccionado";

        setChatMessages([
          { 
            role: "assistant", 
            content: `¡Hola! Soy el asistente analítico de Log-Cold. Estoy monitoreando el pedido #${activePedidoId} de la sucursal: "${nombreLocal}". ¿Qué métrica deseas evaluar?` 
          }
        ]);
        
        setLoading(false);

        // Suscripción en Tiempo Real vía WebSockets a PostgreSQL
        const telemetriaChannel = supabase
          .channel(`pedido_realtime_${activeLocalId}_${activePedidoId}`)
          .on(
            "postgres_changes",
            { 
              event: "INSERT", 
              schema: "public", 
              table: "pedidos_monitoreo",
              filter: `id_pedido=eq.${activePedidoId}`
            },
            (payload: any) => { // 🌟 Corregido: Evita error implícito 'any'
              const newRecord = payload.new as PedidoMonitoreo;
              if (newRecord.id_local === activeLocalId) {
                setData(prev => [newRecord, ...prev].slice(0, 500));
              }
            }
          )
          .subscribe();

        return () => {
          telemetriaChannel.unsubscribe();
        };
      } catch (err) {
        setError("Error inesperado: " + (err instanceof Error ? err.message : "Desconocido"));
        setLoading(false);
      }
    };

    fetchData();
  }, [activePedidoId, activeLocalId, localesList]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim() && localInput) {
      setActivePedidoId(searchInput.trim());
      setActiveLocalId(localInput);
    }
  };

  const handleReset = () => {
    setActivePedidoId("");
    setActiveLocalId("");
    setSearchInput("");
    setLocalInput("");
    setData([]);
    setPedidoEstado("En tránsito");
    setChatMessages([]);
  };

  const analyzeData = () => {
    if (data.length === 0) return null;
    const latest = data[0];
    const avgTemp = data.reduce((sum, d) => sum + d.temperatura, 0) / data.length;
    const avgHum = data.reduce((sum, d) => sum + d.humedad, 0) / data.length;
    const alertCount = data.filter(d => d.alerta !== "OK").length;
    
    let status = pedidoEstado.toUpperCase(); 
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
        response = "No hay lecturas de sensores disponibles para procesar la consulta.";
      } else {
        if (lowerMsg.includes("estado") || lowerMsg.includes("como")) {
          response = `Estado general: ${pedidoEstado}\nAlertas del sensor: ${analysis.status}\nTemp actual: ${analysis.latest.temperatura.toFixed(1)}°C\nHumedad: ${analysis.latest.humedad.toFixed(1)}%\nCoordenadas: ${analysis.latest.latitud.toFixed(4)}, ${analysis.latest.longitud.toFixed(4)}`;
        } else if (lowerMsg.includes("temp")) {
          response = `Temperatura actual: ${analysis.latest.temperatura.toFixed(1)}°C\nPromedio del trayecto: ${analysis.avgTemp.toFixed(1)}°C\nRango de seguridad: 2°C a 8°C`;
        } else if (lowerMsg.includes("hum")) {
          response = `Humedad de la carga: ${analysis.latest.humedad.toFixed(1)}%\nPromedio histórico: ${analysis.avgHum.toFixed(1)}%\nRango óptimo: 60% a 95%`;
        } else if (lowerMsg.includes("ubic") || lowerMsg.includes("gps") || lowerMsg.includes("donde")) {
          response = `Coordenadas GPS del ESP32:\nLatitud: ${analysis.latest.latitud.toFixed(6)}\nLongitud: ${analysis.latest.longitud.toFixed(6)}`;
        } else if (lowerMsg.includes("alerta") || lowerMsg.includes("problema")) {
          response = analysis.alertCount > 0 
            ? `Atención: Se han registrado ${analysis.alertCount} anomalías térmicas/humedad en este envío.` 
            : "La cadena de frío está perfectamente integrada. Sin alertas registradas.";
        } else {
          response = "Puedo ayudarte con reportes específicos de: estado de la carga, temperatura de los sensores DHT22, porcentaje de humedad, coordenadas GPS o análisis de alertas.";
        }
      }
      setChatMessages(prev => [...prev, { role: "assistant", content: response }]);
    }, 400);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-CL", { 
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" 
    });
  };

  const getStatusColor = () => {
    switch (pedidoEstado.toLowerCase()) {
      case "en tránsito":
      case "en transito":
        return { dot: "#4ade80", text: "#4ade80", bg: "rgba(74, 222, 128, 0.1)" };
      case "entregado":
        return { dot: "#60a5fa", text: "#60a5fa", bg: "rgba(96, 165, 250, 0.1)" };
      case "crítico":
      case "critico":
        return { dot: "#f87171", text: "#f87171", bg: "rgba(248, 113, 113, 0.1)" };
      default:
        return { dot: "#94a3b8", text: "#94a3b8", bg: "rgba(148, 147, 184, 0.1)" };
    }
  };

  const currentStatusStyle = getStatusColor();

  // VISTA 1: INTERFAZ DE LOG-IN / BÚSQUEDA
  if (!activePedidoId || !activeLocalId) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.centerContent}>
          <div style={styles.searchBox}>
            <PackageIcon style={{ width: 48, height: 48, color: "#22d3ee", margin: "0 auto 16px" }} />
            <h2 style={styles.searchTitle}>Tracking Log-Cold</h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "24px" }}>
              Monitoreo telemático de la cadena de frío en tiempo real.
            </p>
            
            <form onSubmit={handleSearchSubmit}>
              {/* Desplegable Dinámico de Locales */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Establecimiento / Local Comercial
                </label>
                <select
                  value={localInput}
                  onChange={(e) => setLocalInput(e.target.value)}
                  style={styles.selectInput}
                  required
                >
                  <option value="" disabled>-- Selecciona un Local --</option>
                  {localesList.map((local) => (
                    <option key={local.id} value={local.id}>
                      {local.nombre_local} 
                    </option>
                  ))}
                </select>
              </div>

              {/* Input de Código de Pedido */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Código Identificador del Pedido
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1001"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={styles.searchInput}
                  required
                />
              </div>

              <button 
                type="submit" 
                style={{
                  ...styles.searchMainButton,
                  opacity: (searchInput.trim() && localInput) ? 1 : 0.5,
                  cursor: (searchInput.trim() && localInput) ? "pointer" : "not-allowed"
                }}
                disabled={!searchInput.trim() || !localInput}
              >
                <SearchIcon style={{ width: 18, height: 18, marginRight: 8 }} />
                Rastrear Envío
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // VISTA 2: PANTALLA DE CARGA
  if (loading) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.centerContent}>
          <RefreshCwIcon style={{ width: 48, height: 48, color: "#22d3ee", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          <p style={{ color: "#94a3b8", marginTop: 16 }}>Sincronizando flujo de telemetría...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // VISTA 3: PANTALLA DE ERROR DE CONEXIÓN
  if (error) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.centerContent}>
          <AlertTriangleIcon style={{ width: 48, height: 48, color: "#f87171", margin: "0 auto" }} />
          <h2 style={{ margin: "16px 0 8px", color: "#f87171" }}>Fallo de Sincronización</h2>
          <p style={{ color: "#94a3b8" }}>{error}</p>
          <button onClick={handleReset} style={{...styles.searchMainButton, marginTop: "24px"}}>Regresar al Inicio</button>
        </div>
      </div>
    );
  }

  // VISTA 4: PANTALLA DE ESPERA DE DATOS (Vacío)
  if (data.length === 0) {
    const nombreLocalActual = localesList.find(l => l.id === activeLocalId)?.nombre_local || activeLocalId;
    return (
      <div style={styles.centerScreen}>
        <div style={styles.centerContent}>
          <PackageIcon style={{ width: 48, height: 48, color: "#fbbf24", margin: "0 auto" }} />
          <h2 style={{ margin: "16px 0 8px" }}>Pedido Inicializado</h2>
          <p style={{ color: "#94a3b8", padding: "0 20px" }}>
            El viaje <strong>#{activePedidoId}</strong> de <strong>"{nombreLocalActual}"</strong> está registrado, pero el hardware nodo (ESP32) no ha emitido ráfagas de datos aún.
          </p>
          <button onClick={handleReset} style={{...styles.searchMainButton, marginTop: "24px"}}>Buscar otro Pedido</button>
        </div>
      </div>
    );
  }

  // VISTA 5: DASHBOARD DE RASTREO COMPLETO
  const latestData = data[0];
  const nombreLocalActivo = localesList.find(l => l.id === activeLocalId)?.nombre_local || activeLocalId;

  return (
    <div style={styles.container}>
      {/* Encabezado */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <button onClick={handleReset} style={styles.backButton} title="Buscar otro pedido">
              <ArrowLeftIcon style={{ width: 20, height: 20 }} />
            </button>
            <div>
              <h1 style={styles.title}>Pedido #{activePedidoId}</h1>
              <p style={styles.subtitle}>Log-Cold Tracking System — Sucursal: {nombreLocalActivo}</p>
            </div>
          </div>
          <div style={{ ...styles.statusBadge, backgroundColor: currentStatusStyle.bg, borderColor: currentStatusStyle.text }}>
            <span style={{ ...styles.statusDot, backgroundColor: currentStatusStyle.dot, boxShadow: `0 0 8px ${currentStatusStyle.dot}` }} />
            <span style={{ fontSize: 14, color: currentStatusStyle.text, fontWeight: 600 }}>{pedidoEstado}</span>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main style={{ ...styles.main, ...(isDesktop ? styles.mainDesktop : {}) }}>
        
        {/* Paneles de datos */}
        <div style={styles.leftColumn}>
          <div style={{ ...styles.statsGrid, gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)" }}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>
                <ThermometerIcon style={{ width: 16, height: 16 }} />
                <span>Temperatura</span>
              </div>
              <p style={{ ...styles.statValue, color: latestData.temperatura >= 2 && latestData.temperatura <= 8 ? "#22d3ee" : "#f87171" }}>
                {latestData.temperatura.toFixed(1)}°C
              </p>
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
              <p style={{ fontSize: 12, fontFamily: "monospace", color: "#e2e8f0", marginTop: "6px", lineHeight: "1.4" }}>
                Lat: {latestData.latitud.toFixed(4)}<br />Lon: {latestData.longitud.toFixed(4)}
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

          {/* Mapa */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <MapPinIcon style={{ width: 18, height: 18, color: "#22d3ee", marginRight: 8 }} />
              Posición Telemétrica Actual
            </div>
            <div style={styles.mapContainer}>
              <iframe
                key={`${latestData.latitud}-${latestData.longitud}`}
                title="Mapa OpenStreetMap"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${latestData.longitud - 0.005},${latestData.latitud - 0.005},${latestData.longitud + 0.005},${latestData.latitud + 0.005}&layer=mapnik&marker=${latestData.latitud},${latestData.longitud}`}
              />
            </div>
          </div>

          {/* Tabla de Historial */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>Historial de Muestreos Sincronizados</div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Hora Local (CL)</th>
                    <th style={styles.th}>Temperatura</th>
                    <th style={styles.th}>Humedad</th>
                    <th style={styles.th}>Hardware ID</th>
                    <th style={styles.th}>Alerta</th>
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

        {/* Panel de Chat */}
        <div style={styles.chatContainer}>
          <div style={styles.cardHeader}>
            <BotIcon style={{ width: 18, height: 18, color: "#22d3ee", marginRight: 8 }} />
            Asistente Inteligente de Ruta
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
                placeholder="Pregunta por la temperatura o alertas..."
                style={styles.chatInput}
              />
              <button onClick={handleSendMessage} style={styles.chatButton}>
                <SendIcon style={{ width: 18, height: 18 }} />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

// Estilos de Interfaz
const styles: { [key: string]: React.CSSProperties } = {
  centerScreen: {
    display: "flex", justifyContent: "center", alignItems: "center",
    minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", padding: "20px"
  },
  centerContent: { width: "100%", maxWidth: "420px", textAlign: "center" },
  searchBox: {
    backgroundColor: "#1e293b", padding: "32px", borderRadius: "16px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)", border: "1px solid #334155"
  },
  searchTitle: { fontSize: "24px", fontWeight: 700, color: "#f8fafc", marginBottom: "8px" },
  formGroup: {
    marginBottom: "20px", textAlign: "left", display: "flex", flexDirection: "column", gap: "6px"
  },
  formLabel: { color: "#94a3b8", fontSize: "12px", fontWeight: 500, display: "block" },
  selectInput: {
    width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #475569",
    backgroundColor: "#0f172a", color: "#f8fafc", fontSize: "14px", outline: "none",
    boxSizing: "border-box", display: "block", height: "46px"
  },
  searchInput: {
    width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #475569",
    backgroundColor: "#0f172a", color: "#f8fafc", fontSize: "14px", outline: "none",
    boxSizing: "border-box", display: "block", height: "46px"
  },
  searchMainButton: {
    width: "100%", padding: "12px", borderRadius: "8px", border: "none",
    backgroundColor: "#06b6d4", color: "#0f172a", fontWeight: 600, fontSize: "15px",
    display: "flex", justifyContent: "center", alignItems: "center", transition: "all 0.2s",
    marginTop: "10px", height: "46px"
  },
  container: {
    minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc",
    display: "flex", flexDirection: "column", fontFamily: "sans-serif"
  },
  header: { backgroundColor: "#1e293b", borderBottom: "1px solid #334155", padding: "16px 24px" },
  headerContent: { display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1400px", margin: "0 auto", width: "100%" },
  headerLeft: { display: "flex", alignItems: "center", gap: "16px" },
  backButton: {
    backgroundColor: "transparent", border: "1px solid #475569", color: "#94a3b8",
    padding: "8px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center"
  },
  title: { fontSize: "20px", fontWeight: 700, margin: 0 },
  subtitle: { fontSize: "13px", color: "#94a3b8", margin: "2px 0 0 0" },
  statusBadge: { display: "flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "20px", border: "1px solid" },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%" },
  main: { padding: "20px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "20px" },
  mainDesktop: { flexDirection: "row", alignItems: "flex-start" },
  leftColumn: { flex: 2, display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 },
  statsGrid: { display: "grid", gap: "12px", width: "100%" },
  statCard: { backgroundColor: "#1e293b", padding: "16px", borderRadius: "12px", border: "1px solid #334155", display: "flex", flexDirection: "column", justifyContent: "center" },
  statLabel: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#94a3b8" },
  statValue: { fontSize: "22px", fontWeight: 700, margin: "8px 0 0 0" },
  card: { backgroundColor: "#1e293b", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden", display: "flex", flexDirection: "column" },
  cardHeader: { padding: "14px 18px", borderBottom: "1px solid #334155", fontWeight: 600, fontSize: "14px", color: "#e2e8f0", display: "flex", alignItems: "center" },
  mapContainer: { height: "320px", width: "100%", backgroundColor: "#0f172a" },
  tableContainer: { overflowX: "auto", width: "100%" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" },
  th: { padding: "12px 18px", borderBottom: "1px solid #334155", color: "#94a3b8", fontWeight: 500 },
  td: { padding: "12px 18px", borderBottom: "1px solid #334155", color: "#e2e8f0" },
  badge: { padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600 },
  chatContainer: { flex: 1, backgroundColor: "#1e293b", borderRadius: "12px", border: "1px solid #334155", display: "flex", flexDirection: "column", height: "550px", position: "sticky", top: "20px" },
  chatMessages: { flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" },
  userMessage: { alignSelf: "flex-end", backgroundColor: "#06b6d4", color: "#0f172a", padding: "10px 14px", borderRadius: "12px 12px 0 12px", maxWidth: "80%", fontSize: "13px", fontWeight: 500 },
  assistantMessage: { alignSelf: "flex-start", backgroundColor: "#334155", color: "#f8fafc", padding: "10px 14px", borderRadius: "12px 12px 12px 0", maxWidth: "80%", fontSize: "13px", whiteSpace: "pre-line" },
  chatInputContainer: { padding: "14px", borderTop: "1px solid #334155", backgroundColor: "#1e293b" },
  chatInputRow: { display: "flex", gap: "8px" },
  chatInput: { flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid #475569", backgroundColor: "#0f172a", color: "#f8fafc", fontSize: "13px", outline: "none" },
  chatButton: { backgroundColor: "#06b6d4", color: "#0f172a", border: "none", padding: "0 14px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }
};