import React from 'react';
import ReactDOM from 'react-dom/client';
import ETP from './ETP'; 

const rootElement = document.getElementById('etp-root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ETP />
    </React.StrictMode>
  );
}