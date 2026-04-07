import React from 'react';
import './index.css';


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
        <li><a href="#LLD">Lluvia de ideas</a></li>
        <li><a href="#IDI">Interpretación de la idea</a></li>
        <li><a href="#IMP">Implementación</a></li>
        <li><a href="#Cont">Construcción</a></li>
        <li><a href="#PB">Pruebas</a></li>
      </ul>
    </aside>

    {/* CONTENT */}
    <div className="document-content">
      <section id="ETP">
        <h3>Etapas del proyecto</h3>
        <p>Aquí puedes explicar las etapas...</p>
      </section>

      <section id="LLD">
        <h3>Lluvia de ideas</h3>
        <p>Ideas iniciales del proyecto...</p>
      </section>

      <section id="IDI">
        <h3>Interpretación de la idea</h3>
        <p>Cómo definieron la solución...</p>
      </section>

      <section id="IMP">
        <h3>Implementación</h3>
        <p>Cómo lo desarrollaron...</p>
      </section>

      <section id="Cont">
        <h3>Construcción</h3>
        <p>Parte física o técnica...</p>
      </section>

      <section id="PB">
        <h3>Pruebas</h3>
        <p>Resultados y validación...</p>
      </section>
    </div>

  </div>
</section>
    );
}