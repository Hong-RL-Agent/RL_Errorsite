import React from 'react';
import ReactDOM from 'react-dom/client';
import { Activity, Cpu, DatabaseZap, RadioTower, ShieldAlert, Zap } from 'lucide-react';
import './styles.css';

type GridZone = {
  id: string;
  name: string;
  load: number;
  capacity: number;
  status: 'stable' | 'watch' | 'overload';
  wave: number[];
};

type WorkerState = {
  id: string;
  lane: string;
  state: string;
  queueDepth: number;
  lastMessageId: number;
  risk: string;
};

type Snapshot = {
  timestamp: string;
  totalMegawatts: number;
  stabilityIndex: number;
  npuLoad: number;
  zones: GridZone[];
  workers: WorkerState[];
};

type Scenario = {
  id: number;
  title: string;
  layer: string;
  trigger: string;
  expectedFailure: string;
  detector: string;
  severity: string;
};

const statusColor = {
  stable: '#22C55E',
  watch: '#FACC15',
  overload: '#EF4444',
};

function useSmartGrid() {
  const [snapshot, setSnapshot] = React.useState<Snapshot | null>(null);
  const [scenarios, setScenarios] = React.useState<Scenario[]>([]);
  const [workerPulse, setWorkerPulse] = React.useState({ frame: 0, queueSkew: 0, tokenState: 'SYNCED' });

  React.useEffect(() => {
    const worker = new Worker(new URL('./workers/gridWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<typeof workerPulse>) => setWorkerPulse(event.data);
    const timer = window.setInterval(() => worker.postMessage({ type: 'tick', issuedAt: Date.now() }), 850);
    return () => {
      window.clearInterval(timer);
      worker.terminate();
    };
  }, []);

  React.useEffect(() => {
    let live = true;
    async function load() {
      const [snapshotRes, scenariosRes] = await Promise.all([
        fetch('/api/grid/snapshot'),
        fetch('/api/grid/regressions'),
      ]);
      if (!live) return;
      setSnapshot(await snapshotRes.json());
      setScenarios(await scenariosRes.json());
    }
    load();
    const timer = window.setInterval(load, 2000);
    return () => {
      live = false;
      window.clearInterval(timer);
    };
  }, []);

  return { snapshot, scenarios, workerPulse };
}

function GridMap({ zones }: { zones: GridZone[] }) {
  const points = [
    [110, 100],
    [340, 80],
    [560, 190],
    [230, 320],
  ];
  return (
    <svg className="grid-map" viewBox="0 0 680 410" role="img" aria-label="실시간 전력망 그리드 맵">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path className="grid-line grid-line-yellow" d="M110 100 L340 80 L560 190 L230 320 Z" />
      <path className="grid-line grid-line-green" d="M110 100 L230 320 M340 80 L230 320 M340 80 L560 190" />
      {zones.map((zone, index) => {
        const [x, y] = points[index];
        return (
          <g key={zone.id} filter="url(#glow)">
            <circle cx={x} cy={y} r="36" fill="#020617" stroke={statusColor[zone.status]} strokeWidth="4" />
            <circle className="node-pulse" cx={x} cy={y} r="47" stroke={statusColor[zone.status]} />
            <text x={x} y={y - 4} textAnchor="middle" className="node-id">{zone.id}</text>
            <text x={x} y={y + 17} textAnchor="middle" className="node-load">{Math.round(zone.load)}MW</text>
          </g>
        );
      })}
    </svg>
  );
}

function WaveGraph({ zone }: { zone: GridZone }) {
  const max = Math.max(...zone.wave, zone.capacity);
  const points = zone.wave.map((value, index) => {
    const x = (index / (zone.wave.length - 1)) * 220;
    const y = 70 - (value / max) * 64;
    return `${x},${y}`;
  }).join(' ');
  const ratio = Math.round((zone.load / zone.capacity) * 100);
  return (
    <div className="zone-card">
      <div className="zone-head">
        <span>{zone.name}</span>
        <strong style={{ color: statusColor[zone.status] }}>{ratio}%</strong>
      </div>
      <svg viewBox="0 0 220 78" className="wave">
        <polyline points={points} fill="none" stroke={statusColor[zone.status]} strokeWidth="3" />
      </svg>
    </div>
  );
}

function NpuGauge({ value }: { value: number }) {
  const angle = (value / 100) * 270;
  return (
    <div className="npu-gauge">
      <Cpu size={34} />
      <div className="gauge-ring" style={{ background: `conic-gradient(#FACC15 ${angle}deg, #162033 ${angle}deg)` }}>
        <div>{Math.round(value)}%</div>
      </div>
      <span>NPU accelerator load</span>
    </div>
  );
}

function App() {
  const { snapshot, scenarios, workerPulse } = useSmartGrid();
  const zones = snapshot?.zones ?? [];

  return (
    <main className="app-shell">
      <section className="command-header">
        <div>
          <p>SMART-GRID / PORT 9067</p>
          <h1>Energy Command Headquarters</h1>
        </div>
        <div className="header-metrics">
          <Metric icon={<Zap />} label="Total Flow" value={`${snapshot?.totalMegawatts ?? '--'} MW`} />
          <Metric icon={<Activity />} label="Stability" value={`${snapshot?.stabilityIndex ?? '--'}%`} />
          <Metric icon={<RadioTower />} label="Worker Frame" value={`${workerPulse.frame}`} />
        </div>
      </section>

      <section className="operations-grid">
        <div className="map-panel">
          <div className="panel-title"><DatabaseZap size={18} /> Real-time grid map</div>
          <GridMap zones={zones} />
        </div>
        <div className="side-panel">
          <NpuGauge value={snapshot?.npuLoad ?? 0} />
          <div className="worker-panel">
            <div className="panel-title"><ShieldAlert size={18} /> Web worker monitor</div>
            {(snapshot?.workers ?? []).map((worker) => (
              <div className="worker-row" key={worker.id}>
                <span>{worker.id}</span>
                <b>{worker.state}</b>
                <small>{worker.risk} / q:{worker.queueDepth} / msg:{worker.lastMessageId}</small>
              </div>
            ))}
            <div className="worker-row synthetic">
              <span>BF-CACHE-TOKEN</span>
              <b>{workerPulse.tokenState}</b>
              <small>queue skew {workerPulse.queueSkew}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="lower-grid">
        <div className="wave-panel">
          <div className="panel-title"><Activity size={18} /> Zone load waves</div>
          <div className="zone-grid">
            {zones.map((zone) => <WaveGraph key={zone.id} zone={zone} />)}
          </div>
        </div>
        <div className="scenario-panel">
          <div className="panel-title"><ShieldAlert size={18} /> Regression fault scenarios</div>
          {scenarios.map((scenario) => (
            <article key={scenario.id} className={`scenario ${scenario.severity}`}>
              <span>{String(scenario.id).padStart(2, '0')}</span>
              <div>
                <b>{scenario.title}</b>
                <small>{scenario.layer} / {scenario.detector}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
