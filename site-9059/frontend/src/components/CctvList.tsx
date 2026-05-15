import React from 'react';
import { Video, AlertTriangle } from 'lucide-react';

export const CctvList: React.FC = () => {
  const cctvs = [
    { id: 'CAM-01', location: 'Downtown Intersect', status: 'online', traffic: 'High' },
    { id: 'CAM-02', location: 'Highway 42 North', status: 'online', traffic: 'Medium' },
    { id: 'CAM-03', location: 'Bridge Route 9', status: 'offline', traffic: 'Unknown' },
    { id: 'CAM-04', location: 'Suburbs Exit', status: 'online', traffic: 'Low' },
  ];

  return (
    <div className="glass-panel p-4 rounded-xl h-full flex flex-col">
      <h3 className="text-cyan-400 font-bold text-lg glow-text flex items-center gap-2 mb-4">
        <Video size={20} /> Live CCTV Feeds
      </h3>
      
      <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {cctvs.map(cam => (
          <div key={cam.id} className="bg-slate-800/60 p-3 rounded border border-slate-700 hover:border-cyan-500/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold text-slate-200">{cam.id}</span>
              {cam.status === 'online' ? (
                <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_#22C55E] mt-1"></span>
              ) : (
                <AlertTriangle size={14} className="text-pink-500" />
              )}
            </div>
            <p className="text-xs text-slate-400 mb-2">{cam.location}</p>
            
            <div className="aspect-video bg-black rounded overflow-hidden relative border border-slate-700">
              {cam.status === 'online' ? (
                <div className="w-full h-full flex items-center justify-center opacity-30 bg-slate-900">
                  <span className="text-xs text-cyan-500/50 tracking-widest font-mono">[ STREAM ACTIVE ]</span>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-red-500/50 bg-red-950/20">
                  <span className="text-xs font-mono">NO SIGNAL</span>
                </div>
              )}
              {/* Fake timestamp */}
              <div className="absolute bottom-1 right-2 text-[8px] text-slate-500 font-mono">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
