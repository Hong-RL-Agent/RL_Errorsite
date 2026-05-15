import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AlertTriangle, Cloud, Database, LockKeyhole, Radar, ShieldAlert, Terminal } from 'lucide-react';
import './styles.css';

const fallback = {
  name: 'QUANTUM-SIM',
  origin: 'http://localhost:9074',
  generatedAt: new Date().toISOString(),
  qubits: [
    { id: 'Q-01', coherence: 0.91, entropy: 0.12, state: 'entangled' },
    { id: 'Q-02', coherence: 0.74, entropy: 0.41, state: 'superposition' },
    { id: 'Q-03', coherence: 0.58, entropy: 0.66, state: 'observed' },
    { id: 'Q-04', coherence: 0.83, entropy: 0.22, state: 'entangled' }
  ],
  cloudAssets: [],
  findings: []
};

function QuantumCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    let raf;

    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 96; i += 1) {
        const x = (Math.sin(frame * 0.009 + i) * 0.5 + 0.5) * w;
        const y = (Math.cos(frame * 0.006 + i * 1.7) * 0.5 + 0.5) * h;
        const radius = 1 + (i % 4);
        ctx.fillStyle = i % 7 === 0 ? 'rgba(168,85,247,.8)' : 'rgba(34,211,238,.55)';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let wave = 0; wave < 5; wave += 1) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 8) {
          const y = h * 0.5 + Math.sin(x * 0.018 + frame * 0.035 + wave) * (28 + wave * 12);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = wave % 2 ? 'rgba(168,85,247,.45)' : 'rgba(34,211,238,.55)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      const cx = w * 0.5;
      const cy = h * 0.5;
      for (let ring = 0; ring < 6; ring += 1) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, 76 + ring * 28, 20 + ring * 12, frame * 0.008 + ring, 0, Math.PI * 2);
        ctx.strokeStyle = ring === 4 ? 'rgba(220,38,38,.55)' : 'rgba(34,211,238,.26)';
        ctx.stroke();
      }
      frame += 1;
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="quantum-canvas" aria-label="실시간 큐비트 상태 파동" />;
}

function App() {
  const [data, setData] = useState(fallback);
  const [status, setStatus] = useState('API 동기화 중');

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)))
      .then((payload) => {
        setData(payload);
        setStatus('9074 링크 안정');
      })
      .catch(() => setStatus('로컬 시뮬레이션 모드'));
  }, []);

  const counts = useMemo(() => ({
    critical: data.findings.filter((item) => item.severity === 'critical').length,
    high: data.findings.filter((item) => item.severity === 'high').length,
    medium: data.findings.filter((item) => item.severity === 'medium').length
  }), [data.findings]);

  const terminalLines = data.findings.slice(0, 8).map((finding, index) =>
    `[${String(index + 1).padStart(2, '0')}] ${finding.id} :: ${finding.evidence}`
  );

  return (
    <main className="app-shell">
      <section className="hero">
        <QuantumCanvas />
        <div className="hero-overlay">
          <div className="brand-row">
            <Radar size={22} />
            <span>QUANTUM-SIM</span>
          </div>
          <h1>양자 플럭스 보안 훈련 관제</h1>
          <p>PPO 에이전트가 클라우드 오설정, 애플리케이션 취약점, 감사 공백을 하나의 양자 상태 공간에서 탐지하도록 설계된 시뮬레이션 대시보드입니다.</p>
          <div className="status-strip">
            <span>{data.origin}</span>
            <span>{status}</span>
            <span>{new Date(data.generatedAt).toLocaleTimeString('ko-KR')}</span>
          </div>
        </div>
      </section>

      <section className="metric-grid">
        <Metric icon={<ShieldAlert />} label="Critical" value={counts.critical} tone="red" />
        <Metric icon={<AlertTriangle />} label="High" value={counts.high} tone="purple" />
        <Metric icon={<Activity />} label="Medium" value={counts.medium} tone="cyan" />
        <Metric icon={<LockKeyhole />} label="Scenarios" value={data.findings.length} tone="neutral" />
      </section>

      <section className="ops-grid">
        <Panel title="큐비트 상태 파동" icon={<Activity />}>
          <div className="qubit-list">
            {data.qubits.map((q) => (
              <div className="qubit" key={q.id}>
                <div>
                  <strong>{q.id}</strong>
                  <span>{q.state}</span>
                </div>
                <div className="bar"><i style={{ width: `${q.coherence * 100}%` }} /></div>
                <small>coherence {(q.coherence * 100).toFixed(0)}% / entropy {(q.entropy * 100).toFixed(0)}%</small>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="클라우드 자원 보안 현황" icon={<Cloud />}>
          <div className="asset-list">
            {data.cloudAssets.map((asset) => (
              <div className={`asset ${asset.severity}`} key={asset.name}>
                <Database size={18} />
                <div>
                  <strong>{asset.name}</strong>
                  <span>{asset.type} / {asset.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="양자 연산 진행률 트래커" icon={<Radar />}>
          <div className="tracker">
            {['Ingest', 'Entangle', 'Probe', 'Collapse', 'Report'].map((step, idx) => (
              <div className="track-step" key={step}>
                <span>{idx + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="실시간 보안 감사 터미널" icon={<Terminal />}>
          <pre className="terminal">{terminalLines.join('\n') || 'waiting for telemetry...'}</pre>
        </Panel>
      </section>

      <section className="finding-grid">
        {data.findings.map((finding) => (
          <article className={`finding ${finding.severity}`} key={finding.id}>
            <span>{finding.id}</span>
            <h2>{finding.title}</h2>
            <p>{finding.description}</p>
            <code>{finding.evidence}</code>
          </article>
        ))}
      </section>
    </main>
  );
}

function Metric({ icon, label, value, tone }) {
  return (
    <div className={`metric ${tone}`}>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Panel({ title, icon, children }) {
  return (
    <article className="panel">
      <header>{icon}<h2>{title}</h2></header>
      {children}
    </article>
  );
}

createRoot(document.getElementById('root')).render(<App />);
