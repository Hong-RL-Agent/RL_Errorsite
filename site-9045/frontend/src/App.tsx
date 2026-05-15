import { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { LibraryPage } from './pages/LibraryPage';
import { Navbar } from './components/Navbar';

export const App = () => {
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30 overflow-x-hidden">
      <Navbar />
      
      <div className="transition-all duration-700 ease-in-out">
        {view === 'landing' && <LandingPage onStart={() => setView('login')} />}
        {view === 'login' && <LoginPage onLogin={() => setView('dashboard')} onBack={() => setView('landing')} />}
        {view === 'dashboard' && <LibraryPage />}
      </div>
    </div>
  );
};