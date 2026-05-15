import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-slate-900/70 border-b border-cyan-500/20 px-6 py-4 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
        <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          NEO-LIT <span className="text-cyan-500 font-light text-sm ml-1">SYSTEMS</span>
        </span>
      </div>
      <div className="flex gap-6 text-sm font-medium text-slate-400">
        <span className="hover:text-cyan-400 cursor-pointer transition-colors">ARCHIVES</span>
        <span className="hover:text-cyan-400 cursor-pointer transition-colors">NEURAL LINK</span>
        <div className="px-3 py-1 rounded-full border border-cyan-500/30 text-[10px] text-cyan-500">
          SECURE NODE: 9045
        </div>
      </div>
    </nav>
  );
};