import React from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, Bluetooth, Building2, Camera, Cctv, DoorOpen, KeyRound, RadioTower, Radar, ShieldCheck, Signal, Wifi } from 'lucide-react';
import App from './App.jsx';
import './styles.css';

const iconMap = { AlertTriangle, Bluetooth, Building2, Camera, Cctv, DoorOpen, KeyRound, RadioTower, Radar, ShieldCheck, Signal, Wifi };

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App iconMap={iconMap} />
  </React.StrictMode>
);
