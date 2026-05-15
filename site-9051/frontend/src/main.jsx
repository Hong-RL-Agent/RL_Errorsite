import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  Cpu,
  Gauge,
  HardDrive,
  MemoryStick,
  Network,
  Plane,
  Radar,
  RefreshCw,
  Server,
  Zap
} from "lucide-react";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const fallbackRegressions = [
  ["interrupt-storm", "Virtualization Driver Interrupt Storm", "critical"],
  ["kernel-lockup", "Kernel High Lockup", "critical"],
  ["cache-bloat", "cgroup Memory Limit & Cache Bloat", "critical"],
  ["numa-paradox", "NUMA Auto-balancing Paradox", "warning"],
  ["pid-limit", "Container PID Limit Fork Failure", "critical"],
  ["journal-delay", "File System Journaling Delay", "warning"],
  ["gpu-launch-delay", "GPU Kernel Launch Delay", "warning"],
  ["pcie-p2p", "GPU PCIe P2P Topology Mismatch", "warning"],
  ["bandwidth-saturation", "Memory Bandwidth Saturation", "critical"],
  ["compaction-storm", "Memory Compaction Storm", "critical"],
  ["thundering-herd", "Thundering Herd Problem", "critical"]
].map(([id, title, severity]) => ({
  id,
  title,
  severity,
  status: "standby",
  symptom: "Awaiting backend telemetry.",
  systemLog: "standby",
  impactMs: 0
}));

const fallbackSnapshot = {
  timestamp: new Date().toISOString(),
  drones: Array.from({ length: 12 }, (_, index) => ({
    id: `SKY-${String(index + 1).padStart(3, "0")}`,
    route: `SEOUL-${String.fromCharCode(65 + (index % 6))}${index + 1}`,
    lat: 37.56 + Math.sin(index) * 0.08,
    lon: 126.98 + Math.cos(index) * 0.1,
    battery: 92 - index * 5,
    state: index % 4 === 0 ? "HOLDING" : "DELIVERING",
    signal: 86 + (index % 10),
    payloadKg: 1 + (index % 5)
  })),
  telemetry: {
    cpuLoad: 42,
    cpuSteal: 3,
    memoryPressure: 34,
    ioWait: 5,
    gpuQueueMs: 18,
    p99LatencyMs: 72,
    activeWorkers: 12,
    dirtyCacheMb: 0,
    contextSwitchRate: 1200
  },
  alerts: []
};

function useFleetData() {
  const [snapshot, setSnapshot] = useState(fallbackSnapshot);
  const [regressions, setRegressions] = useState(fallbackRegressions);
  const [connected, setConnected] = useState(false);

  const refresh = async () => {
    try {
      const [fleetRes, regressionRes] = await Promise.all([
        fetch(`${API_BASE}/api/fleet`),
        fetch(`${API_BASE}/api/regressions`)
      ]);
      if (!fleetRes.ok || !regressionRes.ok) {
        throw new Error("backend unavailable");
      }
      setSnapshot(await fleetRes.json());
      setRegressions(await regressionRes.json());
      setConnected(true);
    } catch {
      setConnected(false);
      setSnapshot((current) => ({
        ...current,
        timestamp: new Date().toISOString()
      }));
    }
  };

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 2200);
    return () => clearInterval(timer);
  }, []);

  const trigger = async (id) => {
    try {
      await fetch(`${API_BASE}/api/regressions/${id}/trigger`, { method: "POST" });
      await refresh();
    } catch {
      setRegressions((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: "active", impactMs: 250, systemLog: "offline demo mode: simulated trigger" }
            : item
        )
      );
    }
  };

  const reset = async () => {
    try {
      await fetch(`${API_BASE}/api/regressions/reset`, { method: "POST" });
      await refresh();
    } catch {
      setRegressions(fallbackRegressions);
    }
  };

  return { snapshot, regressions, connected, trigger, reset, refresh };
}

function App() {
  const { snapshot, regressions, connected, trigger, reset, refresh } = useFleetData();
  const activeAlerts = regressions.filter((item) => item.status !== "standby");
  const telemetry = snapshot.telemetry;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-4 py-4 lg:px-6">
        <Header connected={connected} timestamp={snapshot.timestamp} onRefresh={refresh} onReset={reset} />
        <KpiStrip telemetry={telemetry} drones={snapshot.drones} activeAlerts={activeAlerts} />

        <section className="grid gap-4 xl:grid-cols-[1.45fr_0.9fr]">
          <FlightMap drones={snapshot.drones} telemetry={telemetry} activeAlerts={activeAlerts} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <TelemetryPanel telemetry={telemetry} />
            <AlertPanel alerts={activeAlerts} regressions={regressions} onTrigger={trigger} />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_1.25fr]">
          <DroneFleet drones={snapshot.drones} />
          <RegressionMatrix regressions={regressions} onTrigger={trigger} />
        </section>
      </div>
    </main>
  );
}

function Header({ connected, timestamp, onRefresh, onReset }) {
  return (
    <header className="glass flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-md border border-sky-400/30 bg-sky-400/10">
          <Radar className="h-6 w-6 text-sky-300" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-normal text-white">SKY-LOGISTICS Flight Control Center</h1>
          <p className="text-sm text-slate-400">Port 9051 research lab · PPO regression training telemetry</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill label={connected ? "Backend linked" : "Demo mode"} active={connected} />
        <span className="rounded-md border border-slate-700/80 px-3 py-2 text-xs text-slate-400">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
        <button className="icon-button" onClick={onRefresh} title="Refresh telemetry" aria-label="Refresh telemetry">
          <RefreshCw className="h-4 w-4" />
        </button>
        <button className="control-button" onClick={onReset}>Reset Lab</button>
      </div>
    </header>
  );
}

function KpiStrip({ telemetry, drones, activeAlerts }) {
  const rerouting = drones.filter((drone) => drone.state === "REROUTING").length;
  const kpis = [
    { label: "Fleet Online", value: drones.length, note: `${rerouting} rerouting`, tone: "sky" },
    { label: "P99 Latency", value: `${Math.round(telemetry.p99LatencyMs)}ms`, note: "command loop", tone: telemetry.p99LatencyMs > 300 ? "orange" : "sky" },
    { label: "CPU Steal", value: `${telemetry.cpuSteal.toFixed(1)}%`, note: "virtualization", tone: telemetry.cpuSteal > 35 ? "orange" : "sky" },
    { label: "Active Alerts", value: activeAlerts.length, note: "stress matrix", tone: activeAlerts.length ? "orange" : "sky" }
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {kpis.map((item) => (
        <div key={item.label} className={`kpi-card ${item.tone === "orange" ? "kpi-alert" : ""}`}>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">{item.label}</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-white">{item.value}</p>
          </div>
          <span className="rounded-md border border-slate-700/70 bg-slate-950/60 px-2.5 py-1 text-xs text-slate-400">
            {item.note}
          </span>
        </div>
      ))}
    </section>
  );
}

function FlightMap({ drones, telemetry, activeAlerts }) {
  const paths = useMemo(
    () => drones.slice(0, 8).map((drone, index) => ({
      id: drone.id,
      x: 12 + ((index * 17) % 76),
      y: 18 + ((index * 23) % 62),
      alert: drone.state === "REROUTING" || telemetry.p99LatencyMs > 300
    })),
    [drones, telemetry.p99LatencyMs]
  );

  return (
    <section className="glass min-h-[520px] overflow-hidden p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="panel-title">Real-time Map Simulation</h2>
          <p className="panel-subtitle">Seoul metro routes · synthetic SVG telemetry surface</p>
        </div>
        <StatusPill label={`${activeAlerts.length} active regressions`} active={activeAlerts.length > 0} alert />
      </div>

      <div className="map-surface relative h-[455px] overflow-hidden rounded-md border border-sky-400/20 bg-slate-950">
        <div className="scanline" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FB923C" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <g opacity="0.24">
            {Array.from({ length: 10 }, (_, index) => (
              <line key={`v-${index}`} x1={index * 10} y1="0" x2={index * 10 + 10} y2="100" stroke="#38BDF8" strokeWidth="0.12" />
            ))}
            {Array.from({ length: 9 }, (_, index) => (
              <line key={`h-${index}`} x1="0" y1={index * 12} x2="100" y2={index * 12 + 4} stroke="#64748B" strokeWidth="0.12" />
            ))}
          </g>
          <polyline points="8,62 18,44 32,50 43,28 58,35 72,22 89,36" fill="none" stroke="url(#routeGradient)" strokeWidth="0.7" />
          <polyline points="11,28 25,34 41,21 57,54 71,48 90,66" fill="none" stroke="#38BDF8" strokeOpacity="0.62" strokeWidth="0.45" />
          <polygon points="18,72 33,60 49,68 66,58 86,73 80,89 25,91" fill="#38BDF8" opacity="0.045" stroke="#38BDF8" strokeOpacity="0.18" strokeWidth="0.15" />
          <polygon points="16,18 31,11 46,22 39,37 20,35" fill="#FB923C" opacity="0.055" stroke="#FB923C" strokeOpacity="0.22" strokeWidth="0.15" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="#38BDF8" strokeOpacity="0.2" strokeWidth="0.2" />
          <circle cx="50" cy="50" r="18" fill="none" stroke="#FB923C" strokeOpacity="0.24" strokeWidth="0.2" />
          {paths.map((point, index) => (
            <g key={point.id} className="drone-node">
              <circle cx={point.x} cy={point.y} r={point.alert ? 2.2 : 1.7} fill={point.alert ? "#FB923C" : "#38BDF8"} />
              <circle cx={point.x} cy={point.y} r={point.alert ? 5.8 : 4.4} fill="none" stroke={point.alert ? "#FB923C" : "#38BDF8"} strokeOpacity="0.35" />
              <text x={point.x + 2.7} y={point.y - 1.6} fill="#E2E8F0" fontSize="2.6">{index + 1}</text>
            </g>
          ))}
        </svg>
        <div className="absolute bottom-4 left-4 grid gap-2 text-xs text-slate-300 sm:grid-cols-3">
          <MetricChip icon={Network} label="Steal" value={`${telemetry.cpuSteal.toFixed(1)}%`} />
          <MetricChip icon={Gauge} label="P99" value={`${Math.round(telemetry.p99LatencyMs)}ms`} />
          <MetricChip icon={Zap} label="GPU Q" value={`${Math.round(telemetry.gpuQueueMs)}ms`} />
        </div>
        <div className="absolute right-4 top-4 w-52 rounded-md border border-slate-700/70 bg-slate-950/75 p-3 text-xs text-slate-300 backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-slate-500">AIRSPACE</span>
            <span className="text-sky-300">LIVE</span>
          </div>
          <div className="grid gap-2">
            <LegendDot label="Telemetry route" color="bg-sky-400" />
            <LegendDot label="Regression zone" color="bg-orange-400" />
            <LegendDot label="Drone beacon" color="bg-white" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TelemetryPanel({ telemetry }) {
  const metrics = [
    { icon: Cpu, label: "CPU Load", value: telemetry.cpuLoad, unit: "%", accent: "sky" },
    { icon: Network, label: "CPU Steal", value: telemetry.cpuSteal, unit: "%", accent: "orange" },
    { icon: MemoryStick, label: "Memory Pressure", value: telemetry.memoryPressure, unit: "%", accent: "orange" },
    { icon: HardDrive, label: "I/O Wait", value: telemetry.ioWait, unit: "%", accent: "sky" }
  ];

  return (
    <section className="glass p-4">
      <h2 className="panel-title">System Resource Monitors</h2>
      <div className="mt-4 grid gap-3">
        {metrics.map((metric) => (
          <ResourceBar key={metric.label} {...metric} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="Workers" value={telemetry.activeWorkers} />
        <MiniStat label="Dirty Cache" value={`${telemetry.dirtyCacheMb}M`} />
        <MiniStat label="Ctx/s" value={telemetry.contextSwitchRate.toLocaleString()} />
      </div>
    </section>
  );
}

function AlertPanel({ alerts, regressions, onTrigger }) {
  const top = alerts.slice(0, 4);
  return (
    <section className="glass p-4">
      <div className="flex items-center justify-between">
        <h2 className="panel-title">Real-time Alerts</h2>
        <AlertTriangle className="h-5 w-5 text-orange-300" />
      </div>
      <div className="mt-4 grid gap-3">
        {top.length === 0 ? (
          <div className="rounded-md border border-slate-700/80 bg-slate-900/60 p-3 text-sm text-slate-400">
            No active regression. Trigger a lab scenario below.
          </div>
        ) : (
          top.map((alert) => <AlertRow key={alert.id} alert={alert} />)
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {regressions.slice(0, 4).map((item) => (
          <button key={item.id} className="control-button compact" onClick={() => onTrigger(item.id)}>
            {item.id.split("-").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>
    </section>
  );
}

function DroneFleet({ drones }) {
  return (
    <section className="glass p-4">
      <div className="flex items-center justify-between">
        <h2 className="panel-title">Drone Fleet Status</h2>
        <Plane className="h-5 w-5 text-sky-300" />
      </div>
      <div className="mt-4 grid gap-2">
        {drones.map((drone) => (
          <div key={drone.id} className="fleet-row">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{drone.id}</span>
                <span className={drone.state === "REROUTING" ? "text-orange-300" : "text-sky-300"}>{drone.state}</span>
              </div>
              <p className="truncate text-xs text-slate-400">{drone.route} · payload {drone.payloadKg}kg · signal {drone.signal}%</p>
            </div>
            <div className="w-28">
              <div className="mb-1 flex justify-between text-xs text-slate-400">
                <span>Battery</span>
                <span>{drone.battery}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-sky-400" style={{ width: `${drone.battery}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RegressionMatrix({ regressions, onTrigger }) {
  return (
    <section className="glass p-4">
      <div className="flex items-center justify-between">
        <h2 className="panel-title">Regression Control Matrix</h2>
        <Server className="h-5 w-5 text-slate-300" />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {regressions.map((item) => (
          <button key={item.id} className="regression-card text-left" onClick={() => onTrigger(item.id)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{item.symptom}</p>
              </div>
              <span className={item.status === "standby" ? "badge" : "badge active"}>{item.status}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className={item.severity === "critical" ? "text-orange-300" : "text-sky-300"}>{item.severity}</span>
              <span className="text-slate-500">{item.impactMs ? `${item.impactMs}ms impact` : "ready"}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function ResourceBar({ icon: Icon, label, value, unit, accent }) {
  const color = accent === "orange" ? "from-orange-500 to-amber-300" : "from-sky-500 to-cyan-200";
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-slate-300"><Icon className="h-4 w-4" /> {label}</span>
        <span className="font-mono text-slate-100">{value.toFixed(1)}{unit}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 shadow-inner shadow-black/40">
        <div className={`h-2 rounded-full bg-gradient-to-r ${color} shadow-[0_0_18px_rgba(56,189,248,0.3)]`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

function AlertRow({ alert }) {
  return (
    <div className="rounded-md border border-orange-400/25 bg-orange-400/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-orange-100">{alert.title}</p>
        <span className="text-xs text-orange-300">{alert.impactMs}ms</span>
      </div>
      <p className="mt-1 text-xs text-slate-300">{alert.systemLog}</p>
    </div>
  );
}

function MetricChip({ icon: Icon, label, value }) {
  return (
    <div className="rounded-md border border-slate-700/80 bg-slate-950/80 px-3 py-2 backdrop-blur">
      <span className="flex items-center gap-2 text-slate-400"><Icon className="h-3.5 w-3.5 text-sky-300" /> {label}</span>
      <strong className="font-mono text-slate-100">{value}</strong>
    </div>
  );
}

function LegendDot({ label, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-md border border-slate-700/80 bg-slate-900/70 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-lg text-white">{value}</p>
    </div>
  );
}

function StatusPill({ label, active, alert }) {
  return (
    <span className={`rounded-md border px-3 py-2 text-xs ${active ? (alert ? "border-orange-400/40 bg-orange-400/10 text-orange-200" : "border-sky-400/40 bg-sky-400/10 text-sky-200") : "border-slate-700 bg-slate-900 text-slate-400"}`}>
      {label}
    </span>
  );
}

createRoot(document.getElementById("root")).render(<App />);
