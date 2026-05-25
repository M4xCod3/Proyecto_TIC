import { useState } from "react";
import { motion } from "framer-motion";
import { MailIcon, SendIcon, GitBranchIcon, CheckCircleIcon } from "lucide-react";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Textarea } from "./ui/textarea.tsx";
import { Label } from "./ui/label.tsx";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";
import './index2.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export default function Contact() {
  const [form, setForm] = useState<FormState>({\r
    name: "",\r
    email: "",\r
    subject: "",\r
    message: "",\r
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que todos los campos estén completos antes de enviar
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error("Por favor, completa todos los campos del formulario.");
      return;
    }

    setLoading(true);

    try {
      // Inserción de datos en la tabla de Supabase
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

      // Si no hay error, actualizar estados e indicar éxito
      setSubmitted(true);
      toast.success("¡Mensaje enviado correctamente a la base de datos!");
      
      // Resetear el formulario vaciando los campos
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      console.error("Error al guardar el mensaje:", error.message);
      toast.error("Hubo un problema al enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-section" id="contacto">
      <div className="contact-container">
        <div className="contact-header">
          <h2 className="contact-title">
            Contáctanos y <span className="gradient-text">Trabajemos Juntos</span>
          </h2>
          <p className="contact-description">
            Si tienes dudas sobre Log-Cold o quieres implementar nuestra solución, escríbenos.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-left">
            <div className="contact-box">
              <h3>Información de Contacto</h3>
              <p>Estamos disponibles para resolver tus dudas técnicas o comerciales.</p>
              <div className="contact-links">
                {socialLinks.map((link, idx) => {
                  const Icon = link.icon;
                  return (
                    <a key={idx} href={link.href} target="_blank" rel="noreferrer">
                      <Icon size={18} />
                      {link.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="contact-right">
            {submitted ? (
              <div className="contact-success">
                <CheckCircleIcon size={40} />
                <h3>Mensaje enviado</h3>
                <p>El mensaje ha sido registrado en la base de datos con éxito.</p>
                <button onClick={() => setSubmitted(false)}>
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <input
                    name="name"
                    placeholder="Nombre"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Correo"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <input
                  name="subject"
                  placeholder="Asunto"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />

                <textarea
                  name="message"
                  placeholder="Mensaje"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                />

                <button type="submit" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar mensaje"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}