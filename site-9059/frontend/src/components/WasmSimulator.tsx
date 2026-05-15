import React, { useState } from 'react';
import { Cpu } from 'lucide-react';

export const WasmSimulator: React.FC = () => {
  const [computing, setComputing] = useState(false);

  // Defect 8: WebAssembly Memory Limit Crash Simulator
  const triggerWasmCrash = () => {
    setComputing(true);
    setTimeout(() => {
      try {
        // Attempting to allocate an extremely large array to simulate WASM Out-of-Memory / JS heap limit
        // Modern browsers usually limit a single array buffer to ~2GB.
        // We try to allocate multiple massive arrays until crash.
        const memoryHog: any[] = [];
        while (true) {
          // Allocate 100MB at a time
          memoryHog.push(new Float64Array(1024 * 1024 * 100));
        }
      } catch (e: any) {
        alert("CRITICAL ERROR: WebAssembly/JS Memory Limit Reached - " + e.message);
        setComputing(false);
      }
    }, 500);
  };

  return (
    <div className="glass-panel p-4 rounded-xl mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-pink-500 font-bold text-lg flex items-center gap-2">
          <Cpu size={20} /> Advanced AI Pathfinding
        </h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Calculate optimal routes for autonomous units using the WebAssembly high-performance computing module.
      </p>
      <button 
        onClick={triggerWasmCrash}
        disabled={computing}
        className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-900 text-white py-2 rounded font-bold transition-colors shadow-[0_0_15px_rgba(244,63,94,0.4)]"
      >
        {computing ? "Calculating... (Allocating Memory)" : "Calculate Optimal Routes (Heavy)"}
      </button>
    </div>
  );
};
