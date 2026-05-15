import { AlertTriangle, BatteryCharging, Camera, Gauge, Map, RadioTower, Route, ShieldAlert, Truck, Wifi } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  computeTelemetryMath,
  computeTimezoneMismatch,
  damageOversizeId,
  drawTaintedCanvas,
  loadPredictiveMaintenancePanel,
  rememberScrollOnReturn,
  runPolyfillCrashProbe,
  startLongPollWithoutTimeout,
  startOutOfOrderSse,
} from './services/faults.js';

const statusColors = {
  Northbound: '#38BDF8',
  Eastbound: '#38BDF8',
  Docking: '#F59E0B',
  Charging: '#22C55E',
};

export default function App() {
  const [fleet, setFleet] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [events, setEvents] = useState([]);
  const [longPoll, setLongPoll] = useState('waiting without timeout');
  const [selected, setSelected] = useState(null);
  const [maintenancePanel, setMaintenancePanel] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetch('/api/fleet')
      .then((response) => response.json())
      .then((payload) => {
        setFleet(payload.trucks);
        setSelected(payload.trucks[0]);
      });

    const pullTelemetry = () => {
      fetch('/api/telemetry')
        .then((response) => response.json())
        .then(setTelemetry);
    };
    pullTelemetry();
    const timer = window.setInterval(pullTelemetry, 4500);
    const closeSse = startOutOfOrderSse((event) => setEvents((items) => [event, ...items].slice(0, 10)));
    startLongPollWithoutTimeout((payload) => setLongPoll(payload.message));
    runPolyfillCrashProbe();
    loadPredictiveMaintenancePanel().then((module) => setMaintenancePanel(() => module.default));
    return () => {
      window.clearInterval(timer);
      closeSse();
    };
  }, []);

  useEffect(() => {
    drawTaintedCanvas(canvasRef.current);
  }, []);

  const math = useMemo(() => telemetry ? computeTelemetryMath(telemetry) : null, [telemetry]);
  const shiftedTime = telemetry ? computeTimezoneMismatch(telemetry.serverLocal) : 'pending';
  const damagedId = telemetry ? damageOversizeId(telemetry) : 'pending';
  const MaintenancePanel = maintenancePanel;

  return (
    <main className="app-shell">
      <section className="hero">
        <img src="/media/control-feed.svg" alt="" className="hero-backdrop" />
        <div className="hero-overlay" />
        <nav className="topbar">
          <div className="brand-lockup">
            <Truck size={26} />
            <span>AUTO-TRUCK</span>
          </div>
          <div className="port-pill"><Wifi size={16} /> localhost:9088</div>
        </nav>
        <div className="hero-copy">
          <p className="eyebrow">Autonomous Freight Command</p>
          <h1>AUTO-TRUCK</h1>
          <p>실시간 고속도로 물류 관제, 텔레메트리 정합성 검증, 통신 결함 훈련을 하나의 9088 데이터 플레인에서 수행합니다.</p>
        </div>
      </section>

      <section className="dashboard-grid">
        <section className="glass panel map-panel">
          <div className="section-title">
            <div><p className="eyebrow">Live Route Map</p><h2>경부-영동 자율주행 회랑</h2></div>
            <Map className="icon-blue" />
          </div>
          <div className="route-map">
            <div className="map-grid" />
            <div className="route-line main-route" />
            <div className="route-line branch-route" />
            {fleet.map((truck, index) => (
              <button
                key={truck.id}
                className="truck-marker"
                style={{ left: `${18 + index * 20}%`, top: `${64 - index * 13}%`, '--marker': statusColors[truck.state] }}
                onClick={() => {
                  rememberScrollOnReturn();
                  setSelected(truck);
                }}
                title={truck.id}
              >
                <Truck size={18} />
              </button>
            ))}
          </div>
          <div className="fleet-strip">
            {fleet.map((truck) => (
              <button key={truck.id} className={selected?.id === truck.id ? 'fleet-card active' : 'fleet-card'} onClick={() => setSelected(truck)}>
                <strong>{truck.id}</strong>
                <span>{truck.state}</span>
                <b>{truck.speed} km/h</b>
              </button>
            ))}
          </div>
        </section>

        <section className="glass panel telemetry-panel">
          <div className="section-title"><div><p className="eyebrow">Telemetry</p><h2>연료 및 타이어 압력</h2></div><Gauge className="icon-amber" /></div>
          <div className="metric-stack">
            <Metric icon={<BatteryCharging />} label="Fuel reserve" value={`${selected?.fuel ?? 0}%`} accent="#F59E0B" />
            <Metric icon={<Gauge />} label="Tire pressure" value={`${selected?.tirePsi ?? 0} PSI`} accent="#38BDF8" />
            <Metric icon={<ShieldAlert />} label="FP fuel blend" value={math ? math.fuelBlend : '0.0'} accent="#DC2626" />
            <Metric icon={<Route />} label="Steering drift" value={math ? `${math.steering.toFixed(14)} deg` : 'pending'} accent="#38BDF8" />
          </div>
        </section>

        <section className="glass panel camera-panel">
          <div className="section-title"><div><p className="eyebrow">Control Camera</p><h2>관제 카메라 뷰</h2></div><Camera className="icon-blue" /></div>
          <video className="control-video" src="/assets/missing-control-feed.mp4" autoPlay loop playsInline />
          <p className="fault-caption">Autoplay intentionally requests playback without muted fallback for browser-policy training.</p>
          <canvas ref={canvasRef} width="320" height="90" className="security-canvas" />
        </section>

        <section className="glass panel log-panel">
          <div className="section-title"><div><p className="eyebrow">Comms Monitor</p><h2>통신 및 연산 로그</h2></div><RadioTower className="icon-blue" /></div>
          <div className="log-lines">
            <LogLine tone="amber" label="LONG_POLL" value={longPoll} />
            <LogLine tone="red" label="SSE_ORDER" value={`latest arrival seq ${events[0]?.sequence ?? 'waiting'}`} />
            <LogLine tone="blue" label="TIMEZONE" value={shiftedTime} />
            <LogLine tone="red" label="BIGINT_JSON" value={damagedId} />
            <LogLine tone="amber" label="CHUNK_LOAD" value="dynamic import has no retry handler" />
          </div>
        </section>

        <section className="glass panel event-panel">
          <div className="section-title"><div><p className="eyebrow">SSE Location Feed</p><h2>도착 순서 기준 렌더링</h2></div><AlertTriangle className="icon-red" /></div>
          <div className="event-table">
            {events.map((event) => (
              <div className="event-row" key={`${event.sequence}-${event.emittedAt}`}>
                <span>{event.sequence}</span>
                <strong>{event.truckId}</strong>
                <b>{event.speed} km/h</b>
              </div>
            ))}
          </div>
        </section>

        {MaintenancePanel ? <MaintenancePanel /> : null}
      </section>
    </main>
  );
}

function Metric({ icon, label, value, accent }) {
  return (
    <div className="metric">
      <span className="metric-icon" style={{ color: accent }}>{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LogLine({ tone, label, value }) {
  return (
    <div className={`log-line ${tone}`}>
      <span>{label}</span>
      <code>{value}</code>
    </div>
  );
}

