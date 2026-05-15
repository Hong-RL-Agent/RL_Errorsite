import React from 'react';
import ReactDOM from 'react-dom/client';
import { Activity, AlertTriangle, CheckCircle2, Cpu, Fingerprint, Gauge, LockKeyhole, RefreshCcw, ShieldCheck, WalletCards } from 'lucide-react';
import './styles.css';

type DefectScenario = {
  id: number;
  title: string;
  phase: string;
  severity: 'critical' | 'high' | 'medium' | string;
  signal: string;
  antiPattern: string;
  progress: number;
  active: boolean;
};

type InventoryItem = {
  asset: string;
  version: string;
  trust: string;
  region: string;
  drift: string;
};

type InstallStage = {
  name: string;
  progress: number;
  state: string;
  note: string;
};

type DashboardSnapshot = {
  generatedAt: string;
  biometricSuccessRate: number;
  paymentApprovalRate: number;
  activeDevices: number;
  quarantinedNodes: number;
  transactionSeries: number[];
  inventory: InventoryItem[];
  installStages: InstallStage[];
  defects: DefectScenario[];
};

const fallback: DashboardSnapshot = {
  generatedAt: new Date().toISOString(),
  biometricSuccessRate: 98.73,
  paymentApprovalRate: 96.41,
  activeDevices: 18420,
  quarantinedNodes: 17,
  transactionSeries: [91, 93, 94, 92, 96, 97, 95, 98, 97, 99, 98, 97],
  inventory: [
    { asset: 'Palm vein verifier', version: '7.14.2', trust: 'verified', region: 'ap-northeast', drift: '+0.2%' },
    { asset: 'Face liveness model', version: '9.8.0', trust: 'watch', region: 'us-east', drift: '+3.7%' },
    { asset: 'Secure enclave bridge', version: '3.6.9', trust: 'quarantine', region: 'us-west', drift: '+8.4%' }
  ],
  installStages: [
    { name: 'Manifest pinning', progress: 100, state: 'sealed', note: 'root digest fixed to BIO-PAY release channel' },
    { name: 'Delta payload verify', progress: 72, state: 'degraded', note: 'checksum retry storm detected' },
    { name: 'Rollback checkpoint', progress: 35, state: 'blocked', note: 'previous slot metadata missing' }
  ],
  defects: []
};

function useDashboard() {
  const [data, setData] = React.useState<DashboardSnapshot>(fallback);
  const [status, setStatus] = React.useState<'live' | 'fallback'>('fallback');

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await fetch('/api/dashboard', { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`BIO-PAY API ${response.status}`);
        const payload = (await response.json()) as DashboardSnapshot;
        if (mounted) {
          setData(payload);
          setStatus('live');
        }
      } catch {
        if (mounted) setStatus('fallback');
      }
    };

    load();
    const timer = window.setInterval(load, 15000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  return { data, status };
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div>
        <p className="metric-label">{label}</p>
        <p className="metric-value">{value}</p>
      </div>
    </div>
  );
}

function BiometricScanner() {
  return (
    <section className="scanner-panel">
      <div className="scanner-copy">
        <p className="eyebrow">BIO-PAY IDENTITY MESH</p>
        <h1>생체 인증 결제 관리 대시보드</h1>
        <p>얼굴 생존성, 지문 토큰, 결제 승인 상태를 하나의 보안 콘솔에서 실시간으로 관측합니다.</p>
      </div>
      <div className="scanner-stage" aria-label="실시간 생체 스캔 애니메이션">
        <div className="face-frame">
          <div className="face-grid" />
          <div className="scan-line" />
          <div className="face-outline">
            <span className="eye left" />
            <span className="eye right" />
            <span className="mouth" />
          </div>
        </div>
        <div className="fingerprint-orbit">
          <Fingerprint size={76} strokeWidth={1.4} />
        </div>
      </div>
    </section>
  );
}

function TransactionChart({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = 100 - (value / max) * 88;
    return `${x},${y}`;
  }).join(' ');

  return (
    <section className="panel chart-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">TRANSACTION SUCCESS</p>
          <h2>승인 성공률 추이</h2>
        </div>
        <Gauge className="text-cyan-300" />
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart">
        <defs>
          <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.36" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={points} fill="none" stroke="#22D3EE" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
        <polygon points={`0,100 ${points} 100,100`} fill="url(#chartFill)" />
      </svg>
      <div className="chart-axis">
        <span>12분 전</span>
        <span>현재</span>
      </div>
    </section>
  );
}

function InstallProgress({ stages }: { stages: InstallStage[] }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">INSTALL & UPDATE</p>
          <h2>설치 및 업데이트 상태</h2>
        </div>
        <RefreshCcw className="text-amber-400" />
      </div>
      <div className="stage-list">
        {stages.map((stage) => (
          <div className="stage-row" key={stage.name}>
            <div className="stage-meta">
              <strong>{stage.name}</strong>
              <span>{stage.state}</span>
            </div>
            <div className="progress-shell">
              <div className={`progress-fill ${stage.state === 'blocked' ? 'danger' : stage.state === 'degraded' ? 'warn' : ''}`} style={{ width: `${stage.progress}%` }} />
            </div>
            <p>{stage.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Inventory({ items }: { items: InventoryItem[] }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">SECURITY INVENTORY</p>
          <h2>보안 인벤토리</h2>
        </div>
        <Cpu className="text-cyan-300" />
      </div>
      <div className="inventory-table">
        {items.map((item) => (
          <div className="inventory-row" key={item.asset}>
            <div>
              <strong>{item.asset}</strong>
              <span>{item.region}</span>
            </div>
            <span>{item.version}</span>
            <span className={`trust ${item.trust}`}>{item.trust}</span>
            <span>{item.drift}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DefectList({ defects }: { defects: DefectScenario[] }) {
  return (
    <section className="panel defect-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">REGRESSION LAB</p>
          <h2>설치 및 업데이트 결함 시뮬레이션</h2>
        </div>
        <AlertTriangle className="text-red-400" />
      </div>
      <div className="defect-grid">
        {defects.map((defect) => (
          <article className="defect-card" key={defect.id}>
            <div className="defect-topline">
              <span>#{defect.id.toString().padStart(2, '0')}</span>
              <span className={`severity ${defect.severity}`}>{defect.severity}</span>
            </div>
            <h3>{defect.title}</h3>
            <p>{defect.signal}</p>
            <div className="defect-progress">
              <span>{defect.phase}</span>
              <strong>{defect.progress}%</strong>
            </div>
            <div className="progress-shell compact">
              <div className="progress-fill danger" style={{ width: `${defect.progress}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function App() {
  const { data, status } = useDashboard();

  return (
    <main className="app-shell">
      <nav className="topbar">
        <div className="brand">
          <div className="brand-mark"><WalletCards size={22} /></div>
          <span>BIO-PAY</span>
        </div>
        <div className={`live-pill ${status}`}>
          {status === 'live' ? <CheckCircle2 size={16} /> : <Activity size={16} />}
          <span>{status === 'live' ? 'API 9064 연결됨' : '로컬 예비 데이터'}</span>
        </div>
      </nav>

      <BiometricScanner />

      <section className="metrics-grid">
        <StatCard icon={<ShieldCheck size={24} />} label="생체 인증 성공률" value={`${data.biometricSuccessRate}%`} tone="cyan" />
        <StatCard icon={<LockKeyhole size={24} />} label="결제 승인율" value={`${data.paymentApprovalRate}%`} tone="gold" />
        <StatCard icon={<Cpu size={24} />} label="활성 디바이스" value={data.activeDevices.toLocaleString()} tone="cyan" />
        <StatCard icon={<AlertTriangle size={24} />} label="격리 노드" value={data.quarantinedNodes.toString()} tone="red" />
      </section>

      <section className="dashboard-grid">
        <TransactionChart values={data.transactionSeries} />
        <InstallProgress stages={data.installStages} />
        <Inventory items={data.inventory} />
      </section>

      <DefectList defects={data.defects} />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
