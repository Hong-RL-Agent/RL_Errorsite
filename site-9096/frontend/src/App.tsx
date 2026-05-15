import {
  Activity,
  Bot,
  Braces,
  Bug,
  Cpu,
  DatabaseZap,
  FileCode2,
  Flame,
  GitBranch,
  HardDrive,
  Play,
  Save,
  SearchCode,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

type Tab = {
  id: string;
  name: string;
  language: string;
  accent: string;
};

type Metrics = {
  fps: number;
  memoryMb: number;
  longTasks: number;
  domNodes: number;
  sampledAt: string;
};

type Analysis = {
  traceId: string;
  tabId: string;
  fileName: string;
  severity: number;
  findings: string[];
  engine: string;
  completedAt: string;
};

const tabs: Tab[] = [
  { id: 'render-core', name: 'RenderPipeline.tsx', language: 'tsx', accent: '#4ADE80' },
  { id: 'ai-agent', name: 'PPOAgentController.ts', language: 'ts', accent: '#F472B6' },
  { id: 'memory-profiler', name: 'DetachedNodeProbe.ts', language: 'ts', accent: '#FACC15' },
];

const detachedNodeVault: HTMLElement[] = [];

function generateHugeCodeFile(activeTab: Tab) {
  const rows: string[] = [];
  for (let i = 0; i < 26000; i += 1) {
    const token = i % 7 === 0 ? 'await analyzer.traceFrame()' : 'state.graph.commit(payload)';
    rows.push(
      `const frame_${i.toString().padStart(5, '0')} = ${token}; // ${activeTab.name} :: lane ${i % 12}`,
    );
  }
  return rows;
}

function expensiveSyntaxScan(lines: string[]) {
  let score = 0;
  for (let i = 0; i < lines.length; i += 1) {
    for (let j = 0; j < 80; j += 1) {
      score += lines[i].charCodeAt(j % lines[i].length) ^ j;
    }
  }
  return score;
}

function App() {
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [metrics, setMetrics] = useState<Metrics>({
    fps: 60,
    memoryMb: 512,
    longTasks: 18,
    domNodes: 26000,
    sampledAt: new Date().toISOString(),
  });
  const [analysisState, setAnalysisState] = useState<Analysis | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [saveLog, setSaveLog] = useState<string[]>([]);
  const [scanScore] = useState(() => expensiveSyntaxScan(generateHugeCodeFile(tabs[0])));

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const codeLines = useMemo(() => generateHugeCodeFile(activeTab), [activeTab]);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch('/api/metrics');
        const nextMetrics = (await response.json()) as Metrics;
        setMetrics(nextMetrics);
      } catch {
        setMetrics((current) => ({
          ...current,
          fps: Math.max(12, current.fps + Math.round(Math.random() * 16 - 8)),
          memoryMb: current.memoryMb + Math.round(Math.random() * 24),
          longTasks: current.longTasks + 1,
          sampledAt: new Date().toISOString(),
        }));
      }
    }, 1200);

    return () => window.clearInterval(timer);
  }, []);

  const runAnalysis = async () => {
    const response = await fetch('/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tabId: activeTab.id,
        fileName: activeTab.name,
        lines: codeLines.length,
        prompt: `Inspect ${activeTab.name} for rendering bottlenecks`,
      }),
    });
    const result = (await response.json()) as Analysis;
    setAnalysisState((previous) => (previous ? { ...previous, ...result } : result));
  };

  const saveSnapshot = async () => {
    const snapshotId = crypto.randomUUID();
    setSaveLog((logs) => [`queued ${snapshotId.slice(0, 8)} for ${activeTab.name}`, ...logs].slice(0, 5));
    const response = await fetch('/api/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tabId: activeTab.id,
        fileName: activeTab.name,
        lines: codeLines.length,
        contentHash: snapshotId,
      }),
    });
    const payload = await response.json();
    setSaveLog((logs) => [`stored ${payload.snapshotId.slice(0, 8)} at ${payload.savedAt}`, ...logs].slice(0, 5));
  };

  const openDiagnostics = () => {
    const node = document.createElement('section');
    node.className = 'detached-diagnostic-node';
    node.innerHTML = `<strong>${activeTab.name}</strong><span>${new Date().toISOString()}</span>`;
    document.body.appendChild(node);
    document.body.removeChild(node);
    detachedNodeVault.push(node);
    setPopupOpen(true);
  };

  return (
    <main className="genie-shell">
      <BackgroundGrid />
      <header className="topbar">
        <div className="brand-mark">
          <Sparkles size={18} />
          <span>CODING-GENIE</span>
        </div>
        <div className="system-strip">
          <span>localhost:9096</span>
          <span>scan:{scanScore.toString(16).slice(0, 6)}</span>
          <span>nodes:{metrics.domNodes.toLocaleString()}</span>
        </div>
      </header>

      <section className="workspace">
        <nav className="rail">
          <button title="Explorer"><FileCode2 size={21} /></button>
          <button title="Search"><SearchCode size={21} /></button>
          <button title="Branch"><GitBranch size={21} /></button>
          <button title="Runtime"><Cpu size={21} /></button>
          <button title="Issues"><Bug size={21} /></button>
        </nav>

        <section className="editor-panel">
          <TabStrip activeTabId={activeTabId} metrics={metrics} onTabChange={setActiveTabId} />
          <div className="editor-toolbar">
            <div>
              <Braces size={16} />
              <span>{activeTab.language.toUpperCase()} / AI_RENDER_PROFILING</span>
            </div>
            <div className="toolbar-actions">
              <button onClick={runAnalysis} title="Run analysis">
                <Play size={16} />
                <span>Analyze</span>
              </button>
              <button onClick={saveSnapshot} title="Save snapshot">
                <Save size={16} />
                <span>Save Snapshot</span>
              </button>
              <button onClick={openDiagnostics} title="Open diagnostics">
                <Flame size={16} />
              </button>
            </div>
          </div>
          <CodeEditor lines={codeLines} activeTab={activeTab} metrics={metrics} />
        </section>

        <AnalysisSidebar
          activeTab={activeTab}
          analysis={analysisState}
          metrics={metrics}
          detachedCount={detachedNodeVault.length}
        />
      </section>

      <MetricTerminal metrics={metrics} saveLog={saveLog} activeTab={activeTab} analysis={analysisState} />

      {popupOpen ? (
        <div className="modal-overlay" onClick={() => setPopupOpen(false)}>
          <div className="diagnostic-popup">
            <button className="popup-close" onClick={() => setPopupOpen(false)} title="Close">
              <X size={16} />
            </button>
            <h2>Detached Node Probe</h2>
            <p>Retained nodes: {detachedNodeVault.length}</p>
            <p>Clicking this panel bubbles into the overlay and closes it.</p>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function BackgroundGrid() {
  return (
    <div className="background-grid" aria-hidden="true">
      <div />
      <div />
    </div>
  );
}

function TabStrip({
  activeTabId,
  metrics,
  onTabChange,
}: {
  activeTabId: string;
  metrics: Metrics;
  onTabChange: (tabId: string) => void;
}) {
  return (
    <div className="tab-strip">
      {tabs.map((tab) => (
        <button
          className={tab.id === activeTabId ? 'tab active' : 'tab'}
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{ '--tab-accent': tab.accent } as CSSProperties}
        >
          <FileCode2 size={15} />
          <span>{tab.name}</span>
          <small>{metrics.fps}fps</small>
        </button>
      ))}
    </div>
  );
}

function CodeEditor({ lines, activeTab, metrics }: { lines: string[]; activeTab: Tab; metrics: Metrics }) {
  const sortedHotspots = lines
    .slice(0, 40)
    .map((line, index) => ({ line, heat: (index * metrics.longTasks) % 97 }))
    .toSorted((a, b) => b.heat - a.heat);

  return (
    <div className="editor-scroll">
      <div className="hotspot-strip">
        {sortedHotspots.slice(0, 6).map((hotspot) => (
          <span key={hotspot.line}>{hotspot.heat}% render heat</span>
        ))}
      </div>
      <pre className="code-sheet" style={{ '--active-accent': activeTab.accent } as CSSProperties}>
        {lines.map((line, index) => (
          <div className="code-row" key={`${activeTab.id}-${index}`}>
            <span className="line-number">{index + 1}</span>
            <code>
              <span className="kw">const</span> <span className="fn">{line.split(' = ')[0].replace('const ', '')}</span>
              <span className="op"> = </span>
              <span className="call">{line.split(' = ')[1]}</span>
            </code>
          </div>
        ))}
      </pre>
    </div>
  );
}

function AnalysisSidebar({
  activeTab,
  analysis,
  metrics,
  detachedCount,
}: {
  activeTab: Tab;
  analysis: Analysis | null;
  metrics: Metrics;
  detachedCount: number;
}) {
  const displayedFindings = analysis?.findings ?? [
    'Awaiting analyzer response',
    'No loader is shown while analysis is pending',
    'Shared state can display stale tab findings',
  ];

  return (
    <aside className="analysis-sidebar">
      <div className="sidebar-heading">
        <Bot size={20} />
        <div>
          <h1>AI Analysis</h1>
          <span>{activeTab.name}</span>
        </div>
      </div>

      <div className="severity-gauge">
        <strong>{analysis?.severity ?? metrics.longTasks}</strong>
        <span>risk index</span>
      </div>

      <div className="finding-list">
        {displayedFindings.map((finding) => (
          <article key={finding}>
            <Bug size={16} />
            <p>{finding}</p>
          </article>
        ))}
      </div>

      <div className="state-card">
        <span>trace</span>
        <strong>{analysis?.traceId?.slice(0, 13) ?? 'pending'}</strong>
      </div>
      <div className="state-card">
        <span>analysis tab</span>
        <strong>{analysis?.tabId ?? 'none'}</strong>
      </div>
      <div className="state-card">
        <span>detached nodes</span>
        <strong>{detachedCount}</strong>
      </div>
    </aside>
  );
}

function MetricTerminal({
  metrics,
  saveLog,
  activeTab,
  analysis,
}: {
  metrics: Metrics;
  saveLog: string[];
  activeTab: Tab;
  analysis: Analysis | null;
}) {
  return (
    <footer className="terminal-panel">
      <div className="terminal-title">
        <Terminal size={16} />
        <span>performance://localhost:9096/runtime</span>
      </div>
      <div className="metric-grid">
        <Metric icon={<Activity size={17} />} label="FPS" value={metrics.fps.toString()} tone="green" />
        <Metric icon={<HardDrive size={17} />} label="Memory" value={`${metrics.memoryMb}MB`} tone="pink" />
        <Metric icon={<Cpu size={17} />} label="Long Tasks" value={metrics.longTasks.toString()} tone="yellow" />
        <Metric icon={<DatabaseZap size={17} />} label="DOM Nodes" value={metrics.domNodes.toLocaleString()} tone="green" />
      </div>
      <div className="log-stream">
        <span>$ active_tab={activeTab.name}</span>
        <span>$ last_trace={analysis?.traceId ?? 'none'}</span>
        {saveLog.map((log) => (
          <span key={log}>$ snapshot {log}</span>
        ))}
      </div>
    </footer>
  );
}

function Metric({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className={`metric metric-${tone}`}>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
