import React, { useState, useEffect, useRef } from 'react'

function App() {
  const [balance, setBalance] = useState({ balance: 0, currency: 'USD' });
  const [transactions, setTransactions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const fetchData = async () => {
    try {
      const [balRes, txRes, logRes] = await Promise.all([
        fetch('/api/wallet/balance'),
        fetch('/api/transactions'),
        fetch('/api/logs')
      ]);
      const balData = await balRes.json();
      const txData = await txRes.json();
      const logData = await logRes.json();

      setBalance(balData);
      setTransactions(txData.data);
      setLogs(logData.data);
    } catch (err) {
      setError("Failed to fetch system data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerBug = async (bugId) => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (bugId === 'site012-bug01') {
        res = await fetch('/api/wallet/balance?shadow=true');
        const data = await res.json();
        setBalance(data);
        if (data.bugId) setError({ message: "Inconsistent Balance Detected", bugId: data.bugId });
      } else if (bugId === 'site012-bug02') {
        // Send two identical requests
        const reqBody = { amount: 100, recipient: 'John Doe' };
        const reqOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Idempotency-Test': 'trigger' },
          body: JSON.stringify(reqBody)
        };
        const [res1, res2] = await Promise.all([fetch('/api/transfer/send', reqOptions), fetch('/api/transfer/send', reqOptions)]);
        const data1 = await res1.json();
        const data2 = await res2.json();
        if (data1.bugId || data2.bugId) setError({ message: "Duplicate Transaction Processed", bugId: data1.bugId || data2.bugId });
        await fetchData();
      } else if (bugId === 'site012-bug03') {
        res = await fetch('/api/transfer/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 500, recipient: 'Failed Transfer', fail: true })
        });
        const data = await res.json();
        if (data.bugId) setError({ message: "Rollback Failure: Balance Deducted on Error", bugId: data.bugId });
        await fetchData();
      } else if (bugId === 'site012-bug04') {
        res = await fetch('/api/transfer/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 10, recipient: 'Ghost', log: true })
        });
        const data = await res.json();
        if (data.bugId) setError({ message: "Side-Effect Leak: Log recorded on unauthorized request", bugId: data.bugId });
        await fetchData();
      }
    } catch (err) {
      setError({ message: "API Error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferAmount || !recipient) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/transfer/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(transferAmount), recipient })
      });
      const data = await res.json();
      if (!res.ok) {
        setError({ message: data.message || "Transfer failed" });
      } else {
        await fetchData();
        setTransferAmount('');
        setRecipient('');
      }
    } catch (err) {
      setError({ message: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-gray-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">W</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CryptoWallet <span className="text-xs font-normal opacity-40 ml-2">site012</span></h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] uppercase tracking-wider opacity-50">Mainnet Live</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => fetch('/api/test/reset', {method:'POST'}).then(()=>window.location.reload())}
            className="text-[10px] font-bold border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors uppercase tracking-widest"
          >
            System Reset
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Wallet & Transfer */}
          <div className="lg:col-span-4 space-y-6">
            {/* Balance Card */}
            <div className="crypto-card p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16"></div>
              <p className="text-sm font-medium opacity-50 mb-1">Total Balance</p>
              <h2 className="text-4xl font-bold mono tracking-tight mb-6">
                <span className="text-blue-500 mr-2">$</span>
                {balance.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              <div className="flex gap-2">
                <div className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded">STABLE</div>
                <div className="bg-white/5 text-white/50 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{balance.currency}</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="crypto-card p-6 rounded-3xl">
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-30 mb-4">Transfer Assets</h3>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold opacity-40 mb-1 block ml-1">Recipient Address</label>
                  <input 
                    type="text" 
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    placeholder="0x... or Username"
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold opacity-40 mb-1 block ml-1">Amount</label>
                  <input 
                    type="number" 
                    value={transferAmount}
                    onChange={e => setTransferAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors mono"
                  />
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                >
                  {loading ? 'Processing...' : 'Send Transaction'}
                </button>
              </form>
            </div>

            {/* Bug Triggers */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Testing Protocols</h3>
              <button 
                data-bug-id="site012-bug01"
                onClick={() => triggerBug('site012-bug01')}
                className="w-full text-left p-4 rounded-2xl border border-red-500/20 hover:bg-red-500/5 transition-colors group"
              >
                <div className="text-xs font-bold text-red-400 group-hover:text-red-300">Shadow Account Sync</div>
                <div className="text-[10px] opacity-40">Trigger balance inconsistency check</div>
              </button>
              <button 
                data-bug-id="site012-bug02"
                onClick={() => triggerBug('site012-bug02')}
                className="w-full text-left p-4 rounded-2xl border border-red-500/20 hover:bg-red-500/5 transition-colors group"
              >
                <div className="text-xs font-bold text-red-400 group-hover:text-red-300">Idempotency Validation</div>
                <div className="text-[10px] opacity-40">Trigger duplicate transaction test</div>
              </button>
              <button 
                data-bug-id="site012-bug03"
                onClick={() => triggerBug('site012-bug03')}
                className="w-full text-left p-4 rounded-2xl border border-red-500/20 hover:bg-red-500/5 transition-colors group"
              >
                <div className="text-xs font-bold text-red-400 group-hover:text-red-300">Saga Compensation</div>
                <div className="text-[10px] opacity-40">Trigger rollback failure test</div>
              </button>
              <button 
                data-bug-id="site012-bug04"
                onClick={() => triggerBug('site012-bug04')}
                className="w-full text-left p-4 rounded-2xl border border-red-500/20 hover:bg-red-500/5 transition-colors group"
              >
                <div className="text-xs font-bold text-red-400 group-hover:text-red-300">Side-Effect Isolation</div>
                <div className="text-[10px] opacity-40">Trigger failed log leak test</div>
              </button>
            </div>
          </div>

          {/* Right Column: List & Logs */}
          <div className="lg:col-span-8 space-y-6">
            {/* Error Notification */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                <div className="bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white mt-0.5">!</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-red-400">{error.message}</div>
                  {error.bugId && <div className="text-[10px] font-mono opacity-50 mt-1 uppercase tracking-tighter">Bug ID: {error.bugId}</div>}
                </div>
                <button onClick={() => setError(null)} className="text-red-400 opacity-50 hover:opacity-100">&times;</button>
              </div>
            )}

            {/* Transactions List */}
            <div className="crypto-card rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-30">Recent Transactions</h3>
                <span className="text-[10px] opacity-40">{transactions.length} items</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase font-bold opacity-30 border-b border-white/5">
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Recipient</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 mono text-[11px] opacity-60">{tx.id}</td>
                        <td className="px-6 py-4 font-medium">{tx.recipient}</td>
                        <td className="px-6 py-4 font-bold text-blue-400">${tx.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`status-badge status-${tx.status}`}>{tx.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-[10px] opacity-40">{new Date(tx.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center opacity-20 italic">No transactions found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Logs Panel */}
            <div className="crypto-card rounded-3xl overflow-hidden">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-30">System Audit Logs</h3>
              </div>
              <div className="log-panel h-48 overflow-y-auto p-4 mono">
                {logs.slice().reverse().map(log => (
                  <div key={log.id} className="mb-2 last:mb-0 border-l border-blue-500/30 pl-3">
                    <span className="opacity-30 text-[9px] mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className="text-blue-300">{log.event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
