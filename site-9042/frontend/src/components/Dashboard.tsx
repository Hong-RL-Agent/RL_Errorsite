import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  time: string;
  price: number;
}

const Dashboard: React.FC = () => {
  const [balance, setBalance] = useState<number>(1000000);
  const [chartData, setChartData] = useState<ChartData[]>([
    { time: '10:00', price: 50000 },
    { time: '10:05', price: 51000 },
    { time: '10:10', price: 50500 },
    { time: '10:15', price: 52000 }
  ]);

  useEffect(() => {
    // Fetch initial balance
    fetch('/api/trade/balance')
      .then(res => res.json())
      .then(data => setBalance(data.balance))
      .catch(err => console.error('Failed to fetch balance', err));
  }, []);

  // [Index 310] GUI Deadlock Defect
  // 특정 데이터 로딩 시 useEffect 의존성 배열 오류로 인해 무한 렌더링 루프를 발생
  // 이로 인해 브라우저 탭이 응답 없음 상태가 됨
  useEffect(() => {
    if (chartData.length < 5000) {
      const nextTime = new Date().toLocaleTimeString();
      const nextPrice = chartData[chartData.length - 1].price + (Math.random() * 1000 - 500);
      
      // Update state inside useEffect which depends on the same state
      setChartData([...chartData, { time: nextTime, price: nextPrice }]);
    }
  }, [chartData]); // Defect: chartData is in dependency array, causing infinite fast updates

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 col-span-1 flex flex-col justify-center">
          <h2 className="text-slate-400 text-sm font-medium mb-1">Total Balance</h2>
          <div className="text-4xl font-bold text-white tracking-tight">
            ₩ {balance.toLocaleString()}
          </div>
          <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium">
            <span>+2.4% today</span>
          </div>
        </div>
        
        <div className="glass-panel p-6 col-span-1 md:col-span-2">
           <h2 className="text-slate-400 text-sm font-medium mb-4">NEBULA Asset Performance</h2>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData.slice(-20)}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                 <XAxis dataKey="time" stroke="#94a3b8" />
                 <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                   itemStyle={{ color: '#818cf8' }}
                 />
                 <Line type="monotone" dataKey="price" stroke="#818cf8" strokeWidth={3} dot={false} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
