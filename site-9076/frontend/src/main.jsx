import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AlertTriangle, CloudLightning, Cpu, LockOpen, Plane, RadioTower, ShieldAlert, Terminal } from 'lucide-react';
import './styles.css';

const MAP_KEY = 'SKYMAP-TRAINING-KEY-9076-CLIENT-EXPOSED';

function useSkyTaxiData() {
  const [data, setData] = useState(null);
  const [debug, setDebug] = useState(null);
  const [session, setSession] = useState(null);
  const [errorDemo, setErrorDemo] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [statusRes, debugRes] = await Promise.all([
        fetch('/api/status'),
        fetch('/api/debug/snapshot')
      ]);
      if (!alive) return;
      setData(await statusRes.json());
      setDebug(await debugRes.json());
    };

    load();
    const timer = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const createSession = async () => {
    const res = await fetch('/api/session?operator=night-city-dispatch', { method: 'POST' });
    setSession(await res.json());
  };

  const triggerError = async () => {
    const res = await fetch('/api/error-demo/GOLD-7');
    setErrorDemo(await res.json());
  };

  return { data, debug, session, errorDemo, createSession, triggerError };
}

function FlightCanvas({ route = [] }) {
  const path = useMemo(() => {
    if (!route.length) return '';
    return route.map((node, index) => `${index === 0 ? 'M' : 'L'} ${node.x * 10} ${node.y * 6}`).join(' ');
  }, [route]);

  return (
    <div className="flight-sim">
      <svg viewBox="0 0 1000 600" role="img" aria-label="SKY-TAXI route simulation">
        <defs>
          <radialGradient id="cityGlow" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.22" />
            <stop offset="45%" stopColor="#020617" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
          </radialGradient>
          <filter id="goldGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="1000" height="600" fill="url(#cityGlow)" />
        {Array.from({ length: 22 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 48} y1="0" x2={i * 48 - 130} y2="600" className="grid-line" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={i * 55} x2="1000" y2={i * 55 + 120} className="grid-line" />
        ))}
        {Array.from({ length: 34 }).map((_, i) => {
          const height = 50 + ((i * 37) % 190);
          return <rect key={i} x={i * 31} y={600 - height} width="18" height={height} className="tower" />;
        })}
        <path d={path} className="route-shadow" />
        <path d={path} className="route-line" filter="url(#goldGlow)" />
        {route.map((node, index) => (
          <g key={node.id} transform={`translate(${node.x * 10}, ${node.y * 6})`}>
            <circle r={node.state === 'alert' ? 18 : 12} className={`node node-${node.state}`} />
            <text x="18" y="-14" className="node-label">{node.id}</text>
            <text x="18" y="4" className="node-alt">{node.altitudeMeters}m</text>
            {index === 2 && <Plane size={34} x="-17" y="-17" className="taxi-vector" />}
          </g>
        ))}
      </svg>
    </div>
  );
}

function Panel({ icon: Icon, title, accent = 'cyan', children }) {
  return (
    <section className={`panel panel-${accent}`}>
      <header>
        <Icon size={18} />
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  );
}

function App() {
  const { data, debug, session, errorDemo, createSession, triggerError } = useSkyTaxiData();
  const unsafeNotice = new URLSearchParams(window.location.search).get('notice') || 'CYBER CORRIDOR NOMINAL';

  return (
    <main className="app-shell">
      <div className="skyline" />
      <nav className="topbar">
        <div>
          <p>UAM CONTROL NODE 9076</p>
          <h1>SKY-TAXI</h1>
        </div>
        <div className="status-strip">
          <span><RadioTower size={16} /> localhost:9076</span>
          <span><ShieldAlert size={16} /> TRAINING VULN MODE</span>
          <span><Activity size={16} /> {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'SYNCING'}</span>
        </div>
      </nav>

      <section className="command-grid">
        <div className="main-stage">
          <div className="stage-header">
            <div>
              <p>Autonomous route simulation</p>
              <h2>GOLD-7 NIGHT VECTOR</h2>
            </div>
            <button onClick={createSession}><LockOpen size={16} /> FIX SESSION</button>
          </div>
          <FlightCanvas route={data?.route || []} />
          <div className="ticker" dangerouslySetInnerHTML={{ __html: unsafeNotice }} />
        </div>

        <aside className="right-rail">
          <Panel icon={CloudLightning} title="기상 및 항로" accent="gold">
            <dl className="metrics">
              <div><dt>WIND</dt><dd>{data?.weather.windKph ?? '--'} kph</dd></div>
              <div><dt>VIS</dt><dd>{data?.weather.visibilityKm ?? '--'} km</dd></div>
              <div><dt>CEILING</dt><dd>{data?.weather.ceilingMeters ?? '--'} m</dd></div>
              <div><dt>RISK</dt><dd>{data?.weather.routeRisk ?? 'SYNC'}</dd></div>
            </dl>
            <p className="storm">{data?.weather.stormCell}</p>
          </Panel>

          <Panel icon={Cpu} title="세션 및 인증" accent="pink">
            <button className="wide-action" onClick={createSession}>예측 가능 세션 생성</button>
            <code>{session ? session.sessionId : 'SKY-TAXI-SESSION-907601 예상 가능'}</code>
            <p>Cookie: Secure=false / HttpOnly=false / SameSite 누락</p>
          </Panel>

          <Panel icon={AlertTriangle} title="관리자 우회" accent="pink">
            <button className="wide-action" onClick={triggerError}>내부 에러 노출</button>
            <p>Admin API token validation: SKIPPED</p>
          </Panel>
        </aside>
      </section>

      <section className="lower-grid">
        <Panel icon={Plane} title="기체 상태" accent="cyan">
          <div className="fleet-list">
            {(data?.fleet || []).map((taxi) => (
              <article key={taxi.callsign}>
                <strong>{taxi.callsign}</strong>
                <span>{taxi.route}</span>
                <meter min="0" max="100" value={taxi.battery} />
                <em>{taxi.engineState} / {taxi.authState}</em>
              </article>
            ))}
          </div>
        </Panel>

        <Panel icon={Terminal} title="시스템 내부 로그" accent="gold">
          <div className="log-viewer">
            {(data?.logs || []).map((log, index) => (
              <p key={`${log.source}-${index}`}><span>{log.level}</span> [{log.source}] {log.message}</p>
            ))}
            {debug && <p><span>DEBUG</span> hardcoded map key: {MAP_KEY}</p>}
            {errorDemo && <p><span>STACK</span> {errorDemo.message}</p>}
          </div>
        </Panel>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
