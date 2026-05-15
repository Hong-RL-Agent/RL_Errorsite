import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, Cpu, Database, Flame, Gauge, RadioTower, ShieldAlert, WalletCards, Zap } from 'lucide-react';
import './styles.css';

const fallback = {
  symbol: 'BTC/USDT',
  lastPrice: 68420.15,
  dayChange: 2.34,
  equity: 1240884.22,
  marginUsed: 38.7,
  matchedOrders: 1284552,
  engineLatencyMicros: 820,
  bids: [],
  asks: [],
  trades: [],
  candles: [],
  regressions: []
};

function App() {
  const [snapshot, setSnapshot] = useState(fallback);
  const [tab, setTab] = useState('trade');
  const [stress, setStress] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/exchange/snapshot');
        const data = await res.json();
        if (active) setSnapshot(data);
      } catch {
        if (active) setSnapshot(generateLocalSnapshot());
      }
    };
    load();
    const id = setInterval(load, 1600);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const submitStressOrder = async () => {
    setStress(true);
    try {
      const res = await fetch('/api/exchange/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: 'BTC/USDT', side: 'BUY', quantity: 120, price: snapshot.lastPrice + 1250, stressMode: true })
      });
      setSnapshot(await res.json());
    } catch {
      setSnapshot(generateLocalSnapshot(true));
    } finally {
      setTimeout(() => setStress(false), 1100);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0E11] text-zinc-100">
      <TopBar snapshot={snapshot} />
      <section className="mx-auto grid max-w-[1720px] gap-3 px-3 py-3 lg:grid-cols-[320px_minmax(560px,1fr)_340px]">
        <aside className="space-y-3">
          <AssetPanel snapshot={snapshot} />
          <OrderBook title="매수 호가" levels={snapshot.bids} side="BUY" />
        </aside>
        <section className="space-y-3">
          <div className="flex h-10 items-center justify-between border border-zinc-800 bg-zinc-950/80 px-2">
            <div className="flex gap-1">
              {['trade', 'risk'].map((item) => (
                <button key={item} onClick={() => setTab(item)} className={`tab ${tab === item ? 'tab-active' : ''}`}>
                  {item === 'trade' ? '거래 대시보드' : '성능 분석'}
                </button>
              ))}
            </div>
            <button onClick={submitStressOrder} className="stress-button" disabled={stress}>
              <Zap size={16} /> {stress ? '회귀 주입 중' : '대량 주문 주입'}
            </button>
          </div>
          {tab === 'trade' ? <TradingSurface snapshot={snapshot} stress={stress} /> : <RegressionSurface regressions={snapshot.regressions} latency={snapshot.engineLatencyMicros} />}
        </section>
        <aside className="space-y-3">
          <OrderBook title="매도 호가" levels={snapshot.asks} side="SELL" />
          <Trades trades={snapshot.trades} />
        </aside>
      </section>
    </main>
  );
}

function TopBar({ snapshot }) {
  const positive = snapshot.dayChange >= 0;
  return (
    <header className="border-b border-zinc-800 bg-[#0B0E11]/95">
      <div className="mx-auto flex max-w-[1720px] flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center border border-[#F3BA2F]/60 bg-[#F3BA2F]/10 text-[#F3BA2F]"><Database size={22} /></div>
          <div>
            <h1 className="text-xl font-black tracking-normal text-white">CRYPTO-CORE</h1>
            <p className="text-xs text-zinc-500">Institutional matching engine laboratory</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-right md:grid-cols-4">
          <Ticker label={snapshot.symbol} value={`$${format(snapshot.lastPrice)}`} tone={positive ? 'green' : 'red'} />
          <Ticker label="24H" value={`${positive ? '+' : ''}${snapshot.dayChange}%`} tone={positive ? 'green' : 'red'} />
          <Ticker label="MATCHED" value={snapshot.matchedOrders.toLocaleString()} />
          <Ticker label="LATENCY" value={`${snapshot.engineLatencyMicros}us`} tone="gold" />
        </div>
      </div>
    </header>
  );
}

function Ticker({ label, value, tone }) {
  const color = tone === 'green' ? 'text-[#00C087]' : tone === 'red' ? 'text-[#CF304A]' : tone === 'gold' ? 'text-[#F3BA2F]' : 'text-zinc-100';
  return <div className="min-w-28"><p className="text-[11px] text-zinc-500">{label}</p><p className={`font-mono text-sm font-bold ${color}`}>{value}</p></div>;
}

function TradingSurface({ snapshot, stress }) {
  return (
    <div className="grid gap-3 xl:grid-cols-[1fr_270px]">
      <section className={`panel h-[520px] ${stress ? 'render-stall' : ''}`}>
        <div className="panel-head"><span>BTC/USDT Perpetual</span><span className="text-[#F3BA2F]">1m</span></div>
        <CandleChart candles={snapshot.candles} />
      </section>
      <section className="panel">
        <div className="panel-head"><span>주문 입력</span><ShieldAlert size={16} className="text-[#F3BA2F]" /></div>
        <div className="space-y-3 p-3">
          <OrderInput label="가격" value={snapshot.lastPrice} />
          <OrderInput label="수량" value="0.2500" />
          <div className="grid grid-cols-2 gap-2">
            <button className="trade-buy">매수</button>
            <button className="trade-sell">매도</button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Metric icon={<Gauge size={15} />} label="증거금" value={`${snapshot.marginUsed}%`} />
            <Metric icon={<WalletCards size={15} />} label="자산" value={`$${compact(snapshot.equity)}`} />
            <Metric icon={<Cpu size={15} />} label="CPU Pin" value="0-1" />
            <Metric icon={<RadioTower size={15} />} label="IRQ" value="storm" />
          </div>
        </div>
      </section>
    </div>
  );
}

function CandleChart({ candles }) {
  const data = candles?.length ? candles : generateCandles();
  const width = 980;
  const height = 420;
  const max = Math.max(...data.map((d) => d.high));
  const min = Math.min(...data.map((d) => d.low));
  const scaleY = (v) => height - ((v - min) / (max - min || 1)) * (height - 28) - 14;
  const step = width / data.length;
  const line = data.map((d, i) => `${i * step + step / 2},${scaleY(d.close)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(243,186,47,.08),transparent_32%)]">
      <defs>
        <linearGradient id="gridGlow" x1="0" x2="1"><stop stopColor="#F3BA2F" stopOpacity=".2" /><stop offset="1" stopColor="#00C087" stopOpacity=".08" /></linearGradient>
      </defs>
      {Array.from({ length: 8 }).map((_, i) => <line key={i} x1="0" x2={width} y1={i * 54} y2={i * 54} stroke="#1f2937" strokeWidth="1" />)}
      <polyline points={line} fill="none" stroke="url(#gridGlow)" strokeWidth="2" />
      {data.map((d, i) => {
        const x = i * step + step / 2;
        const up = d.close >= d.open;
        const y = Math.min(scaleY(d.open), scaleY(d.close));
        const body = Math.max(2, Math.abs(scaleY(d.open) - scaleY(d.close)));
        return (
          <g key={d.ts || i}>
            <line x1={x} x2={x} y1={scaleY(d.high)} y2={scaleY(d.low)} stroke={up ? '#00C087' : '#CF304A'} strokeWidth="1.4" />
            <rect x={x - step * 0.28} y={y} width={Math.max(3, step * 0.56)} height={body} fill={up ? '#00C087' : '#CF304A'} opacity=".9" />
          </g>
        );
      })}
    </svg>
  );
}

function AssetPanel({ snapshot }) {
  return (
    <section className="panel">
      <div className="panel-head"><span>자산 관리</span><WalletCards size={16} className="text-[#F3BA2F]" /></div>
      <div className="space-y-3 p-3">
        <div><p className="text-xs text-zinc-500">총 평가 자산</p><p className="font-mono text-2xl font-bold">${format(snapshot.equity)}</p></div>
        <div className="h-2 bg-zinc-900"><div className="h-full bg-[#F3BA2F]" style={{ width: `${snapshot.marginUsed}%` }} /></div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Metric label="USDT" value="842K" />
          <Metric label="BTC" value="5.84" />
          <Metric label="ETH" value="74.2" />
          <Metric label="Risk" value="Low" />
        </div>
      </div>
    </section>
  );
}

function OrderBook({ title, levels = [], side }) {
  const data = levels.length ? levels : generateBook(side);
  return (
    <section className="panel">
      <div className="panel-head"><span>{title}</span><Activity size={16} className={side === 'BUY' ? 'text-[#00C087]' : 'text-[#CF304A]'} /></div>
      <div className="p-2 font-mono text-xs">
        {data.map((level, i) => (
          <div key={i} className="relative grid grid-cols-3 py-1">
            <div className={`absolute inset-y-0 right-0 ${side === 'BUY' ? 'bg-[#00C087]/10' : 'bg-[#CF304A]/10'}`} style={{ width: `${Math.max(6, level.depth * 100)}%` }} />
            <span className={side === 'BUY' ? 'z-10 text-[#00C087]' : 'z-10 text-[#CF304A]'}>{format(level.price)}</span>
            <span className="z-10 text-right text-zinc-300">{level.quantity}</span>
            <span className="z-10 text-right text-zinc-500">{(level.quantity * level.price / 1000).toFixed(1)}K</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Trades({ trades = [] }) {
  const data = trades.length ? trades : generateTrades();
  return (
    <section className="panel">
      <div className="panel-head"><span>최근 체결</span><Flame size={16} className="text-[#F3BA2F]" /></div>
      <div className="max-h-[390px] overflow-hidden p-2 font-mono text-xs">
        {data.map((trade, i) => (
          <div key={i} className="grid grid-cols-3 py-1">
            <span className={trade.side === 'BUY' ? 'text-[#00C087]' : 'text-[#CF304A]'}>{format(trade.price)}</span>
            <span className="text-right text-zinc-300">{trade.quantity}</span>
            <span className="text-right text-zinc-500">{new Date(trade.ts).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RegressionSurface({ regressions = [], latency }) {
  const data = regressions.length ? regressions : generateRegressions();
  return (
    <section className="grid gap-3 lg:grid-cols-2">
      {data.map((item) => (
        <article key={item.id} className="panel p-3">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs text-zinc-500">REG-{String(item.id).padStart(2, '0')}</p><h2 className="text-sm font-bold text-zinc-100">{item.name}</h2></div>
            <span className="status">{item.status}</span>
          </div>
          <div className="mt-3 h-2 bg-zinc-900"><div className="h-full bg-[#CF304A]" style={{ width: `${item.severity * 100}%` }} /></div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <Metric label="Penalty" value={`${item.latencyPenaltyMicros}us`} />
            <Metric label="Signal" value={item.signal} />
          </div>
        </article>
      ))}
      <article className="panel p-3 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">엔진 지연 프로파일</h2>
          <p className="font-mono text-[#F3BA2F]">{latency}us</p>
        </div>
        <div className="mt-4 flex h-28 items-end gap-1">
          {Array.from({ length: 72 }).map((_, i) => <div key={i} className="flex-1 bg-[#00C087]/70" style={{ height: `${18 + ((i * 17 + latency) % 78)}%` }} />)}
        </div>
      </article>
    </section>
  );
}

function OrderInput({ label, value }) {
  return <label className="block text-xs text-zinc-500">{label}<input className="mt-1 w-full border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-zinc-100 outline-none focus:border-[#F3BA2F]" value={value} readOnly /></label>;
}

function Metric({ icon, label, value }) {
  return <div className="border border-zinc-800 bg-black/30 p-2">{icon && <span className="mb-1 block text-[#F3BA2F]">{icon}</span>}<p className="text-zinc-500">{label}</p><p className="truncate font-mono text-zinc-100" title={String(value)}>{value}</p></div>;
}

const format = (value) => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
const compact = (value) => Intl.NumberFormat('en', { notation: 'compact' }).format(value || 0);

function generateLocalSnapshot(stressed = false) {
  const candles = generateCandles();
  return { ...fallback, lastPrice: candles.at(-1).close, engineLatencyMicros: stressed ? 19400 : 920, bids: generateBook('BUY'), asks: generateBook('SELL'), trades: generateTrades(), candles, regressions: generateRegressions() };
}

function generateCandles() {
  let p = 68000;
  return Array.from({ length: 90 }, (_, i) => {
    const open = p;
    const close = open + Math.sin(i / 4) * 44 + (i % 5 - 2) * 12;
    p = close;
    return { ts: Date.now() - (90 - i) * 60000, open, close, high: Math.max(open, close) + 35, low: Math.min(open, close) - 28, volume: 100 };
  });
}

function generateBook(side) {
  return Array.from({ length: 14 }, (_, i) => ({ price: 68420 + (side === 'BUY' ? -1 : 1) * (i + 1) * 7.25, quantity: (0.2 + i * 0.31).toFixed(2), depth: (14 - i) / 14, side }));
}

function generateTrades() {
  return Array.from({ length: 22 }, (_, i) => ({ ts: Date.now() - i * 1300, price: 68420 + (i % 2 ? i * 3.4 : -i * 2.8), quantity: (0.04 + i * 0.07).toFixed(3), side: i % 3 ? 'BUY' : 'SELL' }));
}

function generateRegressions() {
  return ['FD 임계점 커널 패닉', 'KSM 스캔 오버헤드', 'NVMe 큐 경합', 'L1TF 패치 오버헤드', 'GPU 동기화 정지', 'CPU L3 캐시 슬라이드', 'OOM 킬러 오선택', 'VRAM 온도 스로틀링', '컨텍스트 스위칭 폭풍', 'L3 파티셔닝 실패', '인터럽트 폭풍'].map((name, i) => ({ id: i + 1, name, status: i % 2 ? 'active' : 'armed', severity: 0.58 + (i % 4) * 0.09, latencyPenaltyMicros: 400 + i * 870, signal: 'simulated lab signal' }));
}

createRoot(document.getElementById('root')).render(<App />);

