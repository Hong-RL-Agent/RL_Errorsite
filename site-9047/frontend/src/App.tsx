import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  CalendarCheck,
  ChevronRight,
  CreditCard,
  Gauge,
  Hotel,
  Orbit,
  Radio,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from './api';

type Booking = {
  id: number;
  guestName: string;
  roomType: string;
  nights: number;
  paymentStatus: string;
  bookingStatus: string;
};

type MonitorMessage = {
  timestamp: string;
  room: string;
  stabilizer: string;
};

const panelClass =
  'min-w-0 rounded-lg border border-white/15 bg-slate-950/55 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.38)] ring-1 ring-white/5 backdrop-blur-2xl';
const titleClass = 'mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-normal text-cyan-100';
const labelClass = 'mb-3 grid gap-2 text-[13px] font-bold text-slate-200/75';
const inputClass =
  'min-h-11 w-full rounded-lg border border-white/15 bg-white/[0.07] px-3 py-2 text-white outline-none transition focus:border-cyan-300/70 focus:bg-white/[0.11] focus:ring-2 focus:ring-cyan-300/20';
const primaryButtonClass =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-200 via-sky-100 to-rose-200 px-4 font-black text-slate-950 shadow-[0_14px_38px_rgba(103,232,249,0.22)] transition hover:translate-y-[-1px] hover:shadow-[0_18px_46px_rgba(251,207,232,0.26)] active:translate-y-0';
const secondaryButtonClass =
  'mb-3 mr-2 inline-flex min-h-10 max-w-full items-center justify-center gap-2 rounded-lg bg-white/90 px-4 text-sm font-black text-slate-950 shadow-[0_10px_28px_rgba(255,255,255,0.12)] transition hover:bg-cyan-100';
const metricRowClass =
  'flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5';

function ConfirmationPanel() {
  const guestName = new URLSearchParams(window.location.search).get('guestName') || 'Orbit Guest';

  return (
    <section className={`${panelClass} lg:col-span-4 md:col-span-6 col-span-12`}>
      <div className={titleClass}>
        <ShieldCheck size={18} />
        <span>예약 확인</span>
      </div>
      {/* J.A.W.S intentional defect #5: URL parameter is rendered as raw HTML. */}
      <div
        className="min-h-14 overflow-hidden break-words rounded-lg border border-cyan-200/15 bg-cyan-100/10 p-4 text-2xl font-black text-white"
        dangerouslySetInnerHTML={{ __html: guestName }}
      />
      <p className="mt-4 text-sm leading-6 text-slate-200/70">
        무중력 객실 접근 권한이 체크인 시점에 자동 동기화됩니다.
      </p>
    </section>
  );
}

function App() {
  const [guestName, setGuestName] = useState('Kim Nova');
  const [nights, setNights] = useState(2);
  const [simulatePaymentFailure, setSimulatePaymentFailure] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [gravityValue, setGravityValue] = useState(3);
  const [correction, setCorrection] = useState<string>('대기 중');
  const [monitor, setMonitor] = useState<MonitorMessage | null>(null);
  const [uploadResult, setUploadResult] = useState('신분증 파일 대기 중');
  const [registerResult, setRegisterResult] = useState('회원 계정 대기 중');

  const roomPrice = useMemo(() => nights * 9047, [nights]);

  const refreshBookings = async () => {
    const response = await api.get<Booking[]>('/bookings');
    setBookings(response.data);
  };

  const confirmBooking = async () => {
    // J.A.W.S intentional defect #6:
    // No loading flag or disabled button, so rapid clicks submit duplicate bookings.
    await api.post('/bookings/confirm', {
      guestName,
      roomType: 'Anti-gravity Suite AG-9047',
      nights,
      simulatePaymentFailure,
    });
    await refreshBookings();
  };

  const loadStatus = async () => {
    const response = await api.get('/rooms/antigravity/status');
    setStatus(response.data);
  };

  const calculateCorrection = async () => {
    try {
      const response = await api.get('/rooms/antigravity/correction', { params: { value: gravityValue } });
      setCorrection(String(response.data.correction));
    } catch (error) {
      setCorrection('계산 장치 오류');
    }
  };

  const uploadIdentity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem('identity') as HTMLInputElement;
    if (!input.files?.[0]) return;
    const body = new FormData();
    body.append('file', input.files[0]);
    const response = await api.post('/uploads/identity', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setUploadResult(`저장됨: ${response.data.storedAs}`);
  };

  const weakRegister = async () => {
    const response = await api.post('/auth/register', {
      email: 'guest9047@orbit.local',
      password: '1',
      displayName: guestName,
    });
    setRegisterResult(`생성됨: ${response.data.email}`);
  };

  const fakeOAuth = async () => {
    const response = await api.get('/auth/oauth/callback', {
      params: { code: 'demo-code-9047', state: 'unverified-client-state' },
    });
    setRegisterResult(`OAuth 통과: ${response.data.authenticated}`);
  };

  useEffect(() => {
    refreshBookings().catch(() => undefined);
    loadStatus().catch(() => undefined);

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws/monitor'),
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe('/topic/antigravity', (message) => {
          setMonitor(JSON.parse(message.body));
        });
        client.publish({ destination: '/app/pulse', body: JSON.stringify({ origin: window.location.origin }) });
      },
    });
    client.activate();
    return () => {
      client.deactivate();
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070d] px-4 py-5 text-white sm:px-7 lg:px-14 lg:py-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.34),transparent_25%),radial-gradient(circle_at_82%_16%,rgba(251,113,133,0.21),transparent_24%),linear-gradient(135deg,#05070d_0%,#111827_45%,#13231f_100%)]" />
      <div className="starfield" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />

      <header className="relative z-10 flex flex-col gap-4 rounded-lg border border-white/15 bg-slate-950/45 px-4 py-3 shadow-[0_18px_70px_rgba(0,0,0,0.3)] ring-1 ring-white/5 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-lg border border-cyan-200/20 bg-cyan-200/10 text-cyan-100">
            <Orbit size={27} />
          </div>
          <div>
            <strong className="block text-sm font-black tracking-normal text-white">ORBIT-HOTEL</strong>
            <span className="text-xs font-medium text-slate-300/75">Anti-gravity Reservation System 9047</span>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2 text-sm font-bold text-slate-200/75">
          {[
            ['예약', '#reserve'],
            ['모니터', '#monitor'],
            ['신원', '#identity'],
          ].map(([label, href]) => (
            <a
              key={href}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 transition hover:border-cyan-200/40 hover:bg-cyan-200/10 hover:text-white"
              href={href}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <section className="relative z-10 grid min-h-[440px] items-center gap-8 py-10 md:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:py-14">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-cyan-200/20 bg-cyan-200/10 px-3 py-1.5 text-xs font-black text-cyan-100">
            <Sparkles size={14} />
            Lunar Dock C-7
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl">
            무중력 스위트에서 지구의 소음을 끊어내다
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200/75 sm:text-lg">
            투명한 궤도 돔, 개인 중력 벡터 조정, 실시간 안정화 모니터링을 하나의 예약 흐름으로
            제공합니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a className={primaryButtonClass.replace('w-full', 'w-auto')} href="#reserve">
              객실 예약
              <ChevronRight size={18} />
            </a>
            <a className={secondaryButtonClass} href="#monitor">
              실시간 상태
            </a>
          </div>
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-white/15 bg-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.34)] ring-1 ring-white/5 backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.03))]" />
          <div className="absolute left-1/2 top-1/2 size-52 -translate-x-1/2 -translate-y-[42%] rounded-full bg-[radial-gradient(circle_at_35%_28%,#ffffff,#80e8ff_16%,#2367ff_45%,#163463_72%,#07111f_100%)] shadow-[0_0_90px_rgba(84,209,255,0.55)]" />
          <div className="absolute left-1/2 top-[52%] h-24 w-[340px] -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] rounded-full border-2 border-white/45" />
          <div className="absolute left-1/2 top-[52%] h-32 w-[410px] -translate-x-1/2 -translate-y-1/2 rotate-[17deg] rounded-full border-2 border-rose-300/40" />
          <Hotel className="absolute right-[18%] top-[22%] text-white drop-shadow-2xl" size={54} />
          <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/10 bg-slate-950/45 p-3 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 text-xs font-black text-slate-200/80">
              <span>Docking Vector</span>
              <span className="text-cyan-100">AG-9047 STABLE</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 grid grid-cols-12 gap-4 pb-10">
        <div id="reserve" className={`${panelClass} lg:col-span-4 md:col-span-6 col-span-12`}>
          <div className={titleClass}>
            <CalendarCheck size={18} />
            <span>객실 예약</span>
          </div>
          <label className={labelClass}>
            투숙객
            <input className={inputClass} value={guestName} onChange={(event) => setGuestName(event.target.value)} />
          </label>
          <label className={labelClass}>
            숙박 일수
            <input
              className={inputClass}
              type="number"
              min="1"
              value={nights}
              onChange={(event) => setNights(Number(event.target.value))}
            />
          </label>
          <label className="mb-4 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] p-3 text-[13px] font-bold text-slate-200/75">
            <input
              className="size-4 accent-cyan-200"
              type="checkbox"
              checked={simulatePaymentFailure}
              onChange={(event) => setSimulatePaymentFailure(event.target.checked)}
            />
            결제 게이트웨이 실패 시뮬레이션
          </label>
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-cyan-200/15 bg-cyan-200/10 p-3">
            <span className="text-sm font-bold text-slate-200/75">예상 금액</span>
            <strong className="text-xl font-black text-cyan-50">{roomPrice.toLocaleString()} CR</strong>
          </div>
          <button className={primaryButtonClass} onClick={confirmBooking}>
            <CreditCard size={18} />
            예약 확정
          </button>
        </div>

        <ConfirmationPanel />

        <div id="monitor" className={`${panelClass} lg:col-span-4 md:col-span-6 col-span-12`}>
          <div className={titleClass}>
            <Radio size={18} />
            <span>무중력실 실시간 상태</span>
          </div>
          <button className={secondaryButtonClass} onClick={loadStatus}>
            <Gauge size={17} />
            상태 로그 조회
          </button>
          <dl className="mt-1 grid gap-2.5">
            <div className={metricRowClass}>
              <dt className="text-sm text-slate-200/65">Field Drift</dt>
              <dd className="font-black text-white">{status?.fieldDrift ? Number(status.fieldDrift).toFixed(5) : '-'}</dd>
            </div>
            <div className={metricRowClass}>
              <dt className="text-sm text-slate-200/65">Retained Logs</dt>
              <dd className="font-black text-white">{String(status?.retainedLogCount ?? '-')}</dd>
            </div>
            <div className={metricRowClass}>
              <dt className="text-sm text-slate-200/65">Socket Room</dt>
              <dd className="font-black text-white">{monitor?.room ?? 'AG-9047'}</dd>
            </div>
            <div className={metricRowClass}>
              <dt className="text-sm text-slate-200/65">Stabilizer</dt>
              <dd className="font-black text-cyan-100">{monitor?.stabilizer ?? 'CONNECTING'}</dd>
            </div>
          </dl>
        </div>

        <div className={`${panelClass} lg:col-span-4 md:col-span-6 col-span-12`}>
          <div className={titleClass}>
            <Gauge size={18} />
            <span>중력 보정값</span>
          </div>
          <label className={labelClass}>
            입력값
            <input
              className={inputClass}
              type="number"
              value={gravityValue}
              onChange={(event) => setGravityValue(Number(event.target.value))}
            />
          </label>
          <button className={secondaryButtonClass} onClick={calculateCorrection}>
            보정 계산
          </button>
          <div className="mt-1 inline-flex max-w-full break-words rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 font-black text-cyan-50">
            {correction}
          </div>
        </div>

        <div id="identity" className={`${panelClass} lg:col-span-4 md:col-span-6 col-span-12`}>
          <div className={titleClass}>
            <Upload size={18} />
            <span>투숙객 신분증</span>
          </div>
          <form className="grid gap-3" onSubmit={uploadIdentity}>
            <input className={inputClass} name="identity" type="file" />
            <button className={secondaryButtonClass} type="submit">
              업로드
            </button>
          </form>
          <p className="mt-1 break-words text-sm leading-6 text-slate-200/70">{uploadResult}</p>
        </div>

        <div className={`${panelClass} lg:col-span-4 md:col-span-6 col-span-12`}>
          <div className={titleClass}>
            <ShieldCheck size={18} />
            <span>빠른 인증</span>
          </div>
          <button className={secondaryButtonClass} onClick={weakRegister}>
            비밀번호 1로 가입
          </button>
          <button className={secondaryButtonClass} onClick={fakeOAuth}>
            소셜 로그인 콜백
          </button>
          <p className="mt-1 break-words text-sm leading-6 text-slate-200/70">{registerResult}</p>
        </div>

        <div className={`${panelClass} col-span-12`}>
          <div className={titleClass}>
            <CalendarCheck size={18} />
            <span>예약 매니페스트</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {bookings.map((booking) => (
              <article
                className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.06] p-4 transition hover:border-cyan-200/25 hover:bg-cyan-100/10"
                key={booking.id}
              >
                <strong className="break-words font-black text-white">
                  #{booking.id} {booking.guestName}
                </strong>
                <span className="text-sm text-slate-200/70">
                  {booking.bookingStatus} / {booking.paymentStatus} / {booking.nights}박
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
