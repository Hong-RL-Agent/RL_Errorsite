import { Package, Truck, BarChart2, Settings } from 'lucide-react';

export default function Sidebar() {
  return (
    // [Index 420] 결함: z-50으로 설정하여 z-40인 모달을 가려버림
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-slate-300 z-50 border-r border-slate-800 shadow-2xl">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Truck className="text-blue-500" /> TITAN LOGISTICS
        </h1>
      </div>
      <nav className="mt-6 px-4 space-y-2">
        <a href="#" className="flex items-center gap-3 p-3 bg-slate-800 text-white rounded-lg"><Package size={20}/> 재고 관리</a>
        <a href="#" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors"><Truck size={20}/> 배송 현황</a>
        <a href="#" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors"><BarChart2 size={20}/> 분석 리포트</a>
        <div className="pt-10">
          <a href="#" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors text-slate-500"><Settings size={20}/> 설정</a>
        </div>
      </nav>
    </aside>
  );
}