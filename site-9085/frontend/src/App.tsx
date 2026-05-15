import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Database,
  GitBranch,
  HardDrive,
  HeartPulse,
  Pill,
  RadioTower,
  RotateCcw,
  Server,
  Smartphone,
  WifiOff
} from 'lucide-react';
import { getJson } from './lib/api';
import {
  simulateIndexedDbLock,
  simulateOfflineSyncLoss,
  simulateQuotaFailure,
  simulateWorkerPressure
} from './lib/faultSimulators';

type VitalsResponse = {
  device: string;
  patient: string;
  serverClock: string;
  samples: { at: string; bpm: number; spo2: number; variability: number; status: string }[];
};

type DeploymentStatus = {
  strategy: string;
  activeVersion: string;
  candidateVersion: string;
  errorRate: number;
  risk: 'critical' | 'warning' | string;
  detail: string;
};

type DeploymentResponse = {
  bigBang: DeploymentStatus;
  canary: DeploymentStatus;
  blueGreen: DeploymentStatus;
};

type ClientPerformance = {
  domNodes: number;
  memoryMb: number;
  storagePressure: number;
  indexedDbLocks: number;
  workerMessagesPerSecond: number;
  lazyImageFailures: number;
};

const meds = [
  { name: 'Metformin XR', time: '07:30', status: '복용 완료', color: 'mint' },
  { name: 'Omega-3', time: '12:10', status: '예정', color: 'blue' },
  { name: 'Atorvastatin', time: '21:00', status: '주의 알림', color: 'pink' }
];

const incidentCards = [
  ['Rollback lock', '빅뱅 배포 후 이전 artifact가 덮여 복구 불가', RotateCcw],
  ['Canary false stop', '오류율 윈도우 오판으로 정상 릴리스 중단', GitBranch],
  ['Schema drift', 'Blue/Green 풀 간 복약 스키마 불일치', Database],
  ['Store evaporation', 'SPA 라우팅 후 전역 상태 소실', Smartphone],
  ['Offline loss', '온라인 복귀 시 오프라인 큐 삭제', WifiOff],
  ['SW refresh loop', '서비스 워커 갱신 루프 위험', RadioTower],
  ['Quota failure', '로컬 스토리지 포화로 저장 실패', HardDrive],
  ['IDB lock', '긴 트랜잭션으로 IndexedDB 잠금', Database],
  ['Worker pressure', '메시지 폭주로 UI 스레드 병목', Activity],
  ['DOM explosion', '무한 스크롤 DOM 노드 미정리', Server],
  ['Lazy image stall', '초기 렌더링 지연 및 이미지 미노출', AlertTriangle]
] as const;

export default function App() {
  const [vitals, setVitals] = useState<VitalsResponse | null>(null);
  const [deployments, setDeployments] = useState<DeploymentResponse | null>(null);
  const [client, setClient] = useState<ClientPerformance | null>(null);
  const [route, setRoute] = useState<'dashboard' | 'schedule' | 'deploy' | 'client'>('dashboard');
  const [volatileStore, setVolatileStore] = useState({ member: 'Ava Kim', adherence: 94 });
  const [feedSize, setFeedSize] = useState(36);
  const [lazyBroken, setLazyBroken] = useState(true);

  useEffect(() => {
    void Promise.all([
      getJson<VitalsResponse>('/api/vitals/stream').then(setVitals),
      getJson<DeploymentResponse>('/api/deployments/status').then(setDeployments),
      getJson<ClientPerformance>('/api/client/performance').then(setClient)
    ]);
    simulateOfflineSyncLoss();
  }, []);

  useEffect(() => {
    if (route !== 'schedule') {
      setVolatileStore({ member: '', adherence: 0 });
    }
  }, [route]);

  const wavePath = useMemo(() => {
    const samples = vitals?.samples ?? [];
    return samples.map((sample, index) => {
      const x = (index / Math.max(samples.length - 1, 1)) * 100;
      const y = 58 - (sample.bpm - 64) * 1.15;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${Math.max(12, Math.min(84, y)).toFixed(2)}`;
    }).join(' ');
  }, [vitals]);

  const deploymentList = deployments ? Object.values(deployments) : [];

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-[#0D9488] text-white">
              <Pill size={22} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-normal">HEALTH-PILL</h1>
              <p className="text-sm text-slate-500">Smart wearable and medication control plane</p>
            </div>
          </div>
          <nav className="hidden gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 md:flex">
            {[
              ['dashboard', '심박'],
              ['schedule', '복약'],
              ['deploy', '배포'],
              ['client', '클라이언트']
            ].map(([key, label]) => (
              <button
                key={key}
                className={`rounded-md px-4 py-2 text-sm font-medium ${route === key ? 'bg-white text-[#2563EB] shadow-sm' : 'text-slate-500'}`}
                onClick={() => setRoute(key as typeof route)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#0D9488]">Server-side live vitals</p>
              <h2 className="mt-1 text-3xl font-semibold">실시간 심박수 파동 대시보드</h2>
            </div>
            <div className="grid size-12 place-items-center rounded-lg bg-rose-50 text-[#F43F5E]">
              <HeartPulse />
            </div>
          </div>
          <div className="mt-6 h-72 rounded-lg border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4">
            <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="pulse" x1="0" x2="1">
                  <stop offset="0%" stopColor="#0D9488" />
                  <stop offset="55%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#F43F5E" />
                </linearGradient>
              </defs>
              {[20, 40, 60, 80].map((y) => (
                <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#E5E7EB" strokeWidth="0.4" />
              ))}
              <path d={wavePath} fill="none" stroke="url(#pulse)" strokeWidth="3.2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Metric label="BPM" value={vitals?.samples.at(-1)?.bpm ?? '--'} tone="mint" />
            <Metric label="SpO2" value={`${vitals?.samples.at(-1)?.spo2 ?? '--'}%`} tone="blue" />
            <Metric label="HRV" value={vitals?.samples.at(-1)?.variability ?? '--'} tone="pink" />
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#2563EB]">Personal medication scheduler</p>
          <h2 className="mt-1 text-2xl font-semibold">개인별 복약 스케줄러</h2>
          <div className="mt-5 space-y-3">
            {meds.map((med) => (
              <div key={med.name} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div>
                  <p className="font-semibold">{med.name}</p>
                  <p className="text-sm text-slate-500">{med.time}</p>
                </div>
                <span className={`rounded-md px-3 py-1 text-xs font-semibold ${badgeClass(med.color)}`}>{med.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg bg-[#0D9488] p-4 text-white">
            <p className="text-sm text-teal-50">Volatile SPA store</p>
            <p className="mt-1 text-2xl font-semibold">{volatileStore.member || '데이터 소실'}</p>
            <p className="text-sm text-teal-50">Adherence {volatileStore.adherence}%</p>
          </div>
        </aside>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#F43F5E]">Deployment monitor</p>
              <h2 className="mt-1 text-2xl font-semibold">Blue / Green / Canary 상태</h2>
            </div>
            <Server className="text-[#2563EB]" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {deploymentList.map((item) => (
              <article key={item.strategy} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{item.strategy}</p>
                <p className="mt-2 font-semibold">{item.activeVersion}</p>
                <p className="text-sm text-slate-500">candidate {item.candidateVersion}</p>
                <div className="mt-4 h-2 rounded-full bg-slate-200">
                  <div
                    className={`h-2 rounded-full ${item.risk === 'critical' ? 'bg-[#F43F5E]' : 'bg-[#2563EB]'}`}
                    style={{ width: `${Math.min(100, item.errorRate * 500)}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-5 text-slate-600">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#0D9488]">Client resource analyzer</p>
          <h2 className="mt-1 text-2xl font-semibold">DOM / Memory / Storage</h2>
          <div className="mt-5 space-y-4">
            <Resource label="DOM Nodes" value={client?.domNodes ?? 0} max={25000} />
            <Resource label="Memory MB" value={client?.memoryMb ?? 0} max={768} />
            <Resource label="Storage" value={Math.round((client?.storagePressure ?? 0) * 100)} max={100} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button className="control" onClick={simulateQuotaFailure}>Quota</button>
            <button className="control" onClick={simulateIndexedDbLock}>IDB Lock</button>
            <button className="control" onClick={simulateWorkerPressure}>Worker</button>
            <button className="control" onClick={() => setFeedSize(feedSize + 250)}>DOM +</button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {incidentCards.map(([title, description, Icon]) => (
            <article key={title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <Icon className="text-[#2563EB]" size={20} />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
            </article>
          ))}
        </div>
        <div className="mt-5 grid max-h-72 grid-cols-2 gap-2 overflow-auto rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-6">
          {Array.from({ length: feedSize }).map((_, index) => (
            <div key={index} className="h-12 rounded-md bg-slate-50 p-2 text-xs text-slate-500">
              patient-feed-{index + 1}
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <button className="control mb-3" onClick={() => setLazyBroken(!lazyBroken)}>Lazy image toggle</button>
          <img
            className="h-56 w-full rounded-lg object-cover"
            loading="lazy"
            src={lazyBroken ? '/images/missing-clinic-render.png' : 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80'}
            alt="HEALTH-PILL clinic monitoring"
          />
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone: 'mint' | 'blue' | 'pink' }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${tone === 'mint' ? 'text-[#0D9488]' : tone === 'blue' ? 'text-[#2563EB]' : 'text-[#F43F5E]'}`}>{value}</p>
    </div>
  );
}

function Resource({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-[#0D9488]" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}

function badgeClass(color: string) {
  if (color === 'mint') return 'bg-teal-50 text-[#0D9488]';
  if (color === 'blue') return 'bg-blue-50 text-[#2563EB]';
  return 'bg-rose-50 text-[#F43F5E]';
}
