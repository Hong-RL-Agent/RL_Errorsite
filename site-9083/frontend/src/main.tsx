import React from "react";
import ReactDOM from "react-dom/client";
import {
  Activity,
  Binary,
  Cpu,
  FileSearch,
  Fingerprint,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Waves,
} from "lucide-react";
import "./styles.css";

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type SecurityEvent = {
  id: string;
  timestamp: string;
  severity: Severity;
  vector: string;
  title: string;
  finding: string;
  affectedAsset: string;
  recommendedControl: string;
};

type SignalSample = {
  id: string;
  type: string;
  frequencyHz: number;
  amplitude: number;
  confidence: number;
  source: string;
  interpretation: string;
};

type IntegrityStatus = {
  component: string;
  status: string;
  hash: string;
  baseline: string;
  lastVerified: string;
  note: string;
};

type PatentDocument = {
  id: string;
  classification: string;
  title: string;
  abstractText: string;
  claims: string[];
  sensitiveMarkers: string[];
};

type Dashboard = {
  station: string;
  port: string;
  document: PatentDocument;
  signals: SignalSample[];
  integrity: IntegrityStatus[];
  events: SecurityEvent[];
};

const fallback: Dashboard = {
  station: "PATENT-AI / Compartment 9083",
  port: "http://localhost:9083",
  document: {
    id: "KR-SEC-9083-LOCAL",
    classification: "TOP SECRET / OFFLINE CACHE",
    title: "Physical-Layer Patent Analysis Control Surface",
    abstractText:
      "Backend telemetry is temporarily unavailable. The client is rendering local isolation status for compartment 9083.",
    claims: ["Claim cache: viewer isolation active.", "Claim cache: forensic timeline awaiting API sync."],
    sensitiveMarkers: ["9083-isolated", "offline-cache"],
  },
  signals: [],
  integrity: [],
  events: [],
};

function severityClass(severity: Severity) {
  return {
    LOW: "text-slate-300 border-slate-600",
    MEDIUM: "text-blue-200 border-blue-500/70",
    HIGH: "text-fuchsia-200 border-fuchsia-500/80",
    CRITICAL: "text-white border-fuchsia-400 bg-fuchsia-500/10",
  }[severity];
}

function waveformPath(seed: number, height = 72, width = 520) {
  const points = Array.from({ length: 44 }, (_, i) => {
    const x = (i / 43) * width;
    const y =
      height / 2 +
      Math.sin(i * 0.72 + seed) * (16 + (seed % 4) * 2) +
      Math.cos(i * 0.21 + seed * 1.7) * 8;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M ${points.join(" L ")}`;
}

function useDashboard() {
  const [data, setData] = React.useState<Dashboard>(fallback);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => {
        if (!response.ok) throw new Error(`API ${response.status}`);
        return response.json() as Promise<Dashboard>;
      })
      .then(setData)
      .catch(() => setData(fallback))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

function App() {
  const { data, loading } = useDashboard();
  const criticalCount = data.events.filter((event) => event.severity === "CRITICAL").length;
  const averageConfidence =
    data.signals.length === 0
      ? 0
      : Math.round((data.signals.reduce((sum, signal) => sum + signal.confidence, 0) / data.signals.length) * 100);

  return (
    <main className="min-h-screen bg-black text-slate-100">
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.06)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="relative mx-auto max-w-[1640px] px-4 py-4 lg:px-6">
        <header className="border border-blue-500/30 bg-[#121212]/90 px-4 py-3 shadow-[0_0_36px_rgba(59,130,246,0.12)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
                <ShieldCheck size={15} />
                국가 지식재산 보호국 / 분석 격실 9083
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-normal text-white md:text-4xl">PATENT-AI</h1>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs md:min-w-[520px]">
              <Metric label="API 경로" value="/api" />
              <Metric label="포트" value={data.port} />
              <Metric label="상태" value={loading ? "SYNC" : "LIVE"} alert={!loading} />
            </div>
          </div>
        </header>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_1.45fr_0.9fr]">
          <PatentViewer document={data.document} />
          <SignalMatrix signals={data.signals} confidence={averageConfidence} />
          <StatusPanel integrity={data.integrity} criticalCount={criticalCount} />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <ForensicTimeline events={data.events} />
          <IdsConsole events={data.events} />
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, alert = false }: { label: string; value: string | number; alert?: boolean }) {
  return (
    <div className="border border-blue-500/25 bg-black/70 px-3 py-2">
      <div className="text-[10px] uppercase text-slate-500">{label}</div>
      <div className={alert ? "truncate text-sm font-semibold text-blue-300" : "truncate text-sm font-semibold text-slate-100"}>
        {value}
      </div>
    </div>
  );
}

function PatentViewer({ document }: { document: PatentDocument }) {
  return (
    <article className="min-h-[520px] border border-blue-500/30 bg-[#121212]/88">
      <PanelTitle icon={<FileSearch size={17} />} title="실시간 특허 문서 렌더링 뷰어" value={document.classification} />
      <div className="px-4 pb-4">
        <div className="border border-slate-700/70 bg-black p-4">
          <div className="flex items-center justify-between gap-3 border-b border-blue-500/30 pb-3">
            <span className="text-xs font-semibold text-blue-300">{document.id}</span>
            <span className="text-xs text-fuchsia-300">SCREEN CAPTURE RISK: OPEN</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold leading-tight text-white">{document.title}</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">{document.abstractText}</p>
          <div className="mt-4 space-y-2">
            {document.claims.map((claim) => (
              <p key={claim} className="border-l-2 border-blue-500 bg-blue-500/5 px-3 py-2 text-sm text-slate-200">
                {claim}
              </p>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {document.sensitiveMarkers.map((marker) => (
              <span key={marker} className="border border-fuchsia-400/60 px-2 py-1 text-[11px] uppercase text-fuchsia-200">
                {marker}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function SignalMatrix({ signals, confidence }: { signals: SignalSample[]; confidence: number }) {
  return (
    <article className="border border-blue-500/30 bg-[#121212]/88">
      <PanelTitle icon={<Waves size={17} />} title="사이드 채널 신호 파형" value={`${confidence}% CONF`} />
      <div className="grid gap-3 px-4 pb-4">
        {signals.map((signal, index) => (
          <div key={signal.id} className="border border-slate-700/70 bg-black/80 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Radio size={14} className="shrink-0 text-blue-300" />
                <span className="truncate text-sm font-semibold text-white">{signal.type}</span>
              </div>
              <span className="text-xs text-fuchsia-200">{Math.round(signal.frequencyHz).toLocaleString()} Hz</span>
            </div>
            <svg className="h-[74px] w-full overflow-visible" viewBox="0 0 520 74" role="img">
              <path d={waveformPath(index + signal.amplitude * 10)} fill="none" stroke="#3B82F6" strokeWidth="2.5" />
              <path d={waveformPath(index + signal.confidence * 8, 74)} fill="none" stroke="#D946EF" strokeOpacity="0.65" strokeWidth="1.5" />
            </svg>
            <div className="mt-2 grid grid-cols-[88px_1fr_52px] items-center gap-2 text-xs">
              <span className="truncate text-slate-500">{signal.source}</span>
              <span className="truncate text-slate-300">{signal.interpretation}</span>
              <span className="text-right text-blue-200">{Math.round(signal.confidence * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function StatusPanel({ integrity, criticalCount }: { integrity: IntegrityStatus[]; criticalCount: number }) {
  return (
    <aside className="border border-blue-500/30 bg-[#121212]/88">
      <PanelTitle icon={<Fingerprint size={17} />} title="FIM / IDS 상태" value={`${criticalCount} CRIT`} />
      <div className="grid gap-3 px-4 pb-4">
        {integrity.map((item) => (
          <div key={item.component} className="border border-slate-700/70 bg-black p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">{item.component}</div>
                <div className="mt-1 text-xs text-slate-500">{item.lastVerified}</div>
              </div>
              <span className="shrink-0 border border-fuchsia-400/60 px-2 py-1 text-[11px] text-fuchsia-200">{item.status}</span>
            </div>
            <div className="mt-3 grid gap-1 text-xs text-slate-400">
              <span>HASH {item.hash}</span>
              <span>BASE {item.baseline}</span>
              <span className="text-blue-200">{item.note}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function ForensicTimeline({ events }: { events: SecurityEvent[] }) {
  return (
    <article className="border border-blue-500/30 bg-[#121212]/88">
      <PanelTitle icon={<Activity size={17} />} title="디지털 포렌식 타임라인" value="CHAIN OBSERVED" />
      <div className="px-4 pb-4">
        <div className="grid gap-2">
          {events.map((event) => (
            <div key={event.id} className="grid gap-3 border border-slate-700/70 bg-black p-3 md:grid-cols-[176px_120px_1fr_260px]">
              <div className="text-xs text-slate-500">{event.timestamp}</div>
              <div className={`w-fit border px-2 py-1 text-[11px] font-semibold ${severityClass(event.severity)}`}>{event.severity}</div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">{event.title}</div>
                <div className="mt-1 text-xs text-slate-400">{event.finding}</div>
              </div>
              <div className="text-xs text-blue-200">{event.recommendedControl}</div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function IdsConsole({ events }: { events: SecurityEvent[] }) {
  return (
    <aside className="border border-blue-500/30 bg-[#121212]/88">
      <PanelTitle icon={<ShieldAlert size={17} />} title="관제 로그" value="11 VECTORS" />
      <div className="space-y-2 px-4 pb-4 font-mono text-xs">
        {events.map((event) => (
          <div key={event.id} className="border border-slate-800 bg-black px-3 py-2">
            <div className="flex items-center justify-between gap-2 text-blue-200">
              <span>{event.id}</span>
              <span>{event.vector}</span>
            </div>
            <div className="mt-1 text-slate-400">{event.affectedAsset}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function PanelTitle({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 border-b border-blue-500/30 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
        <span className="text-blue-300">{icon}</span>
        <span className="truncate">{title}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-xs text-fuchsia-200">
        <Binary size={14} />
        {value}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
