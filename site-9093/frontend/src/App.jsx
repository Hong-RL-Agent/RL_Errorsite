import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, BookOpenCheck, Bot, Cpu, GraduationCap, Radio, Send, ShieldAlert, Terminal, Zap } from 'lucide-react';

const fallback = {
  heatmap: [],
  recommendations: [],
  securityLogs: [],
  activeSignals: [],
  averageMastery: 0,
  threatScore: 0
};

function App() {
  const [snapshot, setSnapshot] = useState(fallback);
  const [scenarios, setScenarios] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('권한 검증 상태를 확인해주세요.');
  const socketRef = useRef(null);

  useEffect(() => {
    async function load() {
      const [dashboard, scenarioList] = await Promise.all([
        fetch('/api/dashboard').then((res) => res.json()),
        fetch('/api/training/scenarios').then((res) => res.json())
      ]);
      setSnapshot(dashboard);
      setScenarios(scenarioList);
    }
    load().catch(() => {
      setSnapshot({
        ...fallback,
        securityLogs: [{ level: 'WARN', source: 'frontend', message: 'API 연결 대기 중: http://localhost:9093', timestamp: new Date().toISOString() }]
      });
    });
  }, []);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws/classroom`);
    socketRef.current = socket;
    socket.onmessage = (event) => {
      try {
        setChatMessages((prev) => [...prev.slice(-5), JSON.parse(event.data)]);
      } catch {
        setChatMessages((prev) => [...prev.slice(-5), { type: 'raw', message: event.data, timestamp: new Date().toISOString() }]);
      }
    };
    socket.onerror = () => {
      setChatMessages((prev) => [...prev, { type: 'system', message: 'WebSocket 연결 대기 중', timestamp: new Date().toISOString() }]);
    };
    return () => socket.close();
  }, []);

  const highRiskCount = useMemo(() => snapshot.heatmap.filter((cell) => cell.risk > 60).length, [snapshot.heatmap]);

  const sendChat = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN && chatInput.trim()) {
      socketRef.current.send(chatInput.trim());
      setChatInput('');
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="absolute inset-0 ocean-grid" />
      <div className="relative mx-auto flex min-h-screen max-w-[1480px] flex-col gap-5 px-5 py-5">
        <header className="glass-panel flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="icon-orbit">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-white">AI-EDUCATION</h1>
              <p className="text-sm text-sky-100/70">PPO Agent Adaptive Security Learning Console · localhost:9093</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Metric icon={<BookOpenCheck size={18} />} label="Mastery" value={`${snapshot.averageMastery}%`} tone="cyan" />
            <Metric icon={<ShieldAlert size={18} />} label="Threat" value={`${snapshot.threatScore}`} tone="red" />
            <Metric icon={<Radio size={18} />} label="High Risk" value={highRiskCount} tone="blue" />
          </div>
        </header>

        <section className="grid flex-1 grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr_0.85fr]">
          <div className="flex flex-col gap-5">
            <Panel title="실시간 학습 진행률 히트맵" icon={<Activity size={18} />}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {snapshot.heatmap.map((cell) => (
                  <div key={`${cell.module}-${cell.learnerGroup}`} className="heat-cell" style={{ '--risk': cell.risk }}>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>{cell.learnerGroup}</span>
                      <span className={cell.risk > 60 ? 'text-rose-300' : 'text-cyan-200'}>{cell.risk}</span>
                    </div>
                    <strong>{cell.progress}%</strong>
                    <span>{cell.module}</span>
                    <div className="progress-track">
                      <i style={{ width: `${cell.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="AI 맞춤형 강의 추천" icon={<Bot size={18} />}>
              <div className="space-y-3">
                {snapshot.recommendations.map((item) => (
                  <article key={item.title} className="recommendation">
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.reason}</p>
                    </div>
                    <div className="confidence">
                      <span>{item.difficulty}</span>
                      <strong>{item.confidence}%</strong>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
          </div>

          <div className="flex flex-col gap-5">
            <Panel title="취약 패턴 훈련 매트릭스" icon={<Zap size={18} />}>
              <div className="scenario-list">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="scenario-row">
                    <span>{scenario.id}</span>
                    <div>
                      <strong>{scenario.pattern}</strong>
                      <p>{scenario.detectorHint}</p>
                    </div>
                    <i>{scenario.status}</i>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="학생-강사 실시간 채팅" icon={<Radio size={18} />}>
              <div className="chat-window">
                {chatMessages.map((message, index) => (
                  <div className="chat-line" key={`${message.timestamp}-${index}`}>
                    <span>{message.type || 'chat'}</span>
                    <p>{message.message}</p>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && sendChat()} />
                <button onClick={sendChat} aria-label="send chat message">
                  <Send size={17} />
                </button>
              </div>
            </Panel>
          </div>

          <div className="flex flex-col gap-5">
            <Panel title="서버 및 캐시 보안 로그" icon={<Terminal size={18} />}>
              <div className="terminal">
                {snapshot.securityLogs.map((log, index) => (
                  <div key={`${log.timestamp}-${index}`}>
                    <span className={`level ${log.level.toLowerCase()}`}>{log.level}</span>
                    <code>[{log.source}]</code>
                    <p>{log.message}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="PPO 신호 스트림" icon={<Cpu size={18} />}>
              <div className="signal-stack">
                {snapshot.activeSignals.map((signal) => (
                  <div key={signal}>
                    <span>{signal}</span>
                    <i />
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon, label, value, tone }) {
  return (
    <div className={`metric ${tone}`}>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Panel({ title, icon, children }) {
  return (
    <section className="glass-panel panel-body">
      <div className="panel-title">
        {icon}
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default App;
