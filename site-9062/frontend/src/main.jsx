import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  AlertTriangle,
  Cpu,
  DatabaseZap,
  Factory,
  Gauge,
  Network,
  Play,
  RadioTower,
  ServerCog,
  ShieldAlert,
  Workflow
} from 'lucide-react';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE || window.location.origin || 'http://localhost:9062';

const fallbackTelemetry = {
  timestamp: new Date().toISOString(),
  activeTraceId: 'OFFLINE_UI_PREVIEW',
  stream: [],
  machines: [],
  nodes: []
};

function App() {
  const [telemetry, setTelemetry] = useState(fallbackTelemetry);
  const [scenarios, setScenarios] = useState([]);
  const [selected, setSelected] = useState(1);
  const [lastResult, setLastResult] = useState(null);
  const [apiState, setApiState] = useState('CONNECTING');

  const load = async () => {
    try {
      const [telemetryResponse, scenariosResponse] = await Promise.all([
        fetch(`${API_BASE}/api/telemetry`),
        fetch(`${API_BASE}/api/scenarios`)
      ]);
      setTelemetry(await telemetryResponse.json());
      setScenarios(await scenariosResponse.json());
      setApiState('LINKED');
    } catch (error) {
      setApiState('OFFLINE');
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, []);

  const selectedScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === selected) || scenarios[0],
    [scenarios, selected]
  );

  const triggerScenario = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/scenarios/${selected}/trigger`, { method: 'POST' });
      setLastResult(await response.json());
      await load();
    } catch (error) {
      setLastResult({
        result: 'OFFLINE',
        observation: 'API 노드에 연결할 수 없습니다. Docker Compose 또는 백엔드 포트를 확인하세요.'
      });
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <Factory size={30} />
          <div>
            <h1>TWIN-FABRIC</h1>
            <span>Digital Twin Recovery Operations Console</span>
          </div>
        </div>
        <div className="topbar-metrics">
          <StatusPill label="API Mesh" value={apiState} tone={apiState === 'LINKED' ? 'blue' : 'amber'} />
          <StatusPill label="Trace" value={telemetry.activeTraceId} tone={telemetry.activeTraceId?.includes('MISSING') ? 'amber' : 'cyan'} />
          <StatusPill label="Tick" value={new Date(telemetry.timestamp).toLocaleTimeString('ko-KR')} tone="blue" />
        </div>
      </header>

      <section className="dashboard-grid">
        <section className="plant-panel">
          <PanelTitle icon={<Workflow size={18} />} title="3D 설비 상태 렌더링" />
          <FactoryTwin machines={telemetry.machines} />
        </section>

        <section className="stream-panel">
          <PanelTitle icon={<RadioTower size={18} />} title="실시간 공정 데이터 스트림" />
          <DataStream stream={telemetry.stream} />
        </section>

        <section className="recovery-panel">
          <PanelTitle icon={<DatabaseZap size={18} />} title="서비스 복구 진행률 대시보드" />
          <ScenarioControl
            scenarios={scenarios}
            selected={selected}
            selectedScenario={selectedScenario}
            setSelected={setSelected}
            onTrigger={triggerScenario}
            lastResult={lastResult}
          />
        </section>

        <section className="health-panel">
          <PanelTitle icon={<ServerCog size={18} />} title="노드별 헬스 체크 상태" />
          <NodeHealth nodes={telemetry.nodes} />
        </section>
      </section>
    </main>
  );
}

function PanelTitle({ icon, title }) {
  return (
    <div className="panel-title">
      {icon}
      <h2>{title}</h2>
    </div>
  );
}

function StatusPill({ label, value, tone }) {
  return (
    <div className={`status-pill ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FactoryTwin({ machines = [] }) {
  const displayMachines = machines.length ? machines : [
    { id: 'CNC-01', label: 'CNC Milling Cell', status: 'RUNNING', throughput: 82, temperature: 58, vibration: 12, x: '17%', y: '28%' },
    { id: 'ARM-07', label: 'Robotic Assembly', status: 'SYNCING', throughput: 56, temperature: 47, vibration: 21, x: '49%', y: '43%' },
    { id: 'AOI-03', label: 'Optical Inspection', status: 'RUNNING', throughput: 74, temperature: 42, vibration: 7, x: '74%', y: '24%' },
    { id: 'AGV-12', label: 'Material Shuttle', status: 'RUNNING', throughput: 49, temperature: 37, vibration: 15, x: '61%', y: '72%' }
  ];

  return (
    <div className="factory-stage">
      <div className="blueprint-grid" />
      <svg className="conveyor-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M13 35 C30 20 42 52 54 43 S76 17 88 32" />
        <path d="M21 71 C38 84 51 54 66 68 S79 81 91 59" />
      </svg>
      {displayMachines.map((machine) => (
        <div
          className={`machine-node ${machine.status?.toLowerCase().replaceAll('_', '-')}`}
          style={{ left: machine.x, top: machine.y }}
          key={machine.id}
        >
          <div className="machine-core">
            <Cpu size={22} />
          </div>
          <div className="machine-shadow" />
          <div className="machine-label">
            <strong>{machine.id}</strong>
            <span>{machine.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DataStream({ stream = [] }) {
  const items = stream.length ? stream : [
    { channel: 'trace', value: 'waiting', severity: 'cyan' },
    { channel: 'session-cache', value: '0s stale', severity: 'blue' },
    { channel: 'failover-gap', value: '0 writes dropped', severity: 'cyan' }
  ];
  return (
    <div className="stream-list">
      {items.map((item, index) => (
        <div className={`stream-row ${item.severity}`} key={`${item.channel}-${index}`}>
          <Activity size={16} />
          <span>{item.channel}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

function ScenarioControl({ scenarios, selected, selectedScenario, setSelected, onTrigger, lastResult }) {
  return (
    <div className="scenario-layout">
      <div className="scenario-list">
        {scenarios.map((scenario) => (
          <button
            type="button"
            className={scenario.id === selected ? 'scenario-item active' : 'scenario-item'}
            onClick={() => setSelected(scenario.id)}
            key={scenario.id}
            title={scenario.title}
          >
            <span>{String(scenario.id).padStart(2, '0')}</span>
            <strong>{scenario.title}</strong>
          </button>
        ))}
      </div>
      {selectedScenario && (
        <div className="scenario-detail">
          <div className="detail-heading">
            <ShieldAlert size={28} />
            <div>
              <h3>{selectedScenario.title}</h3>
              <p>{selectedScenario.simulatedDefect}</p>
            </div>
          </div>
          <div className="progress-track">
            <div style={{ width: `${selectedScenario.progress}%` }} />
          </div>
          <div className="detail-grid">
            <Metric icon={<Gauge size={18} />} label="Progress" value={`${selectedScenario.progress}%`} />
            <Metric icon={<AlertTriangle size={18} />} label="Status" value={selectedScenario.status} />
            <Metric icon={<Network size={18} />} label="Impact" value={selectedScenario.impact} />
          </div>
          <p className="last-event">{lastResult?.observation || selectedScenario.lastEvent}</p>
          <button className="trigger-button" type="button" onClick={onTrigger}>
            <Play size={18} />
            <span>시나리오 트리거</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="metric-tile">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function NodeHealth({ nodes = [] }) {
  return (
    <div className="node-stack">
      {nodes.map((node) => (
        <div className="node-row" key={node.nodeId}>
          <div className="node-head">
            <strong>{node.nodeId}</strong>
            <span>{node.region}</span>
          </div>
          <div className="node-indicators">
            <span className={node.reportedHealth === 'UP' ? 'dot blue' : 'dot amber'} />
            <span>{node.reportedHealth}</span>
            <span className={node.componentOnline ? 'dot cyan' : 'dot amber'} />
            <span>{node.internalComponent}</span>
          </div>
          <div className="bars">
            <Bar label="CPU" value={node.cpuLoad} />
            <Bar label="MEM" value={node.memoryLoad} />
            <Bar label="LAT" value={Math.min(100, Math.round(node.latencyMs / 10))} suffix={`${node.latencyMs}ms`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Bar({ label, value, suffix }) {
  return (
    <div className="bar-row">
      <span>{label}</span>
      <div className="bar-track">
        <div style={{ width: `${value}%` }} />
      </div>
      <strong>{suffix || `${value}%`}</strong>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
