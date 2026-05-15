import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Activity,
  AlertTriangle,
  Archive,
  DatabaseBackup,
  Gauge,
  Landmark,
  Radar,
  ShieldAlert,
  TimerReset,
} from 'lucide-react';
import './styles.css';

const fallbackDashboard = {
  institution: 'DIGITAL-HERITAGE',
  baseUrl: 'http://localhost:9084',
  preservationMode: 'Sepia Vault Continuity Drill',
  timeline: [
    { id: 'era-01', era: '1450', title: 'Incunabula Registry', description: '초기 인쇄본 메타데이터 보존 구역', integrity: 96, risk: 'stable', x: 12, y: 62 },
    { id: 'era-02', era: '1910', title: 'Civic Census Vault', description: '구형 시민 기록 이전 중 정합성 손상', integrity: 68, risk: 'consistency', x: 31, y: 39 },
    { id: 'era-03', era: '1978', title: 'Magnetic Tape Annex', description: '습도 이탈에 따른 콜드 테이프 파손', integrity: 42, risk: 'media', x: 47, y: 70 },
    { id: 'era-04', era: '2004', title: 'Web Memory Wing', description: '정규화 순서 오류로 WAF 탐지 실패', integrity: 53, risk: 'waf', x: 66, y: 34 },
    { id: 'era-05', era: '2026', title: 'Continuity Core', description: '백업 서버 랜섬웨어 전염 훈련', integrity: 24, risk: 'critical', x: 86, y: 57 },
  ],
  metrics: [
    { label: 'RTO', current: 19, target: 8, unit: 'hours', state: 'breach', detail: '목표 복구 시간 초과' },
    { label: 'RPO', current: 37, target: 4, unit: 'hours', state: 'breach', detail: '백업 주기 오류로 데이터 유실 구간 확대' },
    { label: 'Replica Integrity', current: 71, target: 99, unit: '%', state: 'degraded', detail: '이전 데이터 체크섬 불일치' },
    { label: 'Cold Tape Health', current: 46, target: 95, unit: '%', state: 'critical', detail: '물리 보관 환경 불량' },
  ],
  socSignals: [
    { id: 'soc-001', source: 'WAF', severity: 'HIGH', title: '우회 패턴 탐지 맹점', status: 'missed', confidence: 41, scenario: 'WAF blind spot' },
    { id: 'soc-002', source: 'SIEM', severity: 'MEDIUM', title: '오탐 폭주로 중요 이벤트 은닉', status: 'overloaded', confidence: 27, scenario: 'False positive storm' },
    { id: 'soc-003', source: 'NOC', severity: 'HIGH', title: '야간 관제 공백으로 인지 지연', status: 'delayed', confidence: 34, scenario: 'Night shift gap' },
    { id: 'soc-004', source: 'IRP', severity: 'CRITICAL', title: '대응 매뉴얼 부재', status: 'failed', confidence: 18, scenario: 'Missing response playbook' },
  ],
  disasterLogs: [
    { time: '02:13:44', channel: 'SOC', level: 'ERROR', message: '야간 관제 큐가 312분 동안 미확인 상태로 누적됨.' },
    { time: '02:47:19', channel: 'WAF', level: 'WARN', message: '인코딩 우회 요청이 검사 후 정규화되어 정상 트래픽으로 분류됨.' },
    { time: '03:02:10', channel: 'BACKUP', level: 'CRITICAL', message: '랜섬웨어 훈련 페이로드가 백업 카탈로그까지 암호화함.' },
    { time: '03:38:25', channel: 'DR', level: 'ERROR', message: '복구 엔진이 DR Mock 미실시 정책 위반으로 정지.' },
  ],
};

function useDashboard() {
  const [dashboard, setDashboard] = React.useState(fallbackDashboard);
  const [live, setLive] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/heritage/dashboard')
      .then((response) => {
        if (!response.ok) throw new Error('Dashboard API unavailable');
        return response.json();
      })
      .then((data) => {
        setDashboard(data);
        setLive(true);
      })
      .catch(() => setLive(false));
  }, []);

  return { dashboard, live };
}

function GaugeCard({ metric }) {
  const isTimeMetric = metric.unit === 'hours';
  const ratio = isTimeMetric ? Math.min(metric.current / metric.target, 2) : metric.current / metric.target;
  const angle = Math.min(Math.max(ratio * 180, 10), 180);
  const color = metric.state === 'breach' || metric.state === 'critical' ? '#991B1B' : metric.state === 'degraded' ? '#D97706' : '#0EA5E9';

  return (
    <section className="glass panel gauge-card">
      <div className="panel-title">
        <Gauge size={18} />
        <span>{metric.label}</span>
      </div>
      <div className="gauge" style={{ '--angle': `${angle}deg`, '--gauge-color': color }}>
        <div className="gauge-inner">
          <strong>{metric.current}</strong>
          <span>{metric.unit}</span>
        </div>
      </div>
      <div className="metric-row">
        <span>Target {metric.target}{metric.unit === '%' ? '%' : ` ${metric.unit}`}</span>
        <b>{metric.state}</b>
      </div>
      <p>{metric.detail}</p>
    </section>
  );
}

function TimelineMap({ events }) {
  const riskColor = {
    stable: '#0EA5E9',
    consistency: '#D97706',
    media: '#D97706',
    waf: '#991B1B',
    critical: '#991B1B',
  };

  return (
    <section className="glass timeline-panel">
      <div className="section-head">
        <div>
          <span className="eyebrow">Archive Noah Map</span>
          <h2>디지털 유산 타임라인</h2>
        </div>
        <Landmark size={28} />
      </div>
      <svg viewBox="0 0 100 80" className="timeline-map" role="img" aria-label="Digital heritage timeline map">
        <defs>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="trace" x1="0" x2="1">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="55%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
        </defs>
        <path d="M10,62 C24,28 38,48 48,68 C58,88 65,18 88,56" fill="none" stroke="url(#trace)" strokeWidth="1.2" strokeDasharray="2 2" />
        {events.map((event) => (
          <g key={event.id} filter="url(#softGlow)">
            <circle cx={event.x} cy={event.y} r="4.2" fill={riskColor[event.risk] || '#D97706'} />
            <circle cx={event.x} cy={event.y} r="7" fill="transparent" stroke={riskColor[event.risk] || '#D97706'} strokeOpacity="0.35" />
            <text x={event.x} y={event.y - 8} textAnchor="middle">{event.era}</text>
          </g>
        ))}
      </svg>
      <div className="timeline-list">
        {events.map((event) => (
          <article key={event.id}>
            <b>{event.title}</b>
            <span>{event.description}</span>
            <small>Integrity {event.integrity}%</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function SocBoard({ signals }) {
  return (
    <section className="glass panel soc-board">
      <div className="section-head compact">
        <div>
          <span className="eyebrow">SOC / WAF</span>
          <h2>보안 관제 현황</h2>
        </div>
        <ShieldAlert size={26} />
      </div>
      {signals.map((signal) => (
        <article className="signal" key={signal.id}>
          <div className={`severity ${signal.severity.toLowerCase()}`}>{signal.severity}</div>
          <div>
            <b>{signal.source} · {signal.title}</b>
            <span>{signal.scenario}</span>
          </div>
          <strong>{signal.confidence}%</strong>
        </article>
      ))}
    </section>
  );
}

function LogTerminal({ logs }) {
  return (
    <section className="glass panel terminal">
      <div className="section-head compact">
        <div>
          <span className="eyebrow">DR Console</span>
          <h2>재해 복구 로그</h2>
        </div>
        <Activity size={26} />
      </div>
      <div className="terminal-lines">
        {logs.map((log, index) => (
          <div className="terminal-line" key={`${log.time}-${index}`}>
            <span>{log.time}</span>
            <b className={log.level.toLowerCase()}>{log.level}</b>
            <em>{log.channel}</em>
            <p>{log.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  const { dashboard, live } = useDashboard();

  return (
    <main className="app-shell">
      <div className="grain" />
      <header className="hero">
        <nav>
          <div className="brand">
            <Archive size={28} />
            <span>{dashboard.institution}</span>
          </div>
          <div className={`live-pill ${live ? 'online' : 'offline'}`}>
            <Radar size={16} />
            <span>{live ? 'API LIVE : localhost:9084' : 'SIMULATION CACHE'}</span>
          </div>
        </nav>
        <div className="hero-grid">
          <section className="hero-copy">
            <span className="eyebrow">Permanent Memory Continuity Platform</span>
            <h1>DIGITAL-HERITAGE</h1>
            <p>박물관급 디지털 보존 관제와 BCP 취약점 시뮬레이션을 하나의 세피아 데이터 볼트에 결합한 아카이브 노아 플랫폼.</p>
          </section>
          <aside className="glass status-slab">
            <DatabaseBackup size={30} />
            <div>
              <span>Preservation Mode</span>
              <b>{dashboard.preservationMode}</b>
            </div>
            <TimerReset size={30} />
            <div>
              <span>Recovery Posture</span>
              <b>RTO/RPO BREACH</b>
            </div>
          </aside>
        </div>
      </header>

      <section className="dashboard-grid">
        <TimelineMap events={dashboard.timeline} />
        <div className="metric-grid">
          {dashboard.metrics.map((metric) => (
            <GaugeCard key={metric.label} metric={metric} />
          ))}
        </div>
        <SocBoard signals={dashboard.socSignals} />
        <LogTerminal logs={dashboard.disasterLogs} />
      </section>

      <footer>
        <AlertTriangle size={16} />
        <span>Training simulation only · API path uses relative `/api/...` · isolated for http://localhost:9084</span>
      </footer>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
