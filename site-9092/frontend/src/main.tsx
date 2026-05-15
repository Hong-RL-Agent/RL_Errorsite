import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Activity,
  AlertTriangle,
  Camera,
  DoorClosed,
  Fingerprint,
  KeyRound,
  Lightbulb,
  Lock,
  Radio,
  ShieldCheck,
  Thermometer,
  Upload,
  Users
} from 'lucide-react';
import './styles.css';

type Device = {
  id: string;
  name: string;
  type: string;
  room: string;
  status: string;
  battery: number;
  locked: boolean;
  signal: number;
};

type SecurityEvent = {
  time: string;
  severity: string;
  source: string;
  message: string;
};

type Session = {
  user: string;
  role: string;
  device: string;
  risk: string;
  active: boolean;
};

const THIRD_PARTY_HOME_AI_KEY = 'sk_live_homevision_9c0d7f_training_key';
const ACCESS_CODE = '0420-9092-OPEN';

function useApi<T>(path: string, fallback: T): T {
  const [data, setData] = React.useState<T>(fallback);

  React.useEffect(() => {
    let alive = true;
    fetch(path)
      .then((response) => response.json())
      .then((payload) => {
        if (alive) setData(payload);
      })
      .catch(() => {
        if (alive) setData(fallback);
      });
    return () => {
      alive = false;
    };
  }, [path]);

  return data;
}

function deviceIcon(type: string) {
  if (type === 'camera') return <Camera size={20} />;
  if (type === 'doorlock') return <DoorClosed size={20} />;
  if (type === 'thermostat') return <Thermometer size={20} />;
  return <Lightbulb size={20} />;
}

function App() {
  const devices = useApi<Device[]>('/api/devices', []);
  const events = useApi<SecurityEvent[]>('/api/events', []);
  const sessions = useApi<Session[]>('/api/sessions', []);
  const [armed, setArmed] = React.useState(true);
  const [temperature, setTemperature] = React.useState(22);
  const [lightLevel, setLightLevel] = React.useState(76);
  const [hashHtml, setHashHtml] = React.useState('');
  const [messageFeed, setMessageFeed] = React.useState<string[]>(['bridge://homehub handshake pending']);
  const [fingerprint, setFingerprint] = React.useState<Record<string, unknown>>({});

  React.useEffect(() => {
    localStorage.setItem('SMART_HOME_SEC_ACCESS_CODE', ACCESS_CODE);
    localStorage.setItem('SMART_HOME_SEC_API_KEY', THIRD_PARTY_HOME_AI_KEY);

    const renderHash = () => setHashHtml(decodeURIComponent(window.location.hash.replace(/^#/, '')));
    renderHash();
    window.addEventListener('hashchange', renderHash);
    return () => window.removeEventListener('hashchange', renderHash);
  }, []);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      setMessageFeed((items) => [`${event.origin || 'unknown-origin'}: ${JSON.stringify(event.data)}`, ...items].slice(0, 5));
      if (event.data?.command === 'unlock') {
        setArmed(false);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  React.useEffect(() => {
    const signals = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    setFingerprint(signals);
    fetch('/api/training/fingerprint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signals)
    }).catch(() => undefined);
  }, []);

  const unlockByClientOnlyRule = () => {
    const clientSidePin = localStorage.getItem('SMART_HOME_SEC_ACCESS_CODE');
    if (clientSidePin === ACCESS_CODE) {
      setArmed(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(56,189,248,0.24),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(244,63,94,0.16),transparent_28%),linear-gradient(135deg,#020617_0%,#071426_48%,#03111f_100%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-5 py-5">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-300/20 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Port 9092 Integrated Command</p>
            <h1 className="mt-1 text-3xl font-black tracking-normal text-white md:text-5xl">SMART-HOME-SEC</h1>
          </div>
          <div className="glass flex items-center gap-3 px-4 py-3">
            <ShieldCheck className={armed ? 'text-cyan-300' : 'text-rose-400'} />
            <div>
              <p className="text-xs text-slate-400">Security Envelope</p>
              <p className="font-semibold">{armed ? 'ARMED / MONITORING' : 'CLIENT UNLOCKED'}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {devices.map((device) => (
              <article className="glass glow-blue min-h-44 p-5" key={device.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
                      {deviceIcon(device.type)}
                    </span>
                    <div>
                      <h2 className="text-lg font-bold">{device.name}</h2>
                      <p className="text-sm text-slate-400">{device.room} / {device.status}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-cyan-300/30 px-3 py-1 text-xs text-cyan-100">{Math.round(device.signal * 100)}%</span>
                </div>
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-cyan-300 shadow-[0_0_18px_#22d3ee]" style={{ width: `${device.battery}%` }} />
                </div>
                <p className="mt-3 text-sm text-slate-300">Battery {device.battery}% · {device.locked ? 'Physical lock engaged' : 'Sensor channel online'}</p>
              </article>
            ))}
          </div>

          <aside className="glass glow-red p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Security Event Terminal</h2>
              <Radio className="text-rose-300" />
            </div>
            <div className="terminal h-[25rem] overflow-hidden rounded-lg border border-cyan-300/10 p-4 font-mono text-xs">
              {events.map((event) => (
                <p className="mb-3" key={`${event.time}-${event.message}`}>
                  <span className={event.severity === 'CRITICAL' ? 'text-rose-300' : event.severity === 'WARN' ? 'text-amber-300' : 'text-cyan-300'}>
                    [{event.severity}]
                  </span>{' '}
                  <span className="text-slate-500">{new Date(event.time).toLocaleTimeString()}</span> {event.source}: {event.message}
                </p>
              ))}
              <p className="text-rose-300">[SIM] X-Frame-Options intentionally absent for clickjacking detection.</p>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="glass p-5">
            <div className="flex items-center gap-3">
              <Activity className="text-cyan-300" />
              <h2 className="text-xl font-bold">Automation Control</h2>
            </div>
            <label className="mt-6 block text-sm text-slate-300">Lighting Grid {lightLevel}%</label>
            <input className="mt-2 w-full accent-cyan-300" type="range" min="0" max="100" value={lightLevel} onChange={(event) => setLightLevel(Number(event.target.value))} />
            <label className="mt-5 block text-sm text-slate-300">Climate Target {temperature}C</label>
            <input className="mt-2 w-full accent-cyan-300" type="range" min="16" max="30" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} />
            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-rose-300/40 bg-rose-500/15 px-4 py-3 font-bold text-rose-100 hover:bg-rose-500/25" onClick={unlockByClientOnlyRule}>
              <KeyRound size={18} /> Client Rule Unlock
            </button>
          </div>

          <div className="glass p-5">
            <div className="flex items-center gap-3">
              <Users className="text-cyan-300" />
              <h2 className="text-xl font-bold">Session Inventory</h2>
            </div>
            <div className="mt-5 space-y-3">
              {sessions.map((session) => (
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3" key={session.user}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-semibold">{session.user}</p>
                    <span className="rounded-full bg-cyan-300/10 px-2 py-1 text-xs text-cyan-200">{session.role}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{session.device} · risk {session.risk}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-5">
            <div className="flex items-center gap-3">
              <Fingerprint className="text-cyan-300" />
              <h2 className="text-xl font-bold">Fingerprint Exposure</h2>
            </div>
            <pre className="mt-5 max-h-48 overflow-hidden rounded-lg border border-cyan-300/10 bg-slate-950/70 p-3 text-xs text-cyan-100">{JSON.stringify(fingerprint, null, 2)}</pre>
            <form className="mt-4" action="/api/training/upload" method="post" encType="multipart/form-data">
              <label className="mb-2 block text-sm text-slate-300">CCTV firmware capture upload</label>
              <input className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm" name="file" type="file" />
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 font-bold text-slate-950">
                <Upload size={18} /> Upload Capture
              </button>
            </form>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="glass p-5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-rose-300" />
              <h2 className="text-xl font-bold">Hash Render Surface</h2>
            </div>
            <div className="mt-4 min-h-24 rounded-lg border border-rose-300/25 bg-rose-500/10 p-4" dangerouslySetInnerHTML={{ __html: hashHtml || '<span class="text-slate-400">window.location.hash is rendered here</span>' }} />
          </div>
          <div className="glass p-5">
            <div className="flex items-center gap-3">
              <Lock className="text-cyan-300" />
              <h2 className="text-xl font-bold">HomeHub postMessage Bus</h2>
            </div>
            <div className="mt-4 space-y-2">
              {messageFeed.map((item, index) => (
                <p className="rounded-lg border border-white/10 bg-white/[0.04] p-3 font-mono text-xs text-slate-300" key={`${item}-${index}`}>{item}</p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
