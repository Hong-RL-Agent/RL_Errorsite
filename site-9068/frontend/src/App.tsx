import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Beaker,
  Cpu,
  Database,
  FlaskConical,
  GitBranch,
  Globe2,
  LockKeyhole,
  Network,
  RadioTower,
  ServerCog,
  TimerReset,
  Zap,
} from 'lucide-react';

type Candidate = {
  id: string;
  target: string;
  confidence: number;
  stage: string;
  risk: 'low' | 'medium' | 'high';
};

type Scenario = {
  id: string;
  title: string;
  severity: 'medium' | 'high' | 'critical';
};

type Dashboard = {
  platform: string;
  publicOrigin: string;
  generatedAt: string;
  candidates: Candidate[];
  worker: {
    bus: string;
    activePorts: number;
    leakedPorts: number;
    zombieSessions: number;
    signal: string;
  };
  infrastructure: {
    environment: string;
    apiRateLimitPerMinute: Record<string, number>;
    dnsTtlSeconds: Record<string, number>;
    dbPoolByInstance: Record<string, number>;
    tlsMinimum: string;
    loadBalancer: string;
    schedulerZone: string;
  };
  scenarios: Scenario[];
};

type WorkerState = {
  ports: number;
  leakedPorts: number;
  zombieSessions: number;
  sharedMemoryChecksum: number;
};

const fallbackDashboard: Dashboard = {
  platform: 'PHARMA-AI',
  publicOrigin: 'http://localhost:9068',
  generatedAt: new Date().toISOString(),
  candidates: [
    { id: 'PAI-1042', target: 'Kinase allosteric modulator', confidence: 0.94, stage: 'Phase 0 in-silico', risk: 'low' },
    { id: 'PAI-2188', target: 'GPCR inverse agonist', confidence: 0.88, stage: 'Docking queue', risk: 'medium' },
    { id: 'PAI-3301', target: 'Protease covalent probe', confidence: 0.81, stage: 'Toxicity review', risk: 'high' },
  ],
  worker: {
    bus: 'shared-worker://pharma-ai-session-bus',
    activePorts: 0,
    leakedPorts: 0,
    zombieSessions: 0,
    signal: 'Awaiting API telemetry.',
  },
  infrastructure: {
    environment: 'dev',
    apiRateLimitPerMinute: { dev: 240, prod: 60 },
    dnsTtlSeconds: { dev: 30, prod: 300 },
    dbPoolByInstance: { 'instance-a': 24, 'instance-b': 8 },
    tlsMinimum: 'TLSv1.3',
    loadBalancer: 'sticky-session=false',
    schedulerZone: 'Asia/Seoul',
  },
  scenarios: [],
};

const icons = [Cpu, Network, Zap, GitBranch, TimerReset, RadioTower, Globe2, Database, LockKeyhole, ServerCog, Activity];

function MolecularCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let raf = 0;
    let angle = 0;
    const nodes = [
      [-80, -44, -10],
      [0, -62, 34],
      [72, -24, -20],
      [-48, 36, 28],
      [42, 42, -36],
      [0, 80, 18],
    ];

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.scale(dpr, dpr);
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#042f2e';
      context.fillRect(0, 0, width, height);

      const projected = nodes.map(([x, y, z]) => {
        const rx = x * Math.cos(angle) - z * Math.sin(angle);
        const rz = x * Math.sin(angle) + z * Math.cos(angle);
        const scale = 1.2 + rz / 260;
        return [width / 2 + rx * scale, height / 2 + y * scale, scale] as const;
      });

      context.lineWidth = 2;
      projected.forEach((a, index) => {
        const b = projected[(index + 1) % projected.length];
        const gradient = context.createLinearGradient(a[0], a[1], b[0], b[1]);
        gradient.addColorStop(0, 'rgba(34, 211, 238, 0.18)');
        gradient.addColorStop(1, 'rgba(248, 250, 252, 0.72)');
        context.strokeStyle = gradient;
        context.beginPath();
        context.moveTo(a[0], a[1]);
        context.lineTo(b[0], b[1]);
        context.stroke();
      });

      projected.forEach(([x, y, scale], index) => {
        context.beginPath();
        context.shadowColor = index === 2 ? '#FB7185' : '#22D3EE';
        context.shadowBlur = 20;
        context.fillStyle = index === 2 ? '#FB7185' : '#F8FAFC';
        context.arc(x, y, 8 * scale, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
      });

      angle += 0.012;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="h-full min-h-[320px] w-full" aria-label="실시간 분자 구조 시뮬레이터" />;
}

function App() {
  const [dashboard, setDashboard] = useState<Dashboard>(fallbackDashboard);
  const [workerState, setWorkerState] = useState<WorkerState>({ ports: 0, leakedPorts: 0, zombieSessions: 0, sharedMemoryChecksum: 0 });

  useEffect(() => {
    fetch('/api/dashboard')
      .then((response) => response.json())
      .then(setDashboard)
      .catch(() => setDashboard(fallbackDashboard));
  }, []);

  useEffect(() => {
    if (!('SharedWorker' in window)) return;
    const worker = new SharedWorker(new URL('./workers/pharmaSharedWorker.ts', import.meta.url), { type: 'module', name: 'pharma-ai-session-bus' });
    worker.port.onmessage = ({ data }) => {
      if (data.type === 'worker-state') setWorkerState(data);
    };
    worker.port.start();
    worker.port.postMessage({ type: 'connect', sessionId: 'lab-session-alpha', mfe: 'candidate-analysis' });
    worker.port.postMessage({ type: 'heartbeat', sessionId: 'lab-session-alpha', candidateId: 'PAI-1042' });
    worker.port.postMessage({ type: 'switch-mfe', sessionId: 'lab-session-alpha', mfe: 'infra-telemetry' });
    worker.port.postMessage({ type: 'force-terminate', sessionId: 'lab-session-alpha' });
  }, []);

  const metrics = useMemo(
    () => [
      ['API Origin', dashboard.publicOrigin],
      ['Worker Bus', dashboard.worker.bus],
      ['TLS Floor', dashboard.infrastructure.tlsMinimum],
      ['Scheduler Zone', dashboard.infrastructure.schedulerZone],
    ],
    [dashboard],
  );

  return (
    <main className="min-h-screen bg-[#064E3B] text-slate-50">
      <section className="border-b border-cyan-200/15 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.22),transparent_28%),linear-gradient(135deg,#064E3B_0%,#042f2e_52%,#082f49_100%)]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex min-h-[540px] flex-col justify-between">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-md border border-cyan-200/30 bg-cyan-200/10">
                  <FlaskConical className="h-6 w-6 text-cyan-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-semibold tracking-normal text-white md:text-6xl">PHARMA-AI</h1>
                  <p className="mt-2 text-sm text-cyan-100/75">Smart Lab drug discovery and browser-infra fault simulator</p>
                </div>
              </div>
              <div className="hidden rounded-md border border-cyan-200/20 px-3 py-2 text-right text-xs text-cyan-100/80 md:block">
                <div>PUBLIC PORT</div>
                <div className="text-base font-semibold text-cyan-200">9068</div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border border-cyan-200/20 bg-emerald-950/45 shadow-2xl shadow-cyan-950/30">
              <MolecularCanvas />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border border-cyan-200/20 bg-white/[0.06] p-4 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Drug Candidates</h2>
                <Beaker className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="space-y-3">
                {dashboard.candidates.map((candidate) => (
                  <div key={candidate.id} className="rounded-md border border-cyan-100/10 bg-emerald-950/35 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-white">{candidate.id}</span>
                      <span className={candidate.risk === 'high' ? 'text-rose-300' : candidate.risk === 'medium' ? 'text-cyan-200' : 'text-emerald-200'}>
                        {Math.round(candidate.confidence * 100)}%
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-200/80">{candidate.target}</p>
                    <p className="mt-2 text-xs text-cyan-100/60">{candidate.stage}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-cyan-200/20 bg-white/[0.06] p-4 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Shared Worker Monitor</h2>
                <Cpu className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Metric label="Active Ports" value={String(workerState.ports || dashboard.worker.activePorts)} />
                <Metric label="Leaked Ports" value={String(workerState.leakedPorts || dashboard.worker.leakedPorts)} warn />
                <Metric label="Zombie Sessions" value={String(workerState.zombieSessions || dashboard.worker.zombieSessions)} warn />
                <Metric label="SAB Checksum" value={String(workerState.sharedMemoryChecksum)} />
              </div>
              <p className="mt-4 rounded-md border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">{dashboard.worker.signal}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[0.94fr_1.06fr]">
        <div className="rounded-lg border border-cyan-200/20 bg-teal-950/60 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Infrastructure Telemetry</h2>
            <ServerCog className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map(([label, value]) => (
              <Metric key={label} label={label} value={value} />
            ))}
            <Metric label="Rate Limit Dev/Prod" value={`${dashboard.infrastructure.apiRateLimitPerMinute.dev}/${dashboard.infrastructure.apiRateLimitPerMinute.prod}`} warn />
            <Metric label="DNS TTL Dev/Prod" value={`${dashboard.infrastructure.dnsTtlSeconds.dev}s/${dashboard.infrastructure.dnsTtlSeconds.prod}s`} warn />
            <Metric label="DB Pool A/B" value={`${dashboard.infrastructure.dbPoolByInstance['instance-a']}/${dashboard.infrastructure.dbPoolByInstance['instance-b']}`} warn />
            <Metric label="Load Balancer" value={dashboard.infrastructure.loadBalancer} warn />
          </div>
        </div>

        <div className="rounded-lg border border-cyan-200/20 bg-teal-950/60 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Regression Fault Matrix</h2>
            <AlertTriangle className="h-5 w-5 text-rose-300" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {dashboard.scenarios.map((scenario, index) => {
              const Icon = icons[index] ?? Activity;
              return (
                <div key={scenario.id} className="flex min-h-[92px] gap-3 rounded-md border border-cyan-100/10 bg-emerald-950/35 p-3">
                  <Icon className={scenario.severity === 'critical' ? 'h-5 w-5 shrink-0 text-rose-300' : 'h-5 w-5 shrink-0 text-cyan-300'} />
                  <div>
                    <div className="text-sm font-semibold text-white">{scenario.title}</div>
                    <div className="mt-2 text-xs uppercase tracking-normal text-cyan-100/60">{scenario.id}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="min-h-[76px] rounded-md border border-cyan-100/10 bg-emerald-950/40 p-3">
      <div className="text-xs text-cyan-100/60">{label}</div>
      <div className={warn ? 'mt-2 break-words text-lg font-semibold text-rose-200' : 'mt-2 break-words text-lg font-semibold text-slate-50'}>{value}</div>
    </div>
  );
}

export default App;
