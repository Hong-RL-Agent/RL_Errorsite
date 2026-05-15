import React, { useState } from 'react';
import { fetchLogs } from '../lib/api';
import { Server, Database, ShieldAlert } from 'lucide-react';

export const CloudDashboard: React.FC = () => {
  const [logDate, setLogDate] = useState('2026-05-01');
  const [logResult, setLogResult] = useState<string | null>(null);
  const [logError, setLogError] = useState<string | null>(null);

  // Defect 11: Storage Bucket Data Evaporation
  const handleFetchLogs = async () => {
    try {
      setLogResult(null);
      setLogError(null);
      const res = await fetchLogs(logDate);
      setLogResult(res.data.log || JSON.stringify(res.data));
    } catch (err: any) {
      if (err.response?.status === 404) {
        setLogError(err.response.data.error || "404 Not Found");
      } else {
        setLogError("Error fetching logs.");
      }
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl h-full flex flex-col">
      <h3 className="text-neon-green font-bold text-lg glow-text flex items-center gap-2 mb-4">
        <Server size={20} /> Cloud Infrastructure
      </h3>
      
      <div className="flex-grow space-y-4">
        <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-300">Main Region (AP-Northeast-2)</span>
            <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_#22C55E]"></span>
          </div>
          <p className="text-xs text-slate-500">Latency: 12ms | CPU: 45%</p>
        </div>
        
        <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-300">Backup Region (US-West-1)</span>
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
          </div>
          <p className="text-xs text-slate-500">Status: Standby</p>
        </div>

        {/* Defect 11 Controls */}
        <div className="mt-6 border-t border-slate-700 pt-4">
          <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2 mb-2">
            <Database size={16} /> Storage Logs
          </h4>
          <p className="text-xs text-slate-400 mb-2">Fetch system logs. Logs older than 7 days might be archived.</p>
          <div className="flex gap-2">
            <input 
              type="date" 
              value={logDate} 
              onChange={e => setLogDate(e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-cyan-500 flex-grow"
            />
            <button 
              onClick={handleFetchLogs}
              className="bg-cyan-700 hover:bg-cyan-600 px-3 py-1 rounded text-sm font-bold transition-colors"
            >
              Fetch
            </button>
          </div>
          
          {logResult && (
            <div className="mt-3 bg-slate-900 border border-slate-700 p-2 rounded text-xs font-mono text-green-400 overflow-x-auto">
              {logResult}
            </div>
          )}
          {logError && (
            <div className="mt-3 bg-red-950 border border-red-500 p-2 rounded text-xs font-mono text-red-400 flex items-start gap-2">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              {logError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
