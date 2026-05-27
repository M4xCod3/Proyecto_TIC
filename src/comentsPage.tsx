import React from 'react';
import ReactDOM from 'react-dom/client';
import Coments from './coments';

const rootElement = document.getElementById('coments-root');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <Coments />
        </React.StrictMode>
    );
}
