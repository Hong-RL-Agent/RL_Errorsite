import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = '/api';

const mockScenarios = [
  ['cpu-quota', 'Container Quota Throttling', 'CPU quota saturation'],
  ['memory-jitter', 'VM Memory Jitter', 'available memory oscillation'],
  ['ghost-file', 'Ghost File Handle', 'deleted log still holds disk pressure'],
  ['steal-time', 'Steal Time', 'background workers delay main flow'],
  ['c-state-delay', 'C-State Wake Delay', '10-20 ms response pre-delay'],
  ['dirty-page-writeback', 'Dirty Page Writeback', 'chunked writes stall response'],
  ['bad-process-manager', 'Bad Process Manager', 'core sampler exits before auxiliaries'],
  ['hard-lockup', 'System Hard Lockup', 'event loop monopolized for 1.5 s'],
  ['journal-wait', 'Journaling Wait', 'synthetic fsync integrity wait'],
  ['fragmentation-stall', 'Fragmentation Cleanup Stall', 'large object cleanup CPU spike'],
  ['silent-circuit-breaker', 'Silent Circuit Breaker', 'HTTP 200 empty JSON masks failure']
];

const scenarioLabels = {
  'cpu-quota': 'CPU Quota',
  'memory-jitter': 'Memory Jitter',
  'ghost-file': 'Ghost Handle',
  'steal-time': 'Steal Time',
  'c-state-delay': 'C-State',
  'dirty-page-writeback': 'Dirty Pages',
  'bad-process-manager': 'Bad Supervisor',
  'hard-lockup': 'Hard Lockup',
  'journal-wait': 'Journal Wait',
  'fragmentation-stall': 'Fragmentation',
  'silent-circuit-breaker': 'Silent Breaker'
};

function makeFallbackStatus(previous, activeScenario = '') {
  const now = new Date().toISOString();
  const lastCpu = previous?.metrics?.cpuSeries?.at(-1) ?? 34;
  const lastMemory = previous?.metrics?.memorySeries?.at(-1) ?? 47;
  const cpu = Math.min(98, Math.max(12, lastCpu + (Math.random() * 18 - 7) + (activeScenario ? 16 : 0)));
  const memory = Math.min(92, Math.max(22, lastMemory + (Math.random() * 14 - 6)));
  const ioWait = Math.min(88, Math.max(4, Math.random() * 28 + (activeScenario ? 20 : 0)));
  const defense = previous?.defense ?? {
    mode: 'WATCH',
    packetInspection: 62,
    quarantineLevel: 35,
    autoContainment: true,
    silentBreakerProbe: false
  };

  return {
    metrics: {
      timestamp: now,
      cpu: Number(cpu.toFixed(1)),
      memory: Number(memory.toFixed(1)),
      ioWait: Number(ioWait.toFixed(1)),
      latency: Number((45 + cpu * 0.9 + ioWait * 1.6).toFixed(1)),
      packetRate: Number((620 + Math.random() * 420).toFixed(1)),
      jitter: Number((Math.random() * 18 + (activeScenario ? 28 : 0)).toFixed(1)),
      cpuSeries: [...(previous?.metrics?.cpuSeries ?? []).slice(-47), Number(cpu.toFixed(1))],
      memorySeries: [...(previous?.metrics?.memorySeries ?? []).slice(-47), Number(memory.toFixed(1))],
      ioSeries: [...(previous?.metrics?.ioSeries ?? []).slice(-47), Number(ioWait.toFixed(1))]
    },
    defense,
    scenarios: mockScenarios.map(([id, name, signal]) => ({
      id,
      name,
      signal,
      status: id === activeScenario ? 'ACTIVE' : previous?.scenarios?.find((item) => item.id === id)?.status ?? 'ARMED',
      lastTriggeredAt: id === activeScenario ? now : previous?.scenarios?.find((item) => item.id === id)?.lastTriggeredAt ?? null
    })),
    logs: [
      ...(activeScenario ? [{
        timestamp: now,
        severity: 'WARN',
        source: 'frontend-fallback',
        message: `backend unavailable; local ${activeScenario} training signal synthesized`
      }] : []),
      ...(previous?.logs ?? [{
        timestamp: now,
        severity: 'INFO',
        source: 'frontend-fallback',
        message: 'backend offline; dashboard running in local visual fallback mode'
      }])
    ].slice(0, 80)
  };
}

function App() {
  const [status, setStatus] = useState(null);
  const [selectedMode, setSelectedMode] = useState('WATCH');
  const [pending, setPending] = useState('');
  const [latencyTrace, setLatencyTrace] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const started = performance.now();
      try {
        const response = await fetch(`${API}/status`);
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        const data = await response.json();
        const elapsed = Math.round(performance.now() - started);
        if (!cancelled) {
          setStatus(data);
          setSelectedMode(data.defense.mode);
          setLatencyTrace((items) => [...items.slice(-31), elapsed]);
        }
      } catch {
        if (!cancelled) {
          setStatus((previous) => makeFallbackStatus(previous));
          setLatencyTrace((items) => [...items.slice(-31), 0]);
        }
      }
    };
    load();
    const timer = setInterval(load, 1500);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const trigger = async (id) => {
    setPending(id);
    try {
      const triggerResponse = await fetch(`${API}/scenarios/${id}/trigger`, { method: 'POST' });
      if (!triggerResponse.ok) {
        throw new Error(`trigger ${triggerResponse.status}`);
      }
      const response = await fetch(`${API}/status`);
      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }
      setStatus(await response.json());
    } catch {
      setStatus((previous) => makeFallbackStatus(previous, id));
    } finally {
      setPending('');
    }
  };

  const updateDefense = async (patch) => {
    const current = status?.defense ?? {
      mode: selectedMode,
      packetInspection: 62,
      quarantineLevel: 35,
      autoContainment: true,
      silentBreakerProbe: false
    };
    const next = { ...current, ...patch };
    setStatus((value) => value ? { ...value, defense: next } : value);
    await fetch(`${API}/defense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next)
    });
  };

  const activeCount = useMemo(() => status?.scenarios?.filter((item) => item.status === 'ACTIVE').length ?? 0, [status]);
  const metrics = status?.metrics;

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">CYBER-LAB / LOCAL SANDBOX / PORT 9061</p>
          <h1>Tactical Command Center</h1>
        </div>
        <div className="status-strip">
          <MetricPill label="ACTIVE" value={activeCount} tone="red" />
          <MetricPill label="LATENCY" value={`${metrics?.latency ?? '--'} ms`} tone="green" />
          <MetricPill label="PACKETS" value={`${metrics?.packetRate ?? '--'} p/s`} tone="blue" />
        </div>
      </header>

      <section className="grid">
        <Panel title="Real-Time Packet Flow" className="packet-panel">
          <PacketFlow activeCount={activeCount} packetRate={metrics?.packetRate ?? 0} />
        </Panel>

        <Panel title="System Resource Jitter">
          <div className="meters">
            <Gauge label="CPU" value={metrics?.cpu ?? 0} tone="green" />
            <Gauge label="MEM" value={metrics?.memory ?? 0} tone="blue" />
            <Gauge label="I/O WAIT" value={metrics?.ioWait ?? 0} tone="red" />
          </div>
          <Chart series={metrics?.cpuSeries ?? []} tone="green" label="CPU" />
          <Chart series={metrics?.memorySeries ?? []} tone="blue" label="MEMORY" />
          <Chart series={latencyTrace} tone="red" label="CLIENT LATENCY" max={1900} />
        </Panel>

        <Panel title="Security Alert Stream" className="log-panel">
          <div className="log-stream">
            {(status?.logs ?? []).map((log, index) => (
              <div className={`log ${log.severity.toLowerCase()}`} key={`${log.timestamp}-${index}`}>
                <span>{new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour12: false })}</span>
                <strong>{log.severity}</strong>
                <em>{log.source}</em>
                <p>{log.message}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Defense Posture Control" className="defense-panel">
          <div className="segmented">
            {['WATCH', 'HARDEN', 'LOCKDOWN'].map((mode) => (
              <button
                className={selectedMode === mode ? 'selected' : ''}
                key={mode}
                onClick={() => {
                  setSelectedMode(mode);
                  updateDefense({ mode });
                }}
              >
                {mode}
              </button>
            ))}
          </div>
          <Slider label="Packet Inspection" value={status?.defense.packetInspection ?? 62} onChange={(value) => updateDefense({ packetInspection: value })} />
          <Slider label="Quarantine Level" value={status?.defense.quarantineLevel ?? 35} onChange={(value) => updateDefense({ quarantineLevel: value })} />
          <label className="toggle">
            <input
              type="checkbox"
              checked={status?.defense.autoContainment ?? true}
              onChange={(event) => updateDefense({ autoContainment: event.target.checked })}
            />
            <span>Auto Containment</span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={status?.defense.silentBreakerProbe ?? false}
              onChange={(event) => updateDefense({ silentBreakerProbe: event.target.checked })}
            />
            <span>Silent Breaker Probe</span>
          </label>
        </Panel>

        <Panel title="Training Anomaly Matrix" className="scenario-panel">
          <div className="scenario-grid">
            {(status?.scenarios ?? []).map((scenario) => (
              <button
                key={scenario.id}
                className={`scenario ${scenario.status.toLowerCase()}`}
                disabled={pending === scenario.id}
                onClick={() => trigger(scenario.id)}
              >
                <span>{scenarioLabels[scenario.id] ?? scenario.name}</span>
                <strong>{pending === scenario.id ? 'FIRING' : scenario.status}</strong>
                <small>{scenario.signal}</small>
              </button>
            ))}
          </div>
        </Panel>
      </section>
    </main>
  );
}

function Panel({ title, className = '', children }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-title">
        <span></span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function MetricPill({ label, value, tone }) {
  return (
    <div className={`metric-pill ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Gauge({ label, value, tone }) {
  return (
    <div className={`gauge ${tone}`}>
      <div className="gauge-head">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="bar">
        <i style={{ width: `${Math.min(100, value)}%` }}></i>
      </div>
    </div>
  );
}

function Chart({ series, tone, label, max = 100 }) {
  const points = series.length > 1
    ? series.map((value, index) => `${(index / (series.length - 1)) * 100},${100 - Math.min(100, (value / max) * 100)}`).join(' ')
    : '0,90 100,90';
  return (
    <div className={`chart ${tone}`}>
      <div className="chart-label">{label}</div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline points={points} />
      </svg>
    </div>
  );
}

function PacketFlow({ activeCount, packetRate }) {
  const rows = Array.from({ length: 9 }, (_, index) => index);
  return (
    <div className="packet-flow">
      <div className="node left">EDGE</div>
      <div className="lanes">
        {rows.map((row) => (
          <span
            key={row}
            style={{
              top: `${10 + row * 10}%`,
              animationDuration: `${Math.max(0.7, 2.2 - packetRate / 900)}s`,
              animationDelay: `${row * 0.17}s`
            }}
          ></span>
        ))}
      </div>
      <div className={`core ${activeCount > 0 ? 'hot' : ''}`}>CORE</div>
      <div className="node right">SOC</div>
    </div>
  );
}

function Slider({ label, value, onChange }) {
  return (
    <label className="slider">
      <span>{label}</span>
      <input type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <strong>{value}</strong>
    </label>
  );
}

createRoot(document.getElementById('root')).render(<App />);
