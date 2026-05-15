import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  AlertTriangle,
  Binary,
  Fingerprint,
  Globe2,
  LockKeyhole,
  Radar,
  RadioTower,
  ShieldAlert,
  TerminalSquare,
  UserCheck,
} from 'lucide-react';
import './styles.css';

const fallback = {
  threatMap: [
    { id: 'TP-SEO-091', city: 'Seoul', country: 'KR', lat: 37.5665, lng: 126.978, type: 'Credential Stuffing', risk: 94, actor: 'ORCA-7', signal: 'login_velocity_spike' },
    { id: 'TP-SFO-044', city: 'San Francisco', country: 'US', lat: 37.7749, lng: -122.4194, type: 'Cloud Token Theft', risk: 81, actor: 'NIGHT-SIGNAL', signal: 'api_key_reuse' },
    { id: 'TP-FRA-063', city: 'Frankfurt', country: 'DE', lat: 50.1109, lng: 8.6821, type: 'Ransomware Staging', risk: 89, actor: 'RED-LATTICE', signal: 'smb_probe_cluster' },
    { id: 'TP-SIN-112', city: 'Singapore', country: 'SG', lat: 1.3521, lng: 103.8198, type: 'Payment Fraud', risk: 75, actor: 'BLUE-EMBER', signal: 'merchant_anomaly' },
  ],
  predictions: [
    { type: 'Account Takeover', predictedIncidents: 183, confidence: 0.91, trend: 'RISING' },
    { type: 'Synthetic Identity Fraud', predictedIncidents: 97, confidence: 0.84, trend: 'STABLE' },
    { type: 'Ransomware Intrusion', predictedIncidents: 41, confidence: 0.79, trend: 'RISING' },
    { type: 'Insider Data Exfiltration', predictedIncidents: 23, confidence: 0.67, trend: 'WATCH' },
  ],
  authRecords: [],
  securityEvents: [],
  system: { riskScore: 87, debugMode: true },
};

function useDashboard() {
  const [data, setData] = useState(fallback);
  const [status, setStatus] = useState('SYNCING');

  useEffect(() => {
    let active = true;
    const load = () => {
      fetch('/api/dashboard')
        .then((response) => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
        .then((payload) => {
          if (active) {
            setData(payload);
            setStatus('LIVE');
          }
        })
        .catch(() => {
          if (active) {
            setData(fallback);
            setStatus('LOCAL CACHE');
          }
        });
    };
    load();
    const timer = setInterval(load, 9000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return { data, status };
}

function Metric({ icon: Icon, label, value, accent = 'blue' }) {
  return (
    <div className="metric-panel">
      <div className={`metric-icon ${accent}`}>
        <Icon size={20} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ThreatMap({ threats }) {
  const plotted = useMemo(() => threats.map((threat) => ({
    ...threat,
    x: ((threat.lng + 180) / 360) * 100,
    y: ((90 - threat.lat) / 180) * 100,
  })), [threats]);

  return (
    <section className="panel map-panel">
      <div className="panel-heading">
        <span><Globe2 size={18} /> 실시간 범죄 위협 맵</span>
        <b>GLOBAL GRID</b>
      </div>
      <div className="map-canvas">
        <div className="map-grid" />
        <div className="scan-line" />
        {plotted.map((threat) => (
          <div
            key={threat.id}
            className={`threat-node ${threat.risk > 88 ? 'critical' : ''}`}
            style={{ left: `${threat.x}%`, top: `${threat.y}%` }}
            title={`${threat.city} ${threat.type}`}
          >
            <span />
          </div>
        ))}
      </div>
      <div className="threat-list">
        {threats.map((threat) => (
          <article key={threat.id}>
            <div>
              <strong>{threat.city}</strong>
              <p>{threat.type} / {threat.actor}</p>
            </div>
            <em>{threat.risk}</em>
          </article>
        ))}
      </div>
    </section>
  );
}

function PredictionChart({ predictions }) {
  const max = Math.max(...predictions.map((item) => item.predictedIncidents), 1);
  return (
    <section className="panel">
      <div className="panel-heading">
        <span><Radar size={18} /> 범죄 유형별 예측 차트</span>
        <b>PPO SIGNAL</b>
      </div>
      <div className="bars">
        {predictions.map((item) => (
          <div className="bar-row" key={item.type}>
            <div className="bar-label">
              <strong>{item.type}</strong>
              <span>{Math.round(item.confidence * 100)}% / {item.trend}</span>
            </div>
            <div className="bar-track">
              <div style={{ width: `${(item.predictedIncidents / max) * 100}%` }} />
            </div>
            <em>{item.predictedIncidents}</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function AuthPanel({ records }) {
  const safeRecords = records.length ? records : [
    { userId: 'analyst.kim', ip: '10.91.0.44', result: 'SUCCESS', method: 'password', device: 'SOC-WKS-14', timestamp: new Date().toISOString() },
    { userId: 'case.admin', ip: '203.0.113.91', result: 'FAIL', method: 'password', device: 'unknown', timestamp: new Date().toISOString() },
  ];
  return (
    <section className="panel">
      <div className="panel-heading">
        <span><Fingerprint size={18} /> 사용자 인증 기록</span>
        <b>IDENTITY TRACE</b>
      </div>
      <div className="auth-table">
        {safeRecords.map((record, index) => (
          <article key={`${record.userId}-${index}`}>
            <UserCheck size={17} />
            <div>
              <strong>{record.userId}</strong>
              <p>{record.ip} / {record.method} / {record.device}</p>
            </div>
            <span className={record.result === 'SUCCESS' ? 'ok' : 'bad'}>{record.result}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function EventTerminal({ events }) {
  const safeEvents = events.length ? events : [
    { eventId: 'EVT-90017', severity: 'CRITICAL', source: 'predictor-core', message: 'model drift and auth replay signals crossed threshold' },
    { eventId: 'EVT-90018', severity: 'HIGH', source: 'identity-graph', message: 'password recovery sequence accepted alternate userId parameter' },
  ];
  return (
    <section className="panel terminal-panel">
      <div className="panel-heading">
        <span><TerminalSquare size={18} /> 시스템 보안 이벤트 로그</span>
        <b>RAW TELEMETRY</b>
      </div>
      <div className="terminal">
        {safeEvents.map((event) => (
          <p key={event.eventId}>
            <span>{event.severity}</span>
            <code>{event.eventId}</code>
            <b>{event.source}</b>
            {event.message}
          </p>
        ))}
      </div>
    </section>
  );
}

function App() {
  const { data, status } = useDashboard();
  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <ShieldAlert size={34} />
          <div>
            <h1>CYBER-PREDICT</h1>
            <p>사이버 범죄 예측 및 분석 관제 서버 / localhost:9091</p>
          </div>
        </div>
        <div className="status-pill">
          <RadioTower size={16} />
          {status}
        </div>
      </header>

      <section className="hero-band">
        <div>
          <span className="eyebrow">DEEP OCEAN OPERATIONS CENTER</span>
          <h2>범죄 신호, 인증 이상, 취약 구성 이벤트를 하나의 예측 패널로 통합합니다.</h2>
        </div>
        <div className="metrics">
          <Metric icon={Activity} label="위험 점수" value={data.system?.riskScore ?? 87} accent="red" />
          <Metric icon={Binary} label="분석 모델" value="PPO-LAB" />
          <Metric icon={LockKeyhole} label="디버그" value={String(data.system?.debugMode ?? true).toUpperCase()} accent="cyan" />
          <Metric icon={AlertTriangle} label="취약 패턴" value="11" accent="red" />
        </div>
      </section>

      <div className="dashboard-grid">
        <ThreatMap threats={data.threatMap ?? []} />
        <PredictionChart predictions={data.predictions ?? []} />
        <AuthPanel records={data.authRecords ?? []} />
        <EventTerminal events={data.securityEvents ?? []} />
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
