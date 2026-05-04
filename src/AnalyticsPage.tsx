import React from 'react';
import ReactDOM from 'react-dom/client';
import Analytics from './Analytics';
import './index.css';

// Standalone Analytics Page Entry Point
// This renders the Analytics dashboard as an independent page
// accessible via /analytics.html

const rootElement = document.getElementById('analytics-root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Analytics />
    </React.StrictMode>
  );
}
