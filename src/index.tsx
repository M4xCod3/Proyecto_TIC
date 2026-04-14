import React from 'react';
import ReactDOM from 'react-dom/client';
import Navbar from './Navbar';
import Hero from './Hero';
import About from './About';
import Hardware from './Hardware';
import Contact from './Contact';
import Footer from './Footer';
import Document from './document';
import './index.css'; 

export default function Index() {
  return (
    <>
      <div className="hero">
        <div className="navbar">
          <div className="logo">⚡ PROYECTO TIC</div>
          <div className="menu">
            <a href="#inicio">Inicio</a>
            <a href="#about">Proyecto</a>
            <a href="#hardware">Hardware</a>
            <a href="document">Documentacion</a>
            <a href="#contact">Contacto</a>
          </div>
          <button className="btn-contacto" onClick={() => {
            const el = document.querySelector("#contact");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}>
            Contáctanos
          </button>
        </div>

        <div className="hero-content" id="inicio">
          <p className="tag">● Proyecto TIC — IoT</p>

          <h1>
            Conectando el <span>mundo</span><br />
            <span className="gradient">real</span> con la tecnología
          </h1>

          <p className="desc">
            Solución IoT innovadora que integra sensores, automatización y monitoreo en tiempo real.
          </p>

          <div className="buttons">
            <button className="btn-primary">Descubrir el proyecto</button>
            <button className="btn-outline">Contactar al equipo</button>
          </div>
        </div>
      </div>

      {/* 👇 AHORA SÍ SE MUESTRAN */}
      <div id="about">
        <About />
      </div>

      <div id="hardware">
        <Hardware />
      </div>

      <div id="document"> 
        <Document />
      </div>

      <div id="contact">
        <Contact />
      </div>

      <Footer />
    </>
  );
}
// ESTO ES LO QUE FALTA PARA QUE NO SALGA EN BLANCO:
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Index />
    </React.StrictMode>
  );
}