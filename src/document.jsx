import React from 'react';
import './index.css';
import ETP from './ETP';


export default function Document() {
    return (
        <section id="document" className="document-section">
  
  {/* BACKGROUND */}
  <div className="document-bg" />

  <div className="document-container">

    {/* SIDEBAR */}
    <aside className="document-sidebar">
      <h2>Documentación</h2>

      <ul>
        <li><a href="#ETP">Etapas del proyecto</a></li>
        <li><a href="#IMP">Implementación</a></li>
        <li><a href="#Cont">Construcción</a></li>
        <li><a href="#PB">Pruebas</a></li>
      </ul>
    </aside>

    {/* CONTENT */}
    <div className="document-content">

      <a href="/ETP.html" className="doc-card-button">
        <section id="ETP">
          <h3>Etapas del proyecto</h3>
          <p>Explora el ciclo de vida de Log-Cold...</p>
        </section>
      </a>
      
      <a href="/IMP.html" className="doc-card-button">
        <section id="IMP">
          <h3>Implementación</h3>
          <p>Conoce cómo articulamos el flujo de datos utilizando C++ 
            para el firmware, el protocolo ESP-NOW para una red robusta 
            sin dependencia de WiFi y la sincronización en tiempo real con
            Supabase mediante HTTP.</p>
        </section>
      </a>

      <a href="/CONT.html" className="doc-card-button">
        <section id="Cont">
          <h3>Construcción</h3>
          <p>Detalle del desarrollo físico del proyecto:
             configuración de nodos sensores con ESP32 y DHT22,
              integración del módulo GPS NEO-6M y el diseño del esquema 
              de alimentación para garantizar portabilidad y autonomía energética.</p>
        </section>
      </a>

      <a href="/PB.html" className="doc-card-button">
        <section id="PB">
          <h3>Pruebas</h3>
          <p>Revisión de los protocolos de prueba: 
            validación de la precisión de telemetría, 
            tiempos de latencia menores a 5 segundos y 
            la confirmación de persistencia de datos (HTTP 201)
            bajo condiciones de conectividad variable.</p>
        </section>
      </a>
    </div>

  </div>
</section>
    );
}