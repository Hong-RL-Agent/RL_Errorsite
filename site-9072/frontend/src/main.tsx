import React from "react";
import { createRoot } from "react-dom/client";
import { Activity, AlertTriangle, CloudSun, DatabaseZap, Leaf, RadioTower, ServerCog, TerminalSquare } from "lucide-react";
import "./styles.css";

type DashboardSnapshot = {
  generatedAt: string;
  summary: {
    globalTemperatureAnomaly: number;
    oceanHeatIndex: number;
    carbonPpm: number;
    driftScore: number;
    rejectedRequests: number;
    lostLogEvents: number;
  };
  heatmap: HeatPoint[];
  emissions: EmissionSeries[];
  nodes: NodeStatus[];
  autoscaling: {
    desiredReplicas: number;
    actualReplicas: number;
    pendingReplicas: number;
    trafficRps: number;
    scaleLagSeconds: number;
    commandFailure: boolean;
  };
  logs: SystemLog[];
  scenarios: RegressionScenario[];
};

type HeatPoint = { lat: number; lon: number; anomaly: number; risk: string };
type EmissionSeries = { sector: string; points: { month: string; value: number }[] };
type NodeStatus = { id: string; region: string; cpu: number; memory: number; queueDepth: number; status: string; cacheLagMs: number };
type SystemLog = { time: string; level: string; source: string; message: string; forwarded: boolean };
type RegressionScenario = { id: number; name: string; status: string; signal: string; trainingObjective: string };

const fallback: DashboardSnapshot = {
  generatedAt: new Date().toISOString(),
  summary: { globalTemperatureAnomaly: 1.47, oceanHeatIndex: 94.1, carbonPpm: 425.2, driftScore: 0.81, rejectedRequests: 386, lostLogEvents: 173 },
  heatmap: [],
  emissions: [
    { sector: "Power", points: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((month, i) => ({ month, value: 34 + i * 1.8 })) },
    { sector: "Transport", points: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((month, i) => ({ month, value: 25 + i * 1.2 })) },
    { sector: "Industry", points: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((month, i) => ({ month, value: 29 + i * 1.4 })) }
  ],
  nodes: [],
  autoscaling: { desiredReplicas: 18, actualReplicas: 11, pendingReplicas: 7, trafficRps: 18420, scaleLagSeconds: 196, commandFailure: true },
  logs: [],
  scenarios: []
};

function App() {
  const [data, setData] = React.useState<DashboardSnapshot>(fallback);
  const [online, setOnline] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = (await response.json()) as DashboardSnapshot;
        if (active) {
          setData(payload);
          setOnline(true);
        }
      } catch {
        if (active) setOnline(false);
      }
    };
    load();
    const timer = window.setInterval(load, 6000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0F172A] text-slate-100">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(16,185,129,0.20),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(59,130,246,0.22),transparent_30%),linear-gradient(145deg,#0F172A_0%,#10243D_52%,#07111F_100%)]" />
      <div className="relative mx-auto flex max-w-[1480px] flex-col gap-5 px-5 py-5 lg:px-8">
        <Header online={online} generatedAt={data.generatedAt} />
        <KpiGrid data={data} />
        <section className="grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
          <GlassPanel title="Global Temperature Heatmap" icon={<CloudSun size={18} />} accent="blue">
            <Heatmap points={data.heatmap.length ? data.heatmap : syntheticHeat()} />
          </GlassPanel>
          <GlassPanel title="Autoscaling Control Plane" icon={<ServerCog size={18} />} accent="green">
            <Autoscaling data={data} />
          </GlassPanel>
        </section>
        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <GlassPanel title="Carbon Emission Trajectory" icon={<Activity size={18} />} accent="orange">
            <EmissionChart series={data.emissions} />
          </GlassPanel>
          <GlassPanel title="Real-time System Logs" icon={<TerminalSquare size={18} />} accent="blue">
            <LogTerminal logs={data.logs.length ? data.logs : fallbackLogs()} />
          </GlassPanel>
        </section>
        <ScenarioMatrix scenarios={data.scenarios.length ? data.scenarios : fallbackScenarios()} />
      </div>
    </main>
  );
}

function Header({ online, generatedAt }: { online: boolean; generatedAt: string }) {
  return (
    <header className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.07] px-5 py-4 shadow-2xl shadow-black/30 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/30">
          <Leaf size={25} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-white md:text-3xl">CLIMATE-AI</h1>
          <p className="text-sm text-slate-300">Climate prediction and infrastructure observability control tower</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <StatusPill label={online ? "API online" : "Fallback mode"} tone={online ? "green" : "orange"} />
        <StatusPill label="Port 9072 isolated" tone="blue" />
        <StatusPill label={new Date(generatedAt).toLocaleTimeString("ko-KR")} tone="slate" />
      </div>
    </header>
  );
}

function KpiGrid({ data }: { data: DashboardSnapshot }) {
  const cards = [
    ["Temp anomaly", `+${data.summary.globalTemperatureAnomaly.toFixed(2)}C`, "vs pre-industrial baseline", "green"],
    ["Ocean heat", `${data.summary.oceanHeatIndex.toFixed(1)} ZJ`, "upper ocean index", "blue"],
    ["Carbon density", `${data.summary.carbonPpm.toFixed(1)} ppm`, "global atmospheric CO2", "orange"],
    ["Drift score", data.summary.driftScore.toFixed(2), "alert sink disabled", "red"]
  ];
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, detail, tone]) => (
        <div key={label} className="rounded-lg border border-white/10 bg-white/[0.075] p-5 shadow-xl shadow-black/25 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">{label}</span>
            <span className={`h-2.5 w-2.5 rounded-full ${toneClass(tone)}`} />
          </div>
          <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
          <div className="mt-2 text-sm text-slate-400">{detail}</div>
        </div>
      ))}
    </section>
  );
}

function GlassPanel({ title, icon, accent, children }: { title: string; icon: React.ReactNode; accent: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <span className={`grid h-8 w-8 place-items-center rounded-md ${accentBg(accent)}`}>{icon}</span>
          {title}
        </div>
        <span className="text-xs uppercase text-slate-400">live</span>
      </div>
      {children}
    </section>
  );
}

function Heatmap({ points }: { points: HeatPoint[] }) {
  return (
    <div className="relative h-[360px] overflow-hidden rounded-lg border border-white/10 bg-[#06111f]/70">
      <svg viewBox="0 0 900 430" className="h-full w-full">
        <defs>
          <linearGradient id="ocean" x1="0" x2="1">
            <stop stopColor="#0b1b31" />
            <stop offset="1" stopColor="#123B5F" />
          </linearGradient>
        </defs>
        <rect width="900" height="430" fill="url(#ocean)" />
        {[-60, -30, 0, 30, 60].map((lat) => <line key={lat} x1="0" x2="900" y1={mapLat(lat)} y2={mapLat(lat)} stroke="rgba(255,255,255,.08)" />)}
        {[-120, -60, 0, 60, 120].map((lon) => <line key={lon} y1="0" y2="430" x1={mapLon(lon)} x2={mapLon(lon)} stroke="rgba(255,255,255,.08)" />)}
        <path d="M122 170 C180 128 250 155 298 128 C352 100 396 128 430 165 C470 205 545 196 595 174 C650 150 720 166 778 210 L744 260 C670 242 590 280 522 250 C456 222 405 250 340 218 C272 185 210 230 132 220 Z" fill="rgba(148,163,184,.18)" />
        {points.map((p, index) => (
          <circle
            key={`${p.lat}-${p.lon}-${index}`}
            cx={mapLon(p.lon)}
            cy={mapLat(p.lat)}
            r={Math.max(7, p.anomaly * 6)}
            fill={riskColor(p.risk)}
            opacity="0.78"
          />
        ))}
      </svg>
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 backdrop-blur">
        <span>anomaly intensity</span>
        <span className="h-2 w-32 rounded-full bg-gradient-to-r from-emerald-400 via-blue-400 to-amber-400" />
        <span>critical clusters</span>
      </div>
    </div>
  );
}

function EmissionChart({ series }: { series: EmissionSeries[] }) {
  const colors: Record<string, string> = { Power: "#10B981", Transport: "#3B82F6", Industry: "#F59E0B" };
  const values = series.flatMap((s) => s.points.map((p) => p.value));
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  return (
    <div className="h-[310px] rounded-lg border border-white/10 bg-slate-950/45 p-4">
      <svg viewBox="0 0 760 270" className="h-full w-full">
        {[0, 1, 2, 3].map((i) => <line key={i} x1="44" x2="740" y1={35 + i * 56} y2={35 + i * 56} stroke="rgba(255,255,255,.08)" />)}
        {series.map((item) => (
          <g key={item.sector}>
            <path d={linePath(item.points.map((p, i) => [62 + i * 82, scaleY(p.value, min, max)]))} fill="none" stroke={colors[item.sector]} strokeWidth="4" strokeLinecap="round" />
            {item.points.map((p, i) => <circle key={p.month} cx={62 + i * 82} cy={scaleY(p.value, min, max)} r="4" fill={colors[item.sector]} />)}
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap gap-3 text-xs text-slate-300">
        {series.map((item) => <span key={item.sector} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[item.sector] }} />{item.sector}</span>)}
      </div>
    </div>
  );
}

function Autoscaling({ data }: { data: DashboardSnapshot }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Metric label="desired" value={data.autoscaling.desiredReplicas} />
        <Metric label="actual" value={data.autoscaling.actualReplicas} />
        <Metric label="pending" value={data.autoscaling.pendingReplicas} />
      </div>
      <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
        <div className="mb-2 flex items-center gap-2 font-medium"><AlertTriangle size={17} /> Scale control degraded</div>
        <p className="text-amber-100/80">Traffic is rising faster than replica activation. Command failure flag is {String(data.autoscaling.commandFailure)}.</p>
      </div>
      <div className="space-y-3">
        {data.nodes.map((node) => <NodeRow key={node.id} node={node} />)}
      </div>
    </div>
  );
}

function NodeRow({ node }: { node: NodeStatus }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/45 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-white">{node.id}</div>
          <div className="truncate text-xs text-slate-400">{node.region} · {node.status}</div>
        </div>
        <RadioTower size={17} className={node.status === "serving" ? "text-emerald-300" : "text-amber-300"} />
      </div>
      <Bar label="CPU" value={node.cpu} />
      <Bar label="Queue" value={Math.round(node.queueDepth * 100)} tone="orange" />
    </div>
  );
}

function LogTerminal({ logs }: { logs: SystemLog[] }) {
  return (
    <div className="h-[310px] overflow-hidden rounded-lg border border-white/10 bg-[#020617] p-4 font-mono text-xs text-slate-300 shadow-inner">
      {logs.map((log, index) => (
        <div key={`${log.time}-${index}`} className="mb-3 grid grid-cols-[82px_58px_110px_1fr] gap-2">
          <span className="text-slate-500">{log.time}</span>
          <span className={log.level === "ERROR" ? "text-orange-300" : log.level === "WARN" ? "text-amber-300" : "text-blue-300"}>{log.level}</span>
          <span className="truncate text-emerald-300">{log.source}</span>
          <span className={log.forwarded ? "text-slate-300" : "text-red-300"}>{log.message}</span>
        </div>
      ))}
    </div>
  );
}

function ScenarioMatrix({ scenarios }: { scenarios: RegressionScenario[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white"><DatabaseZap size={18} className="text-emerald-300" /> Regression Scenario Matrix</div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {scenarios.map((scenario) => (
          <article key={scenario.id} className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white">{scenario.id}. {scenario.name}</h2>
              <span className="rounded bg-emerald-400/10 px-2 py-1 text-[11px] text-emerald-200">{scenario.status}</span>
            </div>
            <p className="text-xs text-blue-200">{scenario.signal}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{scenario.trainingObjective}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border border-white/10 bg-slate-950/45 p-3"><div className="text-xs text-slate-400">{label}</div><div className="text-2xl font-semibold text-white">{value}</div></div>;
}

function Bar({ label, value, tone = "green" }: { label: string; value: number; tone?: string }) {
  return <div className="mt-2"><div className="mb-1 flex justify-between text-[11px] text-slate-400"><span>{label}</span><span>{value}%</span></div><div className="h-2 rounded bg-white/10"><div className={`h-2 rounded ${tone === "orange" ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${Math.min(value, 100)}%` }} /></div></div>;
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  return <span className={`rounded-md border px-3 py-2 ${toneBorder(tone)}`}>{label}</span>;
}

const mapLon = (lon: number) => ((lon + 180) / 360) * 900;
const mapLat = (lat: number) => ((90 - lat) / 180) * 430;
const scaleY = (value: number, min: number, max: number) => 230 - ((value - min) / (max - min)) * 190;
const linePath = (points: number[][]) => points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
const riskColor = (risk: string) => risk === "critical" ? "#F59E0B" : risk === "elevated" ? "#3B82F6" : "#10B981";
const toneClass = (tone: string) => tone === "green" ? "bg-emerald-400" : tone === "blue" ? "bg-blue-400" : tone === "orange" ? "bg-amber-400" : "bg-red-400";
const accentBg = (accent: string) => accent === "green" ? "bg-emerald-400/15 text-emerald-300" : accent === "orange" ? "bg-amber-400/15 text-amber-300" : "bg-blue-400/15 text-blue-300";
const toneBorder = (tone: string) => tone === "green" ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : tone === "blue" ? "border-blue-300/30 bg-blue-300/10 text-blue-100" : tone === "orange" ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : "border-white/10 bg-white/5 text-slate-200";

function syntheticHeat(): HeatPoint[] {
  const points: HeatPoint[] = [];
  for (let lat = -60; lat <= 75; lat += 15) {
    for (let lon = -150; lon <= 180; lon += 30) {
      const anomaly = 1.1 + Math.abs(lat) / 100 + ((lon + 180) % 90) / 120;
      points.push({ lat, lon, anomaly, risk: anomaly > 2.1 ? "critical" : anomaly > 1.6 ? "elevated" : "watch" });
    }
  }
  return points;
}

function fallbackLogs(): SystemLog[] {
  return [
    { time: "12:00:04 UTC", level: "WARN", source: "drift-monitor", message: "Model drift alert sink disabled", forwarded: false },
    { time: "12:00:09 UTC", level: "ERROR", source: "autoscaler", message: "Scale command rejected at resource threshold", forwarded: true },
    { time: "12:00:14 UTC", level: "WARN", source: "traffic-gateway", message: "Abnormal surge window opened", forwarded: true }
  ];
}

function fallbackScenarios(): RegressionScenario[] {
  return Array.from({ length: 11 }, (_, index) => ({
    id: index + 1,
    name: "Regression scenario pending API sync",
    status: "fallback",
    signal: "local_fallback",
    trainingObjective: "Backend API data will replace this placeholder when /api/dashboard is reachable."
  }));
}

createRoot(document.getElementById("root")!).render(<App />);

