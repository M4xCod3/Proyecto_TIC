import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterLocal() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    nombre_local: "", direccion: "", dueno: "", email: "", password: "", confirmPassword: "" 
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();

  // Aquí veremos en la consola qué datos tiene tu variable realmente
  console.log("Datos contenidos en formData antes del envío:", formData);

  if (formData.password !== formData.confirmPassword) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  setLoading(true);
  
  // ... (tu lógica de supabase.auth.signUp sigue igual)
  const { data, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  });

  if (authError) {
    alert("Error en Auth: " + authError.message);
    setLoading(false);
    return;
  }

  // AQUÍ ESTÁ EL PUNTO CRÍTICO. 
  // Vamos a imprimir qué le estamos pasando a la tabla exactamente.
  const datosParaInsertar = { 
    nombre_local: formData.nombre_local, 
    direccion: formData.direccion, 
    dueno: formData.dueno,
    user_id: data.user?.id 
  };
  
  console.log("Objeto que se enviará a Supabase:", datosParaInsertar);

  const { error: dbError } = await supabase.from("locales").insert([datosParaInsertar]);

  if (dbError) {
    console.error("Error detallado de Supabase:", dbError);
    alert("Error DB: " + dbError.message);
  } else {
    alert("¡Registro exitoso!");
    navigate("/");
  }
  setLoading(false);
};
  return (
    <div style={{ padding: '50px', backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Registrar Local</h2>
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input required placeholder="Email" type="email" style={inputStyle} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input required placeholder="Contraseña" type="password" style={inputStyle} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          {/* Campo de confirmación */}
          <input required placeholder="Confirmar contraseña" type="password" style={inputStyle} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
          
          <hr style={{ margin: '10px 0' }} />
          
          <input required placeholder="Nombre del Local" style={inputStyle} onChange={(e) => setFormData({...formData, nombre_local: e.target.value})} />
          <input required placeholder="Dirección" style={inputStyle} onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
          <input required placeholder="Dueño" style={inputStyle} onChange={(e) => setFormData({...formData, dueno: e.target.value})} />
          
          <button disabled={loading} type="submit" style={{ padding: '12px', backgroundColor: '#06b6d4', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            {loading ? "Procesando..." : "Registrar Ahora"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' };