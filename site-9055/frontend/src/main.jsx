import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  Cpu,
  DatabaseZap,
  Dna,
  Gauge,
  HardDrive,
  Network,
  Pause,
  Play,
  RadioTower,
  ServerCog,
  ShieldCheck,
  Zap
} from 'lucide-react';
import './styles.css';

const fallbackTelemetry = {
  runId: 'idle',
  running: false,
  progress: 0,
  throughputGbPerHour: 0,
  p95LatencyMs: 18,
  cpuCore0: 9,
  cpuOtherCores: 6,
  memoryPressure: 22,
  iops: 18500,
  gpuLaunchRate: 0,
  activeStage: 'Standby',
  bottlenecks: []
};

const palette = {
  ok: '#10b981',
  warn: '#f59e0b',
  hot: '#7C3AED',
  deep: '#1E1B4B'
};

function App() {
  const [telemetry, setTelemetry] = useState(fallbackTelemetry);
  const [sequencing, setSequencing] = useState({ reads: [], confidence: [], variantPositions: [] });
  const [selected, setSelected] = useState('irq-affinity');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [t, s] = await Promise.all([
          fetch('/api/telemetry').then((res) => res.json()),
          fetch('/api/sequencing').then((res) => res.json())
        ]);
        setTelemetry(t);
        setSequencing(s);
        setError('');
      } catch {
        setError('백엔드 텔레메트리 연결 대기 중');
      }
    };
    load();
    const timer = setInterval(load, 1200);
    return () => clearInterval(timer);
  }, []);

  const sortedBottlenecks = useMemo(
    () => [...(telemetry.bottlenecks || [])].sort((a, b) => b.severity - a.severity),
    [telemetry.bottlenecks]
  );
  const selectedBottleneck = sortedBottlenecks.find((item) => item.id === selected) || sortedBottlenecks[0];

  const controlRun = async () => {
    const endpoint = telemetry.running ? '/api/analysis/stop' : '/api/analysis/start?intensity=0.72';
    const next = await fetch(endpoint, { method: 'POST' }).then((res) => res.json());
    setTelemetry(next);
  };

  return (
    <main className="min-h-screen bg-white text-[#1E1B4B]">
      <div className="clinical-grid">
        <Header telemetry={telemetry} error={error} onToggle={controlRun} />

        <section className="mx-auto grid w-full max-w-[1520px] grid-cols-1 gap-5 px-5 pb-8 lg:grid-cols-[1.08fr_0.92fr]">
          <SequencingPanel sequencing={sequencing} telemetry={telemetry} />
          <SystemTelemetry telemetry={telemetry} />
        </section>

        <section className="mx-auto grid w-full max-w-[1520px] grid-cols-1 gap-5 px-5 pb-10 xl:grid-cols-[0.9fr_1.1fr]">
          <GenomeStructureChart telemetry={telemetry} />
          <BottleneckTable
            items={sortedBottlenecks}
            selected={selectedBottleneck}
            onSelect={setSelected}
          />
        </section>
      </div>
    </main>
  );
}

function Header({ telemetry, error, onToggle }) {
  return (
    <header className="mx-auto flex w-full max-w-[1520px] flex-col gap-5 px-5 py-6">
      <div className="flex flex-col justify-between gap-4 border-b border-indigo-100 pb-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-13 w-13 items-center justify-center rounded-md bg-[#1E1B4B] shadow-[0_18px_45px_rgba(30,27,75,0.22)]">
            <Dna className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-[#1E1B4B] md:text-4xl">GENOME-X</h1>
            <p className="mt-1 text-sm font-medium text-indigo-500">Clinical NGS Analysis Control Plane</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill icon={RadioTower} label="SEQ-9055" value="Linked" tone="ok" />
          <StatusPill icon={ShieldCheck} label="LIMS" value="Verified" tone="ok" />
          <StatusPill icon={ServerCog} label="Run" value={telemetry.runId} tone="violet" />
          <button
            onClick={onToggle}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-[#7C3AED] px-4 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(124,58,237,0.28)] transition hover:bg-[#6D28D9]"
          >
            {telemetry.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {telemetry.running ? 'Pause' : 'Start'}
          </button>
        </div>
      </div>
      {error && <div className="rounded-md border border-violet-200 bg-violet-50 px-4 py-2 text-sm text-violet-800">{error}</div>}
    </header>
  );
}

function StatusPill({ icon: Icon, label, value, tone }) {
  const color = tone === 'ok' ? 'bg-emerald-500' : 'bg-[#7C3AED]';
  return (
    <div className="glass flex h-11 items-center gap-3 rounded-md px-3">
      <Icon className="h-4 w-4 text-[#1E1B4B]" />
      <span className="text-xs font-semibold uppercase text-indigo-400">{label}</span>
      <span className="max-w-[120px] truncate text-sm font-semibold text-[#1E1B4B]">{value}</span>
      <span className={`h-2 w-2 rounded-full ${color} shadow-[0_0_18px_currentColor]`} />
    </div>
  );
}

function SequencingPanel({ sequencing, telemetry }) {
  return (
    <section className="glass min-h-[478px] rounded-lg p-5 shadow-soft">
      <PanelTitle icon={Dna} title="실시간 염기서열 시퀀싱" action={`${telemetry.progress.toFixed(1)}%`} />
      <div className="mt-5 overflow-hidden rounded-md border border-indigo-100 bg-white">
        <div className="sequence-scan" />
        <div className="grid gap-1 p-4 font-mono text-[11px] leading-6 text-indigo-950 sm:text-xs">
          {(sequencing.reads || []).map((read, row) => (
            <div key={row} className="grid grid-cols-[48px_1fr_54px] items-center gap-3">
              <span className="text-indigo-300">R{String(row + 1).padStart(3, '0')}</span>
              <div className="min-w-0 overflow-hidden whitespace-nowrap">
                {read.split('').map((base, index) => (
                  <span
                    key={`${row}-${index}`}
                    className={baseClass(base, sequencing.variantPositions?.includes(row * 72 + index))}
                  >
                    {base}
                  </span>
                ))}
              </div>
              <span className="text-right text-emerald-600">{((sequencing.confidence?.[row] || 0.94) * 100).toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Metric icon={Activity} label="Throughput" value={`${telemetry.throughputGbPerHour.toFixed(1)}`} unit="Gb/h" />
        <Metric icon={Gauge} label="P95 Latency" value={`${telemetry.p95LatencyMs.toFixed(0)}`} unit="ms" />
        <Metric icon={Zap} label="Stage" value={telemetry.activeStage} unit="" compact />
      </div>
    </section>
  );
}

function SystemTelemetry({ telemetry }) {
  return (
    <section className="glass rounded-lg p-5 shadow-soft">
      <PanelTitle icon={Cpu} title="시스템 텔레메트리" action={telemetry.running ? 'Live' : 'Idle'} />
      <div className="mt-5 grid gap-4">
        <TelemetryBar label="Core 0 IRQ Load" value={telemetry.cpuCore0} color={palette.hot} />
        <TelemetryBar label="Other Core Utilization" value={telemetry.cpuOtherCores} color={palette.deep} />
        <TelemetryBar label="Memory Pressure" value={telemetry.memoryPressure} color="#0891b2" />
        <TelemetryBar label="SSD IOPS Envelope" value={Math.min(100, telemetry.iops / 220)} color="#0f766e" inverse />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric icon={HardDrive} label="IOPS" value={telemetry.iops.toFixed(0)} unit="ops/s" />
        <Metric icon={DatabaseZap} label="GPU Launch" value={(telemetry.gpuLaunchRate / 1000).toFixed(1)} unit="k/s" />
        <Metric icon={Network} label="SoftIRQ Bias" value={`${Math.max(0, telemetry.cpuCore0 - telemetry.cpuOtherCores).toFixed(0)}`} unit="pts" />
        <Metric icon={ServerCog} label="VM Exit Cost" value={`${Math.max(1, telemetry.p95LatencyMs / 11).toFixed(0)}`} unit="us" />
      </div>
    </section>
  );
}

function GenomeStructureChart({ telemetry }) {
  const points = Array.from({ length: 44 }, (_, i) => {
    const x = 24 + i * 22;
    const y = 120 + Math.sin(i * 0.72) * 42 + Math.cos(i * 0.21) * 18;
    return `${x},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <section className="glass rounded-lg p-5 shadow-soft">
      <PanelTitle icon={Activity} title="복합 유전자 구조 차트" action="chr7 / q31.2" />
      <svg viewBox="0 0 1020 360" className="mt-4 h-[320px] w-full rounded-md border border-indigo-100 bg-white">
        <defs>
          <linearGradient id="geneBand" x1="0" x2="1">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="55%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <line x1="50" y1="180" x2="970" y2="180" stroke="#C7D2FE" strokeWidth="4" />
        {Array.from({ length: 15 }, (_, i) => (
          <rect
            key={i}
            x={70 + i * 61}
            y={145 - (i % 3) * 12}
            width={28 + (i % 4) * 15}
            height={70 + (i % 2) * 18}
            rx="4"
            fill="url(#geneBand)"
            opacity={0.82}
          />
        ))}
        <polyline points={points} fill="none" stroke="#7C3AED" strokeWidth="3" />
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <circle cx={112 + i * 80} cy={120 + (i % 4) * 34} r={7 + telemetry.memoryPressure / 28} fill="#FFFFFF" stroke="#7C3AED" strokeWidth="3" />
            <line x1={112 + i * 80} y1={130 + (i % 4) * 34} x2={112 + i * 80} y2="180" stroke="#DDD6FE" strokeDasharray="4 6" />
          </g>
        ))}
        <text x="52" y="318" fill="#1E1B4B" fontSize="18" fontWeight="700">Variant density</text>
        <text x="800" y="318" fill="#7C3AED" fontSize="18" fontWeight="700">Clinical pathogenicity</text>
      </svg>
    </section>
  );
}

function BottleneckTable({ items, selected, onSelect }) {
  return (
    <section className="glass rounded-lg p-5 shadow-soft">
      <PanelTitle icon={DatabaseZap} title="병목 결함 매트릭스" action={`${items.length} regressions`} />
      <div className="mt-4 overflow-hidden rounded-md border border-indigo-100">
        <table className="w-full border-collapse bg-white text-left text-sm">
          <thead className="bg-indigo-50 text-xs uppercase text-indigo-500">
            <tr>
              <th className="px-4 py-3">Kernel Vector</th>
              <th className="px-4 py-3">Layer</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Latency</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`cursor-pointer border-t border-indigo-50 transition hover:bg-violet-50 ${selected?.id === item.id ? 'bg-violet-50' : ''}`}
              >
                <td className="px-4 py-3 font-semibold text-[#1E1B4B]">{item.name}</td>
                <td className="px-4 py-3 text-indigo-500">{item.layer}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex min-w-14 justify-center rounded-md bg-[#7C3AED] px-2 py-1 text-xs font-bold text-white">
                    {(item.severity * 100).toFixed(0)}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-indigo-700">{item.lastLatencyMs} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="mt-4 rounded-md border border-violet-100 bg-white p-4">
          <div className="text-sm font-bold text-[#1E1B4B]">{selected.symptom}</div>
          <div className="mt-2 text-sm text-indigo-500">{selected.businessTrigger}</div>
        </div>
      )}
    </section>
  );
}

function PanelTitle({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-[#7C3AED]" />
        <h2 className="text-lg font-semibold text-[#1E1B4B]">{title}</h2>
      </div>
      <span className="rounded-md border border-violet-100 bg-white px-3 py-1 text-xs font-bold uppercase text-[#7C3AED]">{action}</span>
    </div>
  );
}

function TelemetryBar({ label, value, color, inverse }) {
  const display = inverse ? 100 - value : value;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-[#1E1B4B]">{label}</span>
        <span className="font-mono text-indigo-500">{Math.max(0, Math.min(100, display)).toFixed(0)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-md bg-indigo-50">
        <div className="h-full rounded-md transition-all duration-700" style={{ width: `${Math.max(3, Math.min(100, display))}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, unit, compact }) {
  return (
    <div className="rounded-md border border-indigo-100 bg-white p-4 shadow-[0_10px_24px_rgba(30,27,75,0.06)]">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className={`mt-3 flex min-h-9 items-end gap-2 font-semibold text-[#1E1B4B] ${compact ? 'text-base' : 'text-2xl'}`}>
        <span className="truncate">{value}</span>
        {unit && <span className="pb-1 text-xs font-bold text-indigo-400">{unit}</span>}
      </div>
    </div>
  );
}

function baseClass(base, variant) {
  const color = {
    A: 'text-emerald-600 bg-emerald-50',
    C: 'text-cyan-700 bg-cyan-50',
    G: 'text-[#7C3AED] bg-violet-50',
    T: 'text-indigo-900 bg-indigo-50'
  }[base];
  return `mx-[1px] rounded px-[3px] ${color} ${variant ? 'ring-1 ring-rose-400 text-rose-600' : ''}`;
}

createRoot(document.getElementById('root')).render(<App />);
