import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function LocalPage() {
  const [user, setUser] = useState<any>(null);
  const [localId, setLocalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authData, setAuthData] = useState({ email: "", password: "" });
  const [pedidoData, setPedidoData] = useState({ codigo_pedido: "", hardware_id: "" });

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
        obtenerLocalId(data.session.user.email);
      }
    });
  }, []);

  const obtenerLocalId = async (email: string | undefined) => {
    const { data } = await supabase
      .from("locales")
      .select("id")
      .eq("correo", email)
      .single();
    if (data) setLocalId(data.id);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword(authData);
    if (error) alert(error.message);
    else {
      setUser(data.user);
      obtenerLocalId(data.user.email);
    }
  };

  const handleRegistrarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localId) return;
    setLoading(true);
    const { error } = await supabase.from("pedido").insert([{
      codigo_pedido: pedidoData.codigo_pedido,
      local_id: localId,
      hardware_id: pedidoData.hardware_id,
      estado: "activo"
    }]);
    if (error) alert(error.message);
    else alert("Pedido registrado exitosamente.");
    setLoading(false);
  };

  if (!user) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: 'auto' }}>
          <input type="email" placeholder="Correo" onChange={(e) => setAuthData({...authData, email: e.target.value})} />
          <input type="password" placeholder="Contraseña" onChange={(e) => setAuthData({...authData, password: e.target.value})} />
          <button type="submit">Ingresar</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '50px' }}>
      <h2>Bienvenido, Local: {localId}</h2>
      <form onSubmit={handleRegistrarPedido} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input required placeholder="Código de Pedido" onChange={(e) => setPedidoData({...pedidoData, codigo_pedido: e.target.value})} />
        <input required placeholder="ID Hardware" onChange={(e) => setPedidoData({...pedidoData, hardware_id: e.target.value})} />
        <button disabled={loading} type="submit">{loading ? "..." : "Registrar Pedido"}</button>
      </form>
      <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }}>Cerrar Sesión</button>
    </div>
  );
}