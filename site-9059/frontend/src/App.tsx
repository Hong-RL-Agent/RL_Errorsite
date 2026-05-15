import React, { useState } from 'react';
import { MapComponent } from './components/MapComponent';
import { DataTable } from './components/DataTable';
import { WasmSimulator } from './components/WasmSimulator';
import { CloudDashboard } from './components/CloudDashboard';
import { CctvList } from './components/CctvList';
import { Settings, ShieldAlert } from 'lucide-react';

function App() {
  const [simulateTimeout, setSimulateTimeout] = useState(false);
  const [regionFailover, setRegionFailover] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 selection:bg-cyan-500/30 flex flex-col">
      <header className="flex justify-between items-center mb-4 pb-4 border-b border-cyan-900/50 shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tighter glow-text bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            SMART-TRAFFIC
          </h1>
          <p className="text-slate-400 text-sm mt-1">Next-Gen Urban Mobility Control System</p>
        </div>
        
        {/* Top bar controls for Backend Defects */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm bg-slate-800/80 px-3 py-1 rounded border border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={simulateTimeout} 
              onChange={e => setSimulateTimeout(e.target.checked)}
              className="accent-pink-500"
            />
            <ShieldAlert size={14} className="text-pink-500" />
            Force Timeout (Defect 3)
          </label>
          <label className="flex items-center gap-2 text-sm bg-slate-800/80 px-3 py-1 rounded border border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={regionFailover} 
              onChange={e => setRegionFailover(e.target.checked)}
              className="accent-red-500"
            />
            <Settings size={14} className="text-red-500" />
            Trigger Region Isolation (Defect 2)
          </label>
        </div>
      </header>

      {/* 3-Column Grid Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-grow">
        
        {/* Left Pane: CCTV List */}
        <aside className="lg:col-span-3 flex flex-col h-[calc(100vh-120px)]">
          <CctvList />
        </aside>

        {/* Center Pane: Interactive Map & Data Table */}
        <div className="lg:col-span-6 flex flex-col gap-4 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
          <section className="relative shrink-0">
            <MapComponent />
          </section>
          <section className="flex-grow">
            <DataTable simulateTimeout={simulateTimeout} regionFailover={regionFailover} />
          </section>
        </div>

        {/* Right Pane: Region Status & Wasm Simulator */}
        <aside className="lg:col-span-3 flex flex-col gap-4 h-[calc(100vh-120px)]">
          <div className="flex-grow">
            <CloudDashboard />
          </div>
          <div className="shrink-0">
            <WasmSimulator />
          </div>
        </aside>
      </main>
      
      {/* 
        Note: Defect 1 (Resource Quota) is active by default. 
        Spamming reload or triggering data fetch > 50 times will lock out the IP via the Backend Interceptor.
      */}
    </div>
  );
}

export default App;
