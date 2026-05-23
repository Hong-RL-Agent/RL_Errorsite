import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Cpu,
  DatabaseZap,
  FileWarning,
  HardDriveUpload,
  MemoryStick,
  Orbit,
  ShieldAlert
} from "lucide-react";

const faultMeta = {
  140: {
    title: "Index 140 · Memory Leak",
    summary: "특정 API 호출마다 메모리가 해제되지 않아 점유율이 지속적으로 상승합니다.",
    icon: MemoryStick
  },
  145: {
    title: "Index 145 · File Descriptor Leak",
    summary: "로그 파일을 연 뒤 닫지 않아 일정 시간 후 파일 생성 에러가 발생합니다.",
    icon: FileWarning
  },
  150: {
    title: "Index 150 · Ungraceful Shutdown",
    summary: "프로세스 종료 핸들러가 미작동하여 버퍼 데이터가 유실됩니다.",
    icon: ShieldAlert
  }
};

async function callApi(path, method = "GET") {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" }
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "요청 처리 중 오류가 발생했습니다.");
  }

  return payload;
}

export default function App() {
  const [overview, setOverview] = useState(null);
  const [busyFault, setBusyFault] = useState(null);
  const [log, setLog] = useState([]);
  const [error, setError] = useState("");

  const pushLog = useCallback((message) => {
    setLog((prev) => [message, ...prev].slice(0, 8));
  }, []);

  const fetchOverview = useCallback(async () => {
    try {
      const data = await callApi("/api/overview");
      setOverview(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    const timer = setInterval(fetchOverview, 4000);
    return () => clearInterval(timer);
  }, [fetchOverview]);

  const triggerFault = useCallback(async (index) => {
    setBusyFault(index);
    try {
      const result = await callApi(`/api/faults/${index}/trigger`, "POST");
      pushLog(`TRIGGER ${index}: ${result.message}`);
      await fetchOverview();
    } catch (err) {
      pushLog(`TRIGGER ${index} 실패: ${err.message}`);
      setError(err.message);
    } finally {
      setBusyFault(null);
    }
  }, [fetchOverview, pushLog]);

  const resetFault = useCallback(async (index) => {
    setBusyFault(index);
    try {
      const result = await callApi(`/api/faults/${index}/reset`, "POST");
      pushLog(`RESET ${index}: ${result.message}`);
      await fetchOverview();
    } catch (err) {
      pushLog(`RESET ${index} 실패: ${err.message}`);
      setError(err.message);
    } finally {
      setBusyFault(null);
    }
  }, [fetchOverview, pushLog]);

  const cluster = overview?.cluster;
  const faults = overview?.faults || {};

  const topMetrics = useMemo(() => ([
    { label: "CPU LOAD", value: cluster ? `${cluster.cpuLoad}%` : "-", icon: Cpu },
    { label: "GPU LOAD", value: cluster ? `${cluster.gpuLoad}%` : "-", icon: Orbit },
    { label: "QUEUE DEPTH", value: cluster ? `${cluster.queueDepth}` : "-", icon: DatabaseZap }
  ]), [cluster]);

  return (
    <div className="min-h-screen bg-[#050505] flex justify-center">
      <div className="max-w-[1440px] w-full mx-auto px-8 py-6 md:px-12 md:py-8">
        <nav className="mb-8 flex items-center justify-between rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/70 to-slate-800/20 px-6 py-4 shadow-glow backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Global Nav</p>
            <h1 className="text-xl font-semibold">Aegis AI Compute Control Center · Site 9037</h1>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            <Activity size={16} />
            <span>Realtime Monitoring</span>
          </div>
        </nav>

        <section className="mb-8 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,#14315b_0%,#0a1020_35%,#050505_100%)] p-8">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-cyan-300/80">Hero</p>
          <h2 className="max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
            Resource Leakage &amp; Compute Cluster Management
          </h2>
          <p className="mt-4 max-w-3xl text-zinc-300">
            자율형 웹 GUI 퍼징 에이전트 훈련용 실증 대시보드. 결함 인덱스 140/145/150을 실시간 주입하고
            시스템 열화 지표를 관측할 수 있습니다.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {topMetrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="mb-3 flex items-center gap-2 text-cyan-200">
                  <metric.icon size={16} />
                  <span className="text-xs tracking-[0.2em]">{metric.label}</span>
                </div>
                <p className="text-3xl font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>
        </section>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-red-200">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <section className="mb-8 grid gap-5 lg:grid-cols-3">
          {[140, 145, 150].map((index) => {
            const meta = faultMeta[index];
            const Icon = meta.icon;
            const status = faults[String(index)]?.status || "stable";

            return (
              <article key={index} className="rounded-2xl border border-white/10 bg-panel/80 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-300">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-lg font-semibold">{meta.title}</h3>
                  </div>
                  <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-widest text-zinc-300">
                    {status}
                  </span>
                </div>
                <p className="mb-5 text-sm leading-6 text-zinc-300">{meta.summary}</p>
                <div className="flex gap-3">
                  <button
                    className="flex-1 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25 disabled:opacity-50"
                    onClick={() => triggerFault(index)}
                    disabled={busyFault === index}
                  >
                    Fault Trigger
                  </button>
                  <button
                    className="flex-1 rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-100 transition hover:bg-fuchsia-500/20 disabled:opacity-50"
                    onClick={() => resetFault(index)}
                    disabled={busyFault === index}
                  >
                    Reset
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mb-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="mb-4 flex items-center gap-2 text-cyan-200">
              <HardDriveUpload size={16} />
              <h4 className="text-sm uppercase tracking-[0.18em]">Fault Telemetry</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p>Retained Memory: {faults["140"]?.retainedMemoryMb ?? 0} MB</p>
              <p>Open File Descriptors: {faults["145"]?.openFileDescriptors ?? 0}</p>
              <p>Lost Records: {faults["150"]?.lostRecords ?? 0}</p>
            </div>
          </article>
          <article className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="mb-4 flex items-center gap-2 text-cyan-200">
              <Activity size={16} />
              <h4 className="text-sm uppercase tracking-[0.18em]">Recent Events</h4>
            </div>
            <div className="space-y-2 text-sm text-zinc-300">
              {log.length === 0 && <p>아직 이벤트가 없습니다.</p>}
              {log.map((entry) => (
                <p key={entry} className="rounded-lg border border-white/10 px-3 py-2">
                  {entry}
                </p>
              ))}
            </div>
          </article>
        </section>

        <footer className="rounded-2xl border border-white/10 bg-black/40 px-6 py-5">
          <p className="text-sm text-zinc-400">
            Footer · AI Operations Safety Lab / Training Scenario 9037
          </p>
        </footer>
      </div>
    </div>
  );
}

