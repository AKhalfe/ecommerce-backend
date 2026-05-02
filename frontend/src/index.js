import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import QRPage from './QRPage';

const path = window.location.pathname;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  path === '/qr' ? <QRPage /> : <App />
);