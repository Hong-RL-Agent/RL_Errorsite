import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Activity, Anchor, Bell, DatabaseZap, Globe2, RadioTower, ShieldAlert, Ship, Waves } from 'lucide-react';
import './styles.css';

type Zone = {
  id: string;
  region: string;
  latitude: number;
  longitude: number;
  pollutant: string;
  concentrationPpm: number;
  severity: string;
};

type ApiTelemetry = {
  protocol: string;
  service: string;
  status: string;
  latencyMs: number;
  errorRate: number;
};

type SecurityEvent = {
  id: string;
  cluster: string;
  source: string;
  severity: string;
  message: string;
  timestamp: string;
};

type StreamEvent = {
  timestamp: string;
  node: string;
  vessel: string;
  microplastics: number;
  hydrocarbon: number;
  threat: string;
};

function useApi<T>(path: string, fallback: T): T {
  const [data, setData] = useState<T>(fallback);

  useEffect(() => {
    fetch(path)
      .then((response) => response.ok ? response.json() : fallback)
      .then(setData)
      .catch(() => setData(fallback));
  }, [path]);

  return data;
}

function App() {
  const zones = useApi<Zone[]>('/api/pollution-zones', []);
  const telemetry = useApi<ApiTelemetry[]>('/api/api-telemetry', []);
  const events = useApi<SecurityEvent[]>('/api/security-events', []);
  const [stream, setStream] = useState<StreamEvent[]>([]);

  useEffect(() => {
    const socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/sensors`);
    socket.onmessage = (message) => {
      const parsed = JSON.parse(message.data) as StreamEvent;
      setStream((current) => [parsed, ...current].slice(0, 6));
    };
    return () => socket.close();
  }, []);

  const fallbackZones = useMemo<Zone[]>(() => zones.length ? zones : [
    { id: 'Z-NEP-441', region: 'North Pacific Gyre', latitude: 31.2, longitude: -145.1, pollutant: 'Microplastics', concentrationPpm: 186.4, severity: 'HIGH' },
    { id: 'Z-SEA-082', region: 'East China Sea', latitude: 28.4, longitude: 125.8, pollutant: 'Hydrocarbon', concentrationPpm: 94.2, severity: 'ELEVATED' },
    { id: 'Z-ATL-219', region: 'Gulf Stream', latitude: 36.7, longitude: -62.3, pollutant: 'Nitrate', concentrationPpm: 61.8, severity: 'WATCH' }
  ], [zones]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow"><Waves size={16} /> National Marine Pollution Watch</div>
          <h1>OCEAN-GUARD</h1>
        </div>
        <div className="status-strip">
          <Metric icon={<Globe2 />} label="Coverage" value="71%" tone="cyan" />
          <Metric icon={<RadioTower />} label="Sensors" value="1,284" tone="emerald" />
          <Metric icon={<ShieldAlert />} label="Threats" value="11" tone="red" />
        </div>
      </header>

      <section className="dashboard-grid">
        <section className="map-panel">
          <div className="panel-title">
            <div><Anchor size={18} /> Global Ocean Contamination Heatmap</div>
            <span>GIS LAYER 9077</span>
          </div>
          <div className="world-map" aria-label="ocean heatmap">
            <div className="grid-lines" />
            {fallbackZones.map((zone, index) => (
              <button
                className={`zone severity-${zone.severity.toLowerCase()}`}
                style={{ left: `${projectX(zone.longitude)}%`, top: `${projectY(zone.latitude)}%` }}
                key={zone.id}
                title={`${zone.region}: ${zone.concentrationPpm} ppm`}
              >
                <span className="pulse" />
                <strong>{zone.id}</strong>
                <small>{zone.pollutant}</small>
                <em>{zone.concentrationPpm} ppm</em>
              </button>
            ))}
            <div className="current-vector vector-a" />
            <div className="current-vector vector-b" />
            <div className="map-legend">
              <span><i className="legend-red" /> Critical pollutant bloom</span>
              <span><i className="legend-cyan" /> Sensor confidence band</span>
              <span><i className="legend-green" /> Current vector</span>
            </div>
          </div>
        </section>

        <aside className="side-stack">
          <Panel title="Vessel & Sensor Stream" icon={<Ship size={17} />}>
            <div className="stream-list">
              {(stream.length ? stream : seedStream).map((item) => (
                <div className="stream-row" key={`${item.timestamp}-${item.node}`}>
                  <span className={item.threat === 'CRIMSON' ? 'dot red' : 'dot green'} />
                  <div>
                    <strong>{item.vessel}</strong>
                    <small>{item.node} · micro {item.microplastics} · hydro {item.hydrocarbon.toFixed(2)}</small>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="API Protocol Monitor" icon={<DatabaseZap size={17} />}>
            <div className="telemetry">
              {(telemetry.length ? telemetry : seedTelemetry).map((api) => (
                <div className="api-row" key={api.service}>
                  <span>{api.protocol}</span>
                  <strong>{api.service}</strong>
                  <em>{api.status}</em>
                  <b>{api.latencyMs}ms</b>
                </div>
              ))}
            </div>
          </Panel>
        </aside>

        <section className="log-panel">
          <div className="panel-title">
            <div><Activity size={18} /> Cluster Infrastructure Security Logs</div>
            <span>GraphQL · gRPC · K8s · Docker</span>
          </div>
          <div className="log-table">
            {(events.length ? events : seedEvents).map((event) => (
              <div className="log-row" key={event.id}>
                <span className={`badge ${event.severity.toLowerCase()}`}>{event.severity}</span>
                <strong>{event.cluster}</strong>
                <code>{event.source}</code>
                <p>{event.message}</p>
                <time>{new Date(event.timestamp).toLocaleTimeString()}</time>
              </div>
            ))}
          </div>
        </section>

        <section className="lab-panel">
          <div className="panel-title">
            <div><Bell size={18} /> Vulnerability Simulation Matrix</div>
            <span>LAB ONLY</span>
          </div>
          <div className="matrix">
            {[
              'Business Logic',
              'Timing Auth',
              'CAPTCHA Bypass',
              'Reset Token Leak',
              'OAuth State',
              'SAML Signature',
              'GraphQL Schema',
              'WebSocket Origin',
              'gRPC Reflection',
              'Privileged Docker',
              'Public K8s API'
            ].map((item, index) => (
              <div className="matrix-cell" key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return <div className={`metric ${tone}`}>{icon}<span>{label}</span><strong>{value}</strong></div>;
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="panel"><div className="panel-title"><div>{icon}{title}</div></div>{children}</section>;
}

function projectX(longitude: number) {
  return ((longitude + 180) / 360) * 100;
}

function projectY(latitude: number) {
  return ((90 - latitude) / 180) * 100;
}

const seedStream: StreamEvent[] = [
  { timestamp: new Date().toISOString(), node: 'ABYSS-02', vessel: 'OGV Halocline', microplastics: 112, hydrocarbon: 1.84, threat: 'STABLE' },
  { timestamp: new Date().toISOString(), node: 'PELAGIC-17', vessel: 'OGV Asterion', microplastics: 206, hydrocarbon: 4.21, threat: 'CRIMSON' }
];

const seedTelemetry: ApiTelemetry[] = [
  { protocol: 'GraphQL', service: 'pollution-schema', status: 'INTROSPECTION_ON', latencyMs: 42, errorRate: 0.8 },
  { protocol: 'gRPC', service: 'sensor-fusion', status: 'REFLECTION_ON', latencyMs: 17, errorRate: 0.2 }
];

const seedEvents: SecurityEvent[] = [
  { id: 'E-9001', cluster: 'ocean-guard-prod-a', source: 'kube-apiserver', severity: 'CRITICAL', message: 'Public API endpoint accepted anonymous discovery request', timestamp: new Date().toISOString() }
];

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
