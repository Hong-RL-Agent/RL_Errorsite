import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Link2, RefreshCcw, ShieldAlert, Timer } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart
} from "recharts";

type Incident = {
  index: number;
  title: string;
  severity: string;
};

type OverviewResponse = {
  gatewayHealth: string;
  activeRoutes: number;
  errorBudgetUsed: number;
  p95LatencyMs: number;
  successRateSeries: Array<{ time: string; successRate: number }>;
  latencySeries: Array<{ time: string; latencyMs: number }>;
  incidents: Incident[];
};

const panelClass =
  "rounded-2xl border border-white/10 bg-gradient-to-b from-[#141a25] to-[#0f141f] shadow-panel backdrop-blur";

export default function GatewayDashboard() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);
  const [rateLimitNotice, setRateLimitNotice] = useState<string | null>(null);
  const [payloadMismatchError, setPayloadMismatchError] = useState<string | null>(null);
  const [secretLeak, setSecretLeak] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/dashboard/bootstrap");
        if (!response.ok) {
          throw new Error(`bootstrap failed: ${response.status}`);
        }
        const data = (await response.json()) as OverviewResponse;
        setOverview(data);
      } catch (error) {
        setBootError((error as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const headline = useMemo(() => {
    if (loading) {
      return "Waiting for weather and forex providers... main dashboard is blocked (Circuit Breaker OFF)";
    }
    if (bootError) {
      return bootError;
    }
    return "External dependencies recovered enough to render dashboard with degraded health";
  }, [bootError, loading]);

  const triggerRateLimit = async () => {
    const response = await fetch("/api/faults/110/payment/charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: "tenant-9036", amount: 120.45 })
    });
    const result = await response.json();
    if (response.status === 429) {
      setRateLimitNotice("Provider Rate Limit Exceeded");
      return;
    }
    setRateLimitNotice(`Charge accepted (${result.count}/3 before block)`);
  };

  const triggerPayloadMismatch = async () => {
    setPayloadMismatchError(null);
    const response = await fetch("/api/faults/115/provider-profile");
    const payload = await response.json();
    try {
      // Intentional legacy parser assumption to trigger undefined-reference parsing failure.
      const providerName = payload.data.provider.name.toUpperCase();
      setPayloadMismatchError(`Unexpectedly parsed provider: ${providerName}`);
    } catch (error) {
      setPayloadMismatchError(`Parsing Error: ${(error as Error).message}`);
    }
  };

  const triggerSecretLeak = async () => {
    const response = await fetch("/api/faults/120/provider-secret-leak");
    const payload = await response.json();
    setSecretLeak(payload.responseBody);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex justify-center">
      <div className="max-w-[1440px] w-full mx-auto px-8 py-8">
        <header className={`${panelClass} mb-8 px-8 py-6`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                <Link2 size={14} /> Enterprise Monitoring
              </p>
              <h1 className="m-0 text-4xl font-bold tracking-wide text-white">JAWS API GATEWAY #9036</h1>
              <p className="mt-3 text-sm text-slate-300">{headline}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
            >
              <RefreshCcw size={14} />
              Refresh
            </button>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <article className={`${panelClass} px-6 py-5`}>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">Gateway Health</p>
            <p className="text-2xl font-semibold text-amber-300">{overview?.gatewayHealth ?? "LOADING"}</p>
          </article>
          <article className={`${panelClass} px-6 py-5`}>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">Active Routes</p>
            <p className="text-2xl font-semibold text-white">{overview?.activeRoutes ?? "-"}</p>
          </article>
          <article className={`${panelClass} px-6 py-5`}>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">P95 Latency</p>
            <p className="text-2xl font-semibold text-rose-300">{overview?.p95LatencyMs ?? "-"} ms</p>
          </article>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <article className={`${panelClass} h-[320px] px-6 py-5`}>
            <p className="mb-4 text-sm font-medium text-slate-200">API Success Rate</p>
            <ResponsiveContainer width="100%" height="88%">
              <AreaChart data={overview?.successRateSeries ?? []}>
                <defs>
                  <linearGradient id="successFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a37" />
                <XAxis dataKey="time" stroke="#7f8ea3" />
                <YAxis domain={[90, 100]} stroke="#7f8ea3" />
                <Tooltip />
                <Area type="monotone" dataKey="successRate" stroke="#22d3ee" fill="url(#successFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </article>
          <article className={`${panelClass} h-[320px] px-6 py-5`}>
            <p className="mb-4 text-sm font-medium text-slate-200">External Dependency Latency</p>
            <ResponsiveContainer width="100%" height="88%">
              <LineChart data={overview?.latencySeries ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2a37" />
                <XAxis dataKey="time" stroke="#7f8ea3" />
                <YAxis stroke="#7f8ea3" />
                <Tooltip />
                <Line type="monotone" dataKey="latencyMs" stroke="#f97316" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </article>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className={`${panelClass} px-6 py-5`}>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-200">
              <Timer size={16} />
              Index 110 - External Rate Limiting
            </div>
            <button
              onClick={() => void triggerRateLimit()}
              className="rounded-lg border border-amber-400/50 bg-amber-500/10 px-4 py-2 text-sm text-amber-200 hover:bg-amber-500/20"
            >
              Trigger Payment Provider Call
            </button>
            {rateLimitNotice && <p className="mt-3 text-sm text-amber-100">{rateLimitNotice}</p>}
          </article>

          <article className={`${panelClass} px-6 py-5`}>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-rose-200">
              <AlertTriangle size={16} />
              Index 115 - API Payload Mismatch
            </div>
            <button
              onClick={() => void triggerPayloadMismatch()}
              className="rounded-lg border border-rose-400/50 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 hover:bg-rose-500/20"
            >
              Run Legacy JSON Parser
            </button>
            {payloadMismatchError && <p className="mt-3 text-sm text-rose-100">{payloadMismatchError}</p>}
          </article>

          <article className={`${panelClass} px-6 py-5`}>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-200">
              <ShieldAlert size={16} />
              Index 120 - Third-party Secret Leak
            </div>
            <button
              onClick={() => void triggerSecretLeak()}
              className="rounded-lg border border-red-400/50 bg-red-500/10 px-4 py-2 text-sm text-red-200 hover:bg-red-500/20"
            >
              Inspect Provider Response Body
            </button>
            {secretLeak && (
              <pre className="mt-3 overflow-x-auto rounded-lg border border-red-300/30 bg-black/40 p-3 text-xs text-red-100">
                {JSON.stringify(secretLeak, null, 2)}
              </pre>
            )}
          </article>

          <article className={`${panelClass} px-6 py-5`}>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-200">
              <Timer size={16} />
              Index 125 - Cascading Failure
            </div>
            <p className="text-sm text-slate-200">
              Dashboard bootstrap intentionally blocks on weather/forex calls without circuit breaker isolation.
            </p>
            {loading && <p className="mt-3 text-sm text-cyan-200">Main thread occupied by external API timeout chain...</p>}
          </article>
        </section>

        <section className="mt-6">
          <article className={`${panelClass} px-6 py-5`}>
            <h2 className="mb-3 text-lg font-semibold text-white">Fault Registry</h2>
            <div className="space-y-2">
              {(overview?.incidents ?? []).map((incident) => (
                <div key={incident.index} className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-2 text-sm">
                  <span className="text-slate-200">
                    #{incident.index} {incident.title}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">{incident.severity}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
