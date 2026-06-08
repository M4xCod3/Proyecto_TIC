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

    // 1. Verificación de contraseña antes de contactar a Supabase
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden. Por favor, verifica.");
      return;
    }

    setLoading(true);
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL, 
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      alert("Error: " + authError.message);
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("locales").insert([{ 
      nombre_local: formData.nombre_local, 
      direccion: formData.direccion, 
      dueno: formData.dueno,
      user_id: data.user?.id 
    }]);

    if (dbError) {
      alert("Error guardando datos: " + dbError.message);
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