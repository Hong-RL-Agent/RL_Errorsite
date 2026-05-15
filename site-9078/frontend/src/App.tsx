import { AlertTriangle, BadgeCheck, Database, Globe2, RadioTower, Scale, ShieldAlert, Siren } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DashboardPayload, fetchDashboard } from './lib/api';

const fallback: DashboardPayload = {
  news: [],
  preferences: [],
  inventory: [],
  traces: [],
  incidents: []
};

function riskClass(risk: string) {
  const normalized = risk.toLowerCase();
  if (normalized.includes('critical')) return 'text-red-200 bg-red-950/80 border-red-700';
  if (normalized.includes('high')) return 'text-blue-100 bg-blue-950/70 border-blue-700';
  return 'text-stone-200 bg-stone-900 border-stone-700';
}

export function App() {
  const [data, setData] = useState<DashboardPayload>(fallback);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  const criticalCount = useMemo(
    () => data.incidents.filter((incident) => incident.severity === 'Critical').length,
    [data.incidents]
  );

  return (
    <main className="min-h-screen bg-[#121212] text-[#F5F1E8] paper-texture">
      <header className="border-b border-stone-700/80 px-5 py-5 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.24em] text-red-300">Port 9078 Security Edition</p>
            <h1 className="font-serif text-4xl leading-none md:text-6xl">NEWS-FEED</h1>
          </div>
          <div className="grid grid-cols-3 gap-2 text-right font-sans text-xs uppercase text-stone-300 md:min-w-[420px]">
            <div className="border border-stone-700 bg-black/30 p-3">
              <span className="block text-2xl font-semibold text-red-300">{criticalCount}</span>
              Critical
            </div>
            <div className="border border-stone-700 bg-black/30 p-3">
              <span className="block text-2xl font-semibold text-blue-300">{data.news.length}</span>
              Live Feeds
            </div>
            <div className="border border-stone-700 bg-black/30 p-3">
              <span className="block text-2xl font-semibold text-stone-100">9078</span>
              Isolated
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 md:grid-cols-[1.7fr_1fr] md:px-8">
        <div>
          <div className="mb-3 flex items-center gap-2 border-b border-stone-700 pb-2">
            <Siren className="h-5 w-5 text-red-500" />
            <h2 className="font-serif text-2xl">Live Editorial Feed</h2>
          </div>
          {error ? <p className="border border-red-700 bg-red-950/60 p-4 text-red-100">{error}</p> : null}
          <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
            {data.news.map((item) => (
              <article key={item.id} className="mb-4 break-inside-avoid border border-stone-700 bg-[#181818] p-4 shadow-xl">
                <div className="mb-3 flex items-center justify-between gap-3 font-sans text-xs uppercase text-stone-400">
                  <span className={item.priority === 'breaking' ? 'text-red-300' : item.priority === 'analysis' ? 'text-blue-300' : 'text-stone-200'}>
                    {item.section}
                  </span>
                  <span>{item.trustScore}% trust</span>
                </div>
                <h3 className="font-serif text-2xl leading-tight">{item.title}</h3>
                <p className="mt-3 font-sans text-sm leading-6 text-stone-300">{item.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.signals.map((signal) => (
                    <span key={signal} className="border border-stone-700 bg-black px-2 py-1 font-sans text-[11px] uppercase text-stone-200">
                      {signal}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <section className="border border-stone-700 bg-[#181818] p-4">
            <div className="mb-4 flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-blue-400" />
              <h2 className="font-serif text-xl">Reader Preference Index</h2>
            </div>
            <div className="space-y-3">
              {data.preferences.map((metric) => (
                <div key={metric.label}>
                  <div className="mb-1 flex justify-between font-sans text-sm text-stone-300">
                    <span>{metric.label}</span>
                    <span>{metric.value}</span>
                  </div>
                  <div className="h-3 border border-stone-700 bg-black">
                    <div className="h-full" style={{ width: `${metric.value}%`, backgroundColor: metric.color }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-stone-700 bg-[#181818] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-red-400" />
              <h2 className="font-serif text-xl">Helm / License Inventory</h2>
            </div>
            <div className="space-y-3">
              {data.inventory.map((item) => (
                <div key={item.component} className="border-b border-stone-800 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-sans text-sm font-semibold">{item.component}</p>
                      <p className="font-sans text-xs text-stone-400">{item.type} {item.version} / {item.owner}</p>
                    </div>
                    <span className={`border px-2 py-1 font-sans text-[11px] uppercase ${riskClass(item.risk)}`}>{item.risk}</span>
                  </div>
                  <p className="mt-2 font-sans text-xs leading-5 text-stone-300">{item.finding}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-8 md:grid-cols-[1.2fr_1fr] md:px-8">
        <section className="border-t border-stone-700 pt-5">
          <div className="mb-4 flex items-center gap-2">
            <RadioTower className="h-5 w-5 text-blue-400" />
            <h2 className="font-serif text-2xl">BGP / DNS Path Trace</h2>
          </div>
          <div className="grid gap-4">
            {data.traces.map((trace) => (
              <div key={trace.id} className="border border-stone-700 bg-[#181818] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-sans text-sm font-semibold uppercase text-stone-200">{trace.routeName}</h3>
                  <span className="bg-red-900 px-2 py-1 font-sans text-xs uppercase text-red-100">{trace.status}</span>
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                  {trace.hops.map((hop) => (
                    <div key={`${trace.id}-${hop.name}`} className="relative border border-stone-700 bg-black/40 p-3">
                      <Globe2 className={hop.state === 'clean' ? 'mb-3 h-5 w-5 text-stone-400' : 'mb-3 h-5 w-5 text-red-400'} />
                      <p className="font-sans text-sm font-semibold">{hop.name}</p>
                      <p className="font-sans text-xs text-stone-400">{hop.kind} / {hop.region}</p>
                      <p className="mt-2 font-sans text-xs text-stone-300">{hop.latencyMs}ms · {hop.state}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-stone-700 pt-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-400" />
            <h2 className="font-serif text-2xl">Incident Ledger</h2>
          </div>
          <div className="max-h-[520px] overflow-auto border border-stone-700 bg-[#181818]">
            {data.incidents.map((incident) => (
              <div key={incident.id} className="grid grid-cols-[48px_1fr] border-b border-stone-800 last:border-0">
                <div className="flex items-center justify-center bg-black font-serif text-lg text-red-200">{incident.id}</div>
                <div className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-sans text-sm font-semibold">{incident.name}</p>
                    {incident.surface === 'License' ? <Scale className="h-4 w-4 text-blue-300" /> : <AlertTriangle className="h-4 w-4 text-red-300" />}
                  </div>
                  <p className="mt-1 font-sans text-xs text-stone-400">{incident.surface} · {incident.indicator}</p>
                  <p className="mt-2 font-mono text-[11px] text-stone-300">{incident.simulationLog}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
