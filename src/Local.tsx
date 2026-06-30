import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function LocalPage() {
  const [user, setUser] = useState<any>(null);
  const [localInfo, setLocalInfo] = useState({ id: "", nombre_local: "" });
  const [loading, setLoading] = useState(false);
  const [authData, setAuthData] = useState({ email: "", password: "" });
  
  const [pedidoData, setPedidoData] = useState({ 
    codigo_pedido: "", 
    hardware_id: "",
    tipo_pedido: "congelado"
  });

  // NUEVO: Estado para guardar los pedidos que están en ruta/activos
  const [pedidosActivos, setPedidosActivos] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
        obtenerLocal(data.session.user.email);
      }
    });
  }, []);

  // NUEVO: Escuchar cuando localInfo tenga datos para cargar sus pedidos
  useEffect(() => {
    if (localInfo.id) {
      cargarPedidosActivos();
    }
  }, [localInfo.id]);

  const obtenerLocal = async (email: string | undefined) => {
    const { data } = await supabase
      .from("locales")
      .select("id, nombre_local")
      .eq("correo", email)
      .single();
    if (data) setLocalInfo(data);
  };

  // NUEVO: Función para traer los pedidos activos desde Supabase
  const cargarPedidosActivos = async () => {
    const { data, error } = await supabase
      .from("pedido")
      .select("id, codigo_pedido, hardware_id, tipo_pedido")
      .eq("local_id", localInfo.id)
      .eq("estado", "activo");
    
    if (!error && data) {
      setPedidosActivos(data);
    }
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

    const { error } = await supabase.from("pedido").insert([{
      codigo_pedido: pedidoData.codigo_pedido,
      local_id: localInfo.id,
      hardware_id: pedidoData.hardware_id,
      tipo_pedido: pedidoData.tipo_pedido,
      estado: "activo"
    }]);

    if (error) alert(error.message);
    else {
      alert("Pedido registrado exitosamente.");
      setPedidoData({ codigo_pedido: "", hardware_id: "", tipo_pedido: "congelado" });
      cargarPedidosActivos(); // NUEVO: Recargar la lista al crear uno nuevo
    }
    setLoading(false);
  };

  // NUEVO: Función para finalizar el pedido (cambiar estado a 'finalizado')
  const handleFinalizarPedido = async (idPedido: string) => {
    if (!confirm("¿Estás seguro de que deseas finalizar este pedido y detener el monitoreo?")) return;

    const { error } = await supabase
      .from("pedido")
      .update({ estado: "finalizado" }) // Pasamos a finalizado
      .eq("id", idPedido);

    if (error) {
      alert("Error al finalizar: " + error.message);
    } else {
      alert("Pedido finalizado con éxito.");
      cargarPedidosActivos(); // Recargar la lista para que desaparezca de pantalla
    }
    // agregar logica de informe 
  };

  // ESTILOS
  const containerStyle: React.CSSProperties = { 
    padding: '40px', maxWidth: '450px', margin: '30px auto', 
    backgroundColor: '#ffffff', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif', color: '#334155' 
  };
  const inputStyle: React.CSSProperties = { 
    width: '100%', padding: '12px', margin: '8px 0', borderRadius: '8px', 
    border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '1rem'
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
      
      {/* SECCIÓN 1: Formulario de Registro */}
      <form onSubmit={handleRegistrarPedido} style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '5px' }}>Nuevo Envío</h3>
        <input required placeholder="Código de Pedido" value={pedidoData.codigo_pedido} style={inputStyle} onChange={(e) => setPedidoData({...pedidoData, codigo_pedido: e.target.value})} />
        <input required placeholder="ID Hardware (Ej: HW1_CEREBRO)" value={pedidoData.hardware_id} style={inputStyle} onChange={(e) => setPedidoData({...pedidoData, hardware_id: e.target.value})} />
        
        <select required value={pedidoData.tipo_pedido} style={inputStyle} onChange={(e) => setPedidoData({...pedidoData, tipo_pedido: e.target.value})}>
          <option value="congelado">❄️ Congelado (Máx 10°C)</option>
          <option value="comida">🍔 Comida Rápida (Mín 20°C)</option>
          <option value="farmaceutica">💊 Farmacéutica (20°C - 30°C)</option>
        </select>

        <button disabled={loading} style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
          {loading ? "Registrando..." : "Registrar Pedido"}
        </button>
      </form>
      
      <hr style={{ margin: '25px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

      {/* NUEVA SECCIÓN 2: Monitoreo en Tiempo Real y Cierre */}
      <div>
        <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '10px' }}>📦 Envíos Activos ({pedidosActivos.length})</h3>
        
        {pedidosActivos.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No hay pedidos en tránsito en este momento.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
            {pedidosActivos.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1e293b' }}>{p.codigo_pedido}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>HW: {p.hardware_id}</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                    {p.tipo_pedido === 'congelado' && '❄️ Congelado'}
                    {p.tipo_pedido === 'comida' && '🍔 Comida'}
                    {p.tipo_pedido === 'farmaceutica' && '💊 Fármacos'}
                  </div>
                </div>
                <button 
                  onClick={() => handleFinalizarPedido(p.id)}
                  style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                >
                  Terminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} style={{ width: '100%', padding: '10px', marginTop: '25px', backgroundColor: 'transparent', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem' }}>
        Cerrar Sesión
      </button>
    </div>
  );
}