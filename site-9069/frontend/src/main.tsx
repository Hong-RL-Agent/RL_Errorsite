import React from 'react';
import ReactDOM from 'react-dom/client';
import { Activity, AlertTriangle, Gauge, Radar, RadioTower, Shield, TimerReset, Zap } from 'lucide-react';
import './styles.css';

type ZoneStatus = {
  name: string;
  status: string;
  replicationLagMs: number;
  packetLossPermille: number;
};

type ClockSkew = {
  az1Ms: number;
  az2Ms: number;
  az3Ms: number;
  orderingRisk: string;
};

type ThrottleGauge = {
  cpuPercent: number;
  networkPercent: number;
  apiBudgetPercent: number;
  syntheticLatencyMs: number;
};

type CctvFeed = {
  id: string;
  sector: string;
  signal: string;
  motionScore: number;
  anomaly: string;
};

type FaultScenario = {
  id: number;
  code: string;
  title: string;
  faultClass: string;
  symptom: string;
  learningSignal: string;
  severity: number;
  driftScore: number;
  latencyMs: number;
  active: boolean;
};

type TelemetrySnapshot = {
  system: string;
  timestamp: string;
  zones: ZoneStatus[];
  clockSkew: ClockSkew;
  throttle: ThrottleGauge;
  feeds: CctvFeed[];
  scenarios: FaultScenario[];
};

const fallback: TelemetrySnapshot = {
  system: 'EYE-SCAN',
  timestamp: new Date().toISOString(),
  zones: [
    { name: 'AZ-NEON-1', status: 'ACTIVE', replicationLagMs: 44, packetLossPermille: 2 },
    { name: 'AZ-THERMAL-2', status: 'DEGRADED', replicationLagMs: 420, packetLossPermille: 24 },
    { name: 'AZ-CYAN-3', status: 'WATCH', replicationLagMs: 132, packetLossPermille: 9 }
  ],
  clockSkew: { az1Ms: -22, az2Ms: 118, az3Ms: -91, orderingRisk: 'HIGH' },
  throttle: { cpuPercent: 68, networkPercent: 82, apiBudgetPercent: 47, syntheticLatencyMs: 520 },
  feeds: [
    { id: 'CAM-01', sector: 'North Gate', signal: 'NIGHTVISION', motionScore: 61, anomaly: 'latency shimmer' },
    { id: 'CAM-02', sector: 'Server Hall', signal: 'THERMAL', motionScore: 88, anomaly: 'hot cache line' },
    { id: 'CAM-03', sector: 'Fuel Yard', signal: 'CYAN-LIDAR', motionScore: 42, anomaly: 'packet ghosting' },
    { id: 'CAM-04', sector: 'Command Deck', signal: 'LOW-LUX', motionScore: 74, anomaly: 'clock reversal' }
  ],
  scenarios: []
};

function useTelemetry() {
  const [data, setData] = React.useState<TelemetrySnapshot>(fallback);
  const [apiState, setApiState] = React.useState<'linked' | 'degraded'>('degraded');

  React.useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const response = await fetch('/api/telemetry', { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`telemetry ${response.status}`);
        const next = (await response.json()) as TelemetrySnapshot;
        if (alive) {
          setData(next);
          setApiState('linked');
        }
      } catch {
        if (alive) {
          setData((current) => ({ ...current, timestamp: new Date().toISOString() }));
          setApiState('degraded');
        }
      }
    };

    load();
    const timer = window.setInterval(load, 2500);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  return { data, apiState };
}

function App() {
  const { data, apiState } = useTelemetry();
  const scenarios = data.scenarios.length ? data.scenarios : buildFallbackScenarios();
  const topRisk = scenarios.slice().sort((a, b) => b.driftScore - a.driftScore).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      <div className="scanlines" />
      <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-4 px-4 py-4 lg:h-screen lg:px-6">
        <Header apiState={apiState} timestamp={data.timestamp} />
        <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="grid min-h-0 grid-rows-[auto_1fr] gap-4">
            <StatusStrip zones={data.zones} />
            <CctvMatrix feeds={data.feeds} />
          </div>
          <aside className="grid min-h-0 grid-rows-[auto_auto_1fr] gap-4">
            <MetricsPanel clockSkew={data.clockSkew} throttle={data.throttle} />
            <RiskPanel scenarios={topRisk} />
            <ScenarioTable scenarios={scenarios} />
          </aside>
        </section>
      </div>
    </main>
  );
}

function Header({ apiState, timestamp }: { apiState: 'linked' | 'degraded'; timestamp: string }) {
  return (
    <header className="grid gap-4 border border-emerald-400/25 bg-slate-950/80 p-4 shadow-[0_0_40px_rgba(74,222,128,0.08)] md:grid-cols-[1fr_auto]">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center border border-emerald-300/60 bg-emerald-400/10 text-emerald-300">
          <Radar size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-normal text-emerald-300 md:text-4xl">EYE-SCAN</h1>
          <p className="text-sm font-semibold text-cyan-200/80">INTELLIGENT CCTV CONTROL SERVER · PORT 9069</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs font-bold sm:grid-cols-3">
        <Badge icon={<Shield size={16} />} label="API" value={apiState === 'linked' ? 'LINKED' : 'LOCAL DRIFT'} tone={apiState === 'linked' ? 'green' : 'pink'} />
        <Badge icon={<RadioTower size={16} />} label="ORIGIN" value="localhost:9069" tone="cyan" />
        <Badge icon={<TimerReset size={16} />} label="SYNC" value={new Date(timestamp).toLocaleTimeString('ko-KR', { hour12: false })} tone="green" />
      </div>
    </header>
  );
}

function Badge({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'green' | 'pink' | 'cyan' }) {
  const color = tone === 'pink' ? 'text-rose-300 border-rose-400/40 bg-rose-500/10' : tone === 'cyan' ? 'text-cyan-200 border-cyan-400/40 bg-cyan-500/10' : 'text-emerald-200 border-emerald-400/40 bg-emerald-500/10';
  return (
    <div className={`flex min-w-0 items-center gap-2 border px-3 py-2 ${color}`}>
      {icon}
      <div className="min-w-0">
        <div className="text-[10px] text-slate-400">{label}</div>
        <div className="truncate">{value}</div>
      </div>
    </div>
  );
}

function StatusStrip({ zones }: { zones: ZoneStatus[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {zones.map((zone) => (
        <div key={zone.name} className="border border-cyan-400/20 bg-slate-950/75 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-cyan-100">{zone.name}</span>
            <span className={zone.status === 'ACTIVE' ? 'text-emerald-300' : zone.status === 'DEGRADED' ? 'text-rose-300' : 'text-cyan-300'}>{zone.status}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-300">
            <Meter label="REPL LAG" value={Math.min(zone.replicationLagMs / 6, 100)} suffix={`${zone.replicationLagMs}ms`} tone="green" />
            <Meter label="LOSS" value={zone.packetLossPermille * 3} suffix={`${zone.packetLossPermille}‰`} tone="pink" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CctvMatrix({ feeds }: { feeds: CctvFeed[] }) {
  return (
    <div className="grid min-h-[520px] gap-4 md:grid-cols-2">
      {feeds.map((feed, index) => (
        <div key={feed.id} className="camera-feed relative overflow-hidden border border-emerald-400/25 bg-black">
          <div className={`thermal-layer thermal-${index}`} />
          <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 500 300" aria-hidden="true">
            <defs>
              <radialGradient id={`glow-${feed.id}`} cx="50%" cy="45%" r="60%">
                <stop offset="0%" stopColor={index === 1 ? '#F43F5E' : '#4ADE80'} stopOpacity="0.42" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="500" height="300" fill={`url(#glow-${feed.id})`} />
            <path className="sweep-path" d="M20 250 C130 120 210 220 300 90 S430 80 480 36" stroke={index === 2 ? '#06B6D4' : '#4ADE80'} strokeWidth="2" fill="none" />
            <circle className="target-pulse" cx={90 + index * 74} cy={95 + index * 28} r="18" fill="none" stroke="#F43F5E" strokeWidth="2" />
            <g stroke="#4ADE80" strokeOpacity="0.3" strokeWidth="1">
              {Array.from({ length: 9 }).map((_, line) => <path key={line} d={`M0 ${line * 36} H500`} />)}
              {Array.from({ length: 11 }).map((_, line) => <path key={line} d={`M${line * 50} 0 V300`} />)}
            </g>
          </svg>
          <div className="noise" />
          <div className="relative z-10 flex h-full min-h-[240px] flex-col justify-between p-4">
            <div className="flex items-start justify-between gap-3 text-xs font-bold">
              <div>
                <div className="text-emerald-300">{feed.id}</div>
                <div className="text-lg text-slate-100">{feed.sector}</div>
              </div>
              <span className="border border-cyan-300/40 bg-cyan-400/10 px-2 py-1 text-cyan-200">{feed.signal}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] items-end gap-4">
              <div>
                <div className="mb-2 text-xs font-bold text-slate-300">MOTION SCORE</div>
                <Meter label="" value={feed.motionScore} suffix={`${feed.motionScore}%`} tone={index === 1 ? 'pink' : 'green'} />
              </div>
              <div className="max-w-[160px] border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-right text-xs font-bold text-rose-200">
                {feed.anomaly}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricsPanel({ clockSkew, throttle }: { clockSkew: ClockSkew; throttle: ThrottleGauge }) {
  const skewValues = [clockSkew.az1Ms, clockSkew.az2Ms, clockSkew.az3Ms];
  return (
    <section className="border border-emerald-400/25 bg-slate-950/80 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-black text-emerald-200"><Gauge size={20} /> DRIFT INSTRUMENTS</h2>
        <span className="text-xs font-bold text-rose-300">ORDER RISK {clockSkew.orderingRisk}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-3 text-xs font-bold text-cyan-200">CLOCK SKEW VISUALIZER</div>
          <div className="space-y-3">
            {skewValues.map((value, index) => (
              <div key={index} className="grid grid-cols-[64px_1fr_58px] items-center gap-2 text-xs">
                <span>AZ-{index + 1}</span>
                <div className="relative h-2 bg-slate-800">
                  <span className="absolute left-1/2 top-[-4px] h-4 w-px bg-slate-500" />
                  <span className="absolute top-0 h-2 bg-cyan-300 shadow-[0_0_12px_#06B6D4]" style={{ left: `${Math.min(50, 50 + value / 4)}%`, width: `${Math.min(48, Math.abs(value) / 2)}%`, transform: value < 0 ? 'translateX(-100%)' : undefined }} />
                </div>
                <span className={value < 0 ? 'text-cyan-200' : 'text-rose-200'}>{value}ms</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          <Meter label="CPU THROTTLE" value={throttle.cpuPercent} suffix={`${throttle.cpuPercent}%`} tone="green" />
          <Meter label="NETWORK THROTTLE" value={throttle.networkPercent} suffix={`${throttle.networkPercent}%`} tone="cyan" />
          <Meter label="API BUDGET" value={throttle.apiBudgetPercent} suffix={`${throttle.apiBudgetPercent}%`} tone="pink" />
          <div className="border border-rose-400/30 bg-rose-500/10 p-3 text-sm font-bold text-rose-200">
            SYNTHETIC LATENCY {throttle.syntheticLatencyMs}ms
          </div>
        </div>
      </div>
    </section>
  );
}

function RiskPanel({ scenarios }: { scenarios: FaultScenario[] }) {
  return (
    <section className="border border-rose-400/25 bg-slate-950/80 p-4">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-rose-200"><AlertTriangle size={20} /> PPO TRAINING HOT ZONE</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="border border-slate-700 bg-black/40 p-3">
            <div className="mb-2 flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-cyan-200">{scenario.code}</span>
              <span className="text-rose-200">{scenario.driftScore}</span>
            </div>
            <div className="min-h-12 text-sm font-bold text-slate-100">{scenario.title}</div>
            <Meter label="DRIFT" value={scenario.driftScore} suffix={`${scenario.latencyMs}ms`} tone="pink" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ScenarioTable({ scenarios }: { scenarios: FaultScenario[] }) {
  return (
    <section className="min-h-0 overflow-hidden border border-cyan-400/20 bg-slate-950/80">
      <div className="flex items-center gap-2 border-b border-cyan-400/20 px-4 py-3 text-lg font-black text-cyan-100">
        <Activity size={20} /> REGRESSION FAULT CATALOG
      </div>
      <div className="max-h-[440px] overflow-auto">
        {scenarios.map((scenario) => (
          <article key={scenario.id} className="grid gap-2 border-b border-slate-800 px-4 py-3 text-sm hover:bg-emerald-400/5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-slate-100">{scenario.id}. {scenario.title}</h3>
              <span className="shrink-0 text-xs font-bold text-emerald-300">{scenario.faultClass}</span>
            </div>
            <p className="text-xs text-slate-300">{scenario.symptom}</p>
            <div className="flex items-center justify-between gap-3 text-xs text-cyan-200">
              <span>{scenario.learningSignal}</span>
              <span className="flex items-center gap-1 text-rose-200"><Zap size={12} /> S{scenario.severity}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Meter({ label, value, suffix, tone }: { label: string; value: number; suffix: string; tone: 'green' | 'pink' | 'cyan' }) {
  const color = tone === 'pink' ? 'bg-rose-400 shadow-[0_0_12px_#F43F5E]' : tone === 'cyan' ? 'bg-cyan-400 shadow-[0_0_12px_#06B6D4]' : 'bg-emerald-400 shadow-[0_0_12px_#4ADE80]';
  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-[10px] font-bold text-slate-400">
          <span>{label}</span>
          <span>{suffix}</span>
        </div>
      )}
      <div className="h-2 overflow-hidden bg-slate-800">
        <div className={`h-full ${color}`} style={{ width: `${Math.max(4, Math.min(value, 100))}%` }} />
      </div>
      {!label && <div className="mt-1 text-xs font-bold text-emerald-200">{suffix}</div>}
    </div>
  );
}

function buildFallbackScenarios(): FaultScenario[] {
  const titles = [
    '로그 로테이션 동기 I/O 블로킹',
    'AZ 복제 지연 데이터 증발',
    'Worker 락 드리프트',
    'IMDS v1/v2 인증 불일치',
    '지능형 스로틀링 지연 드리프트',
    '클록 스큐 이벤트 순서 역전',
    '로그 수집기 버퍼 오버플로우',
    '게이트웨이 헤더 변환 인증 유실',
    'Lambda 콜드 스타트 요동',
    '컨테이너 재사용 글로벌 상태 오염',
    '스팟 인스턴스 회수 상태 유실'
  ];

  return titles.map((title, index) => ({
    id: index + 1,
    code: `FAULT_${String(index + 1).padStart(2, '0')}`,
    title,
    faultClass: 'offline-fallback',
    symptom: 'API 연결 전 로컬 결함 카탈로그 표시',
    learningSignal: '상대 경로 API 복구 감지',
    severity: 70 + (index % 5) * 5,
    driftScore: 66 + (index % 6) * 5,
    latencyMs: 200 + index * 45,
    active: true
  }));
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

