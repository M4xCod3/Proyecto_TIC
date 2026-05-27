import React, { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Mail, Check, MessageSquare, AlertCircle, RefreshCw, Calendar, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface MensajeContacto {
  id: number;
  created_at: string;
  nombre: string;
  correo: string;
  asunto: string;
  mensaje: string;
  leido: boolean;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Evitar múltiples instancias en el navegador compartiendo el contexto global
const getSupabaseClient = (): SupabaseClient | null => {
  if (typeof window === "undefined") return null;
  const globalWindow = window as any;

  if (!globalWindow.supabaseInstance && SUPABASE_URL && SUPABASE_ANON_KEY) {
    globalWindow.supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return globalWindow.supabaseInstance || null;
};

// Variable para detectar pantallas móviles en JS
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

export default function AdminMessages() {
  const [mensajes, setMensajes] = useState<MensajeContacto[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'no_leidos' | 'leidos'>('todos');
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar mensajes desde Supabase
  const fetchMensajes = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      toast.error("Error de configuración con las credenciales de la base de datos.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mensajes_contacto')
        .select('*')
        .order('id', { ascending: false }); // Mostrar los más nuevos primero

      if (error) throw error;
      setMensajes(data || []);
    } catch (error: any) {
      console.error("Error al traer mensajes:", error.message);
      toast.error("No se pudieron cargar los mensajes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMensajes();
  }, []);

  // Cambiar el estado 'leido' de FALSE a TRUE
  const marcarComoLeido = async (id: number) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('mensajes_contacto')
        .update({ leido: true })
        .eq('id', id);

      if (error) throw error;

      // Actualizar el estado local para reflejar el cambio de inmediato en la interfaz
      setMensajes(prev =>
        prev.map(msg => msg.id === id ? { ...msg, leido: true } : msg)
      );
      toast.success(`Mensaje #${id} marcado como leído.`);
    } catch (error: any) {
      console.error("Error al actualizar estado:", error.message);
      toast.error("No se pudo actualizar el estado del mensaje.");
    }
  };

  // Filtrar la lista local según la pestaña seleccionada
  const mensajesFiltrados = mensajes.filter(msg => {
    if (filtro === 'no_leidos') return !msg.leido;
    if (filtro === 'leidos') return msg.leido;
    return true; // 'todos'
  });

  // Formatear la fecha ISO para que se vea legible (Chile/Local)
  const formatearFecha = (isoString: string) => {
    const fecha = new Date(isoString);
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <button style={styles.backButton} onClick={() => window.history.back()}>
              <ArrowLeft size={18} />
              {!isMobile && "Volver"}
            </button>
            <div>
              <h1 style={styles.title}>Panel de Comentarios</h1>
              <p style={styles.subtitle}>Gestión del formulario de contacto Log-Cold</p>
            </div>
          </div>
          <button style={styles.refreshButton} onClick={fetchMensajes} disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main style={styles.main}>
        {/* Controles de Filtros */}
        <div style={styles.filterRow}>
          <button 
            style={{...styles.filterTab, ...(filtro === 'todos' ? styles.filterTabActive : {})}}
            onClick={() => setFiltro('todos')}
          >
            Todos ({mensajes.length})
          </button>
          <button 
            style={{...styles.filterTab, ...(filtro === 'no_leidos' ? styles.filterTabActive : {})}}
            onClick={() => setFiltro('no_leidos')}
          >
            No leídos ({mensajes.filter(m => !m.leido).length})
          </button>
          <button 
            style={{...styles.filterTab, ...(filtro === 'leidos' ? styles.filterTabActive : {})}}
            onClick={() => setFiltro('leidos')}
          >
            Leídos ({mensajes.filter(m => m.leido).length})
          </button>
        </div>

        {/* Contenedor de Mensajes */}
        {loading ? (
          <div style={styles.centerBox}>Cargando mensajes desde Supabase...</div>
        ) : mensajesFiltrados.length === 0 ? (
          <div style={styles.centerBox}>
            <AlertCircle size={24} style={{ marginBottom: '8px', color: '#94a3b8' }} />
            No hay comentarios en esta categoría.
          </div>
        ) : (
          <div style={styles.messagesGrid}>
            {mensajesFiltrados.map((msg) => (
              <div key={msg.id} style={{
                ...styles.messageCard, 
                ...(msg.leido ? {} : styles.messageCardUnread)
              }}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardMetaLeft}>
                    <span style={styles.idBadge}>#{msg.id}</span>
                    <span style={msg.leido ? styles.badgeLeido : styles.badgeNoLeido}>
                      {msg.leido ? "Leído" : "No leído"}
                    </span>
                  </div>
                  <span style={styles.dateText}>
                    <Calendar size={12} style={{ marginRight: '4px' }} />
                    {formatearFecha(msg.created_at)}
                  </span>
                </div>

                <div style={styles.cardBody}>
                  <h3 style={styles.subjectText}>{msg.asunto}</h3>
                  <p style={styles.messageContent}>"{msg.mensaje}"</p>
                  
                  <div style={styles.senderInfo}>
                    <p style={styles.senderText}><strong>De:</strong> {msg.nombre}</p>
                    <a href={`mailto:${msg.correo}`} style={styles.emailLink}>
                      <Mail size={12} style={{ marginRight: '4px' }} />
                      {msg.correo}
                    </a>
                  </div>
                </div>

                {/* Acciones del mensaje */}
                {!msg.leido && (
                  <div style={styles.cardActions}>
                    <button 
                      style={styles.actionButton} 
                      onClick={() => marcarComoLeido(msg.id)}
                    >
                      <Check size={14} style={{ marginRight: '6px' }} />
                      Marcar como leído
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// OBJETO DE ESTILOS RESPONSIVO (CSS-in-JS adaptable a celulares)
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
    padding: "8px 12px",
    backgroundColor: "#334155",
    border: "none",
    color: "#ffffff",
    cursor: "pointer",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
  } as React.CSSProperties,

  title: {
    fontSize: isMobile ? "18px" : "22px",
    fontWeight: "bold",
    color: "#22d3ee",
    margin: 0,
  } as React.CSSProperties,

  subtitle: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: 0,
  } as React.CSSProperties,

  refreshButton: {
    padding: "8px",
    backgroundColor: "transparent",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#94a3b8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,

  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: isMobile ? "12px" : "20px",
  } as React.CSSProperties,

  filterRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
    overflowX: "auto" as const, // Scroll si los botones no caben en pantallas diminutas
    paddingBottom: "4px",
  } as React.CSSProperties,

  filterTab: {
    padding: "8px 16px",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "20px",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "13px",
    whiteSpace: "nowrap" as const,
    transition: "all 0.2s",
  } as React.CSSProperties,

  filterTabActive: {
    backgroundColor: "#0891b2",
    color: "#ffffff",
    borderColor: "#22d3ee",
  } as React.CSSProperties,

  messagesGrid: {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(360px, 1fr))",
    gap: "16px",
  } as React.CSSProperties,

  messageCard: {
    backgroundColor: "#1e293b",
    borderRadius: "10px",
    border: "1px solid #334155",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    transition: "border-color 0.2s",
  } as React.CSSProperties,

  messageCardUnread: {
    borderColor: "#0891b2", // Resalta sutilmente los no leídos con el cian del proyecto
    boxShadow: "0 0 10px rgba(8, 145, 178, 0.1)",
  } as React.CSSProperties,

  cardHeader: {
    padding: "10px 14px",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderBottom: "1px solid #334155",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  } as React.CSSProperties,

  cardMetaLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as React.CSSProperties,

  idBadge: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "#94a3b8",
    backgroundColor: "#334155",
    padding: "2px 6px",
    borderRadius: "4px",
  } as React.CSSProperties,

  badgeNoLeido: {
    fontSize: "11px",
    color: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: 600,
  } as React.CSSProperties,

  badgeLeido: {
    fontSize: "11px",
    color: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    padding: "2px 6px",
    borderRadius: "4px",
  } as React.CSSProperties,

  dateText: {
    fontSize: "11px",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,

  cardBody: {
    padding: "14px",
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  } as React.CSSProperties,

  subjectText: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#ffffff",
    margin: 0,
  } as React.CSSProperties,

  messageContent: {
    fontSize: "13.5px",
    color: "#cbd5e1",
    margin: "4px 0 12px 0",
    whiteSpace: "pre-wrap" as const,
    lineHeight: "1.4",
    fontStyle: "italic",
  } as React.CSSProperties,

  senderInfo: {
    marginTop: "auto",
    paddingTop: "8px",
    borderTop: "1px dashed #334155",
  } as React.CSSProperties,

  senderText: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: 0,
  } as React.CSSProperties,

  emailLink: {
    fontSize: "12px",
    color: "#22d3ee",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    marginTop: "2px",
  } as React.CSSProperties,

  cardActions: {
    padding: "10px 14px",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderTop: "1px solid #334155",
    display: "flex",
    justifyContent: "flex-end",
  } as React.CSSProperties,

  actionButton: {
    padding: "6px 12px",
    backgroundColor: "#0891b2",
    border: "none",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,

  centerBox: {
    padding: "40px",
    textAlign: "center" as const,
    backgroundColor: "#1e293b",
    borderRadius: "8px",
    border: "1px solid #334155",
    color: "#94a3b8",
    fontSize: "14px",
  } as React.CSSProperties,
};