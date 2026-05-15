import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Clipboard,
  Globe2,
  Languages,
  MapPin,
  Mic2,
  Network,
  RadioTower,
  ShieldAlert,
  Waves,
} from 'lucide-react';

type PolicyLog = {
  timestamp: string;
  channel: string;
  message: string;
};

const initialText =
  'Browser security policy, multilingual context, and network trust signals must survive real-time translation.';

const languages = ['English', 'Korean', 'Japanese', 'Arabic', 'Hindi', 'Spanish'];

function postClientEvent(channel: string, message: string) {
  return fetch('/api/policy/client-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel, message }),
  }).catch(() => undefined);
}

export function App() {
  const [sourceLanguage, setSourceLanguage] = useState('English');
  const [targetLanguage, setTargetLanguage] = useState('Korean');
  const [text, setText] = useState(initialText);
  const [translated, setTranslated] = useState('');
  const [logs, setLogs] = useState<PolicyLog[]>([]);
  const [audioState, setAudioState] = useState('booting');
  const [clipboardState, setClipboardState] = useState('untested');
  const [geoState, setGeoState] = useState('not requested');
  const [observerState, setObserverState] = useState('watching');
  const [socketAttempts, setSocketAttempts] = useState(0);
  const removableTargetRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const riskCards = useMemo(
    () => [
      { label: 'WebAudio', value: audioState, icon: Waves },
      { label: 'Clipboard', value: clipboardState, icon: Clipboard },
      { label: 'Geolocation', value: geoState, icon: MapPin },
      { label: 'Observer', value: observerState, icon: RadioTower },
    ],
    [audioState, clipboardState, geoState, observerState]
  );

  useEffect(() => {
    document.documentElement.classList.add('os-theme-applied-late');
    postClientEvent('theme', 'Dark mode synchronized after first paint; white flash risk recorded');
  }, []);

  useEffect(() => {
    const runAutoplayProbe = async () => {
      try {
        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        gain.gain.value = 0.001;
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        setAudioState(context.state);
        if (context.state === 'suspended') {
          postClientEvent('webaudio', 'AudioContext suspended because playback started without user activation');
        }
      } catch (error) {
        setAudioState('blocked');
        postClientEvent('webaudio', `Autoplay probe failed: ${(error as Error).message}`);
      }
    };

    runAutoplayProbe();
  }, []);

  useEffect(() => {
    if (!removableTargetRef.current) {
      return;
    }

    observerRef.current = new IntersectionObserver(() => undefined, { threshold: 0.9 });
    observerRef.current.observe(removableTargetRef.current);

    const timer = window.setTimeout(() => {
      removableTargetRef.current?.remove();
      setObserverState('orphan target');
      postClientEvent('intersection-observer', 'Observer target removed from DOM while observer remains active');
    }, 2400);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.fonts.ready.then(() => {
      postClientEvent('font', 'Multilingual font readiness completed after initial render; FOUT/FOIT risk');
    });
  }, []);

  useEffect(() => {
    const inlineScript = document.createElement('script');
    inlineScript.textContent = "window.__AI_TRANS_INLINE_CSP_PROBE__ = 'executed'";
    document.head.appendChild(inlineScript);
    window.setTimeout(() => {
      const blocked = (window as Window & { __AI_TRANS_INLINE_CSP_PROBE__?: string }).__AI_TRANS_INLINE_CSP_PROBE__ !== 'executed';
      postClientEvent('csp', blocked ? 'Strict CSP blocked inline script probe' : 'Inline script probe executed unexpectedly');
      inlineScript.remove();
    }, 250);
  }, []);

  useEffect(() => {
    const globalWindow = window as Window & { AI_TRANS_EXTENSION_BRIDGE?: string };
    globalWindow.AI_TRANS_EXTENSION_BRIDGE = globalWindow.AI_TRANS_EXTENSION_BRIDGE ?? 'dashboard-owned';
    window.setTimeout(() => {
      if (globalWindow.AI_TRANS_EXTENSION_BRIDGE !== 'dashboard-owned') {
        postClientEvent('extension', 'Global AI_TRANS_EXTENSION_BRIDGE collision detected');
      } else {
        globalWindow.AI_TRANS_EXTENSION_BRIDGE = 'extension-overwrite-simulation';
        postClientEvent('extension', 'Extension-like global variable overwrite simulation interrupted bridge state');
      }
    }, 1600);
  }, []);

  useEffect(() => {
    let closed = false;
    let attempts = 0;

    const connect = () => {
      if (closed || attempts > 12) {
        return;
      }
      attempts += 1;
      setSocketAttempts(attempts);
      const socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/policy`);
      socket.onclose = () => {
        postClientEvent('websocket', `Immediate reconnect attempt ${attempts} without exponential backoff`);
        connect();
      };
      socket.onerror = () => socket.close();
    };

    connect();
    return () => {
      closed = true;
    };
  }, []);

  useEffect(() => {
    const loadLogs = () => {
      fetch('/api/policy/logs')
        .then((response) => response.json())
        .then(setLogs)
        .catch(() => undefined);
    };
    loadLogs();
    const timer = window.setInterval(loadLogs, 1800);
    return () => window.clearInterval(timer);
  }, []);

  const translate = async () => {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceLanguage, targetLanguage, text }),
    });
    const payload = await response.json();
    setTranslated(payload.translatedText);
  };

  const copyTranslated = async () => {
    setClipboardState('pending');
    try {
      await navigator.clipboard.writeText(translated || text);
      setClipboardState('write attempted');
    } catch (error) {
      setClipboardState('denied');
      postClientEvent('clipboard', `Clipboard denial not recovered with fallback: ${(error as Error).message}`);
    }
  };

  const requestGeo = () => {
    setGeoState('pending without timeout');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoState(`${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`);
      },
      (error) => {
        setGeoState(`error ${error.code}`);
        postClientEvent('geolocation', `Geolocation failed without timeout control: ${error.message}`);
      },
      { enableHighAccuracy: true }
    );
    postClientEvent('geolocation', 'Geolocation requested without timeout; unresolved permission prompt can freeze workflow');
  };

  const triggerPreflightStorm = () => {
    for (let index = 0; index < 8; index += 1) {
      fetch('/api/policy/preflight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-TRANS-Trace': `preflight-${index}`,
          'X-Policy-Probe': 'cors-latency',
        },
        body: JSON.stringify({ index }),
      }).catch(() => undefined);
    }
  };

  const simulateItpLoss = async () => {
    await fetch('/api/session/third-party', { credentials: 'include' });
    postClientEvent('itp', 'Dashboard marked third-party session as lost after SameSite=None cookie simulation');
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      <section className="shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">AI-TRANS GLOBAL COMMUNICATION HUB</p>
            <h1>Browser Policy Regression Console</h1>
          </div>
          <div className="port-pill">
            <Network size={16} />
            localhost:9087
          </div>
        </header>

        <section className="status-grid">
          {riskCards.map(({ label, value, icon: Icon }) => (
            <article className="glass metric" key={label}>
              <Icon size={20} />
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </section>

        <section className="workspace">
          <article className="glass editor-panel">
            <div className="panel-title">
              <Languages size={20} />
              <span>Real-Time Multilingual Translation</span>
            </div>
            <div className="language-row">
              <select value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value)}>
                {languages.map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
              <Globe2 size={18} />
              <select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)}>
                {languages.map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
            </div>
            <textarea value={text} onChange={(event) => setText(event.target.value)} />
            <div className="actions">
              <button onClick={translate}>Translate</button>
              <button onClick={copyTranslated}>
                <Clipboard size={16} />
                Copy
              </button>
            </div>
            <output>{translated || '번역 결과가 여기에 스트리밍됩니다.'}</output>
          </article>

          <article className="glass audio-panel">
            <div className="panel-title">
              <Mic2 size={20} />
              <span>Live Audio Waveform</span>
            </div>
            <div className="waveform" aria-label="simulated audio waveform">
              {Array.from({ length: 42 }).map((_, index) => (
                <i key={index} style={{ height: `${18 + ((index * 17) % 66)}%`, animationDelay: `${index * 42}ms` }} />
              ))}
            </div>
            <div className="actions compact">
              <button onClick={requestGeo}>
                <MapPin size={16} />
                Geo Probe
              </button>
              <button onClick={triggerPreflightStorm}>
                <ShieldAlert size={16} />
                CORS Storm
              </button>
              <button onClick={simulateItpLoss}>
                <AlertTriangle size={16} />
                ITP Session
              </button>
            </div>
            <div className="observer-target" ref={removableTargetRef}>
              Intersection Observer Training Target
            </div>
          </article>
        </section>

        <section className="glass terminal-panel">
          <div className="panel-title">
            <ShieldAlert size={20} />
            <span>CSP / CORS / Browser Policy Terminal</span>
            <b>{socketAttempts} WS reconnects</b>
          </div>
          <div className="terminal">
            {logs.map((log) => (
              <p key={`${log.timestamp}-${log.channel}-${log.message}`}>
                <time>{new Date(log.timestamp).toLocaleTimeString()}</time>
                <span>[{log.channel}]</span>
                {log.message}
              </p>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

