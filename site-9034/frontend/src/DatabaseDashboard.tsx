import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  Bug,
  Database,
  RefreshCw,
  SendHorizontal,
  Timer
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type LatencyPoint = { time: string; latency: number };
type DeadlockState = {
  active: boolean;
  message: string;
  freezeDataUpdates: boolean;
  round: number;
};
type TransferResult = {
  dirtyReadObserved: boolean;
  dirtyReadSessionBalance: number;
  committedFromBalance: number;
  committedToBalance: number;
  message: string;
};
type AccountLoadResult = {
  delayMs: number;
  queryCount: number;
  updatesFrozenByDeadlock: boolean;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export default function DatabaseDashboard() {
  const [latency, setLatency] = useState<LatencyPoint[]>([]);
  const [deadlock, setDeadlock] = useState<DeadlockState | null>(null);
  const [sqlDebug, setSqlDebug] = useState<string[]>([]);
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);
  const [accountLoad, setAccountLoad] = useState<AccountLoadResult | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshDashboard = async () => {
    setLoading(true);
    try {
      const [latencyRes, deadlockRes, accountsRes, sqlRes] = await Promise.all([
        fetch(`${API_BASE}/latency`),
        fetch(`${API_BASE}/deadlock`),
        fetch(`${API_BASE}/accounts?size=8`),
        fetch(`${API_BASE}/debug/sql`)
      ]);

      const [latencyJson, deadlockJson, accountsJson, sqlJson] = await Promise.all([
        latencyRes.json(),
        deadlockRes.json(),
        accountsRes.json(),
        sqlRes.json()
      ]);

      setLatency(latencyJson);
      setDeadlock(deadlockJson);
      setAccountLoad(accountsJson);
      setSqlDebug(sqlJson);
    } finally {
      setLoading(false);
    }
  };

  const runTransfer = async () => {
    const payload = { fromId: 1, toId: 2, amount: 32500 };
    const res = await fetch(`${API_BASE}/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = (await res.json()) as TransferResult;
    setTransferResult(json);
    await refreshDashboard();
  };

  useEffect(() => {
    refreshDashboard();
    const interval = setInterval(refreshDashboard, 5500);
    return () => clearInterval(interval);
  }, []);

  const nPlusOneScore = useMemo(() => {
    if (!accountLoad) return 0;
    return Math.min(100, Math.round((accountLoad.delayMs / 5000) * 100));
  }, [accountLoad]);

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center text-slate-100">
      <div className="max-w-[1440px] w-full mx-auto px-10 py-10">
        <header className="glass-card p-7 mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Fintech Admin Console</p>
              <h1 className="text-3xl font-semibold mt-2">Advanced Database & Transactional Integrity Faults</h1>
              <p className="text-slate-300 mt-2">
                RL Agent Training Site #9034 · Index 50 / 52 / 55 / 58 fault instrumentation
              </p>
            </div>
            <button
              type="button"
              onClick={refreshDashboard}
              disabled={loading}
              className="px-4 py-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-300/30 flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {deadlock?.active && (
          <div className="glass-card p-4 mb-6 border-rose-400/60 bg-rose-950/30">
            <p className="flex items-center gap-2 text-rose-300 font-semibold">
              <AlertTriangle size={18} />
              Deadlock Detected
            </p>
            <p className="text-slate-200 mt-1">{deadlock.message}</p>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          <section className="glass-card p-6 col-span-12 lg:col-span-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer size={18} className="text-cyan-300" />
                <h2 className="text-xl font-semibold">Transaction Latency</h2>
              </div>
              <span className="text-xs text-slate-300">Recharts / Real-time Fault Signal</span>
            </div>
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={latency}>
                  <defs>
                    <linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.65} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" unit="ms" />
                  <Tooltip
                    contentStyle={{ background: "#111827", border: "1px solid #334155", borderRadius: "12px" }}
                  />
                  <Area type="monotone" dataKey="latency" stroke="#22d3ee" strokeWidth={2.5} fill="url(#latencyFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="glass-card p-6 col-span-12 lg:col-span-4">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-amber-300" />
              <h2 className="text-xl font-semibold">Index 50 · N+1 Query</h2>
            </div>
            <p className="text-slate-300 mt-2 text-sm">데이터 리스트 로드 시 지연이 기하급수적으로 증가합니다.</p>
            <div className="mt-4 space-y-2 text-sm">
              <p>Observed Delay: <span className="text-amber-300 font-semibold">{accountLoad?.delayMs ?? 0}ms</span></p>
              <p>SQL Query Count: <span className="font-semibold">{accountLoad?.queryCount ?? 0}</span></p>
              <p>Data Updates Frozen: <span className="font-semibold">{String(accountLoad?.updatesFrozenByDeadlock ?? false)}</span></p>
            </div>
            <div className="mt-4 w-full bg-slate-800 rounded-full h-3">
              <div className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-rose-500" style={{ width: `${nPlusOneScore}%` }} />
            </div>
          </section>

          <section className="glass-card p-6 col-span-12 lg:col-span-6">
            <div className="flex items-center gap-2">
              <ArrowRightLeft size={18} className="text-emerald-300" />
              <h2 className="text-xl font-semibold">Index 52 · Dirty Read / Isolation Leak</h2>
            </div>
            <p className="text-slate-300 mt-2 text-sm">송금 트랜잭션 완료 전 다른 세션이 잘못된 잔액을 읽는 상황을 재현합니다.</p>
            <button
              type="button"
              onClick={runTransfer}
              className="mt-4 px-4 py-2 rounded-2xl bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-300/40 flex items-center gap-2"
            >
              <SendHorizontal size={16} />
              송금 실행
            </button>
            {transferResult && (
              <div className="mt-4 text-sm space-y-1">
                <p className="text-emerald-300 font-semibold">{transferResult.message}</p>
                <p>Dirty Read Balance: {transferResult.dirtyReadSessionBalance}</p>
                <p>Committed From Balance: {transferResult.committedFromBalance}</p>
                <p>Committed To Balance: {transferResult.committedToBalance}</p>
              </div>
            )}
          </section>

          <section className="glass-card p-6 col-span-12 lg:col-span-6">
            <div className="flex items-center gap-2">
              <Bug size={18} className="text-rose-300" />
              <h2 className="text-xl font-semibold">Index 55 · Deadlock Cycle</h2>
            </div>
            <p className="text-slate-300 mt-2 text-sm">
              특정 주기로 Deadlock Detected 경보가 발생하고 일부 데이터 업데이트가 정지됩니다.
            </p>
            <div className="mt-4 rounded-2xl border border-slate-700/70 p-4 bg-slate-900/50">
              <p>Status: <span className={deadlock?.active ? "text-rose-300 font-semibold" : "text-emerald-300 font-semibold"}>
                {deadlock?.active ? "Deadlock Active" : "Normal"}
              </span></p>
              <p>Deadlock Round: {deadlock?.round ?? 0}</p>
              <p>Freeze Updates: {String(deadlock?.freezeDataUpdates ?? false)}</p>
            </div>
          </section>
        </div>

        <section className="glass-card p-6 mt-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-fuchsia-300" />
            <h2 className="text-xl font-semibold">System Debugger · Index 58 (SQL Query Exposure)</h2>
          </div>
          <p className="text-sm text-slate-300 mb-4">
            실제 실행 SQL이 password / account_number 민감 정보와 함께 그대로 노출됩니다.
          </p>
          <div className="rounded-2xl border border-slate-700/70 bg-black/40 p-4 max-h-[280px] overflow-auto">
            <pre className="text-xs leading-6 text-fuchsia-200">
              {(sqlDebug.length ? sqlDebug : ["No SQL captured yet"]).join("\n")}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
