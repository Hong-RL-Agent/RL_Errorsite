import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BrainCircuit,
  Clock3,
  Cpu,
  Database,
  FileClock,
  Gauge,
  HardDrive,
  Layers3,
  MemoryStick,
  Network,
  Power,
  Scale,
  ShieldAlert,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const fmt = new Intl.NumberFormat("en-US");

function metricValue(metrics, key, fallback = 0) {
  return metrics && metrics[key] !== undefined ? metrics[key] : fallback;
}

async function post(path, body = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || response.statusText);
  }
  return payload;
}

function GaugeCard({ icon: Icon, label, value, unit, severity = "normal", detail }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const color = severity === "critical" ? "from-rose-500 to-red-300" : severity === "warn" ? "from-amber-400 to-yellow-200" : "from-cyan-400 to-sky-300";
  return (
    <section className={`metric-panel ${severity}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="icon-shell"><Icon size={18} /></span>
          <div className="min-w-0">
            <p className="metric-label">{label}</p>
            <p className="metric-detail">{detail}</p>
          </div>
        </div>
        <span className={`status-dot ${severity}`} />
      </div>
      <div className="mt-6 flex items-end justify-between">
        <div className="text-[32px] font-semibold leading-none tracking-normal text-white">{fmt.format(value)}<span className="ml-1 text-sm text-slate-400">{unit}</span></div>
        <div className="rounded-full border border-slate-700/70 px-2 py-1 text-[11px] uppercase text-slate-400">{severity}</div>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-950 ring-1 ring-white/5">
        <div className={`h-2 rounded-full bg-gradient-to-r ${color} shadow-[0_0_18px_rgba(34,211,238,0.35)]`} style={{ width: `${pct}%` }} />
      </div>
    </section>
  );
}

function ActionButton({ icon: Icon, label, onClick, busy }) {
  return (
    <button className="action-button" onClick={onClick} disabled={busy}>
      <Icon size={17} />
      <span>{busy ? "Running" : label}</span>
    </button>
  );
}

function App() {
  const [metrics, setMetrics] = useState(null);
  const [model, setModel] = useState("Criminal");
  const [prompt, setPrompt] = useState("Review emergency injunctive relief exposure and litigation posture.");
  const [events, setEvents] = useState([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/health`);
      const payload = await response.json();
      setMetrics(payload);
      setError("");
    } catch (err) {
      setError(`Backend offline: ${err.message}`);
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 1600);
    return () => clearInterval(id);
  }, []);

  const record = (label, payload) => {
    setEvents((items) => [
      { label, at: new Date().toLocaleTimeString(), payload },
      ...items.slice(0, 7),
    ]);
    if (payload.metrics) setMetrics(payload.metrics);
  };

  const run = async (name, fn) => {
    setBusy(name);
    try {
      record(name, await fn());
      setError("");
    } catch (err) {
      setError(err.message);
      refresh();
    } finally {
      setBusy("");
    }
  };

  const gauges = useMemo(() => {
    const steal = Math.min(100, Math.round(metricValue(metrics, "hypervisorStealTimeMs") / 70));
    const compute = metricValue(metrics, "computePower", 100);
    const balloonMb = Math.round(metricValue(metrics, "memoryBalloonBytes") / 1024 / 1024);
    return [
      { icon: Power, label: "Compute Power", value: compute, unit: "%", severity: compute < 50 ? "critical" : "normal", detail: "GPU thermal and power governor" },
      { icon: Cpu, label: "Steal Time", value: steal, unit: "%", severity: steal > 55 ? "critical" : "warn", detail: "Random hypervisor scheduling loss" },
      { icon: MemoryStick, label: "Ballooned Memory", value: balloonMb, unit: "MB", severity: balloonMb > 80 ? "critical" : "warn", detail: "VM balloon jitter allocator" },
      { icon: BrainCircuit, label: "GPU Switches", value: metricValue(metrics, "gpuContextSwitches"), unit: "", severity: "warn", detail: `Active model: ${metricValue(metrics, "activeModel", "Criminal")}` },
      { icon: HardDrive, label: "Trim Freezes", value: metricValue(metrics, "ssdTrimFreezes"), unit: "", severity: metricValue(metrics, "ssdTrimFreezes") ? "critical" : "normal", detail: "3s I/O block every 10th write" },
      { icon: Layers3, label: "Fragment Chunks", value: metricValue(metrics, "fragmentedCacheChunks"), unit: "", severity: "warn", detail: "Small allocation cache pressure" },
      { icon: FileClock, label: "Deleted Handles", value: metricValue(metrics, "openDeletedFiles"), unit: "", severity: metricValue(metrics, "openDeletedFiles") ? "critical" : "normal", detail: "Ghost file descriptor occupation" },
      { icon: Network, label: "Batched Requests", value: metricValue(metrics, "batchedRequests"), unit: "", severity: "warn", detail: "Interrupt coalescence queue release" },
    ];
  }, [metrics]);

  const topStats = [
    { label: "Total Requests", value: metricValue(metrics, "totalRequests"), icon: Activity },
    { label: "C-State Delay", value: `${metricValue(metrics, "cStateDelayMs")} ms`, icon: Clock3 },
    { label: "Timeouts", value: metricValue(metrics, "timedOutRequests"), icon: AlertTriangle },
    { label: "DB Writes", value: metricValue(metrics, "dbWrites"), icon: Database },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#050814] text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_88%_2%,rgba(59,130,246,0.12),transparent_22%),linear-gradient(180deg,#050814_0%,#07111f_48%,#050814_100%)]" />
      <header className="sticky top-0 z-20 border-b border-cyan-400/15 bg-[#050814]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="brand-mark"><Scale size={28} /></div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-normal text-white">LEX-AI Performance Lab</h1>
                <span className="rounded border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 text-xs text-cyan-100">Research Console</span>
              </div>
              <p className="text-sm text-slate-400">Enterprise legal AI workload simulator for OS, hardware, I/O and GPU anomaly detection</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <span className="pill"><Activity size={14} /> Port 9048</span>
            <span className="pill warning"><ShieldAlert size={14} /> Hypervisor Steal Time High</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pt-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {topStats.map(({ label, value, icon: Icon }) => (
            <div className="stat-strip" key={label}>
              <span className="icon-shell small"><Icon size={16} /></span>
              <div>
                <p className="text-xs uppercase text-slate-500">{label}</p>
                <p className="mt-1 text-xl font-semibold text-white">{typeof value === "number" ? fmt.format(value) : value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1.25fr)_390px]">
        <section className="ops-surface">
          <div className="surface-header">
            <div>
              <p className="section-kicker">Consultation Workload</p>
              <h2 className="text-lg font-semibold text-white">Legal AI Consultation</h2>
            </div>
            <div className="segmented">
              {["Criminal", "Civil"].map((item) => (
                <button key={item} className={model === item ? "active" : ""} onClick={() => setModel(item)}>{item}</button>
              ))}
            </div>
          </div>
          <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xs uppercase text-slate-500">Matter Prompt</span>
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs text-slate-400">{model} model</span>
                </div>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  className="consult-input"
                  rows={10}
                  aria-label="Consultation prompt"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="micro-panel"><span>Active Model</span><strong>{metricValue(metrics, "activeModel", model)}</strong></div>
                <div className="micro-panel"><span>Memory Balloon</span><strong>{Math.round(metricValue(metrics, "memoryBalloonBytes") / 1024 / 1024)} MB</strong></div>
                <div className="micro-panel"><span>GPU Power</span><strong>{metricValue(metrics, "computePower", 100)}%</strong></div>
              </div>
            </div>
            <div className="command-panel">
              <p className="mb-3 text-xs uppercase text-slate-500">Simulation Controls</p>
              <ActionButton icon={Sparkles} label="Run Inference" busy={busy === "Inference"} onClick={() => run("Inference", () => post("/api/inference", { model, prompt }))} />
              <ActionButton icon={Database} label="Write Case" busy={busy === "DB Write"} onClick={() => run("DB Write", () => post("/api/cases", { title: `${model} matter`, payload: prompt.repeat(8) }))} />
              <ActionButton icon={Gauge} label="Heavy Index" busy={busy === "Index"} onClick={() => run("Index", () => post("/api/documents/index", { document: prompt.repeat(64) }))} />
              <ActionButton icon={Trash2} label="Clear Logs" busy={busy === "Logs"} onClick={() => run("Logs", () => post("/api/logs/clear"))} />
              <ActionButton icon={Layers3} label="Fragment Cache" busy={busy === "Cache"} onClick={() => run("Cache", () => post("/api/cache/fragment", { key: `memo-${Date.now()}`, value: prompt.repeat(128) }))} />
              <ActionButton icon={Zap} label="Coalesce Packet" busy={busy === "Coalesce"} onClick={() => run("Coalesce", () => post("/api/network/coalesce"))} />
            </div>
          </div>
          {error && <div className="mx-5 mb-5 alert"><AlertTriangle size={16} /> {error}</div>}
        </section>

        <aside className="ops-surface">
          <div className="surface-header">
            <div>
              <p className="section-kicker">Live Telemetry</p>
              <h2 className="text-lg font-semibold text-white">Event Stream</h2>
            </div>
            <span className="live-badge">Live</span>
          </div>
          <div className="space-y-3 p-5">
            {events.length === 0 && <div className="empty-state"><BadgeCheck size={20} /> Awaiting workload activation</div>}
            {events.map((event, index) => (
              <div className="event-row" key={`${event.at}-${index}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-white">{event.label}</span>
                  <span className="text-xs text-slate-500">{event.at}</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">{JSON.stringify(event.payload.result || event.payload.write || event.payload.index || event.payload.cache || event.payload.batch || event.payload).slice(0, 170)}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="mx-auto max-w-7xl px-5 pb-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="section-kicker">System Health</p>
            <h2 className="text-lg font-semibold text-white">Bottleneck Gauges</h2>
          </div>
          <span className="text-xs text-slate-500">Last update: {metricValue(metrics, "lastUpdated", "pending")}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {gauges.map((gauge) => <GaugeCard key={gauge.label} {...gauge} />)}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
