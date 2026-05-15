import React from 'react';
import ReactDOM from 'react-dom/client';
import { Activity, Bell, Cpu, Gauge, HardDrive, ShieldAlert, Ticket, Zap } from 'lucide-react';
import './styles.css';

type Telemetry = { key: string; label: string; value: number; unit: string; limit: number; state: string };
type Scenario = { id: number; title: string; defectClass: string; signal: string; intensity: number; state: string };
type TicketRow = { id: string; robotCell: string; title: string; severity: string; status: string; ageMinutes: number; autoClosed: boolean };
type LatencyHop = { service: string; p50Ms: number; p95Ms: number; p99Ms: number };
type RobotJoint = { name: string; x: number; y: number; angleDeg: number; loadPct: number };
type PopupState = { type: string; title: string; message: string; pressureAction: string; countdownSec: number };
type BadgeState = { visibleCount: number; actualUnread: number; fakeBadge: boolean };
type Snapshot = {
  generatedAt: string;
  telemetry: Telemetry[];
  scenarios: Scenario[];
  tickets: TicketRow[];
  latencyChain: LatencyHop[];
  robotJoints: RobotJoint[];
  popup: PopupState;
  badge: BadgeState;
};

const stateClass = (state: string) => (state === 'critical' ? 'critical' : state === 'degraded' ? 'degraded' : 'stable');

function fallbackSnapshot(): Snapshot {
  return {
    generatedAt: new Date().toISOString(),
    telemetry: [
      { key: 'cpu', label: 'CPU 컨텍스트 스위치', value: 91, unit: '%', limit: 88, state: 'critical' },
      { key: 'gpu', label: 'GPU VRAM 파편화', value: 84, unit: '%', limit: 82, state: 'critical' },
      { key: 'disk', label: '로그 I/O IOPS', value: 10420, unit: 'iops', limit: 10000, state: 'critical' },
      { key: 'steal', label: '클라우드 Steal Time', value: 19, unit: '%', limit: 18, state: 'critical' },
    ],
    scenarios: [],
    tickets: [],
    latencyChain: [],
    robotJoints: [
      { name: 'base', x: 120, y: 210, angleDeg: 12, loadPct: 70 },
      { name: 'shoulder', x: 220, y: 150, angleDeg: -18, loadPct: 84 },
      { name: 'elbow', x: 330, y: 190, angleDeg: 34, loadPct: 78 },
      { name: 'wrist', x: 420, y: 132, angleDeg: -9, loadPct: 65 },
      { name: 'gripper', x: 490, y: 176, angleDeg: 4, loadPct: 51 },
    ],
    popup: {
      type: 'pay-to-skip',
      title: '로봇 큐 우선 처리',
      message: '연산 대기열이 길어졌습니다. 유료 우선권 CTA가 과도하게 노출됩니다.',
      pressureAction: '지금 대기열 건너뛰기',
      countdownSec: 17,
    },
    badge: { visibleCount: 7, actualUnread: 0, fakeBadge: true },
  };
}

function App() {
  const [snapshot, setSnapshot] = React.useState<Snapshot>(fallbackSnapshot());
  const [eventMessage, setEventMessage] = React.useState('PPO 학습 큐 대기 중');

  React.useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const response = await fetch('/api/lab/status');
        if (!response.ok) throw new Error(`status ${response.status}`);
        const data = (await response.json()) as Snapshot;
        if (alive) setSnapshot(data);
      } catch {
        if (alive) setSnapshot(fallbackSnapshot());
      }
    };
    load();
    const id = window.setInterval(load, 3000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  const triggerScenario = async (id: number) => {
    const response = await fetch(`/api/scenarios/${id}/trigger`, { method: 'POST' });
    const payload = await response.json();
    setEventMessage(payload.message ?? '결함 신호가 주입되었습니다.');
  };

  return (
    <main className="min-h-screen bg-[#1E293B] text-[#F8FAFC]">
      <div className="mx-auto flex max-w-[1540px] flex-col gap-4 px-4 py-4">
        <Header badge={snapshot.badge} generatedAt={snapshot.generatedAt} />
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.95fr_0.8fr]">
          <RobotTrajectory joints={snapshot.robotJoints} />
          <TelemetryPanel telemetry={snapshot.telemetry} />
          <DarkPatternPopup popup={snapshot.popup} />
        </section>
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <ScenarioBoard scenarios={snapshot.scenarios} onTrigger={triggerScenario} eventMessage={eventMessage} />
          <LatencyPanel hops={snapshot.latencyChain} />
        </section>
        <TicketBoard tickets={snapshot.tickets} />
      </div>
    </main>
  );
}

function Header({ badge, generatedAt }: { badge: BadgeState; generatedAt: string }) {
  return (
    <header className="flex flex-col gap-3 border border-slate-600 bg-slate-900/70 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">Robotics Operations Research</p>
        <h1 className="text-3xl font-black text-white md:text-4xl">ROBO-LAB</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
        <span className="panel-chip"><Activity size={16} /> localhost:9070</span>
        <span className="panel-chip"><Gauge size={16} /> {new Date(generatedAt).toLocaleTimeString('ko-KR')}</span>
        <span className={`panel-chip ${badge.fakeBadge ? 'ring-2 ring-red-800' : ''}`}>
          <Bell size={16} /> 표시 {badge.visibleCount} / 실제 {badge.actualUnread}
        </span>
      </div>
    </header>
  );
}

function RobotTrajectory({ joints }: { joints: RobotJoint[] }) {
  const points = joints.map((joint) => `${joint.x},${joint.y}`).join(' ');
  return (
    <section className="industrial-panel">
      <div className="panel-title"><Zap size={18} /> 실시간 로봇 팔 궤적</div>
      <svg viewBox="0 0 560 300" className="h-[360px] w-full">
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#334155" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="560" height="300" fill="url(#grid)" />
        <polyline points={points} fill="none" stroke="#F97316" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={points} fill="none" stroke="#F8FAFC" strokeWidth="2" strokeDasharray="8 8" />
        {joints.map((joint) => (
          <g key={joint.name}>
            <circle cx={joint.x} cy={joint.y} r="17" fill="#0f172a" stroke={joint.loadPct > 82 ? '#991B1B' : '#F97316'} strokeWidth="4" />
            <text x={joint.x} y={joint.y - 27} textAnchor="middle" className="fill-slate-100 text-[12px] font-bold">{joint.name}</text>
            <text x={joint.x} y={joint.y + 4} textAnchor="middle" className="fill-orange-300 text-[10px]">{Math.round(joint.loadPct)}%</text>
          </g>
        ))}
      </svg>
    </section>
  );
}

function TelemetryPanel({ telemetry }: { telemetry: Telemetry[] }) {
  const iconFor = (key: string) => key === 'gpu' ? <Cpu size={18} /> : key === 'disk' ? <HardDrive size={18} /> : <Gauge size={18} />;
  return (
    <section className="industrial-panel">
      <div className="panel-title"><Cpu size={18} /> GPU/CPU 자원 텔레메트리</div>
      <div className="space-y-3">
        {telemetry.map((item) => (
          <article className="metric-row" key={item.key}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 text-sm font-bold">{iconFor(item.key)}<span>{item.label}</span></div>
              <span className={`state-pill ${stateClass(item.state)}`}>{item.state}</span>
            </div>
            <div className="flex items-end justify-between">
              <strong className="text-2xl text-white">{Math.round(item.value)}<span className="text-sm text-slate-300"> {item.unit}</span></strong>
              <span className="text-xs text-slate-400">limit {Math.round(item.limit)} {item.unit}</span>
            </div>
            <div className="h-2 overflow-hidden bg-slate-700">
              <div className={`h-full ${item.state === 'critical' ? 'bg-red-800' : 'bg-orange-500'}`} style={{ width: `${Math.min(100, (item.value / item.limit) * 100)}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DarkPatternPopup({ popup }: { popup: PopupState }) {
  return (
    <section className="industrial-panel">
      <div className="panel-title"><ShieldAlert size={18} /> 다크 패턴 팝업 시뮬레이터</div>
      <div className="border-2 border-red-900 bg-slate-950 p-4 shadow-[0_0_0_4px_rgba(153,27,27,0.25)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="state-pill critical">{popup.type}</span>
          <span className="text-xs font-bold text-orange-300">T-{popup.countdownSec}s</span>
        </div>
        <h2 className="mb-2 text-xl font-black text-white">{popup.title}</h2>
        <p className="min-h-[72px] text-sm leading-6 text-slate-300">{popup.message}</p>
        <button className="mt-4 flex h-10 w-full items-center justify-center gap-2 bg-orange-500 px-3 text-sm font-black text-slate-950 hover:bg-orange-400">
          <Zap size={16} /> {popup.pressureAction}
        </button>
      </div>
    </section>
  );
}

function ScenarioBoard({ scenarios, onTrigger, eventMessage }: { scenarios: Scenario[]; onTrigger: (id: number) => void; eventMessage: string }) {
  return (
    <section className="industrial-panel">
      <div className="panel-title"><Bell size={18} /> 11개 병목 및 다크 패턴 결함 시나리오</div>
      <div className="mb-3 border border-orange-500/50 bg-orange-500/10 px-3 py-2 text-sm text-orange-100">{eventMessage}</div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {scenarios.map((scenario) => (
          <article key={scenario.id} className="scenario-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black text-orange-300">#{scenario.id.toString().padStart(2, '0')} {scenario.defectClass}</p>
                <h3 className="mt-1 text-sm font-black text-white">{scenario.title}</h3>
              </div>
              <button className="icon-button" onClick={() => onTrigger(scenario.id)} title="학습 큐 주입">
                <Zap size={16} />
              </button>
            </div>
            <p className="mt-2 min-h-[38px] text-xs leading-5 text-slate-300">{scenario.signal}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 bg-slate-700"><div className="h-full bg-orange-500" style={{ width: `${scenario.intensity * 100}%` }} /></div>
              <span className={`state-pill ${stateClass(scenario.state)}`}>{scenario.state}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function LatencyPanel({ hops }: { hops: LatencyHop[] }) {
  return (
    <section className="industrial-panel">
      <div className="panel-title"><Activity size={18} /> 테일 레이턴시 연쇄</div>
      <div className="space-y-3">
        {hops.map((hop) => (
          <div key={hop.service} className="metric-row">
            <div className="mb-2 flex items-center justify-between">
              <strong className="text-sm uppercase text-white">{hop.service}</strong>
              <span className="text-xs text-slate-400">p99 {hop.p99Ms}ms</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <LatencyBar label="p50" value={hop.p50Ms} max={950} />
              <LatencyBar label="p95" value={hop.p95Ms} max={950} />
              <LatencyBar label="p99" value={hop.p99Ms} max={950} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LatencyBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-slate-300"><span>{label}</span><span>{value}</span></div>
      <div className="h-2 bg-slate-700"><div className="h-full bg-red-800" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></div>
    </div>
  );
}

function TicketBoard({ tickets }: { tickets: TicketRow[] }) {
  return (
    <section className="industrial-panel">
      <div className="panel-title"><Ticket size={18} /> 서비스 티켓 현황판</div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-600 text-xs uppercase text-slate-400">
              <th className="px-3 py-2">Ticket</th>
              <th className="px-3 py-2">Cell</th>
              <th className="px-3 py-2">Issue</th>
              <th className="px-3 py-2">Severity</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Age</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className={`border-b border-slate-700 ${ticket.autoClosed ? 'bg-red-950/50' : ''}`}>
                <td className="px-3 py-3 font-black text-orange-300">{ticket.id}</td>
                <td className="px-3 py-3 text-white">{ticket.robotCell}</td>
                <td className="px-3 py-3 text-slate-200">{ticket.title}</td>
                <td className="px-3 py-3"><span className="state-pill critical">{ticket.severity}</span></td>
                <td className="px-3 py-3 text-slate-200">{ticket.status}{ticket.autoClosed ? ' / 결함' : ''}</td>
                <td className="px-3 py-3 text-slate-300">{ticket.ageMinutes}m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
