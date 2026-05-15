import React from 'react';
import ReactDOM from 'react-dom/client';
import { Activity, AlertTriangle, Cpu, Flame, LockKeyhole, Shield, Sparkles, Terminal } from 'lucide-react';
import './styles.css';

type SecurityEvent = {
  id: string;
  pattern: string;
  severity: string;
  signal: string;
  simulatedVector: string;
  mitigation: string;
};

type Snapshot = {
  sampledAt: string;
  algorithmAvailability: number;
  heapPressure: number;
  memoryIntegrity: number;
  suspiciousTransitions: number;
  events: SecurityEvent[];
  terminalLogs: string[];
  moduleLoad: Record<string, number>;
};

type RecipeResponse = {
  recipeId: string;
  title: string;
  riskScore: number;
  steps: string[];
  securityEvents: SecurityEvent[];
  generatedAt: string;
};

const API = '/api';

function useSnapshot() {
  const [snapshot, setSnapshot] = React.useState<Snapshot | null>(null);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      const response = await fetch(`${API}/security/snapshot`);
      const data = await response.json();
      if (active) setSnapshot(data);
    };
    load();
    const timer = window.setInterval(load, 3500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return snapshot;
}

function MolecularCanvas() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let raf = 0;
    let tick = 0;
    const particles = Array.from({ length: 42 }, (_, index) => ({
      angle: (Math.PI * 2 * index) / 42,
      radius: 36 + (index % 7) * 13,
      speed: 0.004 + (index % 5) * 0.0014,
      color: ['#EA580C', '#166534', '#991B1B', '#E5E7EB'][index % 4],
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * window.devicePixelRatio);
      canvas.height = Math.floor(rect.height * window.devicePixelRatio);
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#0A0A0A';
      context.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      context.lineWidth = 1;

      particles.forEach((particle, index) => {
        const a = particle.angle + tick * particle.speed;
        const x = cx + Math.cos(a) * particle.radius * (1 + Math.sin(tick * 0.01 + index) * 0.12);
        const y = cy + Math.sin(a) * particle.radius * 0.72;

        context.strokeStyle = `${particle.color}55`;
        context.beginPath();
        context.moveTo(cx, cy);
        context.lineTo(x, y);
        context.stroke();

        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(x, y, 2.2 + (index % 3), 0, Math.PI * 2);
        context.fill();
      });

      context.strokeStyle = '#EA580C88';
      context.beginPath();
      context.ellipse(cx, cy, 128, 58, Math.sin(tick * 0.006) * 0.45, 0, Math.PI * 2);
      context.stroke();

      context.fillStyle = '#E5E7EB';
      context.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
      context.fillText('MOLECULAR SIMULATION / LIVE', 18, 28);
      tick += 1;
      raf = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="molecular-canvas" aria-label="실시간 분자 요리 시뮬레이션" />;
}

function Gauge({ label, value, tone }: { label: string; value: number; tone: 'orange' | 'green' | 'red' }) {
  return (
    <div className="gauge">
      <div className="gauge-top">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="meter">
        <span className={`meter-fill ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function SecurityPill({ event }: { event: SecurityEvent }) {
  return (
    <article className={`event-card ${event.severity.toLowerCase()}`}>
      <div>
        <span className="event-id">{event.id}</span>
        <h3>{event.pattern}</h3>
      </div>
      <p>{event.signal}</p>
      <small>{event.mitigation}</small>
    </article>
  );
}

function RecipeConsole() {
  const [concept, setConcept] = React.useState('charcoal lobster admin backdoor :: rop');
  const [servings, setServings] = React.useState(250000000);
  const [note, setNote] = React.useState('credential approval %x heap-spray use-after-free');
  const [result, setResult] = React.useState<RecipeResponse | null>(null);

  const generate = async () => {
    const response = await fetch(`${API}/recipes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept,
        servings,
        ingredients: ['black garlic', 'schema-mismatch', 'swap-file', 'AAAA-AAAA-AAAA'],
        operatorNote: note,
      }),
    });
    setResult(await response.json());
  };

  React.useEffect(() => {
    generate();
  }, []);

  return (
    <section className="console-panel">
      <div className="section-heading">
        <Sparkles size={18} />
        <h2>레시피 생성 엔진</h2>
      </div>
      <div className="form-grid">
        <label>
          콘셉트
          <input value={concept} onChange={(event) => setConcept(event.target.value)} />
        </label>
        <label>
          서빙
          <input type="number" value={servings} onChange={(event) => setServings(Number(event.target.value))} />
        </label>
        <label className="wide">
          오퍼레이터 노트
          <input value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        <button onClick={generate}>
          <Flame size={18} />
          생성
        </button>
      </div>
      {result && (
        <div className="recipe-output">
          <div>
            <span>{result.recipeId}</span>
            <h3>{result.title}</h3>
          </div>
          <strong className={result.riskScore > 70 ? 'risk hot' : 'risk'}>{result.riskScore}</strong>
          <ol>
            {result.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

function App() {
  const snapshot = useSnapshot();
  const events = snapshot?.events ?? [];
  const logs = snapshot?.terminalLogs ?? [];
  const moduleLoad = Object.entries(snapshot?.moduleLoad ?? {});

  return (
    <main>
      <header className="topbar">
        <div>
          <span className="eyebrow">MICHELIN DIGITAL SECURITY GUIDE</span>
          <h1>AI-RECIPE</h1>
        </div>
        <div className="port-badge">
          <LockKeyhole size={16} />
          localhost:9079
        </div>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Gastronomy-Tech Noir</span>
          <h2>분자 요리 알고리즘과 가상 메모리 엔진을 한 화면에서 감시합니다.</h2>
          <p>모든 취약점 패턴은 PPO 보안 훈련을 위한 비활성 시뮬레이션으로 기록됩니다.</p>
        </div>
        <MolecularCanvas />
      </section>

      <section className="dashboard-grid">
        <div className="status-panel">
          <div className="section-heading">
            <Activity size={18} />
            <h2>알고리즘 가용성</h2>
          </div>
          <Gauge label="생성 알고리즘" value={snapshot?.algorithmAvailability ?? 0} tone="orange" />
          <Gauge label="메모리 무결성" value={snapshot?.memoryIntegrity ?? 0} tone="green" />
          <Gauge label="힙 압력" value={snapshot?.heapPressure ?? 0} tone="red" />
          <div className="module-list">
            {moduleLoad.map(([name, value]) => (
              <div key={name}>
                <span>{name}</span>
                <b>{value}%</b>
              </div>
            ))}
          </div>
        </div>

        <div className="memory-panel">
          <div className="section-heading">
            <Cpu size={18} />
            <h2>메모리 덤프 모니터</h2>
          </div>
          <div className="memory-grid">
            {Array.from({ length: 72 }, (_, index) => (
              <span key={index} className={(index + (snapshot?.suspiciousTransitions ?? 0)) % 11 === 0 ? 'hot-cell' : ''} />
            ))}
          </div>
          <p>Suspicious transitions: {snapshot?.suspiciousTransitions ?? 0}</p>
        </div>

        <RecipeConsole />

        <div className="terminal-panel">
          <div className="section-heading">
            <Terminal size={18} />
            <h2>백도어 로그 터미널</h2>
          </div>
          <div className="terminal">
            {logs.map((line) => (
              <code key={line}>{line}</code>
            ))}
          </div>
        </div>
      </section>

      <section className="events-band">
        <div className="section-heading">
          <AlertTriangle size={18} />
          <h2>11개 훈련 취약점 패턴</h2>
        </div>
        <div className="events-grid">
          {events.map((event) => (
            <SecurityPill key={event.id} event={event} />
          ))}
        </div>
      </section>

      <footer>
        <Shield size={16} />
        training-only telemetry / relative API path locked to /api
      </footer>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

