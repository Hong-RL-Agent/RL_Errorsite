import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  Cpu,
  DatabaseZap,
  HardDrive,
  KeyRound,
  Lock,
  Network,
  RadioTower,
  ShieldCheck,
  Trash2,
  Vote,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./styles.css";

type LedgerTransaction = {
  id: string;
  height: number;
  hash: string;
  candidate: string;
  precinct: string;
  state: string;
  latencyMs: number;
  timestamp: string;
};

type RegressionReport = {
  id: number;
  name: string;
  subsystem: string;
  status: string;
  impact: string;
  penaltyMs: number;
  lastTriggeredAt: string;
};

type SecuritySnapshot = {
  blockHeight: number;
  activeVoters: number;
  averageLatencyMs: number;
  throughputPerMinute: number;
  writebackErrorPending: boolean;
  gpuImplicitSyncStalled: boolean;
  memoryCompactionLivelock: boolean;
  journalMirroringEnabled: boolean;
  tally: Record<string, number>;
  subsystemLatencyMs: Record<string, number>;
  sampledAt: string;
};

const API = import.meta.env.VITE_API_BASE ?? "";
const candidates = ["Ahn", "Baek", "Choi"];
const precincts = ["P-17", "P-21", "P-34", "P-55", "P-89"];
const colors = ["#22C55E", "#F59E0B", "#38BDF8"];

const fallbackSnapshot: SecuritySnapshot = {
  blockHeight: 43112,
  activeVoters: 120,
  averageLatencyMs: 0,
  throughputPerMinute: 0,
  writebackErrorPending: false,
  gpuImplicitSyncStalled: false,
  memoryCompactionLivelock: false,
  journalMirroringEnabled: true,
  tally: { Ahn: 428, Baek: 391, Choi: 365 },
  subsystemLatencyMs: {
    tlbShootdown: 100,
    globalMutex: 160,
    gpuFence: 140,
    writebackMask: 2000,
    numaHop: 200,
    journalMirror: 100,
  },
  sampledAt: new Date().toISOString(),
};

function App() {
  const [snapshot, setSnapshot] = useState<SecuritySnapshot>(fallbackSnapshot);
  const [ledger, setLedger] = useState<LedgerTransaction[]>([]);
  const [regressions, setRegressions] = useState<RegressionReport[]>([]);
  const [busy, setBusy] = useState(false);
  const [selectedNode, setSelectedNode] = useState<"local" | "remote">("remote");

  async function refresh() {
    const [securityRes, ledgerRes, regressionRes] = await Promise.all([
      fetch(`${API}/api/security`),
      fetch(`${API}/api/ledger`),
      fetch(`${API}/api/regressions`),
    ]);
    if (securityRes.ok) setSnapshot(await securityRes.json());
    if (ledgerRes.ok) setLedger(await ledgerRes.json());
    if (regressionRes.ok) setRegressions(await regressionRes.json());
  }

  useEffect(() => {
    refresh().catch(() => undefined);
    const id = window.setInterval(() => refresh().catch(() => undefined), 2200);
    return () => window.clearInterval(id);
  }, []);

  async function castVote() {
    setBusy(true);
    const body = {
      precinct: precincts[Math.floor(Math.random() * precincts.length)],
      candidate: candidates[Math.floor(Math.random() * candidates.length)],
      numaNode: selectedNode,
    };
    await fetch(`${API}/api/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await refresh();
    setBusy(false);
  }

  async function trigger(id: number) {
    await fetch(`${API}/api/regressions/${id}/trigger`, { method: "POST" });
    await refresh();
  }

  async function batchDelete() {
    setBusy(true);
    await fetch(`${API}/api/sessions/batch-delete`, { method: "POST" });
    await refresh();
    setBusy(false);
  }

  const tallyData = useMemo(
    () => Object.entries(snapshot.tally).map(([name, votes]) => ({ name, votes })),
    [snapshot.tally],
  );

  const latencyData = useMemo(
    () => Object.entries(snapshot.subsystemLatencyMs).map(([name, value]) => ({ name, value })),
    [snapshot.subsystemLatencyMs],
  );

  return (
    <main className="min-h-screen bg-[#0F172A] text-slate-100">
      <div className="absolute inset-0 overflow-hidden">
        <div className="chain-grid" />
      </div>
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-5 lg:px-6">
        <header className="flex flex-col gap-4 border-b border-emerald-400/15 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 text-emerald-300">
              <ShieldCheck className="h-7 w-7" />
              <span className="text-sm font-semibold uppercase tracking-[0.24em]">TRUST-VOTE secure ledger</span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold text-white md:text-5xl">Blockchain Voting Control Plane</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="control-button"
              onClick={() => setSelectedNode(selectedNode === "local" ? "remote" : "local")}
              title="Toggle NUMA node distance"
            >
              <Network className="h-4 w-4" />
              NUMA {selectedNode}
            </button>
            <button className="primary-button" onClick={castVote} disabled={busy} title="Cast encrypted vote">
              <Vote className="h-4 w-4" />
              New Vote
            </button>
            <button className="danger-button" onClick={batchDelete} disabled={busy} title="Trigger SSD GC delay">
              <Trash2 className="h-4 w-4" />
              Batch Delete
            </button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={<Lock />} label="Block Height" value={snapshot.blockHeight.toLocaleString()} tone="green" />
            <Metric icon={<Activity />} label="Throughput / min" value={snapshot.throughputPerMinute} tone="gold" />
            <Metric icon={<Cpu />} label="Avg Latency" value={`${snapshot.averageLatencyMs} ms`} tone="sky" />
            <Metric icon={<RadioTower />} label="Active Voters" value={snapshot.activeVoters} tone="green" />
          </div>

          <SecurityPanel snapshot={snapshot} />
        </section>

        <section className="grid flex-1 gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="panel min-h-[360px]">
            <div className="panel-title">
              <KeyRound className="h-5 w-5 text-emerald-300" />
              Vote Encryption Visualization
            </div>
            <div className={`encryption-core ${snapshot.gpuImplicitSyncStalled ? "stalled" : ""}`}>
              <div className="orbit orbit-a" />
              <div className="orbit orbit-b" />
              <div className="hash-column">
                {Array.from({ length: 9 }).map((_, index) => (
                  <span key={index} style={{ animationDelay: `${index * 110}ms` }} />
                ))}
              </div>
              <div className="core-lock">
                <Lock className="h-11 w-11" />
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ChartPanel title="Vote Count">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={tallyData} dataKey="votes" nameKey="name" outerRadius={72} innerRadius={42}>
                      {tallyData.map((entry, index) => (
                        <Cell key={entry.name} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid #22C55E55" }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartPanel>
              <ChartPanel title="Subsystem Latency">
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={latencyData}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid #F59E0B55" }} />
                    <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartPanel>
            </div>
          </div>

          <div className="panel min-h-[360px]">
            <div className="panel-title">
              <DatabaseZap className="h-5 w-5 text-amber-300" />
              Live Ledger
            </div>
            <div className="ledger-feed">
              {ledger.map((tx) => (
                <div className="ledger-row" key={`${tx.id}-${tx.timestamp}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`state-dot ${tx.state.includes("ERROR") ? "bg-rose-400" : tx.state.includes("PENDING") ? "bg-amber-400" : "bg-emerald-400"}`} />
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm text-white">{tx.hash}</p>
                      <p className="text-xs text-slate-400">
                        {tx.id} · {tx.precinct} · {tx.candidate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-emerald-300">#{tx.height}</p>
                    <p className="text-xs text-amber-300">{tx.latencyMs} ms</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <div className="panel">
            <div className="panel-title">
              <Zap className="h-5 w-5 text-amber-300" />
              Regression Matrix
            </div>
            <div className="regression-grid">
              {regressions.map((item) => (
                <button key={item.id} className="regression-cell" onClick={() => trigger(item.id)} title={item.impact}>
                  <span className="font-mono text-xs text-emerald-300">R{item.id.toString().padStart(2, "0")}</span>
                  <span className="truncate text-sm font-semibold text-white">{item.name}</span>
                  <span className="text-xs text-slate-400">{item.subsystem}</span>
                  <span className="mt-2 text-xs text-amber-300">{item.status} · {item.penaltyMs}ms</span>
                </button>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="panel-title">
              <HardDrive className="h-5 w-5 text-emerald-300" />
              Write Path Trend
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={ledger.slice(0, 14).reverse()}>
                <defs>
                  <linearGradient id="latencyFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="height" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid #22C55E55" }} />
                <Area dataKey="latencyMs" stroke="#22C55E" fill="url(#latencyFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone: "green" | "gold" | "sky" }) {
  const toneMap = {
    green: "text-emerald-300 border-emerald-400/25",
    gold: "text-amber-300 border-amber-400/25",
    sky: "text-sky-300 border-sky-400/25",
  };
  return (
    <div className={`metric-card ${toneMap[tone]}`}>
      <div className="h-5 w-5">{icon}</div>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function SecurityPanel({ snapshot }: { snapshot: SecuritySnapshot }) {
  const rows = [
    ["Writeback Mask", snapshot.writebackErrorPending ? "Pending" : "Clear", snapshot.writebackErrorPending],
    ["GPU Fence", snapshot.gpuImplicitSyncStalled ? "Stalled" : "Flowing", snapshot.gpuImplicitSyncStalled],
    ["Compaction", snapshot.memoryCompactionLivelock ? "Livelock" : "Progress", snapshot.memoryCompactionLivelock],
    ["Journal Mirror", snapshot.journalMirroringEnabled ? "Halved BW" : "Single", snapshot.journalMirroringEnabled],
  ] as const;
  return (
    <div className="security-panel">
      <div className="panel-title">
        <ShieldCheck className="h-5 w-5 text-emerald-300" />
        Security Status
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {rows.map(([label, value, alert]) => (
          <div className="status-tile" key={label}>
            <p className="text-xs text-slate-400">{label}</p>
            <p className={alert ? "text-amber-300" : "text-emerald-300"}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="chart-panel">
      <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      {children}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

