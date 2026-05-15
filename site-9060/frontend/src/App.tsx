import { useEffect, useRef, useState } from 'react';

interface OrbitData {
  id: number;
  x: number;
  y: number;
  z: number;
  velocity: number;
  threatLevel: number;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [orbits, setOrbits] = useState<OrbitData[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [scanStatus, setScanStatus] = useState<string>('Idle');

  useEffect(() => {
    fetch('/api/orbits')
      .then(res => res.json())
      .then(data => setOrbits(data))
      .catch(console.error);

    fetch('/api/telemetry/sensitive')
      .then(res => res.json())
      .then(data => setTelemetry(data))
      .catch(console.error);

    setScanStatus('Scanning...');
    fetch('/api/debris/scan')
      .then(res => res.json())
      .then(data => setScanStatus(`Complete (${data.latencyMs}ms)`))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      orbits.forEach(orbit => {
        const rotatedX = orbit.x * Math.cos(angle) - orbit.z * Math.sin(angle);
        const rotatedZ = orbit.x * Math.sin(angle) + orbit.z * Math.cos(angle);
        
        const scale = 300 / (300 + rotatedZ);
        const projX = centerX + rotatedX * scale * 2;
        const projY = centerY + orbit.y * scale * 2;
        
        ctx.beginPath();
        ctx.arc(projX, projY, Math.max(0.5, 3 * scale * orbit.threatLevel), 0, Math.PI * 2);
        
        if (orbit.threatLevel > 0.8) {
          ctx.fillStyle = '#FB923C';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#FB923C';
        } else {
          ctx.fillStyle = '#A855F7';
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#A855F7';
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      angle += 0.005;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [orbits]);

  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden bg-cosmic-bg text-white">
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at center, #2DD4BF 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <header className="absolute top-0 w-full p-4 z-10 flex justify-between items-center glass-panel rounded-none border-t-0 border-x-0">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cosmic-mint animate-pulse" />
          <h1 className="text-xl font-bold tracking-widest text-cosmic-mint">ORBIT-WATCHER</h1>
        </div>
        <div className="text-sm font-mono text-gray-400">
          Uplink: <span className="text-cosmic-orange">SECURE</span> | System Load: <span className="text-cosmic-violet">NOMINAL</span>
        </div>
      </header>

      <div className="flex-1 flex pt-16 pb-48 px-4 gap-4 relative z-0">
        <div className="w-80 glass-panel flex flex-col p-4 h-full">
          <h2 className="text-cosmic-orange font-semibold tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-cosmic-orange rounded-full" />
            HIGH-RISK DEBRIS
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 font-mono text-sm">
            {orbits.filter(o => o.threatLevel > 0.8).slice(0, 15).map(orbit => (
              <div key={orbit.id} className="p-2 border border-cosmic-border bg-black/40 rounded flex justify-between items-center">
                <span className="text-gray-300">OBJ-{orbit.id}</span>
                <span className="text-cosmic-orange font-bold">{(orbit.threatLevel * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cosmic-violet/20 shadow-[0_0_100px_rgba(168,85,247,0.1)] m-10 pointer-events-none" />
          <div className="absolute inset-0 rounded-full border border-cosmic-mint/10 shadow-[0_0_150px_rgba(45,212,191,0.05)] m-32 pointer-events-none" />
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={800} 
            className="max-w-full max-h-full object-contain mix-blend-screen"
          />
        </div>
      </div>

      <div className="absolute bottom-0 w-full h-44 p-4 z-10 flex gap-4">
        <div className="flex-1 glass-panel p-4 flex flex-col justify-center">
          <h3 className="text-cosmic-mint font-bold mb-2 text-sm uppercase tracking-wider">Classification Telemetry</h3>
          <div className="font-mono text-xs text-gray-400 space-y-1">
            <p>Status: <span className="text-white">{telemetry?.status || 'LOADING'}</span></p>
            <p>ID: <span className="text-white">{telemetry?.classificationId || 'N/A'}</span></p>
            <p>Vuln Index: <span className="text-cosmic-violet">{telemetry?.vulnerabilityIndex || '0.0'}</span></p>
            <p className="text-[10px] mt-2 italic opacity-60 text-cosmic-orange">Anti-Pattern: Missing Cache-Control headers</p>
          </div>
        </div>

        <div className="flex-1 glass-panel p-4 flex flex-col justify-center">
          <h3 className="text-cosmic-violet font-bold mb-2 text-sm uppercase tracking-wider">Deep Space Radar</h3>
          <div className="font-mono text-sm text-gray-300">
            <p className="flex justify-between border-b border-cosmic-border pb-1">
              <span>Scan Status</span>
              <span className={scanStatus.includes('Scanning') ? 'text-cosmic-orange animate-pulse' : 'text-cosmic-mint'}>{scanStatus}</span>
            </p>
            <p className="text-[10px] text-gray-500 mt-2 text-cosmic-orange">Anti-Pattern: Simulated cascading tail latency amplification</p>
          </div>
        </div>

        <div className="flex-1 glass-panel p-4 flex flex-col justify-center">
          <h3 className="text-gray-300 font-bold mb-2 text-sm uppercase tracking-wider">System Health</h3>
          <div className="space-y-2">
            <div className="w-full bg-black/50 rounded h-2 overflow-hidden">
              <div className="bg-cosmic-mint w-[20%] h-full"></div>
            </div>
            <div className="w-full bg-black/50 rounded h-2 overflow-hidden">
              <div className="bg-cosmic-orange w-[85%] h-full animate-pulse"></div>
            </div>
            <div className="w-full bg-black/50 rounded h-2 overflow-hidden">
              <div className="bg-cosmic-violet w-[45%] h-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
