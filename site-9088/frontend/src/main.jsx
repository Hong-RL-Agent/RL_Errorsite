import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/app.css';
import { I18nGate } from './i18n/I18nGate.jsx';

const Dashboard = React.lazy(() => import('./App.jsx'));

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nGate>
      <Suspense fallback={<div className="boot-screen">AUTO-TRUCK telemetry kernel loading...</div>}>
        <Dashboard />
      </Suspense>
    </I18nGate>
  </React.StrictMode>,
);

