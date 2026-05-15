import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  DatabaseZap,
  Factory,
  Globe2,
  Network,
  RadioTower,
  Recycle,
  Route,
  ShieldAlert,
  Truck,
  WifiOff
} from 'lucide-react';
import { DashboardSnapshot, fetchDashboard, probeProxyDelay, sendOptionsProbe } from './services/api';

const fallback: DashboardSnapshot = {
  timestamp: new Date().toISOString(),
  vehicles: [
    { id: 'ECO-17', driver: 'Han Minsu', zone: 'Mapo-A3', lat: 37.5666, lng: 126.9014, fillCollected: 74, battery: 82, routeState: 'rerouting' },
    { id: 'BIO-04', driver: 'Kim Yuna', zone: 'Seongsu-C1', lat: 37.5446, lng: 127.0557, fillCollected: 61, battery: 64, routeState: 'collecting' },
    { id: 'HAZ-22', driver: 'Park Jisoo', zone: 'Gangnam-H7', lat: 37.4979, lng: 127.0276, fillCollected: 89, battery: 41, routeState: 'priority' },
    { id: 'REC-09', driver: 'Lee Daeho', zone: 'Yongsan-R2', lat: 37.5326, lng: 126.9905, fillCollected: 52, battery: 93, routeState: 'standby' }
  ],
  zones: [
    { zone: 'A3', district: 'Mapo Transfer Grid', fillPercent: 86, organic: 32, recyclable: 41, hazard: 13, status: 'critical' },
    { zone: 'C1', district: 'Seongsu Smart Bin Array', fillPercent: 68, organic: 29, recyclable: 34, hazard: 5, status: 'warning' },
    { zone: 'H7', district: 'Gangnam Hazard Pod', fillPercent: 93, organic: 18, recyclable: 26, hazard: 49, status: 'critical' },
    { zone: 'R2', district: 'Yongsan Recycling Spine', fillPercent: 57, organic: 12, recyclable: 43, hazard: 2, status: 'stable' },
    { zone: 'B5', district: 'Jongno Night Market', fillPercent: 77, organic: 46, recyclable: 28, hazard: 3, status: 'warning' },
    { zone: 'D9', district: 'Guro Industrial South', fillPercent: 64, organic: 21, recyclable: 25, hazard: 18, status: 'stable' }
  ],
  network: [
    { layer: 'DNS', status: 'degraded', latencyMs: 2200, lossRate: 0.01, faultPattern: 'resolver timeout', impact: 'initial dashboard timeout' },
    { layer: 'SSL/TLS', status: 'failed', latencyMs: 0, lossRate: 0, faultPattern: 'expired certificate / weak cipher', impact: 'handshake rejected' },
    { layer: 'TCP', status: 'storm', latencyMs: 740, lossRate: 0.17, faultPattern: 'packet loss retransmission', impact: 'telemetry disorder' },
    { layer: 'Proxy', status: 'timeout', latencyMs: 5040, lossRate: 0.05, faultPattern: '502/504 upstream delay', impact: 'heatmap collapse' },
    { layer: 'CORS', status: 'inefficient', latencyMs: 180, lossRate: 0, faultPattern: 'max-age=0 preflight', impact: 'OPTIONS every request' }
  ],
  faults: [],
  preflight: {}
};

const storageFaults = [
  'localStorage WM_ROUTE_CACHE overflow probe',
  'IndexedDB bin-sensor-history quota probe',
  'ServiceWorker stale shell retained',
  'Mobile Safari 100vh action bar occlusion',
  'Third-party smart-map SDK blocked by content filter'
];

function App() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(fallback);
  const [apiState, setApiState] = useState('SYNCING');
  const [quotaState, setQuotaState] = useState('armed');
  const [proxyStatus, setProxyStatus] = useState<number | null>(null);

  useEffect(() => {
    const probe = window.setInterval(() => {
      sendOptionsProbe().catch(() => undefined);
    }, 4500);

    fetchDashboard()
      .then((data) => {
        setSnapshot(data);
        setApiState('LIVE');
      })
      .catch(() => setApiState('FALLBACK'));

    probeProxyDelay().then(setProxyStatus).catch(() => setProxyStatus(0));

    try {
      const payload = 'WASTE-MGMT-QUOTA-PROBE'.repeat(120000);
      for (let i = 0; i < 128; i += 1) {
        localStorage.setItem(`wm-quota-${i}`, payload);
      }
      setQuotaState('filled');
    } catch {
      setQuotaState('quota-exceeded');
    }

    return () => window.clearInterval(probe);
  }, []);

  const totalFill = useMemo(
    () => Math.round(snapshot.zones.reduce((sum, zone) => sum + zone.fillPercent, 0) / snapshot.zones.length),
    [snapshot.zones]
  );

  return (
    <main className="min-h-screen bg-[#111827] text-zinc-100 concrete-shell">
      <section className="dashboard-grid">
        <header className="topbar">
          <div className="brand-lockup">
            <Factory className="brand-icon" />
            <div>
              <p className="eyebrow">SMART CITY WASTE OPS / PORT 9097</p>
              <h1>WASTE-MGMT</h1>
            </div>
          </div>
          <div className="status-strip">
            <MetricPill label="API" value={apiState} tone={apiState === 'LIVE' ? 'green' : 'amber'} />
            <MetricPill label="AVG LOAD" value={`${totalFill}%`} tone="amber" />
            <MetricPill label="PROXY" value={proxyStatus ? String(proxyStatus) : 'FAULT'} tone="red" />
          </div>
        </header>

        <section className="map-panel panel">
          <PanelTitle icon={<Route />} title="Fleet Route Map" signal="adblock-risk script" />
          <div className="city-map">
            <div className="map-grid" />
            <div className="route-line route-a" />
            <div className="route-line route-b" />
            <div className="route-line route-c" />
            {snapshot.vehicles.map((vehicle, index) => (
              <div
                className={`vehicle-dot state-${vehicle.routeState}`}
                style={{ left: `${18 + index * 21}%`, top: `${25 + (index % 3) * 20}%` }}
                key={vehicle.id}
              >
                <Truck size={18} />
                <span>{vehicle.id}</span>
              </div>
            ))}
          </div>
          <div className="fleet-list">
            {snapshot.vehicles.map((vehicle) => (
              <div className="fleet-row" key={vehicle.id}>
                <strong>{vehicle.id}</strong>
                <span>{vehicle.zone}</span>
                <span>{vehicle.fillCollected}% load</span>
                <span>{vehicle.battery}% bat</span>
              </div>
            ))}
          </div>
        </section>

        <section className="heat-panel panel">
          <PanelTitle icon={<Recycle />} title="Zone Fill Heatmap" signal="split-brain watch" />
          <div className="heat-grid">
            {snapshot.zones.map((zone) => (
              <article className={`heat-cell ${zone.status}`} key={zone.zone}>
                <div>
                  <strong>{zone.zone}</strong>
                  <span>{zone.district}</span>
                </div>
                <b>{zone.fillPercent}%</b>
                <div className="bar"><i style={{ width: `${zone.fillPercent}%` }} /></div>
              </article>
            ))}
          </div>
        </section>

        <section className="network-panel panel">
          <PanelTitle icon={<Network />} title="DNS / SSL / TCP Telemetry" signal="preflight max-age=0" />
          <div className="telemetry-stack">
            {snapshot.network.map((metric) => (
              <div className="telemetry-row" key={metric.layer}>
                <div className="layer-name">
                  {metric.layer === 'DNS' && <Globe2 size={18} />}
                  {metric.layer === 'SSL/TLS' && <ShieldAlert size={18} />}
                  {metric.layer === 'TCP' && <RadioTower size={18} />}
                  {metric.layer === 'Proxy' && <WifiOff size={18} />}
                  {metric.layer === 'CORS' && <DatabaseZap size={18} />}
                  <strong>{metric.layer}</strong>
                </div>
                <span className={`badge ${metric.status}`}>{metric.status}</span>
                <span>{metric.latencyMs}ms</span>
                <span>{Math.round(metric.lossRate * 100)}% loss</span>
                <small>{metric.faultPattern}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="terminal-panel panel">
          <PanelTitle icon={<AlertTriangle />} title="Fault Log Terminal" signal="training defects enabled" />
          <div className="terminal">
            {snapshot.faults.map((fault) => (
              <p key={fault.code}>
                <span>[{fault.severity.toUpperCase()}]</span> {fault.code} :: {fault.title} - {fault.detail}
              </p>
            ))}
            {storageFaults.map((line) => (
              <p key={line}><span>[CLIENT]</span> {line} :: {quotaState}</p>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function PanelTitle({ icon, title, signal }: { icon: ReactNode; title: string; signal: string }) {
  return (
    <div className="panel-title">
      <div>{icon}<h2>{title}</h2></div>
      <span>{signal}</span>
    </div>
  );
}

function MetricPill({ label, value, tone }: { label: string; value: string; tone: 'green' | 'amber' | 'red' }) {
  return (
    <div className={`metric-pill ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
