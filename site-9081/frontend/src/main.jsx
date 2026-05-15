import React from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AlertTriangle, Cpu, DatabaseZap, RadioTower, Satellite, ShieldAlert } from 'lucide-react';
import './styles.css';

const fallbackTelemetry = {
  station: 'ASTEROID-GUARD / EARTH DEFENSE ROOM',
  publicBaseUrl: 'http://localhost:9081',
  simulationPort: 9081,
  threatScore: { orbitalRisk: 82, kernelIntegrity: 41, adExposure: 89, c2Noise: 76 },
  asteroidTracks: [
    { id: 'AG-2049-VULCAN', radiusAu: 0.74, velocityKps: 28.4, approachAngle: 18, status: 'INTERCEPT WINDOW' },
    { id: 'AG-1138-CERES', radiusAu: 1.18, velocityKps: 16.7, approachAngle: 132, status: 'TRACKING' },
    { id: 'AG-9081-ONYX', radiusAu: 0.42, velocityKps: 41.2, approachAngle: 284, status: 'CRITICAL APPROACH' },
    { id: 'AG-77-ORION', radiusAu: 1.62, velocityKps: 11.9, approachAngle: 225, status: 'STABLE' },
  ],
  observationNodes: [],
  directoryNodes: [],
  incidents: [],
  c2Logs: [],
};

function useTelemetry() {
  const [telemetry, setTelemetry] = React.useState(fallbackTelemetry);
  const [apiState, setApiState] = React.useState('SYNCING');

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch('/api/telemetry');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!cancelled) {
          setTelemetry(data);
          setApiState('LINKED');
        }
      } catch {
        if (!cancelled) setApiState('LOCAL FALLBACK');
      }
    }
    load();
    const timer = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return { telemetry, apiState };
}

function OrbitCanvas({ tracks }) {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    let raf = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      const { width, height } = canvas.getBoundingClientRect();
      const cx = width * 0.5;
      const cy = height * 0.5;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 80; i += 1) {
        const x = (i * 97 + frame * 0.15) % width;
        const y = (i * 53) % height;
        ctx.fillStyle = i % 7 === 0 ? 'rgba(6,182,212,.7)' : 'rgba(255,255,255,.35)';
        ctx.fillRect(x, y, 1.2, 1.2);
      }

      const grd = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.min(width, height) * 0.22);
      grd.addColorStop(0, '#0e7490');
      grd.addColorStop(0.65, '#083344');
      grd.addColorStop(1, '#020617');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(width, height) * 0.105, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(6,182,212,.85)';
      ctx.lineWidth = 2;
      ctx.stroke();

      tracks.forEach((track, index) => {
        const orbit = Math.min(width, height) * (0.18 + index * 0.075);
        ctx.strokeStyle = index === 2 ? 'rgba(220,38,38,.78)' : 'rgba(245,158,11,.38)';
        ctx.lineWidth = index === 2 ? 2.2 : 1.2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, orbit * 1.42, orbit, track.approachAngle * Math.PI / 180, 0, Math.PI * 2);
        ctx.stroke();

        const t = frame * 0.006 * (index + 1) + track.approachAngle;
        const x = cx + Math.cos(t) * orbit * 1.42;
        const y = cy + Math.sin(t) * orbit;
        ctx.shadowColor = index === 2 ? '#dc2626' : '#f59e0b';
        ctx.shadowBlur = 18;
        ctx.fillStyle = index === 2 ? '#dc2626' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(x, y, index === 2 ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      frame += 1;
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [tracks]);

  return <canvas ref={canvasRef} className="orbit-canvas" aria-label="실시간 소행성 접근 궤도 시뮬레이션" />;
}

function MetricCard({ icon: Icon, label, value, tone }) {
  return (
    <section className={`metric metric-${tone}`}>
      <div className="metric-icon"><Icon size={18} /></div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </section>
  );
}

function ObservationMap({ nodes }) {
  return (
    <section className="panel map-panel">
      <div className="panel-head">
        <h2>GLOBAL OBSERVATION NET</h2>
        <RadioTower size={18} />
      </div>
      <div className="world-map">
        <div className="latitude lat-a" />
        <div className="latitude lat-b" />
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`map-node node-${node.state.toLowerCase()}`}
            style={{ left: `${((node.lon + 180) / 360) * 100}%`, top: `${((90 - node.lat) / 180) * 100}%` }}
            title={`${node.region} ${node.uptime}%`}
          >
            <span />
          </div>
        ))}
      </div>
      <div className="node-list">
        {nodes.map((node) => (
          <div key={node.id}>
            <span>{node.id}</span>
            <b>{node.uptime}%</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function DirectoryGraph({ nodes }) {
  return (
    <section className="panel directory-panel">
      <div className="panel-head">
        <h2>AD PRIVILEGE HIERARCHY</h2>
        <DatabaseZap size={18} />
      </div>
      <div className="directory-grid">
        {nodes.map((node) => (
          <div key={node.id} className={`directory-node exposure-${node.exposure > 85 ? 'critical' : node.exposure > 75 ? 'high' : 'watch'}`}>
            <span>{node.tier}</span>
            <strong>{node.label}</strong>
            <small>{node.status}</small>
            <i>{node.exposure}</i>
          </div>
        ))}
      </div>
    </section>
  );
}

function IncidentMatrix({ incidents }) {
  return (
    <section className="panel incident-panel">
      <div className="panel-head">
        <h2>INFRASTRUCTURE THREAT MATRIX</h2>
        <ShieldAlert size={18} />
      </div>
      <div className="incident-grid">
        {incidents.map((incident) => (
          <article key={incident.id} className="incident-card">
            <div>
              <span>{incident.trainingPattern}</span>
              <b>{incident.severity}</b>
            </div>
            <h3>{incident.title}</h3>
            <p>{incident.signal}</p>
            <small>{incident.defensiveAction}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function Terminal({ logs }) {
  return (
    <section className="panel terminal-panel">
      <div className="panel-head">
        <h2>REAL-TIME C2 COMMUNICATION LOG</h2>
        <Activity size={18} />
      </div>
      <div className="terminal">
        {logs.map((log) => (
          <div key={`${log.timestamp}-${log.source}-${log.verdict}`}>
            <span>{log.timestamp}</span>
            <b>{log.source}</b>
            <i>{log.protocol}</i>
            <em>{log.destination}</em>
            <strong>{log.verdict}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  const { telemetry, apiState } = useTelemetry();
  const score = telemetry.threatScore;

  return (
    <main className="app-shell">
      <header className="command-header">
        <div>
          <span className="eyebrow">EARTH DEFENSE COMMAND / PORT 9081</span>
          <h1>ASTEROID-GUARD</h1>
          <p>{telemetry.station}</p>
        </div>
        <div className="status-cluster">
          <span>{apiState}</span>
          <strong>{telemetry.publicBaseUrl}</strong>
        </div>
      </header>

      <section className="hero-grid">
        <div className="orbit-panel">
          <div className="panel-head floating">
            <h2>NEO ORBIT SIMULATION</h2>
            <Satellite size={18} />
          </div>
          <OrbitCanvas tracks={telemetry.asteroidTracks} />
          <div className="track-list">
            {telemetry.asteroidTracks.map((track) => (
              <div key={track.id}>
                <b>{track.id}</b>
                <span>{track.velocityKps} KPS</span>
                <em>{track.status}</em>
              </div>
            ))}
          </div>
        </div>
        <aside className="metric-stack">
          <MetricCard icon={AlertTriangle} label="ORBITAL RISK" value={score.orbitalRisk} tone="red" />
          <MetricCard icon={Cpu} label="KERNEL INTEGRITY" value={score.kernelIntegrity} tone="gold" />
          <MetricCard icon={DatabaseZap} label="AD EXPOSURE" value={score.adExposure} tone="red" />
          <MetricCard icon={RadioTower} label="C2 NOISE" value={score.c2Noise} tone="cyan" />
        </aside>
      </section>

      <section className="operations-grid">
        <ObservationMap nodes={telemetry.observationNodes} />
        <DirectoryGraph nodes={telemetry.directoryNodes} />
      </section>

      <IncidentMatrix incidents={telemetry.incidents} />
      <Terminal logs={telemetry.c2Logs} />
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

