import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, Database, Clock, Server, Terminal } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/metrics/stats', { headers: { 'X-User-ID': 'ADMIN_HAEUN_DEV' }})
      .then(res => res.json()).then(setData).catch(console.error);
  }, []);

  return (
    <div className="w-full flex justify-center py-12 px-6">
      {/* 🚀 최대 너비를 1440px로 잡고 mx-auto로 밀어넣기 */}
      <div className="w-full max-w-[1440px] flex flex-col gap-10">
        
        {/* 상단 헤더: 대칭 균형 */}
        <header className="flex justify-between items-end border-b border-slate-800 pb-10">
          <div className="space-y-2 text-left">
            <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tighter">
              <Activity className="text-blue-500" size={40} /> JAWS INFRA MONITOR <span className="text-blue-600">#9030</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg uppercase tracking-widest">Autonomous QA RL Lab Environment</p>
          </div>
          <div className="bg-[#151921] border border-slate-800 px-6 py-4 rounded-2xl text-right">
            <span className="text-xs text-slate-500 font-bold block mb-1">X-TRACE-ID</span>
            <span className="text-yellow-500 font-mono font-bold text-lg">{data?.traceId || "ERR_MISSING"}</span>
          </div>
        </header>

        {/* 4개의 그리드 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card title="Thread Context" value={data?.userToken || "Guest"} icon={<ShieldAlert className="text-red-500"/>} />
          <Card title="Server Time" value={data ? new Date(data.serverTime).toLocaleTimeString() : "Syncing"} icon={<Clock className="text-blue-400"/>} />
          <Card title="Warm Start Pool" value={data?.historyCount + " Nodes"} icon={<Database className="text-purple-400"/>} />
          <Card title="Circuit State" value={data?.status || "UP"} icon={<Server className="text-green-500"/>} />
        </div>

        {/* 대형 그래프 영역 */}
        <div className="bg-[#151921] border border-slate-800 rounded-[3rem] p-12 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-10 flex items-center gap-3 uppercase">
            <Terminal className="text-blue-500" /> Real-time System Latency (ms)
          </h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={12} dy={10} />
                <YAxis stroke="#475569" fontSize={12} dx={-10} />
                <Tooltip contentStyle={{backgroundColor: '#0f172a', borderRadius: '20px', border: 'none'}} />
                <Line type="step" dataKey="v" stroke="#3b82f6" strokeWidth={5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon }: any) => (
  <div className="bg-[#151921] border border-slate-800/50 p-8 rounded-3xl flex flex-col gap-4 shadow-xl">
    <div className="p-3 bg-slate-900 w-fit rounded-xl">{icon}</div>
    <div className="space-y-1 text-left">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
      <p className="text-2xl font-mono font-black text-white truncate">{value}</p>
    </div>
  </div>
);

const mockData = Array.from({length: 20}, (_, i) => ({ name: i, v: Math.random() * 400 + 100 }));

export default Dashboard;