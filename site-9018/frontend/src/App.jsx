import React, { useState, useEffect } from 'react';

function App() {
  const [account, setAccount] = useState({ balance: 0, isAccountLocked: false, pending_transactions: 0 });
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');

  const fetchInfo = () => {
    fetch('/api/account-info').then(res => res.json()).then(setAccount);
  };

  useEffect(() => {
    fetchInfo();
    const timer = setInterval(fetchInfo, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleTransfer = async () => {
    setMsg('Processing Transaction...');
    const res = await fetch('/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseInt(amount) })
    });
    const data = await res.json();
    setMsg(data.message || 'Transaction error');
    fetchInfo();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f9', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ backgroundColor: '#002a54', color: '#d4af37', padding: '20px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '22px' }}>🏦 JAWS PREMIER BANKING</h1>
        <div style={{ fontSize: '14px', color: 'white' }}>Safe & Secure Financial Partner</div>
      </header>

      <main style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
        {/* 잔액 카드 */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '30px', border: account.isAccountLocked ? '2px solid #ef4444' : 'none' }}>
          <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '10px' }}>Total Balance</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e293b' }}>₩ {account.balance.toLocaleString()}</div>
          {account.isAccountLocked && (
            <div style={{ marginTop: '20px', color: '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>
              ⚠️ ACCOUNT STATUS: LOCKED (System is processing another request)
            </div>
          )}
        </div>

        {/* 송금 폼 */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '25px', color: '#1e293b' }}>Fast Transfer</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input type="text" placeholder="Recipient Account" style={inputStyle} />
            <input 
              type="number" 
              placeholder="Amount (KRW)" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              style={inputStyle} 
            />
            <button 
              onClick={handleTransfer}
              disabled={account.isAccountLocked}
              style={{ padding: '15px', backgroundColor: account.isAccountLocked ? '#94a3b8' : '#002a54', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Send Money
            </button>
            {msg && <p style={{ textAlign: 'center', fontSize: '14px', color: '#ef4444' }}>{msg}</p>}
          </div>
        </div>

        {/* 시스템 모니터링 (에이전트 힌트) */}
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#1e293b', color: '#94a3b8', borderRadius: '12px', fontSize: '12px' }}>
          <div style={{ marginBottom: '5px', color: '#38bdf8' }}>[DB TRANSACTION MONITOR]</div>
          <div>Active DB Locks: <strong style={{ color: account.isAccountLocked ? '#ef4444' : '#10b981' }}>{account.isAccountLocked ? '1 ROW_LOCK DETECTED' : 'None'}</strong></div>
          <div>Uncommitted Transactions in Queue: <strong>{account.pending_transactions}</strong></div>
        </div>
      </main>
    </div>
  );
}

const inputStyle = { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' };

export default App;