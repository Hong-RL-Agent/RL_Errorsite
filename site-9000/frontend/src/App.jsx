import React, { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemLog, setSystemLog] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 에이전트가 클릭했을 때 502 에러를 유발할 핵심 API 호출
  const fetchServerData = async () => {
    setIsLoading(true);
    setSystemLog('서버와 통신 중...');
    
    try {
      const response = await fetch('/api/v1/system/status');
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      setSystemLog('데이터 로드 완료: 정상');
    } catch (error) {
      // 502 에러가 터지면 화면에 붉은색 경고를 띄웁니다.
      setSystemLog(`[CRITICAL] 시스템 장애 발생: 502 Bad Gateway (Nginx Upstream Error)`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100 md:p-6">
      <div className="mx-auto grid w-full max-w-7xl gap-4 md:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl shadow-black/20">
          <h2 className="mb-8 text-lg font-semibold tracking-wide text-cyan-400">J.A.W.S Admin</h2>
          <nav className="space-y-2">
            <button className={navBtnClass(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>대시보드 홈</button>
            <button className={navBtnClass(activeTab === 'users')} onClick={() => setActiveTab('users')}>사용자 관리</button>
            <button className={navBtnClass(activeTab === 'settings')} onClick={() => setActiveTab('settings')}>인프라 설정</button>
          </nav>
          <div className="mt-10 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-400">
            Target Port: 9000
            <br />
            Env: Production
          </div>
        </aside>

        <main className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 md:p-8">
          <header className="mb-8 flex flex-col gap-4 border-b border-slate-800 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Control Center</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">
                {activeTab === 'dashboard' && '대시보드 개요'}
                {activeTab === 'users' && '사용자 관리'}
                {activeTab === 'settings' && '인프라 설정 (포트 9000)'}
              </h1>
            </div>
            <div className="flex w-full max-w-md gap-2">
              <input
                type="text"
                placeholder="검색어 입력..."
                className="h-10 flex-1 rounded-lg border border-slate-700 bg-slate-950/80 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
              <button className="h-10 rounded-lg bg-cyan-500 px-4 text-sm font-medium text-slate-950 transition hover:bg-cyan-400">검색</button>
            </div>
          </header>

          <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="활성 세션" value="1,284" hint="+8.2% from yesterday" />
            <MetricCard label="평균 응답 시간" value="12ms" hint="p95 latency stable" />
            <MetricCard label="서버 헬스 체크" value="Warning" hint="1 degraded node" danger />
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-white">실시간 서버 로그 연동</h2>
              <button
                onClick={fetchServerData}
                disabled={isLoading}
                className={`h-10 rounded-lg px-4 text-sm font-semibold transition ${
                  isLoading
                    ? 'cursor-not-allowed bg-slate-700 text-slate-300'
                    : 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'
                }`}
              >
                {isLoading ? '연동 중...' : '서버 데이터 강제 동기화'}
              </button>
            </div>

            {systemLog && (
              <div
                className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
                  systemLog.includes('CRITICAL')
                    ? 'border-rose-400/40 bg-rose-500/15 text-rose-200'
                    : 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                }`}
              >
                <strong>시스템 응답:</strong> {systemLog}
              </div>
            )}

            <div className="overflow-hidden rounded-lg border border-slate-800">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">노드</th>
                    <th className="px-4 py-3">마지막 동기화</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  <tr className="bg-slate-950/60">
                    <td className="px-4 py-3"><StatusBadge tone="ok">정상</StatusBadge></td>
                    <td className="px-4 py-3">Frontend-UI-01</td>
                    <td className="px-4 py-3">방금 전</td>
                  </tr>
                  <tr className="bg-slate-950/30">
                    <td className="px-4 py-3"><StatusBadge tone="error">연결 끊김</StatusBadge></td>
                    <td className="px-4 py-3 font-semibold text-white">Backend-API-Core</td>
                    <td className="px-4 py-3">응답 없음</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function MetricCard({ label, value, hint, danger = false }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${danger ? 'text-rose-300' : 'text-white'}`}>{value}</p>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </article>
  );
}

function StatusBadge({ tone, children }) {
  const toneClass = tone === 'ok'
    ? 'border border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
    : 'border border-rose-400/30 bg-rose-500/15 text-rose-200';

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  );
}

const navBtnClass = (active) =>
  `w-full rounded-lg px-3 py-2 text-left text-sm transition ${
    active
      ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/40'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`;

export default App;
