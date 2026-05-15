import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  Hexagon,
  Lock,
  Pickaxe,
  RadioTower,
  RefreshCw,
  Server,
  Zap,
} from "lucide-react";
import "./styles.css";

const FALLBACK = {
  asteroids: [],
  transactions: [],
  telemetry: { cpu: 0, memory: 0, dbPool: 0, latency: 0, throughput: 0, uptimeMinutes: 0, port: 9094 },
  logs: ["대시보드 API 연결 대기 중: /api/dashboard"],
  vulnerabilities: [],
};

function App() {
  const [data, setData] = useState(FALLBACK);
  const [status, setStatus] = useState("SYNCING");
  const [lastFault, setLastFault] = useState(null);

  const load = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
      setStatus("LIVE");
    } catch (error) {
      setStatus("OFFLINE");
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  const triggerFault = async (key) => {
    setStatus("FAULT-INJECTION");
    try {
      const res = await fetch(`/api/faults/${key}`, { method: "POST" });
      setLastFault(await res.json());
      await load();
    } catch (error) {
      setLastFault({ status: "request-failed", error: error.message });
      setStatus("OFFLINE");
    }
  };

  const totalYield = useMemo(
    () => data.asteroids.reduce((sum, asteroid) => sum + Number(asteroid.estimatedYield || 0), 0),
    [data.asteroids]
  );

  return (
    <main className="app-shell">
      <div className="orbital-grid" />
      <header className="hero">
        <section className="hero-copy">
          <div className="eyebrow"><RadioTower size={16} /> localhost:9094 / SPACE-MINING</div>
          <h1>SPACE-MINING</h1>
          <p>심우주 광물 채굴 함대, 자원 정산, 서버 병목 결함을 단일 관제 화면에서 추적하는 작전 센터.</p>
          <div className="hero-actions">
            <button onClick={load}><RefreshCw size={18} /> 동기화</button>
            <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>
          </div>
        </section>
        <section className="radar-panel" aria-label="asteroid radar">
          <div className="radar-core"><Pickaxe size={42} /></div>
          {data.asteroids.slice(0, 5).map((asteroid, index) => (
            <span key={asteroid.id || index} className={`asteroid-dot dot-${index}`}>
              <Hexagon size={18} />
            </span>
          ))}
        </section>
      </header>

      <section className="metrics-grid">
        <Metric icon={<Cpu />} label="CPU Load" value={`${data.telemetry.cpu}%`} tone={data.telemetry.cpu > 80 ? "danger" : "blue"} />
        <Metric icon={<Server />} label="Memory" value={`${data.telemetry.memory}%`} tone="cyan" />
        <Metric icon={<Database />} label="DB Pool" value={`${data.telemetry.dbPool}%`} tone={data.telemetry.dbPool > 82 ? "danger" : "blue"} />
        <Metric icon={<Gauge />} label="Latency" value={`${data.telemetry.latency}ms`} tone="cyan" />
        <Metric icon={<Zap />} label="Throughput" value={`${data.telemetry.throughput}/m`} tone="blue" />
        <Metric icon={<HardDrive />} label="Port" value={data.telemetry.port} tone="cyan" />
      </section>

      <section className="ops-grid">
        <Panel title="소행성 채굴 현황" icon={<Pickaxe />}>
          <div className="asteroid-list">
            {data.asteroids.map((asteroid) => (
              <article className="asteroid-card" key={asteroid.id}>
                <div>
                  <strong>{asteroid.sectorCode}</strong>
                  <span>{asteroid.mineralClass} / purity {asteroid.purity}%</span>
                </div>
                <b>{Number(asteroid.estimatedYield).toLocaleString()}u</b>
                <div className="progress"><i style={{ width: `${asteroid.progress}%` }} /></div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="자원 정산 트랜잭션" icon={<Database />}>
          <table>
            <thead><tr><th>Vessel</th><th>Units</th><th>Settled</th></tr></thead>
            <tbody>
              {data.transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.vessel}</td>
                  <td>{Number(tx.units).toLocaleString()}</td>
                  <td>{new Date(tx.settledAt).toLocaleTimeString("ko-KR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="yield-total">총 예측 채굴량 <strong>{totalYield.toLocaleString()} units</strong></div>
        </Panel>
      </section>

      <section className="ops-grid wide">
        <Panel title="성능 결함 주입 콘솔" icon={<AlertTriangle />}>
          <div className="fault-grid">
            {data.vulnerabilities.map((fault) => (
              <button key={fault.key} className={`fault-button ${fault.severity}`} onClick={() => triggerFault(fault.key)}>
                <span>{fault.title}</span>
                <small>{fault.key}</small>
              </button>
            ))}
          </div>
          {lastFault && <pre className="fault-result">{JSON.stringify(lastFault, null, 2)}</pre>}
        </Panel>

        <Panel title="실시간 시스템 로그 터미널" icon={<Activity />}>
          <div className="terminal">
            {data.logs.map((line, index) => <p key={index}><Lock size={13} /> {line}</p>)}
          </div>
        </Panel>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, tone }) {
  return (
    <article className={`metric ${tone}`}>
      <span>{React.cloneElement(icon, { size: 22 })}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}

function Panel({ title, icon, children }) {
  return (
    <section className="panel">
      <h2>{React.cloneElement(icon, { size: 20 })} {title}</h2>
      {children}
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
