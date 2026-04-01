import { ZapIcon } from "lucide-react";
import './index.css';

export default function Footer() {
  const year = new Date().getFullYear();

  const handleNav = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="footer">
  <div className="footer-container">
    <div className="footer-content">

      <button onClick={() => handleNav("#hero")} className="footer-logo">
        ⚡ PROYECTO<span className="highlight">TIC</span>
      </button>

      <nav className="footer-nav">
        {[
          { label: "Inicio", href: "#hero" },
          { label: "Proyecto", href: "#about" },
          { label: "Hardware", href: "#hardware" },
          { label: "Contacto", href: "#contact" },
        ].map((link) => (
          <button
            key={link.href}
            onClick={() => handleNav(link.href)}
          >
            {link.label}
          </button>
        ))}
      </nav>

      <p className="footer-copy">
        © {year} Proyecto TIC. Todos los derechos reservados.
      </p>

    </div>
  </div>
</footer>
  );
}