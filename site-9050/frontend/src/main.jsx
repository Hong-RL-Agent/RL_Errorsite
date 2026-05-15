import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  Cpu,
  Database,
  Gauge,
  Gem,
  Layers3,
  LockKeyhole,
  MonitorUp,
  Orbit,
  RadioTower,
  RefreshCcw,
  ShoppingBag,
  Sparkles,
  Zap
} from "lucide-react";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

const scenarios = [
  { label: "3D Asset Rendering", path: "/simulate/render-asset", icon: Layers3, color: "cyan" },
  { label: "Texture Sync 1GB", path: "/simulate/texture-sync", icon: MonitorUp, color: "pink" },
  { label: "RCU Stall", path: "/simulate/rcu-stall", icon: Cpu, color: "pink" },
  { label: "Transaction Log", path: "/simulate/transaction-log", icon: Database, color: "cyan" },
  { label: "Shader Tail", path: "/simulate/shader", icon: Sparkles, color: "cyan" },
  { label: "Discount Branches", path: "/simulate/discount", icon: Zap, color: "pink" },
  { label: "Priority Checkout", path: "/simulate/checkout", icon: LockKeyhole, color: "pink" }
];

function App() {
  const [inventory, setInventory] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [activeView, setActiveView] = useState("inventory");
  const [lastResult, setLastResult] = useState(null);
  const [busy, setBusy] = useState("");

  async function load() {
    const [items, snap] = await Promise.all([
      fetch(`${API_BASE}/inventory`, { credentials: "include" }).then((r) => r.json()),
      fetch(`${API_BASE}/telemetry`, { credentials: "include" }).then((r) => r.json())
    ]);
    setInventory(items);
    setTelemetry(snap);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 2400);
    return () => clearInterval(id);
  }, []);

  async function trigger(scenario) {
    setBusy(scenario.label);
    try {
      const result = await fetch(`${API_BASE}${scenario.path}`, {
        method: "POST",
        credentials: "include"
      }).then((r) => r.json());
      setLastResult(result);
      await load();
    } finally {
      setBusy("");
    }
  }

  const riskScore = useMemo(() => {
    if (!telemetry) return 0;
    const critical = telemetry.recentEvents?.filter((event) => event.severity === "CRITICAL").length ?? 0;
    return Math.min(99, Math.round((critical * 11) + ((telemetry.requestCount ?? 0) % 37)));
  }, [telemetry]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="fixed inset-0 grid-bg opacity-50" />
      <div className="fixed inset-0 neon-scan" />
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 lg:px-8">
        <Header activeView={activeView} setActiveView={setActiveView} riskScore={riskScore} />
        <div className="mt-6 grid flex-1 gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="glass-panel min-h-[620px] p-5">
            {activeView === "inventory" ? <Inventory items={inventory} /> : <Telemetry telemetry={telemetry} />}
          </section>
          <aside className="space-y-5">
            <SimulatorPanel scenarios={scenarios} busy={busy} onTrigger={trigger} lastResult={lastResult} />
            <Vitals telemetry={telemetry} riskScore={riskScore} />
          </aside>
        </div>
      </section>
    </main>
  );
}

function Header({ activeView, setActiveView, riskScore }) {
  return (
    <header className="glass-panel flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="logo-cube">
          <Orbit size={28} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">University PPO Sandbox</p>
          <h1 className="text-3xl font-black tracking-normal text-white md:text-5xl">META-MART</h1>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Segment active={activeView === "inventory"} onClick={() => setActiveView("inventory")} icon={ShoppingBag} label="Virtual Inventory" />
        <Segment active={activeView === "telemetry"} onClick={() => setActiveView("telemetry")} icon={Activity} label="Performance Telemetry" />
        <div className="metric-chip">
          <Gauge size={18} />
          <span>Risk {riskScore}</span>
        </div>
      </div>
    </header>
  );
}

function Segment({ active, onClick, icon: Icon, label }) {
  return (
    <button className={`nav-button ${active ? "nav-button-active" : ""}`} onClick={onClick}>
      <Icon size={17} />
      <span>{label}</span>
    </button>
  );
}

function Inventory({ items }) {
  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-pink-300">Neon Atrium</p>
          <h2 className="mt-1 text-2xl font-bold">Virtual Inventory</h2>
        </div>
        <div className="hidden text-right text-sm text-slate-400 sm:block">
          <p>GPU-backed product twins</p>
          <p>Live VRAM pressure sampling</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <article key={item.sku} className="product-card group">
            <div className="product-holo">
              <Gem size={54} className={index % 2 ? "text-pink-300" : "text-cyan-300"} />
            </div>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.zone}</p>
                <h3 className="mt-1 text-xl font-bold text-white">{item.name}</h3>
              </div>
              <span className="rarity">{item.rarity}</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <Stat label="Price" value={`$${item.price}`} />
              <Stat label="VRAM" value={`${item.vramMb}MB`} />
              <Stat label="SKU" value={item.sku.split("-").at(-1)} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Telemetry({ telemetry }) {
  const events = telemetry?.recentEvents ?? [];
  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Hardware-linked traces</p>
          <h2 className="mt-1 text-2xl font-bold">Performance Telemetry</h2>
        </div>
        <RefreshCcw className="text-pink-300" />
      </div>
      <div className="event-stream">
        {events.length === 0 && <p className="p-4 text-slate-400">시뮬레이션 이벤트 대기 중</p>}
        {events.slice().reverse().map((event, index) => (
          <div className="event-row" key={`${event.timestamp}-${index}`}>
            <div>
              <p className="font-semibold text-white">{event.pattern}</p>
              <p className="mt-1 text-sm text-slate-400">{event.detail}</p>
            </div>
            <div className="text-right">
              <span className={`severity ${event.severity.toLowerCase()}`}>{event.severity}</span>
              <p className="mt-2 text-sm text-cyan-200">{event.latencyMs}ms</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimulatorPanel({ scenarios, busy, onTrigger, lastResult }) {
  return (
    <section className="glass-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Regression Console</h2>
        <RadioTower className="text-cyan-300" />
      </div>
      <div className="grid gap-3">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <button key={scenario.path} className={`sim-button ${scenario.color}`} onClick={() => onTrigger(scenario)} disabled={Boolean(busy)}>
              <Icon size={18} />
              <span>{busy === scenario.label ? "Running..." : scenario.label}</span>
            </button>
          );
        })}
      </div>
      {lastResult && (
        <div className="mt-4 rounded-lg border border-cyan-300/25 bg-cyan-300/5 p-3 text-sm">
          <p className="font-semibold text-cyan-200">{lastResult.pattern}</p>
          <p className="mt-1 text-slate-300">{lastResult.detail}</p>
          <p className="mt-2 text-pink-200">latency: {lastResult.latencyMs}ms</p>
        </div>
      )}
    </section>
  );
}

function Vitals({ telemetry, riskScore }) {
  return (
    <section className="glass-panel p-5">
      <h2 className="mb-4 text-xl font-bold">System Vitals</h2>
      <div className="grid gap-3">
        <Stat label="Requests" value={telemetry?.requestCount ?? 0} />
        <Stat label="Active Core" value={`CPU-${telemetry?.activeCore ?? 0}`} />
        <Stat label="Txn Log" value={telemetry?.transactionLogEntries ?? 0} />
        <Stat label="VRAM" value={`${telemetry?.simulatedVramMb ?? 0}MB`} />
      </div>
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm text-slate-300">
          <span>PPO Anomaly Pressure</span>
          <span>{riskScore}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-pink-400" style={{ width: `${riskScore}%` }} />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
