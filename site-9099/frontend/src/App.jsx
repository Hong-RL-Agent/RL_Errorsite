import { useEffect, useMemo, useState } from 'react';

const fallback = {
  timestamp: new Date().toISOString(),
  origin: 'http://localhost:9099',
  regions: [],
  telemetry: [],
  faults: [],
  operationsLog: ['WEATHER-SIM API 대기 중: /api/overview']
};

const points = [
  { code: 'NA', x: 22, y: 38 },
  { code: 'EU', x: 49, y: 31 },
  { code: 'AP', x: 72, y: 43 },
  { code: 'SA', x: 35, y: 67 },
  { code: 'AF', x: 52, y: 58 },
  { code: 'OC', x: 80, y: 72 }
];

function statusClass(status) {
  if (status === 'critical') return 'text-rose-600 bg-rose-50 border-rose-200';
  if (status === 'warning') return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-sky-700 bg-sky-50 border-sky-200';
}

export default function App({ icons }) {
  const { Activity, AlertTriangle, CloudSun, Database, Globe2, Server, ShieldAlert, TerminalSquare } = icons;
  const [data, setData] = useState(fallback);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const response = await fetch('/api/overview');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const next = await response.json();
        if (alive) {
          setData(next);
          setOnline(true);
        }
      } catch {
        if (alive) setOnline(false);
      }
    };
    load();
    const timer = setInterval(load, 8000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const critical = useMemo(() => data.faults.filter((f) => f.severity === 'critical').length, [data.faults]);
  const avgAvailability = useMemo(() => {
    if (!data.regions.length) return 0;
    return Math.round(data.regions.reduce((sum, region) => sum + region.availability, 0) / data.regions.length);
  }, [data.regions]);

  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#f0f9ff_48%,#e0f2fe_100%)] text-slate-800">
      <div className="cloud-layer cloud-a" />
      <div className="cloud-layer cloud-b" />

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/80 bg-white/82 p-5 shadow-[0_24px_80px_rgba(14,165,233,0.14)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-200">
              <CloudSun size={30} />
            </div>
            <div>
              <p className="text-sm font-semibold text-sky-600">WMO Cloud Operations Center</p>
              <h1 className="text-3xl font-black tracking-normal text-slate-900 md:text-4xl">WEATHER-SIM</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sky-700">{data.origin}</span>
            <span className={`rounded-full border px-4 py-2 ${online ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
              {online ? 'API LIVE' : 'API STANDBY'}
            </span>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-3xl border border-white/80 bg-white p-5 shadow-xl shadow-sky-100/70">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-sky-600">Global Weather Manipulation Map</p>
                <h2 className="text-xl font-black text-slate-900">전 지구 관측 리전 및 장애 전파</h2>
              </div>
              <Globe2 className="text-sky-500" />
            </div>
            <div className="map-frame">
              <svg viewBox="0 0 100 72" role="img" aria-label="global weather simulation map">
                <defs>
                  <linearGradient id="ocean" x1="0" x2="1" y1="0" y2="1">
                    <stop stopColor="#e0f2fe" />
                    <stop offset="1" stopColor="#ffffff" />
                  </linearGradient>
                </defs>
                <rect width="100" height="72" rx="10" fill="url(#ocean)" />
                <path d="M11 25 C17 14 31 13 37 25 C31 30 20 31 11 25Z M42 20 C52 10 66 16 65 28 C56 29 48 28 42 20Z M62 40 C73 33 88 41 88 54 C78 57 66 53 62 40Z M28 48 C38 44 46 55 40 66 C30 64 24 57 28 48Z M49 43 C58 38 65 48 61 59 C52 59 47 52 49 43Z" fill="#bae6fd" stroke="#38bdf8" strokeWidth="0.45" />
                {points.map((point) => {
                  const region = data.regions.find((item) => item.code === point.code);
                  const criticalRegion = region && region.availability < 80;
                  return (
                    <g key={point.code}>
                      <circle className="pulse-ring" cx={point.x} cy={point.y} r={criticalRegion ? 7 : 5} fill="none" stroke={criticalRegion ? '#e11d48' : '#0ea5e9'} />
                      <circle cx={point.x} cy={point.y} r="2.2" fill={criticalRegion ? '#e11d48' : '#0ea5e9'} />
                      <text x={point.x + 3} y={point.y - 2} className="map-label">{point.code}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="grid gap-5">
            <MetricCard icon={<Activity />} label="Average Availability" value={`${avgAvailability}%`} tone="sky" />
            <MetricCard icon={<ShieldAlert />} label="Critical Faults" value={critical || 0} tone="rose" />
            <MetricCard icon={<Server />} label="Observed Regions" value={data.regions.length || 6} tone="navy" />
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <Panel title="컨테이너 및 리전 상태" icon={<Server />}>
            <div className="space-y-3">
              {data.regions.map((region) => (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3" key={region.code}>
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm text-slate-900">{region.name}</strong>
                    <span className="text-sm font-black text-sky-600">{region.availability}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-sky-500" style={{ width: `${region.availability}%` }} />
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-500">{region.condition} · {region.latencyMs}ms · pods {region.activePods}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="DB 텔레메트리" icon={<Database />}>
            <div className="space-y-3">
              {data.telemetry.map((item) => (
                <div className={`rounded-2xl border p-3 ${statusClass(item.status)}`} key={item.metric}>
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm">{item.metric}</strong>
                    <span className="text-sm font-black">{item.value}</span>
                  </div>
                  <p className="mt-1 text-xs font-medium opacity-80">{item.detail}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="시스템 운영 로그" icon={<TerminalSquare />}>
            <div className="terminal">
              {data.operationsLog.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </Panel>
        </section>

        <section className="rounded-3xl border border-white/80 bg-white p-5 shadow-xl shadow-sky-100/70">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="text-rose-600" />
            <h2 className="text-xl font-black text-slate-900">PPO 장애 학습 시나리오 11종</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.faults.map((fault) => (
              <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm" key={fault.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-sky-600">{fault.layer}</p>
                    <h3 className="mt-1 text-base font-black text-slate-900">{fault.name}</h3>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${statusClass(fault.severity)}`}>{fault.severity}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">{fault.symptom}</p>
                <p className="mt-3 text-xs font-bold text-slate-500">PPO Signal: {fault.ppoSignal}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function MetricCard({ icon, label, value, tone }) {
  const colors = {
    sky: 'bg-sky-500 text-white shadow-sky-200',
    rose: 'bg-rose-600 text-white shadow-rose-200',
    navy: 'bg-slate-800 text-white shadow-slate-200'
  };
  return (
    <div className="rounded-3xl border border-white/80 bg-white p-5 shadow-xl shadow-sky-100/70">
      <div className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl shadow-lg ${colors[tone]}`}>{icon}</div>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <strong className="mt-2 block text-4xl font-black text-slate-900">{value}</strong>
    </div>
  );
}

function Panel({ title, icon, children }) {
  return (
    <section className="rounded-3xl border border-white/80 bg-white p-5 shadow-xl shadow-sky-100/70">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-900">{title}</h2>
        <span className="text-sky-500">{icon}</span>
      </div>
      {children}
    </section>
  );
}

