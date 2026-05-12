import React from 'react';
import ReactDOM from 'react-dom/client';
import CONT from './CONT'; 

const rootElement = document.getElementById('cont-root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <CONT />
    </React.StrictMode>
  );
}