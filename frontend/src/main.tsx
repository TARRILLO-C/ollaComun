import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrar Service Worker para PWA instalable tanto en desarrollo como en producción
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('EcoFood Service Worker registrado con éxito:', registration.scope);
    }).catch(err => {
      console.warn('Fallo al registrar Service Worker: ', err);
    });
  });
}
