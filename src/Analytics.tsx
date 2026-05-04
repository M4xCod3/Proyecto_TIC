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
} from "lucide-react";
import "./index.css";

// Types
interface PedidoMonitoreo {
  id: number;
  created_at: string;
  latitud: number;
  longitud: number;
  temperatura: number;
  humedad: number;
  alerta: string;
  hardware_id: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Supabase initialization
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export default function Analytics() {
  const [data, setData] = useState<PedidoMonitoreo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hola! Soy el asistente de Log-Cold. Puedo informarte sobre el estado actual de tu pedido. Preguntame lo que necesites." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError("Supabase no configurado. Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en las variables de entorno.");
        setLoading(false);
        return;
      }

      try {
        const { data: pedidos, error: queryError } = await supabase
          .from("pedidos_monitoreo")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (queryError) {
          setError("Error de consulta: " + queryError.message);
          setLoading(false);
          return;
        }

        setData(pedidos || []);
        setLoading(false);

        // Realtime subscription
        const channel = supabase
          .channel("pedidos_realtime")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "pedidos_monitoreo" },
            (payload) => {
              setData(prev => [payload.new as PedidoMonitoreo, ...prev].slice(0, 50));
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

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Get latest data point
  const latestData = data[0];

  // Analyze data for chatbot
  const analyzeData = (): string => {
    if (data.length === 0) return "No hay datos disponibles actualmente.";

    const latest = data[0];
    const avgTemp = data.reduce((sum, d) => sum + d.temperatura, 0) / data.length;
    const avgHum = data.reduce((sum, d) => sum + d.humedad, 0) / data.length;
    const alertCount = data.filter(d => d.alerta !== "OK").length;

    let status = "OPTIMO";
    if (latest.temperatura < 2 || latest.temperatura > 8) status = "ALERTA TEMPERATURA";
    if (latest.humedad < 60 || latest.humedad > 95) status = "ALERTA HUMEDAD";
    if (latest.alerta !== "OK") status = "ALERTA ACTIVA";

    return JSON.stringify({
      status,
      ultimaLectura: {
        temperatura: latest.temperatura.toFixed(1),
        humedad: latest.humedad.toFixed(1),
        ubicacion: latest.latitud.toFixed(4) + ", " + latest.longitud.toFixed(4),
        alerta: latest.alerta,
        fecha: new Date(latest.created_at).toLocaleString("es-CL"),
      },
      promedios: {
        temperatura: avgTemp.toFixed(1),
        humedad: avgHum.toFixed(1),
      },
      totalLecturas: data.length,
      alertasActivas: alertCount,
    });
  };

  // Handle chat
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);

    setTimeout(() => {
      let response = "";
      const lowerMsg = userMessage.toLowerCase();

      if (data.length === 0) {
        response = "No hay datos disponibles actualmente para analizar.";
      } else {
        const analysis = JSON.parse(analyzeData());

        if (lowerMsg.includes("estado") || lowerMsg.includes("como esta") || lowerMsg.includes("cómo está")) {
          response = "Estado actual del pedido: " + analysis.status + "\n\nUltima lectura:\n- Temperatura: " + analysis.ultimaLectura.temperatura + "°C\n- Humedad: " + analysis.ultimaLectura.humedad + "%\n- Ubicacion: " + analysis.ultimaLectura.ubicacion + "\n- Fecha: " + analysis.ultimaLectura.fecha;
        } else if (lowerMsg.includes("temperatura") || lowerMsg.includes("temp")) {
          const tempActual = parseFloat(analysis.ultimaLectura.temperatura);
          const tempStatus = tempActual >= 2 && tempActual <= 8 ? "dentro del rango optimo (2-8°C)" : "FUERA del rango optimo";
          response = "La temperatura actual es " + analysis.ultimaLectura.temperatura + "°C, " + tempStatus + ".\n\nPromedio historico: " + analysis.promedios.temperatura + "°C";
        } else if (lowerMsg.includes("humedad") || lowerMsg.includes("hum")) {
          const humActual = parseFloat(analysis.ultimaLectura.humedad);
          const humStatus = humActual >= 60 && humActual <= 95 ? "dentro del rango optimo (60-95%)" : "FUERA del rango optimo";
          response = "La humedad actual es " + analysis.ultimaLectura.humedad + "%, " + humStatus + ".\n\nPromedio historico: " + analysis.promedios.humedad + "%";
        } else if (lowerMsg.includes("ubicacion") || lowerMsg.includes("donde") || lowerMsg.includes("dónde") || lowerMsg.includes("gps")) {
          response = "La ubicacion actual del pedido es:\n\nCoordenadas: " + analysis.ultimaLectura.ubicacion + "\n\nPuedes ver la ubicacion en el mapa de arriba.";
        } else if (lowerMsg.includes("alerta") || lowerMsg.includes("problema")) {
          if (analysis.alertasActivas > 0) {
            response = "Hay " + analysis.alertasActivas + " alertas en las ultimas " + analysis.totalLecturas + " lecturas.\n\nAlerta actual: " + analysis.ultimaLectura.alerta;
          } else {
            response = "No hay alertas activas. El sistema funciona correctamente con " + analysis.totalLecturas + " lecturas registradas.";
          }
        } else if (lowerMsg.includes("resumen") || lowerMsg.includes("todo")) {
          response = "Resumen del Pedido Log-Cold\n\n- Estado: " + analysis.status + "\n- Temperatura: " + analysis.ultimaLectura.temperatura + "°C (prom: " + analysis.promedios.temperatura + "°C)\n- Humedad: " + analysis.ultimaLectura.humedad + "% (prom: " + analysis.promedios.humedad + "%)\n- Ubicacion: " + analysis.ultimaLectura.ubicacion + "\n- Lecturas totales: " + analysis.totalLecturas + "\n- Alertas: " + analysis.alertasActivas;
        } else {
          response = "Puedo ayudarte con:\n- Estado del pedido\n- Temperatura actual\n- Humedad actual\n- Ubicacion GPS\n- Alertas activas\n- Resumen completo\n\nPreguntame sobre cualquiera de estos temas.";
        }
      }

      setChatMessages(prev => [...prev, { role: "assistant", content: response }]);
    }, 500);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCwIcon className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertTriangleIcon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Sin datos en tiempo real</h2>
          <p className="text-gray-400 mb-4">No se encontraron datos de telemetria en la base de datos.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <ArrowLeftIcon className="w-5 h-5" />
            </a>
            <div>
              <h1 className="text-xl font-bold text-cyan-400">Log-Cold Analytics</h1>
              <p className="text-sm text-gray-400">Monitoreo en tiempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-green-400">Conectado</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Map and Stats */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <ThermometerIcon className="w-4 h-4" />
                <span className="text-xs">Temperatura</span>
              </div>
              <p className="text-2xl font-bold text-cyan-400">{latestData.temperatura.toFixed(1)}°C</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <DropletIcon className="w-4 h-4" />
                <span className="text-xs">Humedad</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{latestData.humedad.toFixed(1)}%</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <MapPinIcon className="w-4 h-4" />
                <span className="text-xs">Ubicacion</span>
              </div>
              <p className="text-sm font-mono text-green-400">{latestData.latitud.toFixed(4)}</p>
              <p className="text-sm font-mono text-green-400">{latestData.longitud.toFixed(4)}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                {latestData.alerta === "OK" ? (
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangleIcon className="w-4 h-4 text-red-400" />
                )}
                <span className="text-xs">Estado</span>
              </div>
              <p className={`text-lg font-bold ${latestData.alerta === "OK" ? "text-green-400" : "text-red-400"}`}>
                {latestData.alerta}
              </p>
            </div>
          </div>

          {/* Map */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-3 border-b border-slate-700">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-cyan-400" />
                Ubicacion GPS
              </h3>
            </div>
            <div className="h-[300px]">
              <iframe
                title="Mapa de ubicacion"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${latestData.longitud - 0.01}%2C${latestData.latitud - 0.01}%2C${latestData.longitud + 0.01}%2C${latestData.latitud + 0.01}&layer=mapnik&marker=${latestData.latitud}%2C${latestData.longitud}`}
                allowFullScreen
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-3 border-b border-slate-700">
              <h3 className="font-semibold">Historial de Datos</h3>
            </div>
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-700 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-left">Temp</th>
                    <th className="px-3 py-2 text-left">Humedad</th>
                    <th className="px-3 py-2 text-left">Ubicacion</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.id} className="border-t border-slate-700 hover:bg-slate-700/50">
                      <td className="px-3 py-2 text-gray-300">{formatDate(row.created_at)}</td>
                      <td className="px-3 py-2">
                        <span className={row.temperatura >= 2 && row.temperatura <= 8 ? "text-cyan-400" : "text-red-400"}>
                          {row.temperatura.toFixed(1)}°C
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={row.humedad >= 60 && row.humedad <= 95 ? "text-blue-400" : "text-yellow-400"}>
                          {row.humedad.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-gray-400">
                        {row.latitud.toFixed(4)}, {row.longitud.toFixed(4)}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${row.alerta === "OK" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
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

        {/* Right Column - Chatbot */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 flex flex-col h-[600px]">
          <div className="p-3 border-b border-slate-700 flex items-center gap-2">
            <BotIcon className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold">Asistente Log-Cold</h3>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-700 text-gray-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Pregunta sobre tu pedido..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Prueba: estado, temperatura, humedad, ubicacion, alertas
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
