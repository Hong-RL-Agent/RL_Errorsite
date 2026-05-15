import React from 'react';

type BookProps = {
  id: string;
  title: string;
  author: string;
};

export const BookCard: React.FC<BookProps> = ({ id, title, author }) => {
  return (
    <div className="group relative bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden">
      {/* 장식용 배경 번호 */}
      <div className="absolute -right-4 -top-4 text-7xl font-black text-slate-800/20 group-hover:text-cyan-500/10 transition-colors">
        {id.padStart(2, '0')}
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-tighter">
            Neural Data
          </span>
          <span className="text-[10px] text-slate-500 font-mono">ID: {id}</span>
        </div>

        {/* 의도적 결함: dangerouslySetInnerHTML를 통해 XSS 실행 (Index: 9045-Client-3) */}
        <h3 
          className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2"
          dangerouslySetInnerHTML={{ __html: title }}
        />

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600" />
            <span className="text-sm text-slate-400 font-medium">{author}</span>
          </div>
          <button className="text-xs font-bold text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1">
            ACCESS <span className="text-[10px]">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};