import React, { useState } from "react";

function App() {
  const [status, setStatus] = useState("시스템 준비 완료");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) =>
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 6));

  const handleDeepAnalysis = async () => {
    setIsAnalyzing(true);
    setStatus("초고용량 데이터 클러스터링 중...");
    addLog("벡터 엔진 초기화 중...");

    try {
      const res = await fetch("/api/analyze");
      if (!res.ok) throw new Error("Server Crash");
      setStatus("분석 완료");
      addLog("데이터 최적화 완료");
    } catch (err) {
      setStatus("⚠️ 서버 연결 끊김 (Internal System Error)");
      addLog("FATAL: 백엔드 노드 응답 없음");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const menuItems = [
    "대시보드",
    "글로벌 모니터링",
    "데이터 마이닝",
    "딥러닝 분석",
    "클라우드 설정",
  ];

  const statusHealthy = !status.includes("⚠️");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-72 flex-col border-r border-slate-800 bg-slate-900/70 px-6 py-8 backdrop-blur xl:flex">
          <div className="mb-10">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">Site #9001</p>
            <h1 className="mt-2 text-2xl font-bold">JAWS DATA AI</h1>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const active = item === "딥러닝 분석";
              return (
                <button
                  key={item}
                  type="button"
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                    active
                      ? "bg-cyan-400/20 text-cyan-300 ring-1 ring-cyan-400/30"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-400">현재 플랜</p>
            <p className="mt-1 text-sm font-semibold">Enterprise Cluster</p>
            <p className="mt-2 text-xs text-slate-400">활성 노드 12 · GPU 48개</p>
          </div>
        </aside>

        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8 xl:px-10">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">운영 콘솔</p>
              <h2 className="text-2xl font-bold sm:text-3xl">딥러닝 분석 센터</h2>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${statusHealthy ? "bg-emerald-400" : "bg-red-400"}`} />
              <span className="text-slate-300">{status}</span>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="가용 메모리" value="48.2 MB / 50.0 MB" sub="임계치 96%" highlight />
            <MetricCard title="CPU 점유율" value="12.4%" sub="평균 대비 -4.1%" />
            <MetricCard title="처리 대기열" value="1,402건" sub="최근 10분 +118" />
            <MetricCard title="성공률" value="99.82%" sub="오늘 요청 8,431회" />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/10 to-blue-500/5 p-7">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">AI Job Launcher</p>
                <h3 className="mt-3 text-2xl font-semibold">대규모 비정형 데이터 분석</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  10억 건 이상의 데이터를 클러스터링해 AI 모델을 재학습합니다. 분석 파이프라인은
                  백엔드 상태에 따라 자동 재시도됩니다.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
                  <span className="rounded-full border border-slate-700 px-3 py-1">예상 메모리: 2.4GB</span>
                  <span className="rounded-full border border-slate-700 px-3 py-1">평균 처리 시간: 32초</span>
                  <span className="rounded-full border border-slate-700 px-3 py-1">우선순위: High</span>
                </div>
                <button
                  type="button"
                  onClick={handleDeepAnalysis}
                  disabled={isAnalyzing}
                  className="mt-7 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-6 py-3 text-base font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                >
                  {isAnalyzing ? "분석 중..." : "실시간 분석 시작"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">워크로드</p>
              <h3 className="mt-2 text-xl font-semibold">현재 리소스 분배</h3>
              <div className="mt-5 space-y-4">
                <Progress label="GPU Cluster" percent={78} />
                <Progress label="Inference Pods" percent={42} />
                <Progress label="Storage IO" percent={61} />
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">System terminal log</p>
              <span className="text-xs text-slate-500">최근 이벤트 {logs.length}건</span>
            </div>
            <div className="rounded-xl bg-black/40 p-4 font-mono text-sm leading-7 text-slate-300">
              {logs.length === 0 ? (
                <p>&gt; 분석 요청 대기 중...</p>
              ) : (
                logs.map((log, i) => <p key={i}>{log}</p>)
              )}
            </div>
          </section>
        </main>
      </nav>
    </div>
  );
}

function MetricCard({ title, value, sub, highlight = false }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-amber-400/40 bg-amber-400/5"
          : "border-slate-800 bg-slate-900/70"
      }`}
    >
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function Progress({ label, percent }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default App;
