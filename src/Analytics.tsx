import { useState, useEffect, useCallback, useRef } from "react";
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
  Brush,
  ReferenceLine,
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
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import "./index.css";

// Types - Mapped to pedidos_monitoreo table structure
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

// Internal telemetry format
interface TelemetryData {
  id?: number;
  timestamp: string;
  lat: number;
  lon: number;
  temp: number;
  hum: number;
  alerta: string;
  hardware_id?: string;
}

// Map database record to internal format
const mapPedidoToTelemetry = (pedido: PedidoMonitoreo): TelemetryData => ({
  id: pedido.id,
  timestamp: pedido.created_at,
  lat: pedido.latitud,
  lon: pedido.longitud,
  temp: pedido.temperatura,
  hum: pedido.humedad,
  alerta: pedido.alerta,
  hardware_id: pedido.hardware_id,
});

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

// Animated Gauge Component
const AnimatedGauge = ({ 
  value, 
  maxValue, 
  label, 
  unit, 
  color, 
  warningThreshold,
  dangerThreshold,
  icon: Icon,
  isNew 
}: { 
  value: number; 
  maxValue: number; 
  label: string; 
  unit: string; 
  color: string;
  warningThreshold?: number;
  dangerThreshold?: number;
  icon: React.ElementType;
  isNew: boolean;
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75;
  
  // Determine color based on thresholds
  let gaugeColor = color;
  if (dangerThreshold && value > dangerThreshold) {
    gaugeColor = "#ef4444";
  } else if (warningThreshold && value > warningThreshold) {
    gaugeColor = "#f59e0b";
  }

  return (
    <motion.div 
      className="relative flex flex-col items-center"
      animate={isNew ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-32 h-32">
        {/* Background arc */}
        <svg className="w-full h-full transform -rotate-[135deg]" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${gaugeColor})` }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-5 h-5 mb-1" style={{ color: gaugeColor }} />
          <motion.span 
            className="text-2xl font-bold text-white"
            key={value}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {value.toFixed(1)}
          </motion.span>
          <span className="text-xs text-gray-400">{unit}</span>
        </div>
        
        {/* Pulse effect when new data */}
        <AnimatePresence>
          {isNew && (
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: gaugeColor }}
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 1.3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>
      </div>
      <p className="text-sm text-gray-400 mt-2">{label}</p>
    </motion.div>
  );
};



export default function Analytics() {
  const [telemetryHistory, setTelemetryHistory] = useState<ChartDataPoint[]>([]);
  const [currentData, setCurrentData] = useState<TelemetryData | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [dataInput, setDataInput] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isNewData, setIsNewData] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp2ci3xvbnt+jZ+fnpN8bG96hJWgnpmLfHBzfoaSmJWNgHZ1e4KLk5WRin9zdnmAh4+RjoV7d3d6gIeNj4uEfHl4e4GGi4yJg316eXt/hImKiIN9enl7f4SIiYaAfHp5e3+Dh4iGgX15eXp+goaHhIF8eXl6foKFhoSAfHl5en6ChoWDf3x5eXp+goWFg398eXl6foKFhYN/fHl5en6ChYWDf3x5eXp+goWFg398eXl6foKFhYN/fHl5en6ChYWDf3x5eXp+goWFg398eXl6fn+FhYN/fHl5en5/hYWDf3x5eXp+f4WFg398eXl6fn+FhYN/fA==");
    audioRef.current.volume = 0.3;
  }, []);

  // Play alert sound
  const playAlertSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [soundEnabled]);

  // AI Analysis function
  const analyzeData = useCallback((data: TelemetryData): AIInsight => {
    const id = Date.now();
    const timestamp = new Date().toLocaleTimeString("es-CL");

    if (data.alerta !== "OK") {
      playAlertSound();
      return {
        id,
        type: "error",
        message: `ALERTA: Desviacion termica detectada en coordenadas (${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}). Temperatura: ${data.temp}C`,
        timestamp,
      };
    }

    if (data.temp > 6) {
      playAlertSound();
      return {
        id,
        type: "warning",
        message: `Advertencia: Temperatura elevada (${data.temp}C). Monitorear de cerca la cadena de frio.`,
        timestamp,
      };
    }

    if (data.temp < 2) {
      playAlertSound();
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
  }, [playAlertSound]);

  // Process new data point
  const processData = useCallback((data: TelemetryData) => {
    setCurrentData(data);
    setHasData(true);
    setIsNewData(true);
    setTimeout(() => setIsNewData(false), 500);
    
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
      return updated.slice(-50); // Keep more data for zoom
    });

    const insight = analyzeData(data);
    setAiInsights(prev => [insight, ...prev].slice(0, 15));
  }, [analyzeData]);

  // Fetch initial data and setup realtime subscription
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const initializeData = async () => {
      if (!supabase) {
        setConnectionStatus("demo");
        setHasData(true);
        return;
      }

      setConnectionStatus("connecting");

      try {
        const { data, error } = await supabase
          .from("pedidos_monitoreo")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          setConnectionStatus("no_data");
          setHasData(false);
          return;
        }

        if (!data || data.length === 0) {
          setConnectionStatus("no_data");
          setHasData(false);
          return;
        }

        setConnectionStatus("connected");
        const reversedData = [...data].reverse();
        reversedData.forEach((item: PedidoMonitoreo) => {
          processData(mapPedidoToTelemetry(item));
        });

        channel = supabase
          .channel("pedidos_monitoreo_realtime")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "pedidos_monitoreo" },
            (payload) => {
              processData(mapPedidoToTelemetry(payload.new as PedidoMonitoreo));
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              setConnectionStatus("connected");
            }
          });

      } catch {
        setConnectionStatus("no_data");
        setHasData(false);
      }
    };

    initializeData();

    return () => {
      if (channel) {
        supabase?.removeChannel(channel);
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
      case "error": return "border-red-500/30 bg-red-500/5 animate-pulse";
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

  // Loading State - While connecting
  if (connectionStatus === "connecting" && hasData === null) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
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
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCwIcon className="w-12 h-12 text-cyan-400" />
            </motion.div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-white">
            Conectando...
          </h1>
          
          <p className="text-gray-400 mb-6 leading-relaxed">
            Estableciendo conexion con la base de datos de telemetria.
          </p>
        </motion.div>
      </div>
    );
  }

  // No Data State - "Sin datos en tiempo real"
  if (connectionStatus === "no_data" || hasData === false) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
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
            Sin datos en tiempo real
          </h1>
          
          <p className="text-gray-400 mb-6 leading-relaxed">
            No se encontraron datos de telemetria en la base de datos. 
            Verifica que la tabla <code className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">pedidos_monitoreo</code> exista 
            y contenga registros.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-400 mb-2">Estructura esperada de la tabla:</p>
            <code className="text-xs text-cyan-300 block whitespace-pre-wrap">
{`CREATE TABLE pedidos_monitoreo (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  latitud FLOAT8 NOT NULL,
  longitud FLOAT8 NOT NULL,
  temperatura FLOAT4 NOT NULL,
  humedad FLOAT4 NOT NULL,
  alerta TEXT DEFAULT 'OK',
  hardware_id TEXT DEFAULT 'HW1_CEREBRO'
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
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0">
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
              <motion.div 
                className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center"
                animate={isNewData ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <ZapIcon className="w-4 h-4 text-cyan-400" />
              </motion.div>
              <span className="font-bold text-lg">
                LOG<span className="text-cyan-400">-COLD</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sound Toggle */}
            <Button
              variant="secondary"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`gap-2 bg-white/5 border border-white/10 hover:bg-white/10 ${
                !soundEnabled ? "opacity-50" : ""
              }`}
              title={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
            >
              {soundEnabled ? <Volume2Icon className="w-4 h-4" /> : <VolumeXIcon className="w-4 h-4" />}
            </Button>
            
            {/* Data Source Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${statusDisplay.className}`}>
              {statusDisplay.icon}
              {statusDisplay.text}
            </div>
            <motion.div 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                isStreaming 
                  ? "bg-green-500/10 border border-green-500/30 text-green-400" 
                  : "bg-gray-500/10 border border-gray-500/30 text-gray-400"
              }`}
              animate={isNewData && isStreaming ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.2 }}
            >
              <span className={`w-2 h-2 rounded-full ${isStreaming ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
              {isStreaming ? "En vivo" : "Pausado"}
            </motion.div>
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
            {currentData?.hardware_id && (
              <span className="ml-2 text-cyan-400">| Equipo: {currentData.hardware_id}</span>
            )}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Gauges, Charts & Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Animated Gauges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ActivityIcon className="w-5 h-5 text-cyan-400" />
                    Metricas en Tiempo Real
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Indicadores visuales de temperatura, humedad y estado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
                    <AnimatedGauge
                      value={currentData?.temp || 0}
                      maxValue={15}
                      label="Temperatura"
                      unit="°C"
                      color="#06b6d4"
                      warningThreshold={6}
                      dangerThreshold={8}
                      icon={ThermometerIcon}
                      isNew={isNewData}
                    />
                    <AnimatedGauge
                      value={currentData?.hum || 0}
                      maxValue={100}
                      label="Humedad"
                      unit="%"
                      color="#3b82f6"
                      warningThreshold={95}
                      dangerThreshold={98}
                      icon={DropletIcon}
                      isNew={isNewData}
                    />
                    <div className="flex flex-col items-center">
                      <motion.div 
                        className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${
                          currentData?.alerta !== "OK" 
                            ? "border-red-500 bg-red-500/10" 
                            : "border-green-500 bg-green-500/10"
                        }`}
                        animate={currentData?.alerta !== "OK" ? { 
                          boxShadow: ["0 0 0 0 rgba(239,68,68,0.4)", "0 0 0 20px rgba(239,68,68,0)", "0 0 0 0 rgba(239,68,68,0.4)"]
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {currentData?.alerta !== "OK" 
                          ? <AlertTriangleIcon className="w-12 h-12 text-red-400" />
                          : <CheckCircle2Icon className="w-12 h-12 text-green-400" />
                        }
                      </motion.div>
                      <p className={`text-sm mt-2 font-medium ${
                        currentData?.alerta !== "OK" ? "text-red-400" : "text-green-400"
                      }`}>
                        {currentData?.alerta || "Sin datos"}
                      </p>
                      <p className="text-xs text-gray-400">Estado</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <motion.div 
                        className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-green-500 bg-green-500/10"
                        animate={isNewData ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <SatelliteIcon className="w-12 h-12 text-green-400" />
                      </motion.div>
                      <p className="text-sm mt-2 font-medium text-green-400">Activo</p>
                      <p className="text-xs text-gray-400">GPS</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Temperature Chart with Zoom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <ThermometerIcon className="w-5 h-5 text-cyan-400" />
                        Temperatura en Tiempo Real
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Monitoreo de temperatura - Arrastra para hacer zoom
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/5 border border-white/10 hover:bg-white/10"
                        title="Zoom in"
                      >
                        <ZoomInIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/5 border border-white/10 hover:bg-white/10"
                        title="Zoom out"
                      >
                        <ZoomOutIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
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
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            border: '1px solid rgba(6,182,212,0.3)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          labelStyle={{ color: '#06b6d4' }}
                        />
                        <ReferenceLine y={6} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Advertencia", fill: "#f59e0b", fontSize: 10 }} />
                        <ReferenceLine y={8} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Peligro", fill: "#ef4444", fontSize: 10 }} />
                        <Area
                          type="monotone"
                          dataKey="temp"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          fill="url(#tempGradient)"
                          animationDuration={300}
                        />
                        <Brush 
                          dataKey="time" 
                          height={30} 
                          stroke="#06b6d4"
                          fill="rgba(6,182,212,0.1)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Humidity Chart with Zoom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <DropletIcon className="w-5 h-5 text-blue-400" />
                    Humedad Relativa
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Nivel de humedad del contenedor - Arrastra para hacer zoom
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[230px]">
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
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            border: '1px solid rgba(59,130,246,0.3)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          labelStyle={{ color: '#3b82f6' }}
                        />
                        <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Min", fill: "#f59e0b", fontSize: 10 }} />
                        <Line
                          type="monotone"
                          dataKey="hum"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                          animationDuration={300}
                        />
                        <Brush 
                          dataKey="time" 
                          height={25} 
                          stroke="#3b82f6"
                          fill="rgba(59,130,246,0.1)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Interactive Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <MapPinIcon className="w-5 h-5 text-green-400" />
                        Monitor GPS Interactivo
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Ubicacion en tiempo real del vehiculo
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[350px] relative rounded-b-lg overflow-hidden bg-slate-900">
                    {/* Stylized Map Background */}
                    <div 
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(0,200,255,0.2) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0,200,255,0.2) 1px, transparent 1px)
                        `,
                        backgroundSize: "30px 30px",
                      }}
                    />
                    
                    {/* Radar Animation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="absolute w-64 h-64 border border-cyan-500/30 rounded-full"
                        animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute w-48 h-48 border border-cyan-500/40 rounded-full"
                        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                      />
                      <motion.div
                        className="absolute w-32 h-32 border border-cyan-500/50 rounded-full"
                        animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                      />
                      
                      {/* Center Marker */}
                      <motion.div 
                        className="relative z-10"
                        animate={isNewData ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="w-6 h-6 bg-green-500 rounded-full shadow-lg shadow-green-500/50 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full" />
                        </div>
                        <motion.div
                          className="absolute inset-0 w-6 h-6 bg-green-400 rounded-full"
                          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </motion.div>
                    </div>
                    
                    {/* Coordinates Display */}
                    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Latitud</p>
                          <motion.p 
                            className="font-mono text-lg text-green-400"
                            key={currentData?.lat}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {currentData?.lat.toFixed(6) || "--.------"}
                          </motion.p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Longitud</p>
                          <motion.p 
                            className="font-mono text-lg text-green-400"
                            key={currentData?.lon}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {currentData?.lon.toFixed(6) || "--.------"}
                          </motion.p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div className="bg-black/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10 flex items-center gap-2">
                        <motion.span 
                          className="w-2 h-2 rounded-full bg-green-400"
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className="text-xs text-green-400 font-medium">GPS Activo</span>
                      </div>
                    </div>
                    
                    {/* Hardware ID */}
                    {currentData?.hardware_id && (
                      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-cyan-500/30">
                        <span className="text-xs text-cyan-400 font-mono">{currentData.hardware_id}</span>
                      </div>
                    )}
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
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <motion.div
                      animate={isNewData ? { rotate: [0, 360] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <BrainCircuitIcon className="w-5 h-5 text-purple-400" />
                    </motion.div>
                    IA Insights
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Analisis inteligente de telemetria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
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
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className={`p-3 rounded-lg border ${getInsightBg(insight.type)}`}
                          >
                            <div className="flex items-start gap-2">
                              <motion.div
                                animate={insight.type === "error" ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 0.5, repeat: insight.type === "error" ? Infinity : 0 }}
                              >
                                {getInsightIcon(insight.type)}
                              </motion.div>
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
              transition={{ delay: 0.6 }}
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
                      className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 resize-none font-mono transition-all"
                    />
                    <Button
                      onClick={handleDataInput}
                      className="w-full bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-400 transition-all hover:scale-[1.02]"
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
              transition={{ delay: 0.7 }}
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
                      <motion.span 
                        className="text-white"
                        key={telemetryHistory.length}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {telemetryHistory.length}
                      </motion.span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Alertas:</span>
                      <motion.span 
                        className={aiInsights.filter(i => i.type === "error").length > 0 ? "text-red-400" : "text-white"}
                        key={aiInsights.filter(i => i.type === "error").length}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {aiInsights.filter(i => i.type === "error").length}
                      </motion.span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sonido:</span>
                      <span className={soundEnabled ? "text-green-400" : "text-gray-500"}>
                        {soundEnabled ? "Activado" : "Desactivado"}
                      </span>
                    </div>
                    {currentData?.hardware_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Hardware:</span>
                        <span className="text-cyan-400">{currentData.hardware_id}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Last Update */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>Ultima actualizacion:</span>
                  </div>
                  <motion.p 
                    className="text-white font-mono text-sm mt-1"
                    key={currentData?.timestamp}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {currentData?.timestamp 
                      ? new Date(currentData.timestamp).toLocaleString("es-CL")
                      : "--"
                    }
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .leaflet-container {
          background: #020617 !important;
        }
      `}</style>
    </div>
  );
}
