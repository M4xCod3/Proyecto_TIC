import React from 'react';
import ReactDOM from 'react-dom/client';
import Analytics from './Analytics';
import './index.css';

// Standalone Analytics Page Entry Point
// This renders the Analytics dashboard as an independent page
// accessible via /analytics.html

console.log("[v0] AnalyticsPage.tsx loaded");

const rootElement = document.getElementById('analytics-root');
console.log("[v0] Root element found:", !!rootElement);

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Analytics />
    </React.StrictMode>
  );
  console.log("[v0] Analytics component rendered");
} else {
  console.error("[v0] analytics-root element not found!");
  // Show error message in the page
  document.body.innerHTML = `
    <div style="min-height: 100vh; background: #020617; color: white; display: flex; align-items: center; justify-content: center; font-family: sans-serif;">
      <div style="text-align: center; padding: 2rem;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">Error de Carga</h1>
        <p style="color: #9ca3af;">No se pudo encontrar el elemento root para la aplicacion.</p>
        <p style="color: #9ca3af; margin-top: 1rem;">Revisa la consola del navegador para mas detalles.</p>
      </div>
    </div>
  `;
}
