import type { FC } from 'react';

export const LandingPage: FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <main className="relative pt-40 pb-20 px-8 flex flex-col items-center text-center max-w-6xl mx-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-cyan-500/10 blur-[160px] rounded-full -z-10" />
      
      <header className="space-y-6 mb-16">
        <h1 className="text-7xl md:text-9xl font-black text-white tracking-tight leading-[0.9]">
          NEURAL <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
            KNOWLEDGE
          </span>
        </h1>
        <p className="max-w-xl mx-auto text-slate-400 text-lg md:text-xl font-medium">
          세계 최초의 신경망 기반 AI 라이브러리. <br />
          이제 당신의 브라우저에서 직접 인덱싱된 지식을 경험하세요.
        </p>
      </header>
      
      <div className="flex gap-6">
        <button 
          onClick={onStart}
          className="px-10 py-5 bg-cyan-500 text-slate-950 font-black rounded-2xl hover:bg-cyan-400 transition-all hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] active:scale-95"
        >
          START EXPLORING
        </button>
        <button className="px-10 py-5 bg-slate-900 border border-slate-800 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">
          DOCUMENTATION
        </button>
      </div>

      <section className="mt-32 w-full grid grid-cols-2 md:grid-cols-4 gap-12 text-left border-t border-slate-800 pt-16">
        {[
          { label: 'Uptime', val: '99.99%' },
          { label: 'Latency', val: '0.4ms' },
          { label: 'Security', val: 'L9 Grade' },
          { label: 'Nodes', val: '9,045' }
        ].map(s => (
          <div key={s.label}>
            <p className="text-cyan-500 text-xs font-black tracking-widest mb-2 uppercase">{s.label}</p>
            <p className="text-3xl font-bold text-white">{s.val}</p>
          </div>
        ))}
      </section>
    </main>
  );
};