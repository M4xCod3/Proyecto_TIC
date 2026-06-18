import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function LocalPage() {
  const [user, setUser] = useState<any>(null);
  const [localInfo, setLocalInfo] = useState({ id: "", nombre_local: "" });
  const [loading, setLoading] = useState(false);
  const [authData, setAuthData] = useState({ email: "", password: "" });
  
  // MODIFICADO: Se agregó tipo_pedido al estado inicial
  const [pedidoData, setPedidoData] = useState({ 
    codigo_pedido: "", 
    hardware_id: "",
    tipo_pedido: "congelado" // Valor por defecto
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
        obtenerLocal(data.session.user.email);
      }
    });
  }, []);

  const obtenerLocal = async (email: string | undefined) => {
    const { data } = await supabase
      .from("locales")
      .select("id, nombre_local")
      .eq("correo", email)
      .single();
    if (data) setLocalInfo(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword(authData);
    if (error) alert(error.message);
    else {
      setUser(data.user);
      obtenerLocal(data.user.email);
    }
  };

  const handleRegistrarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // MODIFICADO: Se incluyó tipo_pedido en el payload de inserción
    const { error } = await supabase.from("pedido").insert([{
      codigo_pedido: pedidoData.codigo_pedido,
      local_id: localInfo.id,
      hardware_id: pedidoData.hardware_id,
      tipo_pedido: pedidoData.tipo_pedido, // Asignado automáticamente por el Trigger en la DB
      estado: "activo"
    }]);

    if (error) alert(error.message);
    else {
      alert("Pedido registrado exitosamente.");
      // Reiniciar estado, manteniendo el tipo de pedido por defecto si se desea
      setPedidoData({ codigo_pedido: "", hardware_id: "", tipo_pedido: "congelado" });
    }
    setLoading(false);
  };

  // ESTILOS (Mantenidos y adaptados)
  const containerStyle: React.CSSProperties = { 
    padding: '40px', maxWidth: '400px', margin: '50px auto', 
    backgroundColor: '#ffffff', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif', color: '#334155' 
  };
  const inputStyle: React.CSSProperties = { 
    width: '100%', padding: '12px', margin: '8px 0', borderRadius: '8px', 
    border: '1px solid #cbd5e1', boxSizing: 'border-box',
    fontSize: '1rem' // Asegurar buen tamaño de fuente en select
  };

  if (!user) {
    return (
      <div style={containerStyle}>
        <h2 style={{ textAlign: 'center' }}>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Correo" style={inputStyle} onChange={(e) => setAuthData({...authData, email: e.target.value})} />
          <input type="password" placeholder="Contraseña" style={inputStyle} onChange={(e) => setAuthData({...authData, password: e.target.value})} />
          <button style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#06b6d4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>Ingresar</button>
        </form>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>¡Hola, {localInfo.nombre_local}!</h2>
      <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Panel de Control de Pedidos</p>
      
      <form onSubmit={handleRegistrarPedido} style={{ marginTop: '20px' }}>
        <input required placeholder="Código de Pedido" value={pedidoData.codigo_pedido} style={inputStyle} onChange={(e) => setPedidoData({...pedidoData, codigo_pedido: e.target.value})} />
        <input required placeholder="ID Hardware (Ej: HW1_CEREBRO)" value={pedidoData.hardware_id} style={inputStyle} onChange={(e) => setPedidoData({...pedidoData, hardware_id: e.target.value})} />
        
        {/* NUEVO: Selector de Tipo de Producto Automatizado */}
        <select 
          required
          value={pedidoData.tipo_pedido} 
          style={inputStyle} // Reutiliza el estilo de los inputs
          onChange={(e) => setPedidoData({...pedidoData, tipo_pedido: e.target.value})}
        >
          <option value="congelado">❄️ Congelado (Máx 10°C)</option>
          <option value="comida">🍔 Comida Rápida (Mín 20°C)</option>
          <option value="farmaceutica">💊 Farmacéutica (20°C - 30°C)</option>
        </select>

        <button disabled={loading} style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
          {loading ? "Registrando..." : "Registrar Pedido"}
        </button>
      </form>
      
      <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} style={{ width: '100%', padding: '10px', marginTop: '20px', backgroundColor: 'transparent', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>
        Cerrar Sesión
      </button>
    </div>
  );
}