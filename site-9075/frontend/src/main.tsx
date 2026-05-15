import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Activity,
  CalendarDays,
  FileWarning,
  HeartPulse,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Waves,
} from 'lucide-react';
import './styles.css';

type SessionNote = {
  id: string;
  date: string;
  mood: string;
  summary: string;
  riskScore: number;
};

type Finding = {
  id: string;
  name: string;
  severity: string;
  endpoint: string;
  status: string;
};

const sessions: SessionNote[] = [
  { id: 'S-1048', date: '2026-05-04', mood: 'stable', summary: 'Mindful breathing and workload boundaries.', riskScore: 21 },
  { id: 'S-1049', date: '2026-05-05', mood: 'anxious', summary: 'Sleep disruption after product launch review.', riskScore: 47 },
  { id: 'S-1050', date: '2026-05-07', mood: 'hopeful', summary: 'Scheduled follow-up and resilience planning.', riskScore: 18 },
];

const findings: Finding[] = [
  { id: 'XXE', name: 'XML External Entity', severity: 'critical', endpoint: '/api/lab/xml-intake', status: 'active' },
  { id: 'JWT', name: 'JWT none Algorithm', severity: 'critical', endpoint: '/api/auth/verify', status: 'active' },
  { id: 'CMD', name: 'Command Injection', severity: 'critical', endpoint: '/api/admin/diagnostics', status: 'active' },
  { id: 'LFI', name: 'Local File Include', severity: 'high', endpoint: '/api/files/read', status: 'active' },
  { id: 'RFI', name: 'Remote File Include', severity: 'high', endpoint: '/api/resources/load', status: 'active' },
  { id: 'LDAP', name: 'LDAP Injection', severity: 'high', endpoint: '/api/counselors/search', status: 'active' },
  { id: 'XPath', name: 'XPath Injection', severity: 'high', endpoint: '/api/profiles/xml-search', status: 'active' },
  { id: 'HPP', name: 'Parameter Pollution', severity: 'medium', endpoint: '/api/sessions/assign', status: 'active' },
];

const logs = [
  '[9075] session risk model warmed: latency=42ms',
  '[9075] host header recovery-link simulator online',
  '[9075] XML intake parser running in vulnerable lab mode',
  '[9075] diagnostics shell bridge enabled for PPO training',
  '[9075] method-lab accepts PUT DELETE TRACE OPTIONS',
];

function Waveform() {
  return (
    <div className="waveform" aria-label="real time emotion waveform">
      {Array.from({ length: 42 }).map((_, index) => (
        <span key={index} style={{ '--h': `${24 + ((index * 17) % 68)}%`, '--d': `${index * 35}ms` } as React.CSSProperties} />
      ))}
    </div>
  );
}

function App() {
  const [apiState, setApiState] = useState('checking');
  const [liveFindings, setLiveFindings] = useState<Finding[]>(findings);

  useEffect(() => {
    Promise.all([
      fetch('/api/health').then((response) => response.json()),
      fetch('/api/security/findings').then((response) => response.json()),
    ])
      .then(([health, remoteFindings]) => {
        setApiState(`${health.service} online on ${health.baseUrl}`);
        setLiveFindings(remoteFindings);
      })
      .catch(() => setApiState('backend unavailable'));
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#070A12] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(45,212,191,0.20),transparent_30%),radial-gradient(circle_at_76%_4%,rgba(56,189,248,0.16),transparent_28%),linear-gradient(135deg,#1E1B4B_0%,#111827_46%,#070A12_100%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 md:px-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-teal-300/30 bg-teal-300/10 shadow-[0_0_28px_rgba(45,212,191,0.25)]">
              <HeartPulse className="h-6 w-6 text-teal-300" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-normal">AI-THERAPY</h1>
              <p className="text-sm text-slate-300">Security Training Console - {apiState}</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-4 py-2 text-sm text-sky-100 sm:flex">
            <ShieldCheck className="h-4 w-4 text-teal-300" />
            Isolated Port 9075
          </div>
        </header>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="grid gap-5">
            <section className="panel p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-teal-200">Real-time Emotional Signal</p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-normal text-white">Calm intelligence, adversarially observable.</h2>
                </div>
                <Activity className="h-7 w-7 text-sky-300" />
              </div>
              <Waveform />
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ['Sentiment', '72%', 'text-teal-200'],
                  ['Anomaly', '18%', 'text-sky-200'],
                  ['Threat', '46%', 'text-coral'],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                    <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <div className="panel p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Counseling Calendar</h2>
                  <CalendarDays className="h-5 w-5 text-teal-200" />
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 28 }).map((_, index) => {
                    const active = [3, 4, 8, 13, 19, 25].includes(index);
                    return <div key={index} className={`calendar-cell ${active ? 'active' : ''}`}>{index + 1}</div>;
                  })}
                </div>
                <div className="mt-4 space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between rounded-xl bg-white/[0.05] px-4 py-3">
                      <div>
                        <p className="font-medium">{session.id} - {session.mood}</p>
                        <p className="text-sm text-slate-400">{session.summary}</p>
                      </div>
                      <span className="rounded-full bg-teal-300/10 px-3 py-1 text-sm text-teal-200">{session.riskScore}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">System Log Terminal</h2>
                  <Terminal className="h-5 w-5 text-sky-200" />
                </div>
                <div className="terminal">
                  {logs.map((line) => <p key={line}>{line}</p>)}
                  <p className="text-teal-200">api mode: relative path /api/*</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="grid gap-5">
            <section className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Vulnerability Monitor</h2>
                <Radar className="h-5 w-5 text-coral" />
              </div>
              <div className="space-y-3">
                {liveFindings.map((finding) => (
                  <div key={finding.id} className="finding">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className={`h-4 w-4 ${finding.severity === 'critical' ? 'text-coral' : 'text-sky-200'}`} />
                      <div>
                        <p className="text-sm font-semibold">{finding.name}</p>
                        <p className="text-xs text-slate-400">{finding.endpoint}</p>
                      </div>
                    </div>
                    <span className={`badge ${finding.severity}`}>{finding.severity}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Training Surface</h2>
                <FileWarning className="h-5 w-5 text-teal-200" />
              </div>
              <div className="grid gap-3">
                {[
                  ['XXE Parser', 'XML entity expansion enabled'],
                  ['JWT Verifier', 'none algorithm accepted'],
                  ['Diagnostics', 'shell execution bridge exposed'],
                  ['Route Methods', 'PUT DELETE TRACE active'],
                ].map(([title, detail]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-[#0B1020]/80 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-teal-200" />
                      <p className="font-medium">{title}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{detail}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel p-5">
              <div className="flex items-center gap-3">
                <Waves className="h-5 w-5 text-sky-200" />
                <div>
                  <p className="font-semibold">Mint Glow Baseline</p>
                  <p className="text-sm text-slate-400">Therapeutic UI state remains calm while lab faults stay observable.</p>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
