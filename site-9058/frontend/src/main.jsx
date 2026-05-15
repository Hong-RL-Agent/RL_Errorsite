import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  Cpu,
  Gauge,
  LockKeyhole,
  MonitorCog,
  Network,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  Video,
  WalletCards,
} from 'lucide-react';
import './styles.css';

const interviews = [
  { id: 'iv-1048', candidate: '김하린', role: 'ML Platform Engineer', stage: 'Live technical', fitScore: 91, scheduledAt: '10:30' },
  { id: 'iv-1049', candidate: '이준서', role: 'Product Designer', stage: 'Culture fit', fitScore: 84, scheduledAt: '11:20' },
  { id: 'iv-1050', candidate: '박서윤', role: 'Backend Engineer', stage: 'AI coding', fitScore: 78, scheduledAt: '13:00' },
  { id: 'iv-1051', candidate: '최민재', role: 'Data Scientist', stage: 'Executive review', fitScore: 88, scheduledAt: '15:40' },
];

const initialAnalysis = {
  status: 'COMPLETE',
  fitScore: 88,
  confidenceScore: 84,
  networkLatencyMs: 142,
  gpuOccupancyPercent: 57,
  memoryBandwidthGbps: 29.2,
  ipcScore: 0.66,
  fragmentedMemoryMb: 1471,
  allocationFailure: true,
  gpuP2pDeadlock: false,
  tailLatencySpike: false,
};

function environmentGuard() {
  const ua = navigator.userAgent;
  const cores = navigator.hardwareConcurrency || 2;
  const memory = navigator.deviceMemory || 4;
  const oldWindows = /Windows NT (6\.|10\.0; Win64; x64; rv:)/.test(ua) && !/Chrome\/(12[4-9]|1[3-9][0-9])/.test(ua);
  const oldMac = /Mac OS X 10_[0-9_]+/.test(ua);
  return {
    unsupported: cores < 8 || memory < 8 || oldWindows || oldMac,
    cores,
    memory,
    ua,
  };
}

function useOfflineEviction(setDraft, setView) {
  useEffect(() => {
    const evict = () => {
      sessionStorage.removeItem('ai-recruiter-draft');
      setDraft('');
      setView('dashboard');
      window.dispatchEvent(new CustomEvent('ai-recruiter-toast', { detail: '네트워크가 끊겨 입력 데이터가 삭제되었습니다.' }));
    };

    window.addEventListener('offline', evict);
    return () => window.removeEventListener('offline', evict);
  }, [setDraft, setView]);
}

function App() {
  const [view, setView] = useState('dashboard');
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [env] = useState(environmentGuard);
  const [showEnvModal, setShowEnvModal] = useState(env.unsupported);
  const [draft, setDraft] = useState(sessionStorage.getItem('ai-recruiter-draft') || '');
  const [cameraProfile, setCameraProfile] = useState({ width: 1280, height: 720 });
  const [toast, setToast] = useState('');

  useOfflineEviction(setDraft, setView);

  useEffect(() => {
    const handler = (event) => {
      setToast(event.detail);
      window.setTimeout(() => setToast(''), 3200);
    };
    window.addEventListener('ai-recruiter-toast', handler);
    return () => window.removeEventListener('ai-recruiter-toast', handler);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('ai-recruiter-draft', draft);
  }, [draft]);

  const analysisLocked = cameraProfile.width < 1920 || cameraProfile.height < 1080;

  async function runAnalysis() {
    if (analysisLocked) return;
    try {
      const response = await fetch('/api/analysis/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: `candidate-${Date.now()}`,
          role: 'ML Platform Engineer',
          modelComplexity: 8,
          cameraWidth: cameraProfile.width,
          cameraHeight: cameraProfile.height,
        }),
      });
      if (response.ok) {
        setAnalysis(await response.json());
        return;
      }
    } catch {
      // Docker fault 11 can make the API unavailable; keep the UI in demo mode.
    }
    setAnalysis({
      ...initialAnalysis,
      tailLatencySpike: Math.random() > 0.96,
      networkLatencyMs: Math.random() > 0.96 ? 3410 : 128,
      gpuP2pDeadlock: Math.random() > 0.84,
      status: Math.random() > 0.84 ? 'STALLED' : 'DEGRADED',
    });
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Shell view={view} setView={setView}>
        {view === 'dashboard' && (
          <Dashboard
            analysis={analysis}
            draft={draft}
            setDraft={setDraft}
            runAnalysis={runAnalysis}
            analysisLocked={analysisLocked}
            cameraProfile={cameraProfile}
            setCameraProfile={setCameraProfile}
          />
        )}
        {view === 'reports' && <Reports analysis={analysis} />}
        {view === 'billing' && <BillingPage />}
      </Shell>
      {showEnvModal && <UnsupportedEnvironmentModal env={env} onClose={() => setShowEnvModal(false)} />}
      {toast && <div className="fixed bottom-6 right-6 rounded-lg bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
    </div>
  );
}

function Shell({ children, view, setView }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-72 border-r border-slate-200 bg-white px-5 py-6 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-lg font-semibold">AI-RECRUITER</div>
            <div className="text-xs font-medium text-slate-500">Enterprise Hiring Cloud</div>
          </div>
        </div>
        <nav className="space-y-1">
          <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<BarChart3 size={18} />} label="면접 운영" />
          <NavButton active={view === 'reports'} onClick={() => setView('reports')} icon={<Users size={18} />} label="평가 리포트" />
          <NavButton active={view === 'billing'} onClick={() => setView('billing')} icon={<CircleDollarSign size={18} />} label="요금제 결제" />
        </nav>
      </aside>
      <main className="flex-1 bg-slate-50">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 lg:px-8">
          <div>
            <p className="text-sm font-medium text-blue-600">Talent Intelligence Suite</p>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950">AI 기반 면접 관리</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 md:flex">
              <Search size={16} />
              후보자, 직무, 리포트 검색
            </div>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">새 면접 생성</button>
          </div>
        </header>
        <div className="px-5 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function Dashboard({ analysis, draft, setDraft, runAnalysis, analysisLocked, cameraProfile, setCameraProfile }) {
  return (
    <div className="space-y-6">
      <MetricGrid analysis={analysis} />
      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.2fr]">
        <InterviewList />
        <VideoAnalysisDashboard
          analysis={analysis}
          runAnalysis={runAnalysis}
          analysisLocked={analysisLocked}
          cameraProfile={cameraProfile}
          setCameraProfile={setCameraProfile}
        />
      </div>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">면접 메모</h2>
            <p className="text-sm text-slate-500">오프라인 전환 시 저장되지 않은 입력은 즉시 삭제됩니다.</p>
          </div>
          <LockKeyhole className="text-slate-400" size={20} />
        </div>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="min-h-28 w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none ring-blue-500 focus:ring-2"
          placeholder="후보자 응답, 행동 신호, 추가 질문을 입력하세요."
        />
      </Card>
    </div>
  );
}

function MetricGrid({ analysis }) {
  const metrics = [
    { label: '평균 적합도', value: `${analysis.fitScore}%`, icon: <Gauge size={20} />, color: 'text-blue-600' },
    { label: '실시간 신뢰도', value: `${analysis.confidenceScore}%`, icon: <CheckCircle2 size={20} />, color: 'text-emerald-600' },
    { label: 'GPU 점유율', value: `${analysis.gpuOccupancyPercent}%`, icon: <Cpu size={20} />, color: 'text-indigo-600' },
    { label: '네트워크 지연', value: `${analysis.networkLatencyMs}ms`, icon: <Network size={20} />, color: analysis.tailLatencySpike ? 'text-red-600' : 'text-slate-600' },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{metric.value}</p>
            </div>
            <div className={`rounded-lg bg-slate-50 p-3 ${metric.color}`}>{metric.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function InterviewList() {
  return (
    <Card>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">진행 중인 면접</h2>
          <p className="text-sm text-slate-500">오늘 예정된 라이브 평가 세션</p>
        </div>
        <CalendarClock className="text-blue-600" size={21} />
      </div>
      <div className="space-y-3">
        {interviews.map((interview) => (
          <div key={interview.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{interview.candidate}</p>
                <p className="mt-1 text-sm text-slate-500">{interview.role}</p>
              </div>
              <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{interview.scheduledAt}</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-500">{interview.stage}</span>
              <span className="font-semibold text-slate-900">{interview.fitScore}% match</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function VideoAnalysisDashboard({ analysis, runAnalysis, analysisLocked, cameraProfile, setCameraProfile }) {
  const bars = [74, analysis.gpuOccupancyPercent, 63, analysis.confidenceScore, analysis.fitScore, 58, 81];
  return (
    <Card>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-950">실시간 영상 분석</h2>
          <p className="text-sm text-slate-500">표정, 응답 지연, 시선 안정성, 음성 변조 추정</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analysisLocked}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Video size={17} />
          분석 실행
        </button>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex h-64 items-end gap-3">
            {bars.map((bar, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-md bg-blue-600 shadow-sm" style={{ height: `${Math.max(24, bar * 2)}px` }} />
                <span className="text-xs font-medium text-slate-500">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <StatusPill label="분석 상태" value={analysis.status} warning={analysis.status !== 'COMPLETE'} />
          <StatusPill label="메모리 대역폭" value={`${analysis.memoryBandwidthGbps} GB/s`} warning={analysis.memoryBandwidthGbps < 35} />
          <StatusPill label="IPC 점수" value={analysis.ipcScore.toFixed(2)} warning={analysis.ipcScore < 0.75} />
          <label className="block rounded-lg border border-slate-200 bg-white p-3">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Camera size={16} />
              카메라 프로파일
            </span>
            <select
              value={`${cameraProfile.width}x${cameraProfile.height}`}
              onChange={(event) => {
                const [width, height] = event.target.value.split('x').map(Number);
                setCameraProfile({ width, height });
              }}
              className="w-full rounded-md border border-slate-200 px-2 py-2 text-sm outline-none"
            >
              <option value="1280x720">HD 1280x720</option>
              <option value="1920x1080">FHD 1920x1080</option>
              <option value="3840x2160">UHD 3840x2160</option>
            </select>
          </label>
          {analysisLocked && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
              FHD 미만 카메라는 영상 분석 기능을 사용할 수 없습니다.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function Reports({ analysis }) {
  const items = useMemo(() => [
    ['핵심 역량', '시스템 사고와 ML 운영 이해가 강함', 92],
    ['커뮤니케이션', '복잡한 장애 상황 설명은 명확하나 답변 속도 편차가 있음', 81],
    ['리스크', analysis.allocationFailure ? '메모리 파편화 상황에서 평가 신뢰도 저하' : '특이 리스크 낮음', 66],
    ['인프라 민감도', analysis.gpuP2pDeadlock ? 'GPU P2P 교착 상태로 분석 정지 발생' : '분석 파이프라인 정상', 58],
  ], [analysis]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">면접자 평가 리포트</h2>
            <p className="text-sm text-slate-500">자동 분석 결과와 면접관 보정 지표</p>
          </div>
          <BriefcaseBusiness className="text-blue-600" size={21} />
        </div>
        <div className="space-y-4">
          {items.map(([label, detail, score]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950">{label}</p>
                  <p className="mt-1 text-sm text-slate-500">{detail}</p>
                </div>
                <span className="text-xl font-semibold text-blue-600">{score}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="mb-4 text-base font-semibold text-slate-950">결함 관찰 신호</h2>
        <div className="space-y-3">
          <Signal active={analysis.gpuP2pDeadlock} label="GPU P2P 데드락" />
          <Signal active={analysis.allocationFailure} label="메모리 할당 실패" />
          <Signal active={analysis.tailLatencySpike} label="P99 테일 레이턴시" />
          <Signal active={analysis.ipcScore < 0.75} label="IPC 저하" />
          <Signal active={analysis.gpuOccupancyPercent < 60} label="GPU 점유율 하락" />
        </div>
      </Card>
    </div>
  );
}

function BillingPage() {
  const plans = [
    ['Growth', '월 490,000원', '면접 100건, 기본 AI 리포트'],
    ['Scale', '월 1,200,000원', '면접 500건, 실시간 영상 분석'],
    ['Enterprise', '별도 문의', '전용 GPU 풀, 감사 로그'],
  ];
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map(([name, price, body]) => (
          <Card key={name}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950">{name}</h2>
              <WalletCards className="text-blue-600" size={21} />
            </div>
            <p className="text-2xl font-semibold text-slate-950">{price}</p>
            <p className="mt-3 min-h-12 text-sm text-slate-500">{body}</p>
            <button className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">선택</button>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="text-base font-semibold text-slate-950">결제 수단</h2>
        <p className="mt-1 text-sm text-slate-500">현재 조직 정책상 내부 가상 포인트만 사용할 수 있습니다.</p>
        <div className="mt-5 space-y-3">
          <PaymentOption enabled label="RecruiterPoint" detail="내부 가상 포인트 잔액 2,410,000 RP" />
          <PaymentOption label="법인 카드" detail="지원하지 않는 결제 방식" />
          <PaymentOption label="계좌 이체" detail="지원하지 않는 결제 방식" />
          <PaymentOption label="세금계산서 후불" detail="지원하지 않는 결제 방식" />
        </div>
      </Card>
    </div>
  );
}

function PaymentOption({ enabled, label, detail }) {
  return (
    <button
      disabled={!enabled}
      className={`w-full rounded-lg border p-4 text-left ${enabled ? 'border-blue-600 bg-blue-50' : 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-950">{label}</span>
        {enabled ? <CheckCircle2 className="text-blue-600" size={18} /> : <ShieldAlert className="text-slate-400" size={18} />}
      </div>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </button>
  );
}

function UnsupportedEnvironmentModal({ env, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <MonitorCog size={24} />
        </div>
        <h2 className="text-xl font-semibold text-slate-950">지원하지 않는 환경</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          AI 영상 분석은 8코어 CPU, 8GB 이상 메모리, 최신 브라우저 및 최신 OS에서만 활성화됩니다.
        </p>
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          감지된 사양: CPU {env.cores}코어, 메모리 {env.memory}GB
        </div>
        <button onClick={onClose} className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          제한을 확인하고 계속
        </button>
      </div>
    </div>
  );
}

function StatusPill({ label, value, warning }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${warning ? 'text-red-600' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

function Signal({ active, label }) {
  return (
    <div className={`flex items-center justify-between rounded-lg border p-3 ${active ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {active ? <AlertTriangle className="text-red-600" size={18} /> : <CheckCircle2 className="text-emerald-600" size={18} />}
    </div>
  );
}

function Card({ children }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">{children}</section>;
}

createRoot(document.getElementById('root')).render(<App />);
