import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto update
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('SAFE DIAGNOSTIC LOG — PWA content updated in background');
    },
    onOfflineReady() {
      console.log('SAFE DIAGNOSTIC LOG — Zenera Trips PWA is available offline');
    },
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
