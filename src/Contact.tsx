import { useState } from "react";
import { motion } from "framer-motion";
import { MailIcon, SendIcon,GitBranchIcon, CheckCircleIcon } from "lucide-react";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Textarea } from "./ui/textarea.tsx";
import { Label } from "./ui/label.tsx";
import { toast } from "sonner";
import './index.css';

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const socialLinks = [
  { icon: GitBranchIcon, label: "GitHub", href: "https://github.com/M4xCod3/Proyecto_TIC.git" },
  { icon: MailIcon, label: "Email", href: "mailto:proyecto@ejemplo.com" },
];

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
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
    if (!form.name || !form.email || !form.message) {
      toast.error("Por favor completa todos los campos requeridos.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Por favor ingresa un correo electrónico válido.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
    toast.success("Mensaje enviado correctamente. Te contactaremos pronto.");
  };

  return (
    <section id="contact" className="contact-section">
  <div className="contact-container">

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="contact-header"
    >
      <span className="contact-subtitle">
        <span className="line" />
        Contacto
        <span className="line" />
      </span>

      <h2 className="contact-title">
        Hablemos del <span className="gradient-text">proyecto</span>
      </h2>

      <p className="contact-description">
        ¿Tienes preguntas o quieres colaborar? Escríbenos.
      </p>
    </motion.div>

    <div className="contact-grid">

      <div className="contact-left">
        <div className="contact-box">
          <h3>Equipo del proyecto</h3>
          <p>
            Somos estudiantes apasionados por la tecnología. 
            Contáctanos para dudas o colaboración.
          </p>
        </div>

        <div className="contact-box">
          <h3>Redes</h3>
          <div className="contact-links">
            {socialLinks.map(({ icon: Icon, label, href }) => (
              <a key={label} href={href} target="_blank">
                <Icon />
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="contact-right">
        {submitted ? (
          <div className="contact-success">
            <CheckCircleIcon />
            <h3>Mensaje enviado</h3>
            <p>Te responderemos pronto.</p>
            <button onClick={() => setSubmitted(false)}>
              Enviar otro
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
              />
              <input
                name="email"
                placeholder="Correo"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <input
              name="subject"
              placeholder="Asunto"
              value={form.subject}
              onChange={handleChange}
            />

            <textarea
              name="message"
              placeholder="Mensaje"
              rows={5}
              value={form.message}
              onChange={handleChange}
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