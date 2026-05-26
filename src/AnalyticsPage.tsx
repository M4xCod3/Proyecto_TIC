import React from 'react';
import ReactDOM from 'react-dom/client';
import Analytics2 from './Analytics2';

const rootElement = document.getElementById('analytics-root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Analytics2 />
    </React.StrictMode>
  );
}
