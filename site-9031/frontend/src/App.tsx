import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Cpu, HardDrive, Server, ToggleLeft, ToggleRight } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { FaultItem, KpiSummary, MetricPoint } from "./types";

type MetricsResponse = {
  series: MetricPoint[];
  kpi: KpiSummary;
};

const cardClass =
  "rounded-2xl border border-border bg-panel/80 p-5 shadow-card backdrop-blur-sm";

const severityColor: Record<FaultItem["severity"], string> = {
  critical: "text-rose-400",
  high: "text-amber-400",
  medium: "text-sky-400",
  low: "text-emerald-400"
};

async function fetchFaults(): Promise<FaultItem[]> {
  const response = await fetch("/api/faults");
  if (!response.ok) {
    throw new Error("fault list load failed");
  }
  const payload = await response.json();
  return payload.items as FaultItem[];
}

async function fetchMetrics(): Promise<MetricsResponse> {
  const response = await fetch("/api/dashboard/metrics");
  if (!response.ok) {
    throw new Error("metrics load failed");
  }
  return (await response.json()) as MetricsResponse;
}

async function toggleFault(index: number, enabled: boolean): Promise<void> {
  const response = await fetch(`/api/faults/${index}/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled })
  });
  if (!response.ok) {
    throw new Error("toggle failed");
  }
}

export default function App() {
  const [faults, setFaults] = useState<FaultItem[]>([]);
  const [series, setSeries] = useState<MetricPoint[]>([]);
  const [kpi, setKpi] = useState<KpiSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = async () => {
    try {
      const [faultData, metricData] = await Promise.all([fetchFaults(), fetchMetrics()]);
      setFaults(faultData);
      setSeries(metricData.series);
      setKpi(metricData.kpi);
      setError(null);
    } catch {
      setError("데이터를 가져오지 못했습니다. API 상태를 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const activeFaults = useMemo(() => faults.filter((f) => f.enabled), [faults]);

  const onToggle = async (fault: FaultItem) => {
    await toggleFault(fault.index, !fault.enabled);
    await loadAll();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-8 lg:px-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Site 9031</p>
            <h1 className="mt-2 text-2xl font-semibold md:text-3xl">
              Server Resource & Hardware Fault Operations
            </h1>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
            Active Faults: <span className="font-semibold text-rose-400">{activeFaults.length}</span>
          </div>
        </header>

        {loading ? (
          <div className={cardClass}>Loading...</div>
        ) : error ? (
          <div className={`${cardClass} border-rose-700 text-rose-300`}>{error}</div>
        ) : (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className={cardClass}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-slate-300">CPU Pressure</span>
                  <Cpu className="h-4 w-4 text-violet-300" />
                </div>
                <p className="text-3xl font-semibold">{kpi?.cpuPressure.toFixed(1)}%</p>
              </article>
              <article className={cardClass}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-slate-300">I/O Wait</span>
                  <HardDrive className="h-4 w-4 text-amber-300" />
                </div>
                <p className="text-3xl font-semibold">{kpi?.ioWait.toFixed(1)}%</p>
              </article>
              <article className={cardClass}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-slate-300">FD Usage</span>
                  <Server className="h-4 w-4 text-cyan-300" />
                </div>
                <p className="text-3xl font-semibold">{kpi?.fdUsage.toFixed(1)}%</p>
              </article>
              <article className={cardClass}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-slate-300">Zombie Workers</span>
                  <AlertTriangle className="h-4 w-4 text-rose-300" />
                </div>
                <p className="text-3xl font-semibold">{kpi?.zombieWorkers.toFixed(1)}</p>
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
              <article className={cardClass}>
                <h2 className="mb-4 text-lg font-semibold">Resource Trend</h2>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series}>
                      <defs>
                        <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />
                      <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
                      <Area type="monotone" dataKey="cpu" stroke="#8b5cf6" fill="url(#cpuFill)" />
                      <Line type="monotone" dataKey="memory" stroke="#22d3ee" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="ioWait" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className={cardClass}>
                <h2 className="mb-4 text-lg font-semibold">Leak & Exhaustion Monitor</h2>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series}>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                      <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
                      <Legend />
                      <Line type="monotone" dataKey="fdUsage" stroke="#06b6d4" dot={false} />
                      <Line type="monotone" dataKey="inodeUsage" stroke="#ef4444" dot={false} />
                      <Line type="monotone" dataKey="zombieWorkers" stroke="#f97316" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>

            <section className={cardClass}>
              <h2 className="mb-4 text-lg font-semibold">Fault Injection Controls</h2>
              <div className="grid gap-3">
                {faults.map((fault) => (
                  <button
                    key={fault.index}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-left transition hover:border-slate-600"
                    onClick={() => void onToggle(fault)}
                  >
                    <div className="pr-4">
                      <p className="text-sm text-slate-400">Index {fault.index}</p>
                      <p className="text-base font-medium">{fault.title}</p>
                      <p className="text-sm text-slate-400">{fault.symptom}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold uppercase ${severityColor[fault.severity]}`}>
                        {fault.severity}
                      </span>
                      {fault.enabled ? (
                        <ToggleRight className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-slate-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
