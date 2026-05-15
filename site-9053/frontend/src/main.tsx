import React from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AlertTriangle, Cpu, Database, Gauge, Leaf, Radio, ServerCog, TerminalSquare, Zap } from 'lucide-react';
import './styles.css';

type AnomalyStatus = {
  id: string;
  name: string;
  subsystem: string;
  severity: string;
  enabled: boolean;
  intensity: number;
  signal: string;
  mitigation: string;
};

type FarmTelemetry = {
  wallClock: string;
  farmClock: string;
  soilMoisture: number;
  canopyTemperature: number;
  co2Ppm: number;
  lightLux: number;
  pumpPressure: number;
  aiGrowthFps: number;
  apiLatencyMs: number;
  memoryPressure: number;
  diskIoPressure: number;
  pcieSaturation: number;
  workqueueDepth: number;
  ringBusContention: number;
  numaFlushLatencyMs: number;
  anomalies: AnomalyStatus[];
};

type SystemLogEntry = {
  timestamp: string;
  level: string;
  subsystem: string;
  message: string;
};

const fallbackTelemetry: FarmTelemetry = {
  wallClock: new Date().toISOString(),
  farmClock: new Date().toISOString(),
  soilMoisture: 64,
  canopyTemperature: 23.4,
  co2Ppm: 714,
  lightLux: 34200,
  pumpPressure: 4.7,
  aiGrowthFps: 42,
  apiLatencyMs: 165,
  memoryPressure: 61,
  diskIoPressure: 57,
  pcieSaturation: 76,
  workqueueDepth: 92,
  ringBusContention: 63,
  numaFlushLatencyMs: 212,
  anomalies: [],
};

function App() {
  const [tab, setTab] = React.useState<'farm' | 'system'>('farm');
  const [telemetry, setTelemetry] = React.useState<FarmTelemetry>(fallbackTelemetry);
  const [logs, setLogs] = React.useState<SystemLogEntry[]>([]);
  const [connected, setConnected] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const [telemetryRes, logsRes] = await Promise.all([fetch('/api/telemetry'), fetch('/api/logs')]);
      setTelemetry(await telemetryRes.json());
      setLogs(await logsRes.json());
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    const timer = window.setInterval(load, 2500);
    return () => window.clearInterval(timer);
  }, [load]);

  const runAction = async (path: string) => {
    try {
      await fetch(path, { method: 'POST' });
      await load();
    } catch {
      setConnected(false);
    }
  };

  const toggle = async (id: string) => {
    try {
      await fetch(`/api/anomalies/${id}/toggle`, { method: 'POST' });
      await load();
    } catch {
      setConnected(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f1720] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(135deg,rgba(30,41,59,0.95),rgba(15,23,32,1)_48%,rgba(11,18,25,1))]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1480px] gap-5 px-5 py-5">
        <aside className="hidden w-64 shrink-0 rounded-lg border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/30 backdrop-blur-xl lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-emerald-500 text-slate-950">
              <Leaf size={22} />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-wide">AGRO-CORE</p>
              <p className="text-xs text-slate-400">Smart Farm Control</p>
            </div>
          </div>
          <nav className="space-y-2">
            <NavButton active={tab === 'farm'} icon={<Gauge size={18} />} label="Farm Monitor" onClick={() => setTab('farm')} />
            <NavButton active={tab === 'system'} icon={<ServerCog size={18} />} label="System Health" onClick={() => setTab('system')} />
          </nav>
          <div className="mt-8 rounded-md border border-white/10 bg-slate-950/40 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Cluster Link</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-300">Port 9053</span>
              <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-5">
          <header className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">Eco-Industrial Control Plane</p>
                <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Precision Crop Operations</h1>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <HeaderMetric label="Wall Clock" value={formatTime(telemetry.wallClock)} />
                <HeaderMetric label="Farm Clock" value={formatTime(telemetry.farmClock)} />
                <HeaderMetric label="AI FPS" value={telemetry.aiGrowthFps.toFixed(0)} />
                <HeaderMetric label="API ms" value={telemetry.apiLatencyMs.toFixed(0)} tone="amber" />
              </div>
            </div>
          </header>

          {tab === 'farm' ? (
            <FarmMonitor telemetry={telemetry} logs={logs} runAction={runAction} />
          ) : (
            <SystemHealth telemetry={telemetry} logs={logs} toggle={toggle} runAction={runAction} />
          )}
        </section>
      </div>
    </main>
  );
}

function FarmMonitor({ telemetry, logs, runAction }: { telemetry: FarmTelemetry; logs: SystemLogEntry[]; runAction: (path: string) => void }) {
  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="grid gap-5 md:grid-cols-2">
          <GaugeCard title="Soil Moisture" value={telemetry.soilMoisture} unit="%" max={100} icon={<Activity />} />
          <GaugeCard title="Canopy Temp" value={telemetry.canopyTemperature} unit="C" max={40} icon={<Leaf />} amber={telemetry.canopyTemperature > 27} />
          <GaugeCard title="CO2 Cycle" value={telemetry.co2Ppm} unit="ppm" max={1200} icon={<Radio />} />
          <GaugeCard title="Pump Pressure" value={telemetry.pumpPressure} unit="bar" max={7} icon={<Zap />} amber={telemetry.pumpPressure < 3.5} />
        </div>
        <GrowthPanel telemetry={telemetry} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <CommandPanel runAction={runAction} />
        <Terminal logs={logs} />
      </div>
    </>
  );
}

function SystemHealth({ telemetry, logs, toggle, runAction }: { telemetry: FarmTelemetry; logs: SystemLogEntry[]; toggle: (id: string) => void; runAction: (path: string) => void }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
      <section className="grid gap-3">
        {telemetry.anomalies.map((anomaly) => (
          <button key={anomaly.id} onClick={() => toggle(anomaly.id)} className="rounded-lg border border-white/10 bg-white/[0.055] p-4 text-left backdrop-blur-xl transition hover:border-emerald-400/50 hover:bg-white/[0.08]">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded px-2 py-1 text-[11px] font-semibold uppercase ${anomaly.severity === 'critical' ? 'bg-amber-500/20 text-amber-200' : 'bg-emerald-500/15 text-emerald-200'}`}>{anomaly.severity}</span>
                  <span className="text-xs text-slate-400">{anomaly.subsystem}</span>
                </div>
                <h2 className="mt-2 text-lg font-semibold text-white">{anomaly.name}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-300">{anomaly.signal}</p>
                <p className="mt-2 text-xs text-slate-500">Mitigation: {anomaly.mitigation}</p>
              </div>
              <div className="flex items-center gap-4">
                <MiniBar value={anomaly.intensity * 100} />
                <span className={`w-16 text-right text-sm font-semibold ${anomaly.enabled ? 'text-emerald-300' : 'text-slate-500'}`}>{anomaly.enabled ? 'ACTIVE' : 'OFF'}</span>
              </div>
            </div>
          </button>
        ))}
      </section>
      <aside className="space-y-5">
        <Diagnostics telemetry={telemetry} />
        <CommandPanel runAction={runAction} compact />
        <Terminal logs={logs.slice(0, 8)} />
      </aside>
    </div>
  );
}

function GaugeCard({ title, value, unit, max, icon, amber = false }: { title: string; value: number; unit: string; max: number; icon: React.ReactNode; amber?: boolean }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = amber ? '#F59E0B' : '#10B981';
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.065] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="text-slate-400 [&_svg]:size-5">{icon}</div>
        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-4xl font-semibold text-white">{value.toFixed(unit === 'bar' ? 1 : 0)}</p>
          <p className="mt-1 text-sm text-slate-400">{unit}</p>
        </div>
        <svg viewBox="0 0 120 70" className="h-20 w-32">
          <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="10" strokeLinecap="round" />
          <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" pathLength="100" strokeDasharray={`${pct} 100`} />
          <circle cx={10 + pct} cy="60" r="3" fill={color} />
        </svg>
      </div>
    </article>
  );
}

function GrowthPanel({ telemetry }: { telemetry: FarmTelemetry }) {
  const points = Array.from({ length: 18 }, (_, i) => {
    const x = 8 + i * 24;
    const y = 125 - Math.sin(i / 2.2) * 18 - telemetry.soilMoisture / 3 + (i % 3) * 5;
    return `${x},${Math.max(28, Math.min(135, y))}`;
  }).join(' ');
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">AI Growth Simulation</p>
          <h2 className="mt-2 text-2xl font-semibold">Canopy Forecast</h2>
        </div>
        <div className="rounded-md bg-slate-950/50 px-3 py-2 text-right">
          <p className="text-xs text-slate-500">Light</p>
          <p className="font-semibold text-amber-200">{telemetry.lightLux.toFixed(0)} lux</p>
        </div>
      </div>
      <svg viewBox="0 0 430 170" className="mt-6 h-56 w-full">
        <defs>
          <linearGradient id="growthFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity=".42" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="rgba(255,255,255,.08)">
          {[35, 70, 105, 140].map((y) => <line key={y} x1="8" x2="420" y1={y} y2={y} />)}
        </g>
        <polyline points={`8,150 ${points} 416,150`} fill="url(#growthFill)" stroke="none" />
        <polyline points={points} fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </article>
  );
}

function Diagnostics({ telemetry }: { telemetry: FarmTelemetry }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Cpu size={18} /> Diagnostic Bus</h2>
      <MetricRow label="Memory Pressure" value={telemetry.memoryPressure} />
      <MetricRow label="Disk I/O Pressure" value={telemetry.diskIoPressure} />
      <MetricRow label="PCIe Saturation" value={telemetry.pcieSaturation} />
      <MetricRow label="Workqueue Depth" value={Math.min(100, telemetry.workqueueDepth / 2.2)} />
      <MetricRow label="Ring Bus Contention" value={telemetry.ringBusContention} />
      <MetricRow label="NUMA Flush" value={Math.min(100, telemetry.numaFlushLatencyMs / 3.3)} />
    </article>
  );
}

function CommandPanel({ runAction, compact = false }: { runAction: (path: string) => void; compact?: boolean }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Database size={18} /> Control Commands</h2>
      <div className={`grid gap-3 ${compact ? '' : 'md:grid-cols-3'}`}>
        <ActionButton label="Historical Analysis" onClick={() => runAction('/api/actions/historical-analysis')} />
        <ActionButton label="3D Leaf Analysis" onClick={() => runAction('/api/actions/leaf-analysis')} />
        <ActionButton label="Archive Flush" onClick={() => runAction('/api/actions/archive-flush')} />
      </div>
    </article>
  );
}

function Terminal({ logs }: { logs: SystemLogEntry[] }) {
  return (
    <article className="min-h-72 rounded-lg border border-emerald-400/20 bg-[#06100d]/90 p-4 font-mono shadow-2xl shadow-emerald-950/20">
      <div className="mb-3 flex items-center justify-between border-b border-emerald-400/10 pb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-emerald-200"><TerminalSquare size={16} /> kernel.feed</h2>
        <span className="text-xs text-emerald-500">streaming</span>
      </div>
      <div className="space-y-2 overflow-hidden text-xs leading-5">
        {(logs.length ? logs : [{ timestamp: new Date().toISOString(), level: 'INFO', subsystem: 'frontend', message: 'Waiting for backend telemetry stream' }]).map((log, index) => (
          <p key={`${log.timestamp}-${index}`} className="text-emerald-100/85">
            <span className="text-slate-500">{formatTime(log.timestamp)}</span> <span className={log.level === 'CRIT' ? 'text-amber-300' : 'text-emerald-300'}>{log.level}</span> <span className="text-slate-400">[{log.subsystem}]</span> {log.message}
          </p>
        ))}
      </div>
    </article>
  );
}

function HeaderMetric({ label, value, tone = 'emerald' }: { label: string; value: string; tone?: 'emerald' | 'amber' }) {
  return (
    <div className="min-w-28 rounded-md border border-white/10 bg-slate-950/35 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 font-semibold ${tone === 'amber' ? 'text-amber-300' : 'text-emerald-300'}`}>{value}</p>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition ${active ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:bg-white/10'}`}>
      {icon}
      {label}
    </button>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20">
      <Zap size={16} />
      {label}
    </button>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className={value > 70 ? 'text-amber-300' : 'text-emerald-300'}>{value.toFixed(0)}%</span>
      </div>
      <MiniBar value={value} />
    </div>
  );
}

function MiniBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
      <div className={`h-full rounded-full ${value > 70 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(value));
}

createRoot(document.getElementById('root')!).render(<App />);
