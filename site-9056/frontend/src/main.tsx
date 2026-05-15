import React from 'react';
import ReactDOM from 'react-dom/client';
import { Activity, Cpu, Database, Gauge, HardDrive, Radar, Server, Thermometer, Zap } from 'lucide-react';
import './style.css';

type FaultMetric = {
  id: string;
  name: string;
  subsystem: string;
  severity: number;
  latencyMs: number;
  status: string;
  evidence: string;
};

type CoreStatus = {
  timestamp: string;
  depthMeters: number;
  pressureBar: number;
  oxygenPercent: number;
  powerPercent: number;
  cpuTemperatureC: number;
  cpuClockGhz: number;
  stealTimePercent: number;
  pcieThroughputGbps: number;
  sonarIntegrity: number;
  depthSeries: number[];
  pressureSeries: number[];
  terrainGrid: number[];
  faults: FaultMetric[];
  eventLog: string[];
};

const fallback: CoreStatus = {
  timestamp: new Date().toISOString(),
  depthMeters: 6002.4,
  pressureBar: 605.1,
  oxygenPercent: 82.4,
  powerPercent: 74.6,
  cpuTemperatureC: 87.1,
  cpuClockGhz: 2.1,
  stealTimePercent: 24.7,
  pcieThroughputGbps: 11.8,
  sonarIntegrity: 71.3,
  depthSeries: Array.from({ length: 72 }, (_, i) => 6000 + Math.sin(i / 4) * 18),
  pressureSeries: Array.from({ length: 72 }, (_, i) => 604 + Math.cos(i / 5) * 4),
  terrainGrid: Array.from({ length: 144 }, (_, i) => 30 + ((i * 17) % 70)),
  faults: [
    ['vm-pause-loop', 'Virtual PAUSE loop exit', 'hypervisor', 0.71, 8.4, 'HV_EXIT', 'spinlock wait yielded to hypervisor'],
    ['disk-queue-saturation', 'NCQ/TCQ queue saturation', 'storage', 0.82, 31.0, 'QUEUE_FULL', 'disk command queue depth saturated'],
    ['tsx-transaction-abort', 'TSX transaction abort rollback', 'cpu', 0.75, 15.1, 'RTM_ABORT', 'integrity transactions rolled back'],
    ['split-lock', 'Split lock bus serialization', 'cpu', 0.62, 12.0, 'BUS_LOCK', 'misaligned sensor word crossed cache line'],
    ['dirty-throttle', 'Kernel dirty page throttling', 'kernel', 0.79, 33.2, 'WRITEBACK_THROTTLED', 'video writeback throttled'],
    ['vm-steal-time', 'Virtualization steal time surge', 'hypervisor', 0.68, 22.4, 'HOST_CONTENTION', 'co-tenant VM consumed host CPU credits'],
    ['vram-fragmentation', 'GPU VRAM buddy allocator failure', 'gpu', 0.88, 41.8, 'ALLOC_RETRY', 'fragmented sonar image heap'],
    ['watchdog-starvation', 'Realtime priority starvation watchdog', 'scheduler', 0.66, 14.4, 'WATCHDOG_PREBOOT', 'heartbeat deadlines missed'],
    ['pcie-lane-contention', 'PCIe lane split bandwidth contention', 'interconnect', 0.73, 23.6, 'DMA_BACKPRESSURE', 'GPU and NVMe recorder sharing uplink'],
    ['thermal-throttle', 'CPU thermal throttling', 'cooling', 0.84, 26.1, 'PROCHOT_ASSERTED', 'coolant loop delta-T exceeded limit'],
    ['cfs-quota-throttle', 'Container CFS quota throttling', 'container', 0.9, 27.2, 'CFS_THROTTLED', 'container exceeded CPU quota window'],
  ].map(([id, name, subsystem, severity, latencyMs, status, evidence]) => ({
    id: String(id),
    name: String(name),
    subsystem: String(subsystem),
    severity: Number(severity),
    latencyMs: Number(latencyMs),
    status: String(status),
    evidence: String(evidence),
  })),
  eventLog: ['OFFLINE CACHE | backend telemetry link initializing'],
};

function useCoreStatus() {
  const [status, setStatus] = React.useState<CoreStatus>(fallback);

  React.useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const response = await fetch('/api/core/status');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = (await response.json()) as CoreStatus;
        if (live) setStatus(payload);
      } catch {
        if (live) setStatus((previous) => ({ ...fallback, timestamp: previous.timestamp }));
      }
    };
    load();
    const timer = window.setInterval(load, 1200);
    return () => {
      live = false;
      window.clearInterval(timer);
    };
  }, []);

  return status;
}

function App() {
  const status = useCoreStatus();
  const topFault = [...status.faults].sort((a, b) => b.severity - a.severity)[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="abyss-grid" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-[1640px] flex-col gap-4 px-4 py-4 lg:px-6">
        <Header status={status} />
        <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr_0.95fr]">
          <section className="flex flex-col gap-4">
            <MetricStrip status={status} />
            <SonarPanel integrity={status.sonarIntegrity} />
            <ChartPanel title="수심 / 수압 실시간 추적" depth={status.depthSeries} pressure={status.pressureSeries} />
          </section>
          <section className="flex flex-col gap-4">
            <TerrainGrid cells={status.terrainGrid} />
            <SystemsPanel status={status} />
          </section>
          <section className="flex flex-col gap-4">
            <FaultPanel faults={status.faults} />
            <EventLog events={status.eventLog} topFault={topFault} />
          </section>
        </div>
      </section>
    </main>
  );
}

function Header({ status }: { status: CoreStatus }) {
  return (
    <header className="metal-panel flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Abyssal Command / Hadal Base 9056</p>
        <h1 className="mt-1 text-2xl font-black tracking-normal text-white md:text-4xl">DEEP-SEA CORE</h1>
      </div>
      <div className="grid grid-cols-2 gap-2 text-right text-xs sm:grid-cols-4">
        <Readout label="Depth" value={`${status.depthMeters.toFixed(1)}m`} />
        <Readout label="Pressure" value={`${status.pressureBar.toFixed(1)}bar`} />
        <Readout label="Clock" value={`${status.cpuClockGhz.toFixed(1)}GHz`} />
        <Readout label="UTC" value={new Date(status.timestamp).toISOString().slice(11, 19)} />
      </div>
    </header>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-cyan-300/25 bg-slate-950/70 px-3 py-2 shadow-[inset_0_0_18px_rgba(34,211,238,0.08)]">
      <div className="text-[10px] uppercase text-slate-500">{label}</div>
      <div className="font-mono text-sm font-bold text-cyan-200">{value}</div>
    </div>
  );
}

function MetricStrip({ status }: { status: CoreStatus }) {
  const metrics = [
    { icon: Gauge, label: 'O2 Reserve', value: status.oxygenPercent, suffix: '%', color: 'cyan' },
    { icon: Zap, label: 'Power Bus', value: status.powerPercent, suffix: '%', color: 'orange' },
    { icon: Thermometer, label: 'CPU Thermal', value: status.cpuTemperatureC, suffix: 'C', color: 'orange' },
    { icon: Server, label: 'Steal Time', value: status.stealTimePercent, suffix: '%', color: 'cyan' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((item) => (
        <div className="metal-panel p-3" key={item.label}>
          <div className="flex items-center justify-between">
            <item.icon className={item.color === 'cyan' ? 'text-cyan-300' : 'text-orange-400'} size={20} />
            <span className="font-mono text-lg font-black">{item.value.toFixed(1)}{item.suffix}</span>
          </div>
          <div className="mt-3 text-xs uppercase text-slate-400">{item.label}</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded bg-slate-800">
            <div className={item.color === 'cyan' ? 'h-full bg-cyan-300' : 'h-full bg-orange-500'} style={{ width: `${Math.min(100, item.value)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SonarPanel({ integrity }: { integrity: number }) {
  return (
    <div className="metal-panel relative min-h-[330px] overflow-hidden p-4">
      <div className="flex items-center justify-between">
        <PanelTitle icon={<Radar size={18} />} title="소나 스캔" />
        <span className="font-mono text-sm text-cyan-200">IMG {integrity.toFixed(1)}%</span>
      </div>
      <div className="sonar mx-auto mt-4 aspect-square max-h-[260px]">
        <div className="sonar-sweep" />
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} className="sonar-dot" style={{ '--x': `${10 + ((i * 37) % 80)}%`, '--y': `${14 + ((i * 53) % 72)}%` } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}

function ChartPanel({ title, depth, pressure }: { title: string; depth: number[]; pressure: number[] }) {
  const points = (series: number[], min: number, max: number) =>
    series.map((value, index) => `${(index / (series.length - 1)) * 100},${100 - ((value - min) / (max - min)) * 100}`).join(' ');
  return (
    <div className="metal-panel p-4">
      <PanelTitle icon={<Activity size={18} />} title={title} />
      <svg className="mt-4 h-44 w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGlow" x1="0" x2="1">
            <stop stopColor="#22D3EE" />
            <stop offset="1" stopColor="#F97316" />
          </linearGradient>
        </defs>
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1="0" x2="100" y1={i * 14} y2={i * 14} className="stroke-slate-700/40" strokeWidth="0.2" />)}
        <polyline points={points(depth, 5960, 6040)} fill="none" stroke="#22D3EE" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        <polyline points={points(pressure, 596, 614)} fill="none" stroke="#F97316" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

function TerrainGrid({ cells }: { cells: number[] }) {
  return (
    <div className="metal-panel p-4">
      <PanelTitle icon={<Database size={18} />} title="해저 지형 데이터 그리드" />
      <div className="mt-4 grid grid-cols-12 gap-1">
        {cells.map((cell, index) => (
          <div
            key={index}
            className="h-7 rounded-[2px] border border-cyan-300/10"
            style={{
              background: `linear-gradient(180deg, rgba(34,211,238,${0.08 + cell / 190}), rgba(249,115,22,${cell / 260}))`,
              boxShadow: cell > 82 ? '0 0 14px rgba(249,115,22,0.38)' : 'inset 0 0 10px rgba(34,211,238,0.08)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SystemsPanel({ status }: { status: CoreStatus }) {
  return (
    <div className="metal-panel p-4">
      <PanelTitle icon={<Cpu size={18} />} title="성능 모니터링" />
      <div className="mt-4 grid gap-3">
        <Bar label="PCIe Throughput" value={status.pcieThroughputGbps} max={28} suffix="Gbps" />
        <Bar label="CPU Clock" value={status.cpuClockGhz} max={4.2} suffix="GHz" />
        <Bar label="Steal Time" value={status.stealTimePercent} max={50} suffix="%" danger />
        <Bar label="Sonar Integrity" value={status.sonarIntegrity} max={100} suffix="%" />
      </div>
    </div>
  );
}

function FaultPanel({ faults }: { faults: FaultMetric[] }) {
  return (
    <div className="metal-panel min-h-[420px] p-4">
      <PanelTitle icon={<HardDrive size={18} />} title="결함 주입 매트릭스" />
      <div className="mt-4 space-y-2">
        {faults.map((fault) => (
          <div key={fault.id} className="rounded border border-slate-700/80 bg-slate-950/70 p-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-100">{fault.name}</div>
                <div className="mt-1 text-[11px] uppercase text-slate-500">{fault.subsystem} / {fault.status}</div>
              </div>
              <div className="font-mono text-sm text-orange-300">{Math.round(fault.severity * 100)}%</div>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded bg-slate-800">
              <div className="h-full bg-gradient-to-r from-cyan-300 to-orange-500" style={{ width: `${fault.severity * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventLog({ events, topFault }: { events: string[]; topFault?: FaultMetric }) {
  return (
    <div className="metal-panel flex-1 p-4">
      <PanelTitle icon={<Activity size={18} />} title="운영 이벤트 로그" />
      {topFault && (
        <div className="mt-4 rounded border border-orange-500/40 bg-orange-950/20 p-3 text-sm text-orange-100">
          PRIMARY ALERT: {topFault.status} / {topFault.evidence}
        </div>
      )}
      <div className="mt-4 space-y-2 font-mono text-xs text-slate-300">
        {events.map((event, index) => (
          <div key={`${event}-${index}`} className="border-l border-cyan-300/30 pl-3">{event}</div>
        ))}
      </div>
    </div>
  );
}

function Bar({ label, value, max, suffix, danger = false }: { label: string; value: number; max: number; suffix: string; danger?: boolean }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="uppercase text-slate-400">{label}</span>
        <span className={danger ? 'font-mono text-orange-300' : 'font-mono text-cyan-200'}>{value.toFixed(1)}{suffix}</span>
      </div>
      <div className="h-2 rounded bg-slate-800">
        <div className={danger ? 'h-full rounded bg-orange-500' : 'h-full rounded bg-cyan-300'} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}

function PanelTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-cyan-100">
      <span className="text-cyan-300">{icon}</span>
      <span>{title}</span>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
