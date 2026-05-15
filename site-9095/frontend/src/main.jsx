import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  AlertTriangle,
  BellRing,
  Cable,
  Cpu,
  DatabaseZap,
  Gauge,
  LockKeyhole,
  RadioTower,
  RefreshCcw,
  ServerCrash,
  Snowflake,
  TerminalSquare,
  Waves
} from 'lucide-react';
import './styles.css';

const fallbackSnapshot = {
  generatedAt: new Date().toISOString(),
  globalAvailability: 98.7,
  activePowerMw: 44.2,
  thermalHeadroom: 12.8,
  cables: [
    { route: 'PACIFIC-RING-01', region: 'Busan <-> Seattle', throughputTbps: 148.2, packetLoss: 0.1, latencyMs: 32.4, status: 'SYNC' },
    { route: 'ARCTIC-DUSK-07', region: 'Reykjavik <-> Svalbard', throughputTbps: 92.7, packetLoss: 0.2, latencyMs: 80.2, status: 'DEGRADED' },
    { route: 'ABYSSAL-LINE-13', region: 'Guam <-> Sydney', throughputTbps: 121.5, packetLoss: 0.1, latencyMs: 42.7, status: 'SYNC' },
    { route: 'TRENCH-GRID-22', region: 'Tokyo <-> Singapore', throughputTbps: 176.4, packetLoss: 3.2, latencyMs: 53.8, status: 'LOSSY' }
  ],
  cooling: [
    { zone: 'CRYO-VAULT-A', efficiency: 94, inletCelsius: 6.8, pumpRpm: 4180, risk: 'NOMINAL' },
    { zone: 'HEAT-EXCHANGER-B', efficiency: 77, inletCelsius: 11.6, pumpRpm: 5520, risk: 'WATCH' },
    { zone: 'PUMP-RING-C', efficiency: 63, inletCelsius: 14.2, pumpRpm: 6810, risk: 'RISK' }
  ],
  queues: [
    { broker: 'Kafka', topic: 'cable.telemetry.raw', lag: 181000, consumerRate: 9400, producerRate: 31100, pressure: 'SATURATED' },
    { broker: 'RabbitMQ', topic: 'incident.alert.sms', lag: 24900, consumerRate: 420, producerRate: 2100, pressure: 'LOSS-RISK' },
    { broker: 'Kafka', topic: 'cooling.metrics.windowed', lag: 11200, consumerRate: 7300, producerRate: 8800, pressure: 'ELEVATED' }
  ],
  faultPatterns: [],
  logs: [
    { timestamp: new Date().toISOString(), level: 'INFO', subsystem: 'control-plane', message: '9095 isolated command bus online' },
    { timestamp: new Date().toISOString(), level: 'CRITICAL', subsystem: 'distributed-lock', message: 'dual lock ownership observed for abyssal-admin authority' }
  ]
};

function App() {
  const [snapshot, setSnapshot] = useState(fallbackSnapshot);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await fetch('/api/dashboard', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`API ${response.status}`);
        }
        const data = await response.json();
        if (mounted) {
          setSnapshot(data);
          setConnected(true);
        }
      } catch {
        if (mounted) {
          setConnected(false);
        }
      }
    };
    load();
    const timer = setInterval(load, 3000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const faultSummary = useMemo(() => {
    const critical = snapshot.faultPatterns?.filter((fault) => fault.severity === 'CRITICAL').length ?? 4;
    const high = snapshot.faultPatterns?.filter((fault) => fault.severity === 'HIGH').length ?? 5;
    return { critical, high };
  }, [snapshot]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <AbyssBackground />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col gap-5 px-5 py-5 lg:px-8">
        <Header connected={connected} snapshot={snapshot} />
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.9fr_0.75fr]">
          <CommandTheater snapshot={snapshot} />
          <CoreMetrics snapshot={snapshot} faultSummary={faultSummary} />
          <CoolingPanel cooling={snapshot.cooling} />
        </section>
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <QueueTelemetry queues={snapshot.queues} />
          <LogTerminal logs={snapshot.logs} />
        </section>
        <FaultGrid faults={snapshot.faultPatterns} />
      </div>
    </main>
  );
}

function Header({ connected, snapshot }) {
  return (
    <header className="glass-panel flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center border border-cyan-300/50 bg-sky-400/10 shadow-[0_0_34px_rgba(56,189,248,0.45)]">
          <Waves className="h-7 w-7 text-cyan-300" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-200/80">Abyssal Infrastructure Command</p>
          <h1 className="text-2xl font-black uppercase leading-tight text-white md:text-4xl">DEEP-SEA-DATA</h1>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Badge icon={RadioTower} label="PORT" value="9095" />
        <Badge icon={Activity} label="API LINK" value={connected ? 'LIVE' : 'LOCAL FALLBACK'} danger={!connected} />
        <Badge icon={Gauge} label="SLA" value={`${snapshot.globalAvailability}%`} />
        <Badge icon={RefreshCcw} label="SYNC" value={formatTime(snapshot.generatedAt)} />
      </div>
    </header>
  );
}

function Badge({ icon: Icon, label, value, danger }) {
  return (
    <div className={`metric-chip ${danger ? 'danger-chip' : ''}`}>
      <Icon className="h-4 w-4" />
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function CommandTheater({ snapshot }) {
  return (
    <section className="glass-panel relative min-h-[430px] overflow-hidden p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="section-kicker">Subsea Cable Traffic</p>
          <h2 className="section-title">해저 케이블 실시간 트래픽</h2>
        </div>
        <Cable className="h-7 w-7 text-sky-300" />
      </div>
      <div className="ocean-map">
        <div className="trench-grid" />
        {snapshot.cables.map((cable, index) => (
          <CableRoute key={cable.route} cable={cable} index={index} />
        ))}
        <div className="command-core">
          <DatabaseZap className="h-10 w-10 text-cyan-200" />
          <span>NODE 9095</span>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
        {snapshot.cables.map((cable) => (
          <div className="route-card" key={cable.route}>
            <div className="flex items-center justify-between">
              <strong>{cable.route}</strong>
              <span className={`status-pill ${cable.status.toLowerCase()}`}>{cable.status}</span>
            </div>
            <p>{cable.region}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <span>{cable.throughputTbps} Tbps</span>
              <span>{cable.latencyMs} ms</span>
              <span>{cable.packetLoss}% loss</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CableRoute({ cable, index }) {
  const top = [18, 35, 57, 73][index];
  const rotation = [-8, 5, -2, 9][index];
  return (
    <div className={`cable-route ${cable.status.toLowerCase()}`} style={{ top: `${top}%`, transform: `rotate(${rotation}deg)` }}>
      <span />
      <i />
      <b>{cable.route}</b>
    </div>
  );
}

function CoreMetrics({ snapshot, faultSummary }) {
  const metrics = [
    { label: 'Global Availability', value: `${snapshot.globalAvailability}%`, icon: Activity, tone: 'cyan' },
    { label: 'Active Power Draw', value: `${snapshot.activePowerMw} MW`, icon: Cpu, tone: 'blue' },
    { label: 'Critical Patterns', value: faultSummary.critical, icon: ServerCrash, tone: 'red' },
    { label: 'High Risk Patterns', value: faultSummary.high, icon: AlertTriangle, tone: 'amber' }
  ];
  return (
    <section className="glass-panel p-5">
      <p className="section-kicker">Facility Pulse</p>
      <h2 className="section-title mb-4">가용성 병목 지표</h2>
      <div className="grid gap-3">
        {metrics.map((metric) => (
          <div className={`metric-row ${metric.tone}`} key={metric.label}>
            <metric.icon className="h-6 w-6" />
            <div>
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded border border-sky-300/20 bg-slate-950/50 p-4">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
          <span>Thermal Headroom</span>
          <strong className="text-cyan-200">{snapshot.thermalHeadroom} C</strong>
        </div>
        <div className="h-3 overflow-hidden rounded bg-slate-800">
          <div className="h-full bg-gradient-to-r from-rose-500 via-sky-400 to-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.7)]" style={{ width: `${Math.max(20, snapshot.thermalHeadroom * 4)}%` }} />
        </div>
      </div>
    </section>
  );
}

function CoolingPanel({ cooling }) {
  return (
    <section className="glass-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="section-kicker">Cryogenic Loop</p>
          <h2 className="section-title">냉각 효율성</h2>
        </div>
        <Snowflake className="h-7 w-7 text-cyan-200" />
      </div>
      <div className="space-y-4">
        {cooling.map((item) => (
          <div className="cooling-card" key={item.zone}>
            <div className="flex items-center justify-between gap-2">
              <strong>{item.zone}</strong>
              <span className={`status-pill ${item.risk.toLowerCase()}`}>{item.risk}</span>
            </div>
            <div className="radial-gauge" style={{ '--value': `${item.efficiency}%` }}>
              <span>{item.efficiency}%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <span>Inlet {item.inletCelsius} C</span>
              <span>Pump {item.pumpRpm} RPM</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function QueueTelemetry({ queues }) {
  return (
    <section className="glass-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="section-kicker">Broker Backpressure</p>
          <h2 className="section-title">Kafka/RabbitMQ 렉 텔레메트리</h2>
        </div>
        <BellRing className="h-7 w-7 text-rose-300" />
      </div>
      <div className="space-y-3">
        {queues.map((queue) => {
          const ratio = Math.min(100, Math.round((queue.consumerRate / queue.producerRate) * 100));
          return (
            <div className="queue-row" key={`${queue.broker}-${queue.topic}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <strong>{queue.broker}</strong>
                  <p>{queue.topic}</p>
                </div>
                <span className={`status-pill ${queue.pressure.toLowerCase()}`}>{queue.pressure}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <span>Lag {queue.lag.toLocaleString()}</span>
                <span>In {queue.producerRate.toLocaleString()}/s</span>
                <span>Out {queue.consumerRate.toLocaleString()}/s</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded bg-slate-800">
                <div className="h-full bg-gradient-to-r from-rose-500 to-cyan-300" style={{ width: `${ratio}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LogTerminal({ logs }) {
  return (
    <section className="glass-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="section-kicker">Availability Stream</p>
          <h2 className="section-title">실시간 시스템 로그</h2>
        </div>
        <TerminalSquare className="h-7 w-7 text-cyan-200" />
      </div>
      <div className="terminal">
        {logs.slice(-12).map((log, index) => (
          <div className="terminal-line" key={`${log.timestamp}-${index}`}>
            <span>{formatTime(log.timestamp)}</span>
            <b className={log.level.toLowerCase()}>{log.level}</b>
            <i>{log.subsystem}</i>
            <p>{log.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FaultGrid({ faults = [] }) {
  const visible = faults.length ? faults : [
    { id: 1, name: 'Circuit breaker stuck closed', severity: 'CRITICAL', signal: 'Downstream 5xx burst' },
    { id: 2, name: 'Async queue lag saturation', severity: 'HIGH', signal: 'Kafka/RabbitMQ lag > 180k' },
    { id: 11, name: 'Distributed lock split brain', severity: 'CRITICAL', signal: 'Dual ownership' }
  ];
  return (
    <section className="glass-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="section-kicker">PPO Fault Curriculum</p>
          <h2 className="section-title">가용성 결함 패턴 11종</h2>
        </div>
        <LockKeyhole className="h-7 w-7 text-sky-300" />
      </div>
      <div className="fault-grid">
        {visible.map((fault) => (
          <article className="fault-card" key={fault.id}>
            <div className="flex items-start justify-between gap-3">
              <span className="fault-id">{String(fault.id).padStart(2, '0')}</span>
              <span className={`severity ${fault.severity.toLowerCase()}`}>{fault.severity}</span>
            </div>
            <h3>{fault.name}</h3>
            <p>{fault.signal}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AbyssBackground() {
  return (
    <div className="pointer-events-none fixed inset-0">
      <div className="abyss-gradient" />
      <div className="scanlines" />
      <div className="pressure-lines" />
    </div>
  );
}

function formatTime(value) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date(value));
}

createRoot(document.getElementById('root')).render(<App />);
