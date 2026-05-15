import React from 'react';
import ReactDOM from 'react-dom/client';
import { Activity, AlertTriangle, BrainCircuit, Cpu, DatabaseZap, RadioTower, RefreshCcw, ShieldAlert, TerminalSquare } from 'lucide-react';
import './styles.css';

type EegChannel = {
  id: string;
  label: string;
  band: string;
  impedanceKohm: number;
  microvolts: number;
  waveform: number[];
};

type HardwareStatus = {
  component: string;
  status: string;
  version: string;
  latencyMs: number;
  loadPercent: number;
  detail: string;
};

type DefectScenario = {
  id: number;
  title: string;
  subsystem: string;
  severity: string;
  signal: string;
  failureMode: string;
  mitigation: string;
  confidence: number;
};

type LogEntry = {
  timestamp: string;
  level: string;
  source: string;
  message: string;
};

type NeuroSnapshot = {
  capturedAt: string;
  sessionId: string;
  cognitiveLoad: number;
  anomalyScore: number;
  eegChannels: EegChannel[];
  heatmap: number[][];
  hardware: HardwareStatus[];
  scenarios: DefectScenario[];
  logs: LogEntry[];
};

const fallbackSnapshot: NeuroSnapshot = {
  capturedAt: new Date().toISOString(),
  sessionId: 'NLINK-9065-OFFLINE',
  cognitiveLoad: 0,
  anomalyScore: 0,
  eegChannels: [],
  heatmap: Array.from({ length: 7 }, () => Array.from({ length: 9 }, () => 0.1)),
  hardware: [],
  scenarios: [],
  logs: [
    {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      source: 'frontend.proxy',
      message: 'Unable to reach /api/snapshot on http://localhost:9065'
    }
  ]
};

function useTelemetry() {
  const [snapshot, setSnapshot] = React.useState<NeuroSnapshot>(fallbackSnapshot);
  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch('/api/snapshot', {
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as NeuroSnapshot;
        if (active) {
          setSnapshot(data);
          setConnected(true);
        }
      } catch {
        if (active) {
          setSnapshot(fallbackSnapshot);
          setConnected(false);
        }
      }
    }

    void load();
    const timer = window.setInterval(load, 2500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return { snapshot, connected };
}

function Waveform({ channel, color }: { channel: EegChannel; color: string }) {
  const width = 360;
  const height = 72;
  const points = channel.waveform.length > 0 ? channel.waveform : [0];
  const max = Math.max(...points.map((value) => Math.abs(value)), 1);
  const path = points
    .map((value, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height / 2 - (value / max) * (height * 0.42);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <div className="wave-row">
      <div className="wave-meta">
        <strong>{channel.label}</strong>
        <span>{channel.band.toUpperCase()}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${channel.label} waveform`}>
        <path className="wave-grid" d={`M 0 ${height / 2} L ${width} ${height / 2}`} />
        <path d={path} stroke={color} />
      </svg>
      <div className="wave-value">{channel.microvolts.toFixed(1)} uV</div>
    </div>
  );
}

function BrainHeatmap({ heatmap }: { heatmap: number[][] }) {
  return (
    <svg className="brain-map" viewBox="0 0 360 300" role="img" aria-label="Brain activation heatmap">
      <defs>
        <radialGradient id="brain-shell" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </radialGradient>
      </defs>
      <path
        d="M180 28 C112 28 66 78 62 146 C58 222 111 272 180 272 C249 272 302 222 298 146 C294 78 248 28 180 28 Z"
        fill="url(#brain-shell)"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <path d="M180 34 C166 78 168 114 180 146 C193 184 193 224 180 266" fill="none" stroke="#334155" strokeWidth="2" />
      {heatmap.flatMap((row, y) =>
        row.map((value, x) => {
          const cx = 76 + x * 26;
          const cy = 68 + y * 28;
          const intensity = Math.min(1, Math.max(0, value));
          const fill = intensity > 0.72 ? '#D946EF' : intensity > 0.48 ? '#3B82F6' : '#4ADE80';
          return <circle key={`${x}-${y}`} cx={cx} cy={cy} r={8 + intensity * 9} fill={fill} opacity={0.18 + intensity * 0.52} />;
        })
      )}
      <path
        d="M109 91 C145 72 214 72 250 91 M94 145 C137 125 222 125 266 145 M115 205 C151 220 211 220 245 205"
        fill="none"
        stroke="#64748B"
        strokeWidth="1.2"
        opacity="0.75"
      />
    </svg>
  );
}

function StatusPill({ status }: { status: string }) {
  const danger = ['critical', 'blocked', 'mismatch', 'unstable'].includes(status);
  const degraded = ['high', 'degraded'].includes(status);
  return <span className={danger ? 'pill danger' : degraded ? 'pill warning' : 'pill'}>{status}</span>;
}

function App() {
  const { snapshot, connected } = useTelemetry();
  const colors = ['#4ADE80', '#3B82F6', '#D946EF', '#22D3EE'];

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <div className="eyebrow"><RadioTower size={16} /> PORT 9065 ISOLATED CONTROL PLANE</div>
          <h1>NEURO-LINK</h1>
          <p>실시간 뇌파 분석 및 하드웨어 배포 결함 관제</p>
        </div>
        <div className={connected ? 'connection online' : 'connection offline'}>
          <Activity size={18} />
          <span>{connected ? 'API LINKED' : 'API OFFLINE'}</span>
          <strong>{snapshot.sessionId}</strong>
        </div>
      </section>

      <section className="metrics">
        <div className="metric">
          <BrainCircuit />
          <span>Cognitive Load</span>
          <strong>{snapshot.cognitiveLoad.toFixed(1)}%</strong>
        </div>
        <div className="metric">
          <ShieldAlert />
          <span>Anomaly Score</span>
          <strong>{snapshot.anomalyScore.toFixed(2)}</strong>
        </div>
        <div className="metric">
          <Cpu />
          <span>HAL/NPU Faults</span>
          <strong>{snapshot.scenarios.length}</strong>
        </div>
        <div className="metric">
          <RefreshCcw />
          <span>Last Capture</span>
          <strong>{new Date(snapshot.capturedAt).toLocaleTimeString('ko-KR')}</strong>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel waveform-panel">
          <div className="panel-title">
            <h2>EEG Waveform</h2>
            <span>8-channel live feed</span>
          </div>
          <div className="wave-list">
            {snapshot.eegChannels.map((channel, index) => (
              <Waveform key={channel.id} channel={channel} color={colors[index % colors.length]} />
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>Brain Activity</h2>
            <span>SVG heatmap</span>
          </div>
          <BrainHeatmap heatmap={snapshot.heatmap} />
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>NPU / HAL Status</h2>
            <span>runtime indicators</span>
          </div>
          <div className="hardware-list">
            {snapshot.hardware.map((item) => (
              <article className="hardware-item" key={item.component}>
                <div>
                  <h3>{item.component}</h3>
                  <p>{item.detail}</p>
                </div>
                <StatusPill status={item.status} />
                <div className="bar"><span style={{ width: `${Math.min(100, item.loadPercent)}%` }} /></div>
                <footer>
                  <span>{item.version}</span>
                  <strong>{item.latencyMs.toFixed(1)} ms</strong>
                </footer>
              </article>
            ))}
          </div>
        </div>

        <div className="panel scenario-panel">
          <div className="panel-title">
            <h2>Regression Scenarios</h2>
            <span>deployment anti-patterns</span>
          </div>
          <div className="scenario-list">
            {snapshot.scenarios.map((scenario) => (
              <article className="scenario" key={scenario.id}>
                <header>
                  <span>#{scenario.id.toString().padStart(2, '0')}</span>
                  <StatusPill status={scenario.severity} />
                </header>
                <h3>{scenario.title}</h3>
                <p>{scenario.failureMode}</p>
                <footer>
                  <code>{scenario.signal}</code>
                  <strong>{Math.round(scenario.confidence * 100)}%</strong>
                </footer>
              </article>
            ))}
          </div>
        </div>

        <div className="panel log-panel">
          <div className="panel-title">
            <h2>Update History</h2>
            <span>event log viewer</span>
          </div>
          <div className="logs">
            {snapshot.logs.map((log) => (
              <div className="log-line" key={`${log.timestamp}-${log.source}`}>
                {log.level === 'ERROR' ? <AlertTriangle size={16} /> : log.level === 'WARN' ? <DatabaseZap size={16} /> : <TerminalSquare size={16} />}
                <time>{new Date(log.timestamp).toLocaleTimeString('ko-KR')}</time>
                <strong>{log.source}</strong>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

