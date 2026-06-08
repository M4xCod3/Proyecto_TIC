import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Store, UserPlus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function RegisterLocal() {
  const [formData, setFormData] = useState({ nombre: "", direccion: "", dueño: "" });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

    const { error } = await supabase.from("locales").insert([{ 
      nombre: formData.nombre, 
      direccion: formData.direccion, 
      dueno: formData.dueño 
    }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("¡Local registrado con éxito!");
      setFormData({ nombre: "", direccion: "", dueño: "" });
    }
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      padding: '50px', backgroundColor: '#0f172a', minHeight: '100vh', color: 'white' 
    }}>
      <div style={{ backgroundColor: 'white', color: '#333', padding: '30px', borderRadius: '15px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '20px' }}>Registrar Local</h2>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} placeholder="Nombre del Local" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
          <input style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} placeholder="Dirección" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
          <input style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} placeholder="Dueño" value={formData.dueño} onChange={(e) => setFormData({...formData, dueño: e.target.value})} />
          <button type="submit" style={{ padding: '12px', backgroundColor: '#06b6d4', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Registrar Ahora
          </button>
        </form>
      </div>
    </div>
  );
}