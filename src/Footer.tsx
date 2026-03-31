import { ZapIcon } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  const handleNav = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <button
            onClick={() => handleNav("#hero")}
            className="flex items-center gap-2 group"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <ZapIcon className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">
              PROYECTO<span className="text-primary">TIC</span>
            </span>
          </button>

          {/* Nav links */}
          <nav className="flex items-center gap-6">
            {[
              { label: "Inicio", href: "#hero" },
              { label: "Proyecto", href: "#about" },
              { label: "Hardware", href: "#hardware" },
              { label: "Contacto", href: "#contact" },
            ].map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © {year} Proyecto TIC. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}