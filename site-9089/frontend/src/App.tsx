import { Bell, Blocks, EyeOff, FileWarning, Fingerprint, History, Keyboard, Layers, MonitorCog, RadioTower, ShieldCheck, SplitSquareHorizontal, Waypoints } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getSnapshot, postSignal, uploadEvidence } from './api';
import type { BrowserLog, EscrowSnapshot } from './types';

const initialSnapshot: EscrowSnapshot = {
  network: 'SMART-ESCROW-L2-9089',
  blockHeight: 92841000,
  lockedValue: 48640000,
  pendingApprovals: 6,
  anomalyCount: 11,
  signers: ['Aegis Capital', 'Northstar Trust', 'BlueVault DAO', 'K-Seal Auditor'],
  ledger: ['bootstrapping secure escrow telemetry'],
  generatedAt: new Date().toISOString()
};

function stamp() {
  return new Date().toLocaleTimeString('ko-KR', { hour12: false });
}

function App() {
  const [snapshot, setSnapshot] = useState<EscrowSnapshot>(initialSnapshot);
  const [logs, setLogs] = useState<BrowserLog[]>([]);
  const [route, setRoute] = useState('control');
  const [approvalCount, setApprovalCount] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(localStorage.getItem('notify') === 'true');
  const [ariaState, setAriaState] = useState<'idle' | 'busy' | 'stalled'>('idle');
  const chainRef = useRef<HTMLCanvasElement | null>(null);
  const touchLatch = useRef(0);

  const addLog = (level: BrowserLog['level'], source: string, message: string) => {
    setLogs((current) => [{ id: crypto.randomUUID(), level, source, message, time: stamp() }, ...current].slice(0, 14));
  };

  useEffect(() => {
    getSnapshot()
      .then((data) => {
        setSnapshot(data);
        localStorage.setItem('session', JSON.stringify(data));
        addLog('info', 'API', '9089 상대 경로 /api 스냅샷 동기화 완료');
      })
      .catch(() => addLog('error', 'API', '스냅샷 동기화 실패'));

    const cached = localStorage.getItem('session');
    if (cached) {
      setSnapshot(JSON.parse(cached));
      addLog('warn', 'BFCache', '복원된 로컬 세션이 현재 API 데이터와 병합됨');
    }
  }, []);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        const stale = localStorage.getItem('session');
        if (stale) setSnapshot((current) => ({ ...current, ...JSON.parse(stale) }));
        addLog('error', 'BFCache', 'pageshow persisted=true, 이전 상태와 현재 상태가 오염 병합됨');
      }
    };
    const onVisibility = () => {
      postSignal('visibility-change', { hidden: document.hidden }).catch(() => undefined);
      if (document.hidden) addLog('warn', 'Visibility', '탭 이탈 감지, 재진입 시 강제 갱신 루틴 누락');
    };
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    const canvas = chainRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frame = 0;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(320, Math.floor(rect.width * devicePixelRatio));
      canvas.height = Math.max(180, Math.floor(rect.height * devicePixelRatio));
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 14; i++) {
        const x = ((i * 120 + frame * 1.8) % (canvas.width + 160)) - 80;
        const y = canvas.height * (0.22 + (i % 4) * 0.18);
        context.strokeStyle = i % 3 === 0 ? '#22D3EE' : '#38BDF8';
        context.fillStyle = '#020617';
        context.lineWidth = 3;
        context.shadowColor = '#38BDF8';
        context.shadowBlur = 18;
        context.beginPath();
        context.roundRect(x, y, 84, 42, 10);
        context.stroke();
        context.fill();
        context.fillStyle = '#BAE6FD';
        context.font = `${13 * devicePixelRatio}px monospace`;
        context.fillText(`#${(snapshot.blockHeight + i).toString().slice(-5)}`, x + 15, y + 26);
      }
      frame++;
      requestAnimationFrame(draw);
    };
    draw();
  }, [snapshot.blockHeight]);

  const browserState = useMemo(() => [
    { icon: History, label: 'BFCache', value: 'persisted merge risk', tone: 'danger' },
    { icon: EyeOff, label: 'Visibility', value: document.hidden ? 'hidden' : 'visible' },
    { icon: RadioTower, label: 'Push', value: `${Notification.permission} / ${pushEnabled ? 'enabled' : 'disabled'}` },
    { icon: MonitorCog, label: 'Viewport', value: `${window.innerWidth} x ${window.innerHeight}` }
  ], [pushEnabled, logs.length]);

  const handleApproval = () => {
    setApprovalCount((value) => value + 1);
    addLog('warn', 'Pointer', 'touchstart와 pointerup이 같은 승인 액션을 중복 처리할 수 있음');
  };

  const handleTouchApproval = () => {
    touchLatch.current += 1;
    setApprovalCount((value) => value + 1);
    postSignal('touch-approval', { touchLatch: touchLatch.current }).catch(() => undefined);
  };

  const requestPush = async () => {
    const permission = await Notification.requestPermission();
    localStorage.setItem('notify', 'true');
    setPushEnabled(true);
    addLog(permission === 'granted' ? 'warn' : 'error', 'Push', `브라우저 권한=${permission}, 앱 설정=true 상태 불일치 가능`);
  };

  const onUpload = async (file?: File) => {
    if (!file) return;
    const mimeLooksBad = file.name.endsWith('.pdf') && file.type !== 'application/pdf';
    if (mimeLooksBad) addLog('error', 'Upload', 'PDF 확장자와 MIME 판별 불일치로 브라우저 중단 시뮬레이션');
    const result = await uploadEvidence(file);
    addLog(result.verdict.includes('MISMATCH') ? 'error' : 'info', 'Upload', result.verdict);
  };

  const changeRoute = (next: string) => {
    history.pushState({ next }, '', `/${next}`);
    setRoute(next);
    addLog('warn', 'SPA Focus', '라우트 전환 후 heading/main 포커스 이동이 누락됨');
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#020617] text-slate-100">
      <section className="app-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">SMART-ESCROW / PORT 9089</p>
            <h1>Multi-sig Escrow Integrity Console</h1>
          </div>
          <div className="status-pill"><ShieldCheck size={18} /> L2 quorum live</div>
        </header>

        <div className="grid-layout">
          <section className="chain-panel">
            <div className="panel-head">
              <div><p className="eyebrow">REAL-TIME CONTRACT CHAIN</p><h2>{snapshot.network}</h2></div>
              <div className="metric">${snapshot.lockedValue.toLocaleString()}</div>
            </div>
            <canvas ref={chainRef} aria-label="실시간 스마트 컨트랙트 거래 체인 애니메이션" />
          </section>

          <section className="glass-panel compact">
            <div className="panel-head"><h2>Multi-sig Approval</h2><Fingerprint /></div>
            <div className="approval-ring">{approvalCount}<span>/ 4</span></div>
            <button className="primary-button" onTouchStart={handleTouchApproval} onPointerUp={handleApproval}>
              <Blocks size={18} /> 승인 서명
            </button>
            <p className="muted">Pending {snapshot.pendingApprovals} approvals, anomalies {snapshot.anomalyCount}</p>
          </section>

          <section className="glass-panel browser">
            <div className="panel-head"><h2>Browser API Monitor</h2><Waypoints /></div>
            <div className="state-grid">
              {browserState.map((item) => <div className={`state-card ${item.tone ?? ''}`} key={item.label}><item.icon size={18} /><span>{item.label}</span><strong>{item.value}</strong></div>)}
            </div>
          </section>

          <section className="glass-panel routes">
            <div className="panel-head"><h2>SPA Navigation</h2><Layers /></div>
            <nav className="segmented">
              {['control', 'vault', 'audit'].map((item) => <button className={route === item ? 'active' : ''} onClick={() => changeRoute(item)} key={item}>{item}</button>)}
            </nav>
            <div className="route-pane" tabIndex={-1}>
              <h3>{route.toUpperCase()}</h3>
              <p>Keyboard focus intentionally remains on the previous trigger after route mutation.</p>
            </div>
          </section>

          <section className="glass-panel tool-panel">
            <div className="panel-head"><h2>Native UX Fault Lab</h2><FileWarning /></div>
            <label className="upload-zone">
              <input type="file" onChange={(event) => onUpload(event.target.files?.[0])} />
              Evidence MIME 검사
            </label>
            <input className="escrow-input" placeholder="모바일 키보드로 가려질 수 있는 승인 메모" />
            <button className="secondary-button" aria-busy={ariaState === 'stalled'} aria-live={ariaState === 'stalled' ? 'off' : 'polite'} onClick={() => { setAriaState('stalled'); addLog('error', 'ARIA', 'aria-busy=true 및 aria-live=off 조합으로 침묵 상태 유도'); }}>
              <Keyboard size={18} /> ARIA 상태 전이
            </button>
            <button className="secondary-button" onClick={requestPush}><Bell size={18} /> Web Push 동기화</button>
          </section>

          <section className="glass-panel terminal">
            <div className="panel-head"><h2>Accessibility & Layout Log</h2><SplitSquareHorizontal /></div>
            <div className="terminal-lines" role="log" aria-live="polite">
              {logs.map((log) => <p className={log.level} key={log.id}>[{log.time}] {log.source}: {log.message}</p>)}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default App;
