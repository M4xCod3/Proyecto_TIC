import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  ThermometerIcon,
  DropletIcon,
  MapPinIcon,
  BrainCircuitIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ActivityIcon,
  SatelliteIcon,
  ClockIcon,
  ZapIcon,
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  RefreshCwIcon,
  DatabaseIcon,
  WifiIcon,
  WifiOffIcon,
  PackageXIcon,
} from "lucide-react";
import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import "./index.css";

// Types
interface TelemetryData {
  id?: number;
  timestamp: string;
  lat: number;
  lon: number;
  temp: number;
  hum: number;
  alerta: string;
}

interface ChartDataPoint {
  time: string;
  temp: number;
  hum: number;
  fullTime: string;
}

interface AIInsight {
  id: number;
  type: "ok" | "warning" | "error" | "info";
  message: string;
  timestamp: string;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "no_data" | "demo";

// Supabase client initialization
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Simulated data generator for demo mode
const generateTelemetryData = (): TelemetryData => {
  const now = new Date();
  const baseTemp = 4 + Math.random() * 3;
  const baseHum = 85 + Math.random() * 10;
  const hasAlert = Math.random() > 0.85;
  
  return {
    timestamp: now.toISOString(),
    lat: -33.4489 + (Math.random() - 0.5) * 0.01,
    lon: -70.6693 + (Math.random() - 0.5) * 0.01,
    temp: parseFloat(baseTemp.toFixed(2)),
    hum: parseFloat(baseHum.toFixed(2)),
    alerta: hasAlert ? "THERMAL_DEVIATION" : "OK",
  };
};

// Parse data string format: TIMESTAMP;LAT;LON;TEMP;HUM;ALERTA
const parseDataString = (dataString: string): TelemetryData | null => {
  try {
    const parts = dataString.split(";");
    if (parts.length !== 6) return null;
    
    return {
      timestamp: parts[0],
      lat: parseFloat(parts[1]),
      lon: parseFloat(parts[2]),
      temp: parseFloat(parts[3]),
      hum: parseFloat(parts[4]),
      alerta: parts[5],
    };
  } catch {
    return null;
  }
};

export default function Analytics() {
  const [telemetryHistory, setTelemetryHistory] = useState<ChartDataPoint[]>([]);
  const [currentData, setCurrentData] = useState<TelemetryData | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [dataInput, setDataInput] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [hasData, setHasData] = useState<boolean | null>(null);

  // AI Analysis function
  const analyzeData = useCallback((data: TelemetryData): AIInsight => {
    const id = Date.now();
    const timestamp = new Date().toLocaleTimeString("es-CL");

    if (data.alerta !== "OK") {
      return {
        id,
        type: "error",
        message: `ALERTA: Desviacion termica detectada en coordenadas (${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}). Temperatura: ${data.temp}C`,
        timestamp,
      };
    }

    if (data.temp > 6) {
      return {
        id,
        type: "warning",
        message: `Advertencia: Temperatura elevada (${data.temp}C). Monitorear de cerca la cadena de frio.`,
        timestamp,
      };
    }

    if (data.temp < 2) {
      return {
        id,
        type: "warning",
        message: `Advertencia: Temperatura muy baja (${data.temp}C). Riesgo de congelacion.`,
        timestamp,
      };
    }

    if (data.hum < 80) {
      return {
        id,
        type: "info",
        message: `Info: Humedad por debajo del optimo (${data.hum}%). Verificar sellado del contenedor.`,
        timestamp,
      };
    }

    return {
      id,
      type: "ok",
      message: `Estado de la Carga: OK. Temp: ${data.temp}C, Hum: ${data.hum}%. Condiciones optimas.`,
      timestamp,
    };
  }, []);

  // Process new data point
  const processData = useCallback((data: TelemetryData) => {
    setCurrentData(data);
    setHasData(true);
    
    const time = new Date(data.timestamp);
    const timeStr = time.toLocaleTimeString("es-CL", { 
      hour: "2-digit", 
      minute: "2-digit",
      second: "2-digit"
    });
    
    setTelemetryHistory(prev => {
      const newPoint: ChartDataPoint = {
        time: timeStr,
        temp: data.temp,
        hum: data.hum,
        fullTime: data.timestamp,
      };
      const updated = [...prev, newPoint];
      return updated.slice(-20);
    });

    const insight = analyzeData(data);
    setAiInsights(prev => [insight, ...prev].slice(0, 10));
  }, [analyzeData]);

  // Fetch initial data and setup realtime subscription
  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    let demoInterval: ReturnType<typeof setInterval> | null = null;

    const initializeData = async () => {
      // If Supabase is not configured, run in demo mode
      if (!supabase) {
        console.log("[v0] Supabase not configured, running in demo mode");
        setConnectionStatus("demo");
        setHasData(true);
        return;
      }

      setConnectionStatus("connecting");

      try {
        // Fetch initial data from telemetry table
        const { data, error } = await supabase
          .from("telemetry")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(20);

        if (error) {
          console.log("[v0] Supabase error:", error.message);
          // If table doesn't exist or other error, show no data
          setConnectionStatus("no_data");
          setHasData(false);
          return;
        }

        if (!data || data.length === 0) {
          console.log("[v0] No data found in telemetry table");
          setConnectionStatus("no_data");
          setHasData(false);
          return;
        }

        // Process historical data
        setConnectionStatus("connected");
        const reversedData = [...data].reverse();
        reversedData.forEach((item: TelemetryData) => {
          processData(item);
        });

        // Setup realtime subscription
        channel = supabase
          .channel("telemetry_realtime")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "telemetry" },
            (payload) => {
              console.log("[v0] New telemetry data received:", payload.new);
              processData(payload.new as TelemetryData);
            }
          )
          .subscribe((status) => {
            console.log("[v0] Realtime subscription status:", status);
            if (status === "SUBSCRIBED") {
              setConnectionStatus("connected");
            }
          });

      } catch (err) {
        console.log("[v0] Error initializing Supabase:", err);
        setConnectionStatus("no_data");
        setHasData(false);
      }
    };

    initializeData();

    // Cleanup
    return () => {
      if (channel) {
        supabase?.removeChannel(channel);
      }
      if (demoInterval) {
        clearInterval(demoInterval);
      }
    };
  }, [processData]);

  // Demo mode streaming
  useEffect(() => {
    if (connectionStatus !== "demo" || !isStreaming) return;

    const interval = setInterval(() => {
      const newData = generateTelemetryData();
      processData(newData);
    }, 2000);

    return () => clearInterval(interval);
  }, [connectionStatus, isStreaming, processData]);

  // Handle manual data input
  const handleDataInput = () => {
    if (!dataInput.trim()) return;
    
    const parsed = parseDataString(dataInput.trim());
    if (parsed) {
      processData(parsed);
      setDataInput("");
    }
  };

  const handleScrollToHome = () => {
    window.location.href = "/";
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "ok": return <CheckCircle2Icon className="w-4 h-4 text-green-400" />;
      case "warning": return <AlertTriangleIcon className="w-4 h-4 text-yellow-400" />;
      case "error": return <AlertTriangleIcon className="w-4 h-4 text-red-400" />;
      default: return <ActivityIcon className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case "ok": return "border-green-500/30 bg-green-500/5";
      case "warning": return "border-yellow-500/30 bg-yellow-500/5";
      case "error": return "border-red-500/30 bg-red-500/5";
      default: return "border-cyan-500/30 bg-cyan-500/5";
    }
  };

  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case "connecting":
        return {
          icon: <WifiIcon className="w-3 h-3 animate-pulse" />,
          text: "Conectando...",
          className: "bg-blue-500/10 border-blue-500/30 text-blue-400"
        };
      case "connected":
        return {
          icon: <WifiIcon className="w-3 h-3" />,
          text: "Supabase",
          className: "bg-green-500/10 border-green-500/30 text-green-400"
        };
      case "disconnected":
        return {
          icon: <WifiOffIcon className="w-3 h-3" />,
          text: "Desconectado",
          className: "bg-red-500/10 border-red-500/30 text-red-400"
        };
      case "no_data":
        return {
          icon: <PackageXIcon className="w-3 h-3" />,
          text: "Sin datos",
          className: "bg-orange-500/10 border-orange-500/30 text-orange-400"
        };
      case "demo":
      default:
        return {
          icon: <DatabaseIcon className="w-3 h-3" />,
          text: "Demo",
          className: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
        };
    }
  };

  const statusDisplay = getConnectionStatusDisplay();

  // No Data State - "Pedido no existente"
  if (connectionStatus === "no_data" || (hasData === false && connectionStatus !== "demo")) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,200,255,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,200,255,0.3) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center max-w-md mx-auto px-6"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
            <PackageXIcon className="w-12 h-12 text-orange-400" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-white">
            Pedido no existente
          </h1>
          
          <p className="text-gray-400 mb-6 leading-relaxed">
            No se encontraron datos de telemetria en la base de datos. 
            Verifica que la tabla <code className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">telemetry</code> exista 
            y contenga registros.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-400 mb-2">Estructura esperada de la tabla:</p>
            <code className="text-xs text-cyan-300 block whitespace-pre-wrap">
{`CREATE TABLE telemetry (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ,
  lat DECIMAL,
  lon DECIMAL,
  temp DECIMAL,
  hum DECIMAL,
  alerta TEXT
);`}
            </code>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={handleScrollToHome}
              className="gap-2 bg-white/5 border border-white/10 hover:bg-white/10"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Volver al inicio
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
              className="gap-2 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400"
            >
              <RefreshCwIcon className="w-4 h-4" />
              Reintentar
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,200,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,200,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,200,255,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.08),transparent_50%)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={handleScrollToHome}
              className="gap-2 bg-white/5 border border-white/10 hover:bg-white/10"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Volver
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <ZapIcon className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-bold text-lg">
                LOG<span className="text-cyan-400">-COLD</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Data Source Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${statusDisplay.className}`}>
              {statusDisplay.icon}
              {statusDisplay.text}
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              isStreaming 
                ? "bg-green-500/10 border border-green-500/30 text-green-400" 
                : "bg-gray-500/10 border border-gray-500/30 text-gray-400"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isStreaming ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
              {isStreaming ? "En vivo" : "Pausado"}
            </div>
            {connectionStatus === "demo" && (
              <Button
                variant="secondary"
                onClick={() => setIsStreaming(!isStreaming)}
                className="gap-2 bg-white/5 border border-white/10 hover:bg-white/10"
              >
                {isStreaming ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                {isStreaming ? "Pausar" : "Reanudar"}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
            Analisis de Datos en Tiempo Real
          </h1>
          <p className="text-gray-400">
            Monitoreo de telemetria para cadena de frio - Sistema Log-Cold
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts & GPS */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <ThermometerIcon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Temperatura</p>
                        <p className="text-xl font-bold text-white">
                          {currentData?.temp.toFixed(1) || "--"}°C
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <DropletIcon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Humedad</p>
                        <p className="text-xl font-bold text-white">
                          {currentData?.hum.toFixed(1) || "--"}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <SatelliteIcon className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">GPS Status</p>
                        <p className="text-xl font-bold text-green-400">Activo</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className={`bg-white/5 border-white/10 backdrop-blur-sm ${
                  currentData?.alerta !== "OK" ? "border-red-500/50" : ""
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        currentData?.alerta !== "OK" 
                          ? "bg-red-500/20" 
                          : "bg-green-500/20"
                      }`}>
                        {currentData?.alerta !== "OK" 
                          ? <AlertTriangleIcon className="w-5 h-5 text-red-400" />
                          : <CheckCircle2Icon className="w-5 h-5 text-green-400" />
                        }
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Estado</p>
                        <p className={`text-xl font-bold ${
                          currentData?.alerta !== "OK" ? "text-red-400" : "text-green-400"
                        }`}>
                          {currentData?.alerta || "--"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Temperature Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ThermometerIcon className="w-5 h-5 text-cyan-400" />
                    Temperatura en Tiempo Real
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Monitoreo de temperatura de la cadena de frio (°C)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={telemetryHistory}>
                        <defs>
                          <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="time" 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                        />
                        <YAxis 
                          domain={[0, 10]}
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(6,182,212,0.3)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="temp"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          fill="url(#tempGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Humidity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <DropletIcon className="w-5 h-5 text-blue-400" />
                    Humedad Relativa
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Nivel de humedad del contenedor (%)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={telemetryHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="time" 
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                        />
                        <YAxis 
                          domain={[70, 100]}
                          stroke="rgba(255,255,255,0.5)"
                          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(59,130,246,0.3)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="hum"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* GPS Monitor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <MapPinIcon className="w-5 h-5 text-green-400" />
                    Monitor GPS
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Ubicacion en tiempo real del vehiculo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-black/40 rounded-lg border border-white/10 p-6 overflow-hidden">
                    {/* Map Grid Background */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(0,255,100,0.3) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0,255,100,0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: "20px 20px",
                      }}
                    />
                    
                    <div className="relative flex items-center justify-between">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Latitud</p>
                          <p className="text-2xl font-mono text-green-400">
                            {currentData?.lat.toFixed(6) || "--.------"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Longitud</p>
                          <p className="text-2xl font-mono text-green-400">
                            {currentData?.lon.toFixed(6) || "--.------"}
                          </p>
                        </div>
                      </div>

                      {/* Animated Position Indicator */}
                      <div className="relative w-32 h-32">
                        <div className="absolute inset-0 rounded-full border border-green-500/30" />
                        <div className="absolute inset-4 rounded-full border border-green-500/40" />
                        <div className="absolute inset-8 rounded-full border border-green-500/50" />
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <div className="w-4 h-4 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
                        </motion.div>
                        {/* Pulse effect */}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ scale: 0.8, opacity: 1 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <div className="w-4 h-4 rounded-full bg-green-400/50" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="relative mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-sm text-gray-400">
                      <ClockIcon className="w-4 h-4" />
                      Ultima actualizacion: {currentData?.timestamp 
                        ? new Date(currentData.timestamp).toLocaleString("es-CL")
                        : "--"
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - AI Insights & Data Input */}
          <div className="space-y-6">
            {/* AI Insights Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BrainCircuitIcon className="w-5 h-5 text-purple-400" />
                    IA Insights
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Analisis inteligente de telemetria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    <AnimatePresence mode="popLayout">
                      {aiInsights.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <BrainCircuitIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Esperando datos...</p>
                        </div>
                      ) : (
                        aiInsights.map((insight) => (
                          <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className={`p-3 rounded-lg border ${getInsightBg(insight.type)}`}
                          >
                            <div className="flex items-start gap-2">
                              {getInsightIcon(insight.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white leading-relaxed">
                                  {insight.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {insight.timestamp}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Manual Data Input */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ActivityIcon className="w-5 h-5 text-cyan-400" />
                    Entrada Manual
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Formato: TIMESTAMP;LAT;LON;TEMP;HUM;ALERTA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <textarea
                      value={dataInput}
                      onChange={(e) => setDataInput(e.target.value)}
                      placeholder="2024-01-15T10:30:00Z;-33.4489;-70.6693;4.5;88.2;OK"
                      className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none font-mono"
                    />
                    <Button
                      onClick={handleDataInput}
                      className="w-full bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-400"
                    >
                      <RefreshCwIcon className="w-4 h-4 mr-2" />
                      Procesar Datos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Connection Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-white text-sm">
                    <DatabaseIcon className="w-4 h-4 text-gray-400" />
                    Estado de Conexion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fuente:</span>
                      <span className={connectionStatus === "connected" ? "text-green-400" : "text-yellow-400"}>
                        {connectionStatus === "connected" ? "Supabase Realtime" : "Modo Demo"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Puntos:</span>
                      <span className="text-white">{telemetryHistory.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Alertas:</span>
                      <span className="text-white">
                        {aiInsights.filter(i => i.type === "error").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
