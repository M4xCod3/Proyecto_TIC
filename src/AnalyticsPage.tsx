import React from 'react';
import ReactDOM from 'react-dom/client';
import Analytics from './Analytics';

const rootElement = document.getElementById('analytics-root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Analytics />
    </React.StrictMode>
  );
}
