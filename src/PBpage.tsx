import React from 'react';
import ReactDOM from 'react-dom/client';
import PB from './PB'; 

const rootElement = document.getElementById('pb-root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <PB />
    </React.StrictMode>
  );
}