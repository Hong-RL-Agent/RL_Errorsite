import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, ShieldAlert, Activity, Globe, Terminal } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const NetworkDashboard = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/network/status')
      .then(res => res.json())
      .then(setData)
      .catch(() => console.log("Network Fault Detected"));
  }, []);

  return (
    <div className="w-full max-w-[1440px] mx-auto p-6 md:p-12 min-h-screen">
      <header className="flex justify-between items-end mb-12 border-b border-slate-800 pb-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter">
            <Wifi className="text-blue-500" size={40} /> NETWORK OPS <span className="text-blue-600">#9032</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Protocol & Partition Fault Training</p>
        </div>
        <div className="bg-[#151921] border border-slate-800 px-6 py-4 rounded-2xl">
          <span className="text-[10px] text-slate-500 font-black block mb-1 uppercase">Node Token</span>
          <span className="text-blue-400 font-mono font-bold">{data?.traceId || "SCANNING..."}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard title="Packet Loss" value={data?.packetLoss || "0%"} icon={<WifiOff className="text-red-500"/>} color="border-red-500/20" />
        <StatCard title="Jitter Latency" value={data?.latency || "0ms"} icon={<Activity className="text-blue-400"/>} color="border-blue-500/20" />
        <StatCard title="SSL Status" value={data?.sslStatus || "SECURE"} icon={<ShieldAlert className="text-orange-500"/>} color="border-orange-500/20" />
        <StatCard title="Protocol Env" value={data?.protocol || "HTTP/2"} icon={<Globe className="text-green-500"/>} color="border-green-500/20" />
      </div>

      <div className="bg-[#151921] border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
        <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3">
          <Terminal size={20} className="text-blue-500"/> Connection Stability Analysis
        </h2>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} />
              <Line type="step" dataKey="v" stroke="#3b82f6" strokeWidth={4} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className={`bg-[#151921] border ${color} p-8 rounded-3xl shadow-xl transition-all hover:translate-y-[-5px]`}>
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-slate-900 rounded-xl">{icon}</div>
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{title}</h3>
    </div>
    <div className="text-3xl font-mono font-black text-white truncate">{value}</div>
  </div>
);

const mockData = Array.from({length: 40}, (_, i) => ({ name: i, v: Math.floor(Math.random() * 100) }));

export default NetworkDashboard;