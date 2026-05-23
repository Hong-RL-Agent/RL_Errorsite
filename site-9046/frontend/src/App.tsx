import { useEffect, useState, useContext } from 'react';
import { AppContext } from './context';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Wallet, TrendingUp, Download, ServerCrash } from 'lucide-react';

function Dashboard() {
  const [tickerData, setTickerData] = useState<any[]>([]);

  useEffect(() => {
    // Defect 370: Memory Leak / Performance
    // Accumulating setIntervals without cleanup
    setInterval(() => {
      setTickerData((prev) => {
        const newData = [...prev, { time: new Date().toLocaleTimeString(), price: 50000 + Math.random() * 2000 }];
        return newData.slice(-20);
      });
    }, 1000);
  }, []);

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-blue-900/50 shadow-[0_0_15px_rgba(0,243,255,0.15)] mb-6">
      <h2 className="text-2xl font-bold text-[var(--color-neon-blue)] mb-4 flex items-center gap-2">
        <TrendingUp className="text-[var(--color-neon-blue)]" /> Live Market Data
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={tickerData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" />
            <YAxis stroke="#64748b" domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
            <Line type="monotone" dataKey="price" stroke="var(--color-neon-blue)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TradePanel({ setError }: { setError: (err: string | null) => void }) {
  const { balance } = useContext(AppContext);
  const [amount, setAmount] = useState('');

  const handleTrade = async (type: 'buy' | 'sell') => {
    try {
      const res = await fetch(`/api/trade?type=${type}&amount=${amount}`, { method: 'POST' });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      // Defect 390: State Synchronization Error
      // Backend updated, but frontend state NOT updated
      alert(`${type.toUpperCase()} order successful! (UI Balance not updated intentionally)`);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-purple-900/50 shadow-[0_0_15px_rgba(176,38,255,0.15)]">
      <h2 className="text-xl font-bold text-[var(--color-cyber-purple)] mb-4">Quick Trade</h2>
      <div className="flex gap-4 items-center">
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="Amount"
          className="bg-slate-950 border border-slate-800 text-white px-4 py-2 rounded focus:outline-none focus:border-[var(--color-cyber-purple)]"
        />
        <button onClick={() => handleTrade('buy')} className="bg-green-600/20 text-green-400 border border-green-500/50 px-6 py-2 rounded hover:bg-green-600/40 transition-colors">Buy</button>
        <button onClick={() => handleTrade('sell')} className="bg-red-600/20 text-red-400 border border-red-500/50 px-6 py-2 rounded hover:bg-red-600/40 transition-colors">Sell</button>
      </div>
      <p className="mt-4 text-slate-400 text-sm">Available Balance: <span className="text-white font-mono">${balance}</span></p>
    </div>
  );
}

function WithdrawalPanel({ setError }: { setError: (err: string | null) => void }) {
  const { balance, setBalance } = useContext(AppContext);
  const [amount, setAmount] = useState('');

  const handleWithdraw = async () => {
    const withdrawAmount = Number(amount);
    // Frontend validation
    if (withdrawAmount > balance) {
      alert("Frontend Validation Failed: Insufficient balance!");
      return;
    }
    
    try {
      const res = await fetch(`/api/withdraw?amount=${withdrawAmount}`, { method: 'POST' });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      setBalance(balance - withdrawAmount);
      alert('Withdrawal successful');
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-slate-700 mt-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Download className="text-slate-400" /> Withdraw Funds
      </h2>
      <div className="flex gap-4 items-center">
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="Amount"
          className="bg-slate-950 border border-slate-800 text-white px-4 py-2 rounded focus:outline-none focus:border-slate-500"
        />
        <button onClick={handleWithdraw} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">Withdraw</button>
      </div>
    </div>
  );
}

function ErrorModal({ error, onClose }: { error: string | null, onClose: () => void }) {
  if (!error) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-red-600 rounded-xl p-6 max-w-3xl w-full">
        <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
          <AlertCircle /> System Error
        </h3>
        {/* Defect 400: Expose raw Java Stack Trace */}
        <pre className="bg-slate-950 p-4 rounded text-red-400 text-sm overflow-auto max-h-96 whitespace-pre-wrap font-mono">
          {error}
        </pre>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700">Close</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [error, setError] = useState<string | null>(null);

  const triggerDbError = async () => {
    try {
      const res = await fetch('/api/db-error');
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-neon-blue)] to-[var(--color-cyber-purple)] tracking-tighter">
            NEBULA v2
          </h1>
          <p className="text-slate-400 mt-1">Next-Gen Asset Management & HFT Platform</p>
        </div>
        <button onClick={triggerDbError} className="flex items-center gap-2 text-red-500 hover:text-red-400 border border-red-500/30 px-4 py-2 rounded-full hover:bg-red-500/10 transition-colors">
          <ServerCrash size={18} /> Trigger System Failure
        </button>
      </header>

      <main className="max-w-6xl mx-auto">
        <Dashboard />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TradePanel setError={setError} />
          <div>
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-800 rounded-full">
                  <Wallet className="text-[var(--color-neon-blue)]" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Asset Value</p>
                  <p className="text-3xl font-bold text-white mt-1">$10,000.00</p>
                </div>
              </div>
            </div>
            <WithdrawalPanel setError={setError} />
          </div>
        </div>
      </main>

      <ErrorModal error={error} onClose={() => setError(null)} />
    </div>
  );
}

export default App;
