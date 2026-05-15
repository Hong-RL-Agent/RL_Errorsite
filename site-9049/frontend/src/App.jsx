import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  Cpu,
  Database,
  FileCheck2,
  Gauge,
  HardDrive,
  HeartPulse,
  LockKeyhole,
  MemoryStick,
  Network,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Zap
} from 'lucide-react';

const API = '/api';

const actions = [
  {
    label: 'Medical Record Save',
    icon: FileCheck2,
    path: '/consultation/records',
    body: { patientId: 'VL-2048', summary: 'Remote cardiology consult and medication adjustment.', medicationPlan: 'Titrate beta blocker after BP review.' }
  },
  { label: 'Remote Patient Node', icon: Network, path: '/consultation/remote-node', body: { nodeId: 'numa-remote-patient-07' } },
  { label: 'Image IRQ Stream', icon: HardDrive, path: '/consultation/diagnostic-image-stream' },
  { label: 'Genomic AVX Analysis', icon: BrainCircuit, path: '/consultation/genomic-analysis' },
  { label: 'Kernel Spinlock', icon: LockKeyhole, path: '/consultation/spinlock' },
  { label: 'CoW Fault Storm', icon: MemoryStick, path: '/consultation/cow-fault-storm' },
  { label: 'Unaligned Serialize', icon: Database, path: '/consultation/serialize' }
];

const vitals = [
  ['HR', '72', 'bpm', 'Stable sinus rhythm'],
  ['SpO2', '98', '%', 'Room air'],
  ['BP', '118/76', 'mmHg', 'Last cuff sync 10s'],
  ['Temp', '36.8', 'C', 'Afebrile']
];

const records = [
  ['VL-2048', 'Mira Han', 'Cardiology', 'High priority remote follow-up'],
  ['VL-1182', 'Jon Bell', 'Neurology', 'Awaiting MRI packet'],
  ['VL-3307', 'Ari Kim', 'Genomics', 'Consent verified']
];

function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [busyAction, setBusyAction] = useState('');
  const [pulseBusy, setPulseBusy] = useState(false);

  async function loadTelemetry() {
    const response = await fetch(`${API}/telemetry`);
    setTelemetry(await response.json());
  }

  async function trigger(action) {
    setBusyAction(action.label);
    try {
      const response = await fetch(`${API}${action.path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: action.body ? JSON.stringify(action.body) : undefined
      });
      setLastResult({ name: action.label, data: await response.json() });
      await loadTelemetry();
    } finally {
      setBusyAction('');
    }
  }

  async function pulse() {
    setPulseBusy(true);
    try {
      const response = await fetch(`${API}/consultation/pulse`);
      setLastResult({ name: 'Consultation Pulse', data: await response.json() });
      await loadTelemetry();
    } finally {
      setPulseBusy(false);
    }
  }

  async function resetSession() {
    await fetch(`${API}/telemetry/reset-session`, { method: 'POST' });
    await loadTelemetry();
  }

  useEffect(() => {
    loadTelemetry();
    const timer = setInterval(loadTelemetry, 2500);
    return () => clearInterval(timer);
  }, []);

  const latencyRows = useMemo(() => {
    if (!telemetry?.endpointLatencyMs) return [];
    return Object.entries(telemetry.endpointLatencyMs).slice(-8).reverse();
  }, [telemetry]);

  const memoryPercent = telemetry?.simulatedMemoryPercent ?? 0;
  const sessionAlive = telemetry?.sessionAlive ?? true;

  return (
    <main className="min-h-screen px-5 py-6 text-slate-900 md:px-8">
      <header className="mx-auto flex max-w-7xl flex-col gap-5 border-b border-slate-200/80 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Stethoscope size={26} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">Research Telemedicine Lab</p>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl">VITA-LINK</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill icon={ShieldCheck} tone={sessionAlive ? 'ok' : 'danger'} label={sessionAlive ? 'Session Protected' : 'Session State Lost'} />
          <button onClick={loadTelemetry} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={resetSession} className="inline-flex h-10 items-center gap-2 rounded-md bg-indigo-600 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
            <RotateCcw size={16} /> Restore Session
          </button>
        </div>
      </header>

      <section className="mx-auto mt-6 grid max-w-7xl gap-4 metric-grid">
        <Metric icon={Activity} label="Dirty Buffer" value={telemetry?.dirtyBuffer ?? 0} unit="pages" />
        <Metric icon={Zap} label="IRQ Count" value={telemetry?.irqCount ?? 0} unit="events" />
        <Metric icon={MemoryStick} label="Memory Pressure" value={memoryPercent} unit="%" danger={memoryPercent >= 90} />
        <Metric icon={Gauge} label="AVX Slowdown" value={telemetry?.globalSlowdownRemainingMs ?? 0} unit="ms" />
      </section>

      <section className="mx-auto mt-6 grid max-w-7xl gap-6 clinical-grid">
        <div className="space-y-6">
          <Panel title="Live Vitals" icon={HeartPulse}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {vitals.map(([label, value, unit, note]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-3xl font-semibold text-slate-950">{value}</span>
                    <span className="pb-1 text-sm font-medium text-slate-500">{unit}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{note}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Patient Records" icon={FileCheck2}>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white/80">
              {records.map(([id, name, service, note]) => (
                <div key={id} className="grid grid-cols-[96px_1fr] gap-3 border-b border-slate-100 p-4 last:border-b-0 md:grid-cols-[120px_1fr_140px_1.4fr]">
                  <span className="font-mono text-sm font-semibold text-indigo-700">{id}</span>
                  <span className="font-semibold text-slate-900">{name}</span>
                  <span className="text-sm text-slate-600">{service}</span>
                  <span className="text-sm text-slate-600">{note}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Telemetry Warnings" icon={AlertTriangle}>
            <div className="space-y-2">
              {(telemetry?.kernelWarnings?.length ? telemetry.kernelWarnings : ['No kernel-style warnings recorded yet.']).map((warning, index) => (
                <div key={`${warning}-${index}`} className="rounded-md border border-slate-200 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100">
                  {warning}
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Anomaly Controls" icon={Cpu}>
            <div className="grid gap-3">
              <button onClick={pulse} disabled={pulseBusy} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white disabled:opacity-60">
                <Activity size={17} /> {pulseBusy ? 'Processing...' : 'Consultation Pulse'}
              </button>
              {actions.map((action) => {
                const Icon = action.icon;
                const busy = busyAction === action.label;
                return (
                  <button key={action.label} onClick={() => trigger(action)} disabled={Boolean(busyAction)} className="inline-flex h-11 items-center justify-between gap-3 rounded-md border border-slate-300 bg-white px-3 text-left text-sm font-semibold text-slate-800 shadow-sm hover:bg-indigo-50 disabled:opacity-60">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <Icon size={17} className="shrink-0 text-indigo-600" />
                      <span className="truncate">{busy ? 'Running...' : action.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Latest Response" icon={Database}>
            <pre className="max-h-72 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {lastResult ? JSON.stringify(lastResult, null, 2) : 'Awaiting lab action...'}
            </pre>
          </Panel>

          <Panel title="Endpoint Latency" icon={Gauge}>
            <div className="space-y-2">
              {latencyRows.length ? latencyRows.map(([endpoint, ms]) => (
                <div key={endpoint} className="flex items-center justify-between rounded-md border border-slate-200 bg-white/80 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-700">{endpoint}</span>
                  <span className="font-mono font-semibold text-indigo-700">{ms}ms</span>
                </div>
              )) : <p className="text-sm text-slate-500">No latency samples yet.</p>}
            </div>
          </Panel>
        </aside>
      </section>
    </main>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="glass rounded-lg p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={18} className="text-indigo-600" />
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Metric({ icon: Icon, label, value, unit, danger = false }) {
  return (
    <div className="glass rounded-lg p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <Icon size={19} className={danger ? 'text-rose-600' : 'text-indigo-600'} />
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className={danger ? 'text-3xl font-semibold text-rose-700' : 'text-3xl font-semibold text-slate-950'}>{value}</span>
        <span className="pb-1 text-sm font-medium text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

function StatusPill({ icon: Icon, tone, label }) {
  const classes = tone === 'ok'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-rose-200 bg-rose-50 text-rose-700';
  return (
    <span className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold ${classes}`}>
      <Icon size={16} /> {label}
    </span>
  );
}

export default App;
