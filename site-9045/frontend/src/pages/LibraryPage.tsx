import React, { useEffect, useState } from 'react';
import { api } from '../api/axiosInstance';
import { BookCard } from '../components/BookCard';

type Book = {
  id: string;
  title: string;
  author: string;
};

export const LibraryPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentUser, setCurrentUser] = useState<string>("Loading...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 도서 목록 가져오기
        const bookRes = await api.get('/books');
        setBooks(bookRes.data);

        // 의도적 결함: ThreadLocal 미삭제로 인해 다른 유저 정보가 보일 수 있음 (Index: 9045-Server-1)
        const userRes = await api.get('/auth/me');
        setCurrentUser(userRes.data);
      } catch (error) {
        console.error("System Error", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-8 flex gap-8">
      {/* 왼쪽 사이드바 - 전문가 느낌 추가 */}
      <aside className="hidden lg:flex flex-col w-64 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 shadow-xl">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Current Session</h4>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
              {currentUser[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{currentUser}</p>
              <p className="text-[10px] text-cyan-500 font-mono">Active Connection</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2 px-2">
          {['All Archives', 'Recent Access', 'Secure Vault', 'Neural Models'].map((item) => (
            <button key={item} className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-1">Central Neural Archive</h2>
            <p className="text-slate-500 text-sm font-medium">Monitoring {books.length} active data streams</p>
          </div>
          <div className="flex gap-3">
            <input 
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-cyan-500/50 transition-all w-64"
              placeholder="Search data index..."
            />
            <button className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              SYNC
            </button>
          </div>
        </header>

        {/* 도서 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} id={book.id} title={book.title} author={book.author} />
          ))}
        </div>
      </main>
    </div>
  );
};