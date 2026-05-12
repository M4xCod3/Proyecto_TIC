import React from 'react';
import ReactDOM from 'react-dom/client';
import IMP from './IMP'; 

const rootElement = document.getElementById('imp-root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <IMP />
    </React.StrictMode>
  );
}