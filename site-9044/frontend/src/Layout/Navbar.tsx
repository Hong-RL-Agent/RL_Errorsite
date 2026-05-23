import { Bell, Search } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-8 text-slate-300">
      <div className="relative w-96">
        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="화물 번호 또는 제품명 검색..." 
          className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex items-center gap-6">
        <Bell size={20} className="cursor-pointer hover:text-white" />
        <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
          <span className="text-sm font-medium">관리자 (하은)</span>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">HE</div>
        </div>
      </div>
    </header>
  );
}