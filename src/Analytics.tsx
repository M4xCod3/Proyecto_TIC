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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import "./index.css";

/**
 * DATA SOURCE INTEGRATION
 * 
 * This component is prepared to receive real-time data from:
 * 1. Supabase Realtime subscriptions
 * 2. WebSocket connections
 * 3. Server-Sent Events (SSE)
 * 4. Manual JSON input (TIMESTAMP;LAT;LON;TEMP;HUM;ALERTA format)
 * 
 * To connect to Supabase, uncomment and configure:
 * 
 * import { createClient } from '@supabase/supabase-js'
 * const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
 * 
 * Then in useEffect:
 * const subscription = supabase
 *   .channel('telemetry')
 *   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'telemetry' }, 
 *       payload => processData(payload.new as TelemetryData))
 *   .subscribe()
 */

// Types
interface TelemetryData {
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

// Simulated data generator for demo
const generateTelemetryData = (): TelemetryData => {
  const now = new Date();
  const baseTemp = 4 + Math.random() * 3; // Cold chain: 4-7C
  const baseHum = 85 + Math.random() * 10; // 85-95% humidity
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
      return updated.slice(-20); // Keep last 20 points
    });

    const insight = analyzeData(data);
    setAiInsights(prev => [insight, ...prev].slice(0, 10));
  }, [analyzeData]);

  // Simulated streaming
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const newData = generateTelemetryData();
      processData(newData);
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming, processData]);

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
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
              <DatabaseIcon className="w-3 h-3" />
              Demo
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              isStreaming 
                ? "bg-green-500/10 border border-green-500/30 text-green-400" 
                : "bg-gray-500/10 border border-gray-500/30 text-gray-400"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isStreaming ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
              {isStreaming ? "En vivo" : "Pausado"}
            </div>
            <Button
              variant="secondary"
              onClick={() => setIsStreaming(!isStreaming)}
              className="gap-2 bg-white/5 border border-white/10 hover:bg-white/10"
            >
              {isStreaming ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              {isStreaming ? "Pausar" : "Reanudar"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Analisis de Datos en{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Tiempo Real
            </span>
          </h1>
          <p className="text-gray-400">
            Monitor de telemetria del sistema Log-Cold para transporte refrigerado
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Temperatura</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {currentData?.temp.toFixed(1) ?? "--"}°C
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <ThermometerIcon className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Humedad</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {currentData?.hum.toFixed(1) ?? "--"}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  <DropletIcon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 hover:border-green-500/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Estado</p>
                  <p className={`text-lg font-bold ${
                    currentData?.alerta === "OK" ? "text-green-400" : "text-red-400"
                  }`}>
                    {currentData?.alerta ?? "--"}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  currentData?.alerta === "OK" 
                    ? "bg-green-500/10 border border-green-500/30" 
                    : "bg-red-500/10 border border-red-500/30"
                }`}>
                  {currentData?.alerta === "OK" 
                    ? <CheckCircle2Icon className="w-6 h-6 text-green-400" />
                    : <AlertTriangleIcon className="w-6 h-6 text-red-400" />
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Lecturas</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {telemetryHistory.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                  <ActivityIcon className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Temperature Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                        <ThermometerIcon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <CardTitle>Temperatura</CardTitle>
                        <CardDescription>Monitoreo en tiempo real (°C)</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <ClockIcon className="w-4 h-4" />
                      Ultimos 20 registros
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={telemetryHistory}>
                        <defs>
                          <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis 
                          dataKey="time" 
                          stroke="#64748b" 
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={12}
                          tickLine={false}
                          domain={[0, 10]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid rgba(34, 211, 238, 0.3)",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          labelStyle={{ color: "#94a3b8" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="temp"
                          stroke="#22d3ee"
                          strokeWidth={2}
                          fill="url(#tempGradient)"
                          dot={false}
                          activeDot={{ r: 4, fill: "#22d3ee" }}
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
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                        <DropletIcon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle>Humedad</CardTitle>
                        <CardDescription>Porcentaje de humedad relativa</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={telemetryHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis 
                          dataKey="time" 
                          stroke="#64748b" 
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={12}
                          tickLine={false}
                          domain={[70, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          labelStyle={{ color: "#94a3b8" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="hum"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: "#3b82f6" }}
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
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                      <MapPinIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <CardTitle>Monitor GPS</CardTitle>
                      <CardDescription>Posicion del vehiculo de transporte</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative h-48 rounded-lg overflow-hidden border border-white/10 bg-[#0a1628]">
                    {/* Stylized Map Placeholder */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: "30px 30px",
                      }}
                    />
                    
                    {/* GPS Coordinates Display */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-green-400/20"
                            style={{ transform: "translate(-50%, -50%)", left: "50%", top: "50%" }}
                          />
                          <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                            className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-green-400/10"
                            style={{ transform: "translate(-50%, -50%)", left: "50%", top: "50%" }}
                          />
                          <div className="relative w-4 h-4 mx-auto rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
                        </div>
                        
                        <div className="mt-6 space-y-2">
                          <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                              <SatelliteIcon className="w-4 h-4 text-green-400" />
                              <span className="text-sm font-mono">
                                LAT: {currentData?.lat.toFixed(6) ?? "--.------"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                              <SatelliteIcon className="w-4 h-4 text-blue-400" />
                              <span className="text-sm font-mono">
                                LON: {currentData?.lon.toFixed(6) ?? "--.------"}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Santiago, Chile - Region Metropolitana
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI Insights Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <Card className="border-purple-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                    <BrainCircuitIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>IA Insights</CardTitle>
                    <CardDescription>Analisis inteligente de la carga</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {aiInsights.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BrainCircuitIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Esperando datos...</p>
                    </div>
                  ) : (
                    aiInsights.map((insight) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-3 rounded-lg border ${getInsightBg(insight.type)}`}
                      >
                        <div className="flex items-start gap-2">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-300 leading-relaxed">
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
              </CardContent>
            </Card>

            {/* Data Input Card */}
            <Card className="border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/20 flex items-center justify-center">
                    <RefreshCwIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <CardTitle>Entrada Manual</CardTitle>
                    <CardDescription>Formato: TIMESTAMP;LAT;LON;TEMP;HUM;ALERTA</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <textarea
                    value={dataInput}
                    onChange={(e) => setDataInput(e.target.value)}
                    placeholder="2024-01-15T10:30:00;-33.4489;-70.6693;5.2;88.5;OK"
                    className="w-full h-24 px-3 py-2 text-sm font-mono bg-black/40 border border-white/10 rounded-lg text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                  <Button
                    onClick={handleDataInput}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90"
                  >
                    Procesar Datos
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Reading Details */}
            {currentData && (
              <Card className="border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Ultima Lectura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Timestamp:</span>
                      <span className="text-gray-300">
                        {new Date(currentData.timestamp).toLocaleTimeString("es-CL")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Latitud:</span>
                      <span className="text-gray-300">{currentData.lat.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Longitud:</span>
                      <span className="text-gray-300">{currentData.lon.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Temperatura:</span>
                      <span className="text-cyan-400">{currentData.temp}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Humedad:</span>
                      <span className="text-blue-400">{currentData.hum}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estado:</span>
                      <span className={currentData.alerta === "OK" ? "text-green-400" : "text-red-400"}>
                        {currentData.alerta}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
