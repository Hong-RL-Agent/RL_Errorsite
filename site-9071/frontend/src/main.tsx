import React from 'react';
import ReactDOM from 'react-dom/client';
import { Activity, BrainCircuit, Cpu, Dumbbell, Gauge, HeartPulse, RadioTower, ShieldAlert, Zap } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './styles.css';

type ScenarioStatus = {
  id: number;
  code: string;
  title: string;
  subsystem: string;
  severity: string;
  risk: number;
  latencyMs: number;
  packetLoss: number;
  symptom: string;
  ppoSignal: string;
  active: boolean;
};

type MotionJoint = {
  joint: string;
  x: number;
  y: number;
  z: number;
  confidence: number;
};

type TimePoint = {
  t: string;
  value: number;
};

type Snapshot = {
  generatedAt: string;
  cluster: string;
  port: string;
  fitness: {
    activeUsers: number;
    heartRateBpm: number;
    caloriesPerHour: number;
    motionSync: number;
    sensorThroughput: number;
    droppedSensorFrames: number;
  };
  kernel: {
    cpuSteal: number;
    vmExitRate: number;
    memoryPressure: number;
    schedulerDelayMs: number;
    zombieSessionMb: number;
    quotaBlockedSessions: number;
    state: string;
  };
  ai: {
    poseLatencyMs: number;
    inferenceQueueDepth: number;
    circuitBreakerFallbackRate: number;
    threadLocalBleedRisk: number;
    timezoneDrift: string;
    confidence: number;
  };
  skeleton: MotionJoint[];
  heartRateSeries: TimePoint[];
  calorieSeries: TimePoint[];
  scenarios: ScenarioStatus[];
};

const fallbackSnapshot: Snapshot = {
  generatedAt: new Date().toISOString(),
  cluster: 'vrfit-kernel-lab-9071',
  port: '9071',
  fitness: {
    activeUsers: 1842,
    heartRateBpm: 148,
    caloriesPerHour: 846,
    motionSync: 96.2,
    sensorThroughput: 88.4,
    droppedSensorFrames: 4.8,
  },
  kernel: {
    cpuSteal: 31.4,
    vmExitRate: 17840,
    memoryPressure: 73.5,
    schedulerDelayMs: 86.2,
    zombieSessionMb: 5210,
    quotaBlockedSessions: 19,
    state: 'degraded',
  },
  ai: {
    poseLatencyMs: 143.2,
    inferenceQueueDepth: 21.5,
    circuitBreakerFallbackRate: 13.8,
    threadLocalBleedRisk: 15.2,
    timezoneDrift: 'KST edge + UTC core drift: +380ms',
    confidence: 89.6,
  },
  skeleton: [
    { joint: 'head', x: 50, y: 13, z: 0.4, confidence: 98 },
    { joint: 'neck', x: 50, y: 25, z: 0.3, confidence: 98 },
    { joint: 'leftShoulder', x: 36, y: 31, z: 0.2, confidence: 96 },
    { joint: 'rightShoulder', x: 64, y: 31, z: 0.2, confidence: 96 },
    { joint: 'leftElbow', x: 25, y: 46, z: 0.1, confidence: 94 },
    { joint: 'rightElbow', x: 75, y: 44, z: 0.1, confidence: 94 },
    { joint: 'leftWrist', x: 18, y: 62, z: -0.1, confidence: 93 },
    { joint: 'rightWrist', x: 82, y: 58, z: -0.1, confidence: 93 },
    { joint: 'core', x: 50, y: 50, z: 0.1, confidence: 97 },
    { joint: 'leftKnee', x: 39, y: 74, z: -0.2, confidence: 95 },
    { joint: 'rightKnee', x: 61, y: 74, z: -0.2, confidence: 95 },
    { joint: 'leftAnkle', x: 34, y: 91, z: -0.3, confidence: 92 },
    { joint: 'rightAnkle', x: 66, y: 91, z: -0.3, confidence: 92 },
  ],
  heartRateSeries: [],
  calorieSeries: [],
  scenarios: [],
};

const bones = [
  ['head', 'neck'],
  ['neck', 'leftShoulder'],
  ['neck', 'rightShoulder'],
  ['leftShoulder', 'leftElbow'],
  ['rightShoulder', 'rightElbow'],
  ['leftElbow', 'leftWrist'],
  ['rightElbow', 'rightWrist'],
  ['neck', 'core'],
  ['core', 'leftKnee'],
  ['core', 'rightKnee'],
  ['leftKnee', 'leftAnkle'],
  ['rightKnee', 'rightAnkle'],
];

function useTelemetry() {
  const [snapshot, setSnapshot] = React.useState<Snapshot>(fallbackSnapshot);
  const [online, setOnline] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await fetch('/api/telemetry');
        if (!response.ok) {
          throw new Error(`Telemetry failed: ${response.status}`);
        }
        const data = (await response.json()) as Snapshot;
        if (mounted) {
          setSnapshot(data);
          setOnline(true);
        }
      } catch {
        if (mounted) {
          setOnline(false);
          setSnapshot((previous) => ({
            ...previous,
            generatedAt: new Date().toISOString(),
          }));
        }
      }
    }

    load();
    const timer = window.setInterval(load, 2600);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  return { snapshot, online };
}

function StatCard({
  icon,
  label,
  value,
  unit,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  tone: 'violet' | 'lime' | 'cyan' | 'red';
}) {
  return (
    <section className={`stat-card ${tone}`}>
      <div className="stat-icon">{icon}</div>
      <p>{label}</p>
      <strong>
        {value}
        <span>{unit}</span>
      </strong>
    </section>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="metric-bar">
      <div>
        <span>{label}</span>
        <strong>{value.toFixed(1)}%</strong>
      </div>
      <div className="rail">
        <i style={{ width: `${Math.max(4, Math.min(100, value))}%`, background: color }} />
      </div>
    </div>
  );
}

function SkeletonView({ joints }: { joints: MotionJoint[] }) {
  const jointMap = new Map(joints.map((joint) => [joint.joint, joint]));

  return (
    <section className="panel skeleton-panel">
      <header className="panel-title">
        <div>
          <span>REALTIME MOTION TRACKING</span>
          <h2>Skeleton View</h2>
        </div>
        <Activity size={22} />
      </header>
      <svg className="skeleton" viewBox="0 0 100 100" role="img" aria-label="VR-FIT skeleton tracking view">
        <defs>
          <filter id="neon">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {bones.map(([from, to]) => {
          const a = jointMap.get(from);
          const b = jointMap.get(to);
          if (!a || !b) return null;
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className="bone"
              filter="url(#neon)"
            />
          );
        })}
        {joints.map((joint) => (
          <circle
            key={joint.joint}
            cx={joint.x}
            cy={joint.y}
            r={joint.joint === 'core' ? 2.5 : 1.9}
            className="joint"
            filter="url(#neon)"
          />
        ))}
      </svg>
      <div className="motion-grid">
        <MetricBar label="Motion Sync" value={fallbackClamp(joints.reduce((sum, j) => sum + j.confidence, 0) / joints.length)} color="linear-gradient(90deg,#06B6D4,#BEF264)" />
        <MetricBar label="Pose Confidence" value={fallbackClamp(Math.max(...joints.map((j) => j.confidence)))} color="linear-gradient(90deg,#8B5CF6,#06B6D4)" />
      </div>
    </section>
  );
}

function TelemetryChart({
  title,
  data,
  color,
  unit,
}: {
  title: string;
  data: TimePoint[];
  color: string;
  unit: string;
}) {
  const chartId = React.useId().replace(/:/g, '');
  const safeData = data.length
    ? data
    : Array.from({ length: 12 }, (_, index) => ({
        t: `${index}`,
        value: title.includes('Heart') ? 138 + Math.sin(index) * 12 : 710 + Math.cos(index) * 80,
      }));

  return (
    <section className="panel chart-panel">
      <header className="panel-title compact">
        <h2>{title}</h2>
        <span>{unit}</span>
      </header>
      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={safeData} margin={{ top: 12, right: 8, bottom: 0, left: -24 }}>
          <defs>
            <linearGradient id={`fill-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.85} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,.12)" vertical={false} />
          <XAxis dataKey="t" stroke="#64748b" tick={{ fontSize: 11 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#020617', border: '1px solid rgba(139,92,246,.45)', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={3} fill={`url(#fill-${chartId})`} />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}

function ScenarioList({ scenarios }: { scenarios: ScenarioStatus[] }) {
  const data = scenarios.length ? scenarios : [
    {
      id: 10,
      code: 'POSE_LATENCY_OVER',
      title: 'AI pose latency exceeds motion budget',
      subsystem: 'ai/inference',
      severity: 'critical',
      risk: 0.88,
      latencyMs: 520,
      packetLoss: 3.3,
      symptom: '포즈 추론이 임계치를 넘겨 동작 피드백이 뒤늦게 표시됨',
      ppoSignal: 'control_lag',
      active: true,
    },
  ];

  return (
    <section className="panel scenario-panel">
      <header className="panel-title">
        <div>
          <span>PPO REGRESSION MATRIX</span>
          <h2>Kernel & Virtualization Faults</h2>
        </div>
        <ShieldAlert size={22} />
      </header>
      <div className="scenario-list">
        {data.map((scenario) => (
          <article key={scenario.code} className={`scenario ${scenario.severity}`}>
            <div className="scenario-top">
              <strong>{String(scenario.id).padStart(2, '0')} / {scenario.code}</strong>
              <span>{Math.round(scenario.risk * 100)}%</span>
            </div>
            <h3>{scenario.title}</h3>
            <p>{scenario.symptom}</p>
            <div className="scenario-meta">
              <span>{scenario.subsystem}</span>
              <span>{scenario.latencyMs.toFixed(0)} ms</span>
              <span>{scenario.ppoSignal}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function fallbackClamp(value: number) {
  return Math.max(0, Math.min(100, value || 0));
}

function App() {
  const { snapshot, online } = useTelemetry();
  const generated = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(snapshot.generatedAt));

  return (
    <main className="app-shell">
      <section className="hero-band">
        <div>
          <span className="eyebrow">VR-FIT // PORT {snapshot.port}</span>
          <h1>Neon Active Kernel Command</h1>
          <p>
            실시간 운동 몰입도, AI 포즈 추론 지연, VM Exit 폭주, 커널 락업 리스크를 하나의 운영 화면에서 추적합니다.
          </p>
        </div>
        <div className="status-pill">
          <RadioTower size={18} />
          <span>{online ? 'LIVE API /api/telemetry' : 'LOCAL FALLBACK'}</span>
        </div>
      </section>

      <section className="top-grid">
        <StatCard icon={<HeartPulse size={24} />} label="Heart Rate" value={snapshot.fitness.heartRateBpm.toFixed(0)} unit="bpm" tone="violet" />
        <StatCard icon={<Dumbbell size={24} />} label="Calorie Burn" value={snapshot.fitness.caloriesPerHour.toFixed(0)} unit="kcal/h" tone="lime" />
        <StatCard icon={<Cpu size={24} />} label="VM Exit Rate" value={(snapshot.kernel.vmExitRate / 1000).toFixed(1)} unit="k/s" tone="cyan" />
        <StatCard icon={<BrainCircuit size={24} />} label="Pose Latency" value={snapshot.ai.poseLatencyMs.toFixed(0)} unit="ms" tone="red" />
      </section>

      <section className="dashboard-grid">
        <SkeletonView joints={snapshot.skeleton} />
        <div className="chart-stack">
          <TelemetryChart title="Heart Rate Stream" data={snapshot.heartRateSeries} color="#8B5CF6" unit="bpm" />
          <TelemetryChart title="Calories Output" data={snapshot.calorieSeries} color="#BEF264" unit="kcal/h" />
        </div>
        <section className="panel telemetry-panel">
          <header className="panel-title">
            <div>
              <span>LOW LEVEL TELEMETRY</span>
              <h2>Kernel / AI Control Plane</h2>
            </div>
            <Gauge size={22} />
          </header>
          <MetricBar label="CPU Steal" value={snapshot.kernel.cpuSteal} color="linear-gradient(90deg,#06B6D4,#8B5CF6)" />
          <MetricBar label="Memory Pressure" value={snapshot.kernel.memoryPressure} color="linear-gradient(90deg,#8B5CF6,#ef4444)" />
          <MetricBar label="Sensor Throughput" value={snapshot.fitness.sensorThroughput} color="linear-gradient(90deg,#BEF264,#06B6D4)" />
          <MetricBar label="Circuit Breaker Fallback" value={snapshot.ai.circuitBreakerFallbackRate} color="linear-gradient(90deg,#f97316,#ef4444)" />
          <div className="telemetry-readouts">
            <div><span>Scheduler Delay</span><strong>{snapshot.kernel.schedulerDelayMs.toFixed(1)} ms</strong></div>
            <div><span>Zombie Memory</span><strong>{snapshot.kernel.zombieSessionMb.toFixed(0)} MB</strong></div>
            <div><span>Quota Blocks</span><strong>{snapshot.kernel.quotaBlockedSessions}</strong></div>
            <div><span>Timezone Drift</span><strong>{snapshot.ai.timezoneDrift}</strong></div>
          </div>
        </section>
        <ScenarioList scenarios={snapshot.scenarios} />
      </section>

      <footer>
        <Zap size={16} />
        <span>{snapshot.cluster} updated {generated} via http://localhost:9071</span>
      </footer>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
