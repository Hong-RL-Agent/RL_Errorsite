import React from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AlertTriangle, CloudSun, Database, Globe2, Server, ShieldAlert, TerminalSquare } from 'lucide-react';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App icons={{ Activity, AlertTriangle, CloudSun, Database, Globe2, Server, ShieldAlert, TerminalSquare }} />
  </React.StrictMode>
);

