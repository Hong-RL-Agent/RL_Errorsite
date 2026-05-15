import React from 'react';
import ReactDOM from 'react-dom/client';
import { Activity, Cpu, Gauge, RadioTower, ShieldCheck, SlidersHorizontal, Waves } from 'lucide-react';
import './styles.css';

type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

type CompositionStatus = {
  sessionId: string;
  style: string;
  bpm: number;
  keySignature: string;
  completion: number;
  tracker: string[];
  waveform: number[];
  generatedAt: string;
};

type IntegrationStatus = {
  name: string;
  origin: string;
  state: string;
  latencyMs: number;
  note: string;
};

type RegressionScenario = {
  id: number;
  name: string;
  severity: Severity;
  subsystem: string;
  trigger: string;
  simulatedFault: string;
  guardrail: string;
  currentState: string;
  telemetry: string[];
};

const severityClass: Record<Severity, string> = {
  LOW: 'severity-low',
  MEDIUM: 'severity-medium',
  HIGH: 'severity-high',
  CRITICAL: 'severity-critical'
};

function useApiData<T>(path: string, fallback: T): T {
  const [data, setData] = React.useState<T>(fallback);

  React.useEffect(() => {
    let alive = true;
    const load = async () => {
      const response = await fetch(path, {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`${path} ${response.status}`);
      }
      const nextData = (await response.json()) as T;
      if (alive) {
        setData(nextData);
      }
    };

    load().catch(() => undefined);
    const interval = window.setInterval(() => load().catch(() => undefined), 4500);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [path]);

  return data;
}

function Waveform({ values }: { values: number[] }) {
  const normalized = values.length > 0 ? values : Array.from({ length: 96 }, (_, index) => Math.sin(index / 3));
  const points = normalized
    .map((value, index) => {
      const x = (index / Math.max(normalized.length - 1, 1)) * 1000;
      const y = 120 - value * 76;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="visualizer" aria-label="실시간 파형 비주얼라이저">
      <div className="visualizer-grid" />
      <svg viewBox="0 0 1000 240" preserveAspectRatio="none" role="img">
        <polyline className="wave wave-shadow" points={points} />
        <polyline className="wave" points={points} />
      </svg>
      <div className="meter-row">
        {Array.from({ length: 32 }, (_, index) => (
          <span
            key={index}
            className="meter"
            style={{ height: `${28 + Math.abs(Math.sin(index * 0.7)) * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  const composition = useApiData<CompositionStatus>('/api/composition/status', {
    sessionId: 'MELODY-9063-A7',
    style: 'cinematic synthwave',
    bpm: 126,
    keySignature: 'F# minor',
    completion: 0,
    tracker: ['API 연결 대기 중'],
    waveform: [],
    generatedAt: new Date().toISOString()
  });

  const integrations = useApiData<IntegrationStatus[]>('/api/integrations', []);
  const regressions = useApiData<RegressionScenario[]>('/api/regressions', []);

  return (
    <main className="app-shell">
      <section className="top-strip">
        <div>
          <p className="eyebrow">RESEARCH SANDBOX / PORT 9063</p>
          <h1>MELODY-AI</h1>
        </div>
        <div className="origin-lock">
          <ShieldCheck size={18} />
          <span>http://localhost</span>
        </div>
      </section>

      <section className="studio-grid">
        <article className="console-panel main-panel">
          <div className="panel-title">
            <Waves size={20} />
            <span>실시간 파형 비주얼라이저</span>
          </div>
          <Waveform values={composition.waveform} />
          <div className="transport">
            <div>
              <span className="metric-label">SESSION</span>
              <strong>{composition.sessionId}</strong>
            </div>
            <div>
              <span className="metric-label">BPM</span>
              <strong>{composition.bpm}</strong>
            </div>
            <div>
              <span className="metric-label">KEY</span>
              <strong>{composition.keySignature}</strong>
            </div>
            <div>
              <span className="metric-label">STYLE</span>
              <strong>{composition.style}</strong>
            </div>
          </div>
        </article>

        <aside className="console-panel tracker-panel">
          <div className="panel-title">
            <SlidersHorizontal size={20} />
            <span>AI 작곡 트래커</span>
          </div>
          <div className="progress-shell">
            <div style={{ width: `${composition.completion}%` }} />
          </div>
          <strong className="completion">{composition.completion}%</strong>
          <ul className="tracker-list">
            {composition.tracker.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="lower-grid">
        <article className="console-panel">
          <div className="panel-title">
            <RadioTower size={20} />
            <span>외부 연동 상태 대시보드</span>
          </div>
          <div className="integration-list">
            {integrations.map((integration) => (
              <div className="integration-row" key={integration.name}>
                <div>
                  <strong>{integration.name}</strong>
                  <span>{integration.origin}</span>
                </div>
                <div className="status-block">
                  <span className={`state state-${integration.state.toLowerCase()}`}>{integration.state}</span>
                  <span>{integration.latencyMs}ms</span>
                </div>
                <p>{integration.note}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="console-panel">
          <div className="panel-title">
            <Activity size={20} />
            <span>결함 시뮬레이션 매트릭스</span>
          </div>
          <div className="regression-table">
            {regressions.map((scenario) => (
              <div className="regression-row" key={scenario.id}>
                <span className="scenario-id">{String(scenario.id).padStart(2, '0')}</span>
                <div>
                  <strong>{scenario.name}</strong>
                  <span>{scenario.subsystem} / {scenario.currentState}</span>
                </div>
                <span className={`severity ${severityClass[scenario.severity]}`}>{scenario.severity}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="footer-band">
        <div>
          <Gauge size={18} />
          <span>CORS WebMvcConfigurer 활성화</span>
        </div>
        <div>
          <Cpu size={18} />
          <span>Vite /api 프록시 고정</span>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
