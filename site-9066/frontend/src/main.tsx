import React from 'react';
import ReactDOM from 'react-dom/client';
import { Activity, AlertTriangle, Cpu, DatabaseZap, Network, ShieldCheck, Video } from 'lucide-react';
import './styles.css';

type SystemStatus = {
  baseUrl: string;
  engineVersion: string;
  renderMode: string;
  securityPolicy: string;
  serverTime: string;
};

type ParticipantMetric = {
  id: string;
  name: string;
  audioLatencyMs: number;
  videoLatencyMs: number;
  packetLossPermille: number;
  streamState: string;
};

type TelemetryFrame = {
  tick: number;
  participants: ParticipantMetric[];
  vram: {
    totalGb: number;
    usedGb: number;
    fragmentedGb: number;
    zombieGb: number;
    utilizationPercent: number;
  };
  pointCloudDensity: number;
  npuCompilerDriftPercent: number;
  blockedPatchJobs: number;
};

type FaultScenario = {
  id: number;
  title: string;
  subsystem: string;
  trigger: string;
  ppoSignal: string;
  expectedMitigation: string;
  severity: string;
  active: boolean;
};

type TerminalLog = {
  at: string;
  level: string;
  source: string;
  message: string;
};

const emptyTelemetry: TelemetryFrame = {
  tick: 0,
  participants: [],
  vram: { totalGb: 16, usedGb: 0, fragmentedGb: 0, zombieGb: 0, utilizationPercent: 0 },
  pointCloudDensity: 0,
  npuCompilerDriftPercent: 0,
  blockedPatchJobs: 0
};

function useHoloData() {
  const [status, setStatus] = React.useState<SystemStatus | null>(null);
  const [telemetry, setTelemetry] = React.useState<TelemetryFrame>(emptyTelemetry);
  const [scenarios, setScenarios] = React.useState<FaultScenario[]>([]);
  const [logs, setLogs] = React.useState<TerminalLog[]>([]);
  const [online, setOnline] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const loadStatic = async () => {
      const [statusRes, scenariosRes] = await Promise.all([fetch('/api/status'), fetch('/api/scenarios')]);
      if (!active) return;
      setStatus(await statusRes.json());
      setScenarios(await scenariosRes.json());
    };
    const loadDynamic = async () => {
      try {
        const [telemetryRes, logsRes] = await Promise.all([fetch('/api/telemetry'), fetch('/api/logs')]);
        if (!active) return;
        setTelemetry(await telemetryRes.json());
        setLogs(await logsRes.json());
        setOnline(true);
      } catch {
        if (active) setOnline(false);
      }
    };
    loadStatic().catch(() => setOnline(false));
    loadDynamic();
    const timer = window.setInterval(loadDynamic, 1500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return { status, telemetry, scenarios, logs, online };
}

function PointCloud({ density, tick }: { density: number; tick: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth * dpr;
    const height = canvas.clientHeight * dpr;
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#020617';
    context.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const count = Math.max(120, Math.min(320, Math.floor(density / 420)));
    for (let i = 0; i < count; i += 1) {
      const orbit = (i / count) * Math.PI * 2;
      const layer = (i % 9) / 9;
      const pulse = Math.sin(tick / 8 + i * 0.13);
      const radius = (90 + layer * 180 + pulse * 18) * dpr;
      const x = centerX + Math.cos(orbit + tick / 28) * radius * (0.72 + layer * 0.28);
      const y = centerY + Math.sin(orbit * 1.7 - tick / 32) * radius * 0.52;
      const size = (1.1 + layer * 2.4 + Math.abs(pulse)) * dpr;
      const hue = i % 5 === 0 ? '#D946EF' : i % 3 === 0 ? '#F8FAFC' : '#22D3EE';
      context.beginPath();
      context.shadowBlur = 18 * dpr;
      context.shadowColor = hue;
      context.fillStyle = hue;
      context.globalAlpha = 0.45 + layer * 0.5;
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
    context.shadowBlur = 0;
    const gradient = context.createRadialGradient(centerX, centerY, 10, centerX, centerY, Math.min(width, height) / 1.6);
    gradient.addColorStop(0, 'rgba(34, 211, 238, 0.18)');
    gradient.addColorStop(0.54, 'rgba(217, 70, 239, 0.08)');
    gradient.addColorStop(1, 'rgba(2, 6, 23, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }, [density, tick]);

  return <canvas ref={canvasRef} className="point-cloud" aria-label="3D point cloud hologram simulation" />;
}

function VramGauge({ telemetry }: { telemetry: TelemetryFrame }) {
  const percent = telemetry.vram.utilizationPercent;
  return (
    <section className="panel gauge-panel">
      <div className="panel-title">
        <Cpu size={18} />
        <span>VRAM OCCUPANCY</span>
      </div>
      <div className="gauge" style={{ '--gauge': `${percent * 3.6}deg` } as React.CSSProperties}>
        <div>
          <strong>{percent}%</strong>
          <span>{telemetry.vram.usedGb.toFixed(1)}GB / {telemetry.vram.totalGb}GB</span>
        </div>
      </div>
      <div className="metric-grid">
        <span>Fragmented <b>{telemetry.vram.fragmentedGb.toFixed(1)}GB</b></span>
        <span>Zombie <b>{telemetry.vram.zombieGb.toFixed(1)}GB</b></span>
        <span>NPU Drift <b>{telemetry.npuCompilerDriftPercent}%</b></span>
        <span>Blocked Jobs <b>{telemetry.blockedPatchJobs}</b></span>
      </div>
    </section>
  );
}

function LatencyGraph({ participants }: { participants: ParticipantMetric[] }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <Activity size={18} />
        <span>A/V LATENCY</span>
      </div>
      <div className="latency-list">
        {participants.map((participant) => (
          <div className="latency-row" key={participant.id}>
            <div>
              <strong>{participant.name}</strong>
              <span>{participant.streamState} / loss {(participant.packetLossPermille / 10).toFixed(1)}%</span>
            </div>
            <div className="bars">
              <i style={{ width: `${Math.min(100, participant.audioLatencyMs)}%` }} />
              <b style={{ width: `${Math.min(100, participant.videoLatencyMs)}%` }} />
            </div>
            <em>{participant.videoLatencyMs}ms</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScenarioMatrix({ scenarios }: { scenarios: FaultScenario[] }) {
  return (
    <section className="panel scenario-panel">
      <div className="panel-title">
        <AlertTriangle size={18} />
        <span>REGRESSION FAULT MATRIX</span>
      </div>
      <div className="scenario-grid">
        {scenarios.map((scenario) => (
          <article className={`scenario severity-${scenario.severity.toLowerCase()}`} key={scenario.id}>
            <header>
              <span>{String(scenario.id).padStart(2, '0')}</span>
              <b>{scenario.severity}</b>
            </header>
            <h3>{scenario.title}</h3>
            <p>{scenario.trigger}</p>
            <footer>{scenario.subsystem} / {scenario.ppoSignal}</footer>
          </article>
        ))}
      </div>
    </section>
  );
}

function Terminal({ logs }: { logs: TerminalLog[] }) {
  return (
    <section className="panel terminal-panel">
      <div className="panel-title">
        <DatabaseZap size={18} />
        <span>UPDATE LOG TERMINAL</span>
      </div>
      <div className="terminal">
        {logs.map((log, index) => (
          <div key={`${log.at}-${index}`} className={`log log-${log.level.toLowerCase()}`}>
            <time>{new Date(log.at).toLocaleTimeString('ko-KR', { hour12: false })}</time>
            <span>{log.level}</span>
            <b>{log.source}</b>
            <p>{log.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  const { status, telemetry, scenarios, logs, online } = useHoloData();

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Video size={28} />
          <div>
            <h1>HOLO-COMM</h1>
            <p>3D Hologram Conference Control Server</p>
          </div>
        </div>
        <div className="status-strip">
          <span className={online ? 'online' : 'offline'}>{online ? 'LINK STABLE' : 'API OFFLINE'}</span>
          <span><Network size={14} /> http://localhost:9066</span>
          <span><ShieldCheck size={14} /> /api proxy isolated</span>
        </div>
      </header>

      <section className="hero-grid">
        <div className="hologram-stage">
          <PointCloud density={telemetry.pointCloudDensity} tick={telemetry.tick} />
          <div className="stage-overlay">
            <span>POINTS {telemetry.pointCloudDensity.toLocaleString('ko-KR')}</span>
            <strong>{status?.engineVersion ?? 'holo-renderer-3.7.9066'}</strong>
            <small>{status?.securityPolicy ?? 'cors:/api@localhost:9066'}</small>
          </div>
        </div>
        <VramGauge telemetry={telemetry} />
        <LatencyGraph participants={telemetry.participants} />
      </section>

      <section className="lower-grid">
        <ScenarioMatrix scenarios={scenarios} />
        <Terminal logs={logs} />
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
