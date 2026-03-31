import { useState } from "react";
import { motion } from "framer-motion";
import { MailIcon, SendIcon,GitBranchIcon, CheckCircleIcon } from "lucide-react";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Textarea } from "./ui/textarea.tsx";
import { Label } from "./ui/label.tsx";
import { toast } from "sonner";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const socialLinks = [
  { icon: GitBranchIcon, label: "GitHub", href: "https://github.com" },
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
    // Simulate form submission delay
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
    toast.success("Mensaje enviado correctamente. Te contactaremos pronto.");
  };

  return (
    <section id="contact" className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,oklch(0.72_0.22_195/0.05),transparent)]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-widest mb-4">
            <span className="w-6 h-px bg-primary" />
            Contacto
            <span className="w-6 h-px bg-primary" />
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-4">
            Hablemos del{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              proyecto
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            ¿Tienes preguntas, sugerencias o quieres colaborar? Escríbenos y te
            responderemos a la brevedad.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left: info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-2">
                Equipo del proyecto
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Somos estudiantes apasionados por la tecnología. Si tienes
                dudas sobre el proyecto, el hardware o quieres colaborar,
                no dudes en contactarnos.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-4">
                Encuéntranos en
              </h3>
              <div className="flex flex-col gap-3">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg border border-border group-hover:border-primary/40 bg-secondary flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="p-8 rounded-xl border border-border bg-card">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <CheckCircleIcon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">
                    Mensaje enviado
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Gracias por escribirnos. Te responderemos lo antes posible.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", subject: "", message: "" });
                    }}
                  >
                    Enviar otro mensaje
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="name">
                        Nombre <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Juan Pérez"
                        value={form.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="email">
                        Correo <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="juan@ejemplo.com"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Pregunta sobre el hardware..."
                      value={form.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="message">
                      Mensaje <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Escribe tu mensaje aquí..."
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Enviando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <SendIcon className="w-4 h-4" />
                        Enviar mensaje
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}