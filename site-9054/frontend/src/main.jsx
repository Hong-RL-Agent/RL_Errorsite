import React from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, Cpu, Gauge, GitBranch, HardDrive, RadioTower, Satellite, ShieldAlert, Zap } from 'lucide-react';
import './styles.css';

const API_URL = import.meta.env.VITE_AVCORE_API_URL || 'http://localhost:9055';

const fallbackTelemetry = {
  timestamp: new Date().toISOString(),
  speedKph: 78.6,
  steeringAngle: 4.2,
  batteryPercent: 72,
  cpuLoad: 0.67,
  gpuMemoryFragmentation: 0.48,
  packetLoss: 0.04,
  pathConfidence: 0.84,
  latencyMs: 54,
  clockFrozen: false,
  regressions: [],
  events: []
};

function useTelemetry() {
  const [data, setData] = React.useState(fallbackTelemetry);
  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/api/telemetry`, { cache: 'no-store' });
        const payload = await response.json();
        if (active) {
          setData(payload);
          setConnected(true);
        }
      } catch {
        if (active) {
          setConnected(false);
          setData((current) => ({
            ...current,
            timestamp: new Date().toISOString(),
            cpuLoad: Math.min(1, Math.max(0.25, current.cpuLoad + (Math.random() - 0.45) * 0.08)),
            latencyMs: Math.max(20, current.latencyMs + (Math.random() - 0.4) * 12)
          }));
        }
      }
    };
    load();
    const id = setInterval(load, 850);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return { data, connected };
}

function MetricCard({ icon: Icon, label, value, unit, tone = 'blue' }) {
  return (
    <section className="metric-card">
      <div className={`metric-icon ${tone}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="metric-label">{label}</p>
        <p className="metric-value">
          {value}
          <span>{unit}</span>
        </p>
      </div>
    </section>
  );
}

function GaugeDial({ label, value, danger }) {
  const percent = Math.max(0, Math.min(100, value));
  const stroke = danger ? '#EF4444' : '#3B82F6';
  return (
    <div className="gauge-panel">
      <svg viewBox="0 0 140 88" aria-label={label}>
        <path d="M18 74a52 52 0 0 1 104 0" fill="none" stroke="#1E293B" strokeWidth="12" strokeLinecap="round" />
        <path
          d="M18 74a52 52 0 0 1 104 0"
          fill="none"
          stroke={stroke}
          strokeWidth="12"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${percent} 100`}
        />
        <line
          x1="70"
          y1="74"
          x2={70 + Math.cos((200 - percent * 1.6) * Math.PI / 180) * 42}
          y2={74 - Math.sin((200 - percent * 1.6) * Math.PI / 180) * 42}
          stroke="#E2E8F0"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <div className="gauge-copy">
        <span>{label}</span>
        <strong>{Math.round(percent)}%</strong>
      </div>
    </div>
  );
}

function LidarMap({ telemetry }) {
  const alerts = telemetry.regressions.filter((item) => item.severity === 'CRITICAL').length;
  return (
    <section className="lidar-shell">
      <div className="section-title">
        <div>
          <p>AV Status Console</p>
          <h1>AV-CORE</h1>
        </div>
        <span className={telemetry.clockFrozen ? 'status red' : 'status'}>{telemetry.clockFrozen ? 'CLOCK STUTTER' : 'AUTONOMOUS'}</span>
      </div>
      <svg className="lidar-map" viewBox="0 0 720 500" role="img" aria-label="LIDAR pathfinding radar map">
        <defs>
          <pattern id="carbon" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="#0F172A" />
            <path d="M0 0h8v8H0zM8 8h8v8H8z" fill="#111C31" />
          </pattern>
          <radialGradient id="radarGlow" cx="50%" cy="52%" r="60%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>
          <filter id="blueGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="720" height="500" fill="url(#carbon)" />
        <rect width="720" height="500" fill="url(#radarGlow)" />
        {[70, 130, 190, 250].map((r) => (
          <circle key={r} cx="360" cy="292" r={r} fill="none" stroke="#1D4ED8" strokeOpacity="0.34" strokeWidth="1.3" />
        ))}
        {Array.from({ length: 14 }).map((_, index) => {
          const x = 360 + Math.cos(index * 0.66) * (80 + (index % 5) * 36);
          const y = 292 + Math.sin(index * 0.66) * (60 + (index % 4) * 38);
          return <circle key={index} cx={x} cy={y} r={index % 3 === 0 ? 5 : 3} fill={index < alerts ? '#EF4444' : '#60A5FA'} opacity="0.92" />;
        })}
        <path d="M78 416 C174 344 221 376 298 303 S448 184 622 96" fill="none" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" opacity="0.18" />
        <path d="M78 416 C174 344 221 376 298 303 S448 184 622 96" fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" filter="url(#blueGlow)" />
        {alerts > 0 && <path d="M464 196l36 62-72 0z" fill="none" stroke="#EF4444" strokeWidth="4" filter="url(#blueGlow)" />}
        <g transform="translate(330 262)">
          <path d="M30 0l26 58H4z" fill="#E2E8F0" />
          <path d="M30 13l13 32H17z" fill="#0F172A" />
        </g>
      </svg>
    </section>
  );
}

function RegressionTable({ regressions }) {
  return (
    <section className="debug-panel">
      <div className="panel-heading">
        <h2>Advanced Debugging Metrics</h2>
        <span>{regressions.length} active probes</span>
      </div>
      <div className="regression-list">
        {regressions.map((item) => (
          <article key={item.id} className="regression-row">
            <div>
              <strong>{item.name}</strong>
              <p>{item.subsystem}</p>
            </div>
            <div className="pressure-track">
              <span style={{ width: `${item.pressure * 100}%`, background: item.severity === 'CRITICAL' ? '#EF4444' : '#3B82F6' }} />
            </div>
            <code className={item.severity.toLowerCase()}>{item.severity}</code>
          </article>
        ))}
      </div>
    </section>
  );
}

function EventLog({ events }) {
  return (
    <section className="event-log">
      <div className="panel-heading">
        <h2>Event Stream</h2>
        <RadioTower size={16} />
      </div>
      <div className="event-lines">
        {events.length === 0 && <p className="empty-line">Awaiting V2X telemetry frames...</p>}
        {events.slice(0, 18).map((event, index) => (
          <div key={`${event.timestamp}-${index}`} className="event-line">
            <time>{new Date(event.timestamp).toLocaleTimeString()}</time>
            <span className={event.severity.toLowerCase()}>{event.severity}</span>
            <p>{event.source}: {event.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  const { data, connected } = useTelemetry();
  const cpu = Math.round(data.cpuLoad * 100);
  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <span className="eyebrow">Research Sandbox / Port 9054</span>
          <h1>Autonomous Vehicle Control Dashboard</h1>
        </div>
        <div className="connection">
          <span className={connected ? 'online' : 'offline'} />
          {connected ? 'Backend linked' : 'Simulation fallback'}
        </div>
      </header>

      <section className="metric-grid">
        <MetricCard icon={Gauge} label="Speed" value={data.speedKph.toFixed(1)} unit="kph" />
        <MetricCard icon={GitBranch} label="Steering" value={data.steeringAngle.toFixed(1)} unit="deg" />
        <MetricCard icon={Cpu} label="CPU Load" value={cpu} unit="%" tone={cpu > 80 ? 'red' : 'blue'} />
        <MetricCard icon={Zap} label="Latency" value={data.latencyMs.toFixed(0)} unit="ms" tone={data.latencyMs > 120 ? 'red' : 'blue'} />
      </section>

      <div className="layout">
        <LidarMap telemetry={data} />
        <aside className="side-stack">
          <GaugeDial label="Path Confidence" value={data.pathConfidence * 100} />
          <GaugeDial label="Packet Integrity" value={(1 - data.packetLoss) * 100} danger={data.packetLoss > 0.12} />
          <GaugeDial label="GPU Heap Health" value={(1 - data.gpuMemoryFragmentation) * 100} danger={data.gpuMemoryFragmentation > 0.7} />
          <MetricCard icon={Satellite} label="Battery" value={data.batteryPercent.toFixed(0)} unit="%" />
          <MetricCard icon={ShieldAlert} label="Alert Clock" value={new Date(data.timestamp).toLocaleTimeString()} unit="" tone={data.clockFrozen ? 'red' : 'blue'} />
        </aside>
      </div>

      <div className="bottom-layout">
        <RegressionTable regressions={data.regressions} />
        <EventLog events={data.events} />
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
