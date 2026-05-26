import { useState } from "react";
import { motion } from "framer-motion";
import { MailIcon, GitBranchIcon, CheckCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";
import './index2.css';

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const socialLinks = [
  { icon: GitBranchIcon, label: "GitHub", href: "https://github.com/M4xCod3/Proyecto_TIC.git" },
  { icon: MailIcon, label: "Email", href: "mailto:maximiliano.arriagada@mail.udp.cl" },
];

const getSupabaseClient = () => {
  // Si estamos en el servidor (Astro SSR), no hacemos nada
  if (typeof window === "undefined") return null;

  // Forzar el tipado en window para evitar que TypeScript reclame
  const globalWindow = window as any;

  // Si no existe la instancia en este navegador, la creamos UNA sola vez
  if (!globalWindow.supabaseInstance) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error("Faltan las variables de entorno de Supabase en el .env");
    }

    globalWindow.supabaseInstance = createClient(url, key);
  }

  return globalWindow.supabaseInstance;
};

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error("Por favor completa todos los campos del formulario.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Por favor ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);

    try {
      // Inicializamos Supabase AQUÍ ADENTRO. 
      // Esto garantiza al 100% que se ejecuta solo en el navegador del cliente al hacer click
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        throw new Error("Faltan las variables de entorno de Supabase en el .env");
      }

      const supabase = createClient(url, key);

      const { error } = await supabase
        .from("mensajes_contacto")
        .insert([
          {
            nombre: form.name,
            correo: form.email,
            asunto: form.subject,
            mensaje: form.message,
          },
        ]);

      if (error) throw error;

      setSubmitted(true);
      toast.success("¡Mensaje enviado correctamente!");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      console.error("Error detectado:", error.message);
      toast.error(error.message || "Hubo un problema al enviar el mensaje.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      {/* ... Todo tu HTML y animaciones de motion se mantienen exactamente igual ... */}
      <div className="contact-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="contact-header"
        >
          <span className="contact-subtitle"><span className="line" />Contacto<span className="line" /></span>
          <h2 className="contact-title">Hablemos del <span className="gradient-text">proyecto</span></h2>
          <p className="contact-description">¿Tienes preguntas o quieres colaborar? Escríbenos.</p>
        </motion.div>

        <div className="contact-grid">
          <div className="contact-left">
            <div className="contact-box">
              <h3>Equipo del proyecto</h3>
              <p>Somos un equipo técnico y multidisciplinario de desarrollo comprometido con la creación de un ecosistema tecnológico integral end-to-end. Contáctanos para dudas o colaboración.</p>
            </div>
            <div className="contact-box">
              <h3>Redes</h3>
              <div className="contact-links">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"><Icon size={18} />{label}</a>
                ))}
              </div>
            </div>
          </div>

          <div className="contact-right">
            {submitted ? (
              <div className="contact-success">
                <CheckCircleIcon size={40} />
                <h3>Mensaje enviado</h3>
                <p>El mensaje ha sido registrado en la base de datos con éxito.</p>
                <button onClick={() => setSubmitted(false)}>Enviar otro</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
                  <input name="email" type="email" placeholder="Correo" value={form.email} onChange={handleChange} required />
                </div>
                <input name="subject" placeholder="Asunto" value={form.subject} onChange={handleChange} required />
                <textarea name="message" placeholder="Mensaje" rows={5} value={form.message} onChange={handleChange} required />
                <button type="submit" disabled={loading}>{loading ? "Enviando..." : "Enviar mensaje"}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}