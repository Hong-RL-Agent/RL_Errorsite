import React from "react";
import { createRoot } from "react-dom/client";
import { Activity, Cpu, Database, Gauge, RadioTower, Route, ShieldAlert, Zap } from "lucide-react";
import "./styles.css";

type Intersection = {
  code: string;
  district: string;
  phase: "GREEN" | "AMBER" | "RED";
  cycleSeconds: number;
  queue: number;
  flowRate: number;
  delayIndex: number;
};

type DbMetric = { label: string; value: number; unit: string; status: string };
type DbEvent = { time: string; severity: string; source: string; message: string };
type Snapshot = {
  intersections: Intersection[];
  dbMetrics: DbMetric[];
  events: DbEvent[];
  signalCycles: number[];
  generatedAt: number;
};

const fallback: Snapshot = {
  intersections: [
    { code: "JCT-SEOUL-001", district: "Gangnam Smart Grid", phase: "GREEN", cycleSeconds: 74, queue: 31, flowRate: 89, delayIndex: 0.28 },
    { code: "JCT-SEOUL-014", district: "Digital Media Spine", phase: "AMBER", cycleSeconds: 38, queue: 72, flowRate: 76, delayIndex: 0.53 },
    { code: "JCT-SEOUL-027", district: "Han River East", phase: "RED", cycleSeconds: 92, queue: 118, flowRate: 63, delayIndex: 0.74 },
    { code: "JCT-SEOUL-052", district: "Metropolis Core", phase: "GREEN", cycleSeconds: 66, queue: 44, flowRate: 91, delayIndex: 0.31 }
  ],
  dbMetrics: [
    { label: "Lock Wait", value: 82, unit: "%", status: "DEADLOCK_RISK" },
    { label: "Pool Free", value: 3, unit: "conn", status: "LEAK_PRONE" },
    { label: "Cache Hit", value: 44, unit: "%", status: "BUFFER_PRESSURE" },
    { label: "Dirty Page", value: 87, unit: "%", status: "FLUSH_STORM" },
    { label: "Disk Used", value: 98.2, unit: "%", status: "TABLESPACE_FULL" },
    { label: "Dead Tuple", value: 912000, unit: "rows", status: "VACUUM_STALLED" }
  ],
  events: [
    { time: "09:10:00", severity: "WARN", source: "LOG-TABLE", message: "traffic_event_log is unpartitioned; latest query scanned cold pages." },
    { time: "09:10:03", severity: "ERROR", source: "VACUUM-GC", message: "background cleanup stalled; dead tuples are accumulating." }
  ],
  signalCycles: [74, 38, 92, 66, 83, 55, 47, 101, 62, 71, 88, 44],
  generatedAt: Date.now()
};

function phaseColor(phase: string) {
  if (phase === "GREEN") return "bg-[#22C55E]";
  if (phase === "AMBER") return "bg-[#F59E0B]";
  return "bg-[#EF4444]";
}

function severityColor(severity: string) {
  if (severity === "CRITICAL" || severity === "ERROR") return "text-[#EF4444]";
  if (severity === "WARN") return "text-[#F59E0B]";
  return "text-[#0EA5E9]";
}

function App() {
  const [snapshot, setSnapshot] = React.useState<Snapshot>(fallback);
  const [online, setOnline] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) throw new Error("dashboard unavailable");
        const data = await response.json();
        if (!cancelled) {
          setSnapshot(data);
          setOnline(true);
        }
      } catch {
        if (!cancelled) setOnline(false);
      }
    }
    load();
    const timer = window.setInterval(load, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-5 py-5">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase text-[#0EA5E9]">Smart City Signal Operations</p>
            <h1 className="mt-1 text-4xl font-black text-slate-950">TRAFFIC-CONTROL</h1>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <RadioTower className={online ? "text-[#22C55E]" : "text-[#EF4444]"} size={22} />
            <div>
              <p className="text-xs text-slate-500">Endpoint</p>
              <p className="font-semibold">http://localhost:9100</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
          <CityMap intersections={snapshot.intersections} />
          <SignalPanel snapshot={snapshot} />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
          <DbMetrics metrics={snapshot.dbMetrics} />
          <EventTerminal events={snapshot.events} />
        </section>
      </div>
    </main>
  );
}

function CityMap({ intersections }: { intersections: Intersection[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Route className="text-[#0EA5E9]" />
          <h2 className="text-lg font-bold">실시간 도심 교통 흐름</h2>
        </div>
        <span className="rounded-md bg-[#F1F5F9] px-3 py-1 text-sm font-semibold text-slate-600">Live Adaptive Grid</span>
      </div>
      <div className="relative h-[460px] overflow-hidden rounded-lg border border-slate-200 bg-[#F1F5F9]">
        <div className="city-grid" />
        <div className="road horizontal top-[28%]" />
        <div className="road horizontal top-[62%]" />
        <div className="road vertical left-[30%]" />
        <div className="road vertical left-[68%]" />
        {[18, 35, 54, 73, 88].map((left, index) => (
          <span key={`car-a-${left}`} className="vehicle vehicle-green" style={{ left: `${left}%`, top: "27%", animationDelay: `${index * -1.3}s` }} />
        ))}
        {[8, 29, 47, 66, 83].map((left, index) => (
          <span key={`car-b-${left}`} className="vehicle vehicle-blue" style={{ left: `${left}%`, top: "61%", animationDelay: `${index * -1.1}s` }} />
        ))}
        {intersections.map((item, index) => {
          const points = [
            ["30%", "28%"],
            ["68%", "28%"],
            ["30%", "62%"],
            ["68%", "62%"]
          ][index % 4];
          return (
            <article key={item.code} className="absolute w-52 rounded-lg border border-slate-200 bg-white/90 p-3 shadow-lg backdrop-blur" style={{ left: points[0], top: points[1], transform: "translate(-50%, -50%)" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{item.code}</span>
                <span className={`h-3 w-3 rounded-full ${phaseColor(item.phase)} shadow-[0_0_16px_currentColor]`} />
              </div>
              <p className="mt-1 font-bold">{item.district}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <span className="rounded-md bg-[#F8FAFC] py-2"><b>{item.cycleSeconds}</b>s</span>
                <span className="rounded-md bg-[#F8FAFC] py-2"><b>{item.queue}</b>q</span>
                <span className="rounded-md bg-[#F8FAFC] py-2"><b>{Math.round(item.flowRate)}</b>%</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SignalPanel({ snapshot }: { snapshot: Snapshot }) {
  const max = Math.max(...snapshot.signalCycles);
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="text-[#22C55E]" />
        <h2 className="text-lg font-bold">교차로별 신호 주기 그래프</h2>
      </div>
      <div className="flex h-64 items-end gap-3 border-b border-l border-slate-200 px-3">
        {snapshot.signalCycles.map((value, index) => (
          <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t-md bg-[#0EA5E9]" style={{ height: `${(value / max) * 210}px` }} />
            <span className="text-xs font-semibold text-slate-500">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Kpi icon={<Gauge size={18} />} label="Avg Cycle" value="68s" />
        <Kpi icon={<Zap size={18} />} label="PPO Actions" value="1.8k" />
        <Kpi icon={<ShieldAlert size={18} />} label="DB Faults" value="11" />
      </div>
    </section>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-3">
      <div className="text-[#0EA5E9]">{icon}</div>
      <p className="mt-2 text-xs text-slate-500">{label}</p>
      <p className="text-xl font-black">{value}</p>
    </div>
  );
}

function DbMetrics({ metrics }: { metrics: DbMetric[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Database className="text-[#EF4444]" />
        <h2 className="text-lg font-bold">DB 리소스 상태</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-600">{metric.label}</p>
                <p className="mt-1 text-2xl font-black">{metric.value.toLocaleString()}<span className="text-sm text-slate-500"> {metric.unit}</span></p>
              </div>
              <Cpu className="text-[#F59E0B]" />
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-[#EF4444]" style={{ width: `${Math.min(100, metric.value > 100 ? 92 : metric.value)}%` }} />
            </div>
            <p className="mt-2 text-xs font-semibold text-[#EF4444]">{metric.status}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function EventTerminal({ events }: { events: DbEvent[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">실시간 DB 이벤트 로그</h2>
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#22C55E]" />
      </div>
      <div className="h-[310px] overflow-hidden rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-slate-100">
        {events.map((event, index) => (
          <p key={`${event.time}-${index}`} className="mb-3">
            <span className="text-slate-400">{event.time}</span>{" "}
            <span className={severityColor(event.severity)}>{event.severity}</span>{" "}
            <span className="text-[#0EA5E9]">{event.source}</span>{" "}
            <span>{event.message}</span>
          </p>
        ))}
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
