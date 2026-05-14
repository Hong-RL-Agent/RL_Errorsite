import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './styles/beauty.css';
import './styles/booking.css';
import './styles/sticky-cta.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
