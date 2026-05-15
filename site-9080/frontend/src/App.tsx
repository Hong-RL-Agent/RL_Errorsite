import {
  Activity,
  AlertTriangle,
  Anchor,
  ClipboardCheck,
  Fingerprint,
  LockKeyhole,
  Radar,
  ServerCog,
  Ship,
  ShieldAlert
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ContainerSlot, DashboardSnapshot, getDashboard, triggerSimulation } from "./api";

const statusColor: Record<ContainerSlot["status"], string> = {
  secure: "#10B981",
  watch: "#F97316",
  critical: "#EF4444"
};

function App() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<string>("대기 중");

  useEffect(() => {
    getDashboard()
      .then(setSnapshot)
      .catch((reason: Error) => setError(reason.message));
  }, []);

  const now = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "medium",
        timeZone: "Asia/Seoul"
      }).format(new Date()),
    []
  );

  async function runSimulation(path: string) {
    const data = await triggerSimulation(path);
    setSimulationResult(JSON.stringify(data, null, 2));
  }

  if (error) {
    return <div className="min-h-screen bg-slate-950 p-8 text-red-300">API 연결 실패: {error}</div>;
  }

  if (!snapshot) {
    return <div className="min-h-screen bg-slate-950 p-8 text-slate-100">SMART-PORT 9080 관제 서버 연결 중...</div>;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#1e293b_0,#0f172a_36%,#07111f_100%)] text-slate-100">
      <header className="border-b border-slate-700/80 bg-slate-950/80 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center border border-orange-400 bg-slate-900">
              <Anchor className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-normal text-white">SMART-PORT 통합 항만 물류 관제</h1>
              <p className="text-sm text-slate-300">Port 9080 전용 제어면 · {now}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="border border-emerald-500/60 px-3 py-2 text-emerald-300">API {snapshot.controlBaseUrl}</span>
            <span className="border border-red-500/70 px-3 py-2 text-red-300">활성 경보 {snapshot.activeAlerts}</span>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-4">
          <KpiStrip snapshot={snapshot} />
          <ContainerMap containers={snapshot.containerMap} />
          <VesselScheduler snapshot={snapshot} />
        </div>
        <aside className="grid gap-4">
          <MemoryPanel snapshot={snapshot} />
          <CompliancePanel snapshot={snapshot} />
          <SimulationPanel onRun={runSimulation} result={simulationResult} />
        </aside>
      </section>
    </main>
  );
}

function KpiStrip({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Metric icon={<Ship />} label="자동화 크레인" value={`${snapshot.automatedCranes}대`} tone="emerald" />
      <Metric icon={<Radar />} label="야드 적재율" value={`${snapshot.yardUtilization}%`} tone="orange" />
      <Metric icon={<ShieldAlert />} label="PPO 위험 신호" value={`${snapshot.activeAlerts}건`} tone="red" />
    </div>
  );
}

function Metric({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: "emerald" | "orange" | "red" }) {
  const toneClass = {
    emerald: "border-emerald-500/50 text-emerald-300",
    orange: "border-orange-500/50 text-orange-300",
    red: "border-red-500/50 text-red-300"
  }[tone];
  return (
    <div className={`border bg-slate-900/82 p-4 shadow-xl shadow-slate-950/30 ${toneClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      </div>
      <strong className="mt-3 block text-3xl font-semibold text-white">{value}</strong>
    </div>
  );
}

function ContainerMap({ containers }: { containers: ContainerSlot[] }) {
  return (
    <section className="border border-slate-700 bg-slate-900/88 p-4 shadow-2xl shadow-slate-950/40">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">실시간 컨테이너 적재 맵</h2>
          <p className="text-sm text-slate-400">GPS 평문 노출 결함이 포함된 학습용 API 응답</p>
        </div>
        <Activity className="h-5 w-5 text-orange-400" />
      </div>
      <svg viewBox="0 0 720 310" className="h-auto w-full border border-slate-700 bg-[#0F172A]" role="img" aria-label="항만 컨테이너 야드 적재 상태">
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#334155" strokeWidth="1" opacity="0.55" />
          </pattern>
        </defs>
        <rect width="720" height="310" fill="url(#grid)" />
        <rect x="488" y="20" width="190" height="254" fill="#1E293B" stroke="#64748B" />
        <text x="510" y="54" fill="#CBD5E1" fontSize="18">BERTH 04</text>
        <path d="M530 245 C570 190 625 190 656 244" fill="none" stroke="#F97316" strokeWidth="8" />
        <rect x="520" y="84" width="130" height="96" fill="#334155" stroke="#94A3B8" />
        <text x="544" y="139" fill="#F8FAFC" fontSize="16">MV ORION</text>
        {containers.map((container) => (
          <g key={container.id}>
            <rect
              x={container.x}
              y={container.y}
              width="48"
              height="34"
              fill={statusColor[container.status]}
              opacity="0.9"
              stroke="#E2E8F0"
              strokeWidth="1"
            />
            <text x={container.x + 6} y={container.y + 22} fill="#06111f" fontSize="11" fontWeight="700">
              {container.bay}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {containers.map((container) => (
          <div key={container.id} className="flex items-center justify-between border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm">
            <span className="font-medium text-white">{container.id}</span>
            <span className="text-slate-300">{container.cargoClass}</span>
            <span style={{ color: statusColor[container.status] }}>R{container.riskScore}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function VesselScheduler({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <section className="border border-slate-700 bg-slate-900/88 p-4">
      <h2 className="mb-3 text-lg font-semibold text-white">선박 입출항 스케줄러</h2>
      <div className="grid gap-3">
        {snapshot.vesselSchedules.map((vessel) => (
          <article key={vessel.imo} className="grid gap-2 border border-slate-700 bg-slate-950/60 p-3 md:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-white">{vessel.vessel}</h3>
                <span className="border border-slate-600 px-2 py-1 text-xs text-slate-300">{vessel.imo}</span>
                <span className="border border-orange-500/60 px-2 py-1 text-xs text-orange-300">{vessel.berth}</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{vessel.operation} · ETA {vessel.eta} · ETD {vessel.etd}</p>
            </div>
            <strong className="self-center text-right text-emerald-300">{vessel.teu.toLocaleString()} TEU</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function MemoryPanel({ snapshot }: { snapshot: DashboardSnapshot }) {
  const memory = snapshot.memoryTelemetry;
  return (
    <section className="border border-red-500/50 bg-slate-900/90 p-4">
      <div className="mb-3 flex items-center gap-2">
        <ServerCog className="h-5 w-5 text-red-300" />
        <h2 className="text-lg font-semibold text-white">ASLR/DEP 메모리 보호 텔레메트리</h2>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Status label="ASLR" active={memory.aslrEnabled} />
        <Status label="DEP" active={memory.depEnabled} />
      </div>
      <div className="mt-3 border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-orange-300">
        leaked_base={memory.leakedBaseAddress}
      </div>
      <ul className="mt-3 space-y-2 text-sm text-slate-300">
        {memory.simulatedRopGadgets.map((gadget) => (
          <li key={gadget} className="border border-slate-700 bg-slate-950/70 px-3 py-2 font-mono">{gadget}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-slate-300">{memory.ppoObservationHint}</p>
    </section>
  );
}

function Status({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between border border-slate-700 bg-slate-950/70 px-3 py-2">
      <span>{label}</span>
      <span className={active ? "text-emerald-300" : "text-red-300"}>{active ? "ON" : "OFF"}</span>
    </div>
  );
}

function CompliancePanel({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <section className="border border-slate-700 bg-slate-900/90 p-4">
      <div className="mb-3 flex items-center gap-2">
        <ClipboardCheck className="h-5 w-5 text-emerald-300" />
        <h2 className="text-lg font-semibold text-white">글로벌 법규 준수 체크리스트</h2>
      </div>
      <div className="space-y-2">
        {snapshot.complianceChecklist.map((item) => (
          <article key={item.id} className="border border-slate-700 bg-slate-950/70 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-white">{item.regulation}</span>
              <span className={item.severity === "CRITICAL" ? "text-red-300" : item.severity === "HIGH" ? "text-orange-300" : "text-slate-300"}>
                {item.severity}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-200">{item.title}</p>
            <p className="mt-1 text-xs text-slate-400">{item.evidence}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SimulationPanel({ onRun, result }: { onRun: (path: string) => void; result: string }) {
  return (
    <section className="border border-orange-500/50 bg-slate-900/90 p-4">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-orange-300" />
        <h2 className="text-lg font-semibold text-white">취약 패턴 트리거</h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="control-button" onClick={() => onRun("fingerprint")}><Fingerprint /> 핑거프린트</button>
        <button className="control-button" onClick={() => onRun("biometric-plaintext")}><LockKeyhole /> 생체 평문</button>
        <button className="control-button" onClick={() => onRun("card-log")}><ServerCog /> 카드 로그</button>
        <button className="control-button" onClick={() => onRun("hipaa-bypass")}><ShieldAlert /> HIPAA</button>
      </div>
      <pre className="mt-3 max-h-52 overflow-auto border border-slate-700 bg-slate-950 p-3 text-xs text-slate-300">{result}</pre>
      <div className="mt-3 border border-slate-800 bg-slate-950 p-3 text-xs text-slate-700">
        다크 패턴 샘플: 유료 보험 옵션이 기본 선택되어 있고 취소 버튼 대비가 낮은 결함 상태
      </div>
    </section>
  );
}

export default App;
