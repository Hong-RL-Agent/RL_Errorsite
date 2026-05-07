import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, CreditCard, ShieldCheck, Info, AlertTriangle } from 'lucide-react';

function App() {
  const [view, setView] = useState('dashboard');
  const [trades, setTrades] = useState([]);
  const [summary, setSummary] = useState({ totalTrades: 0, completed: 0, balance: 0 });
  const [activeTrade, setActiveTrade] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(false);

  const addBug = (bug) => setBugs(prev => [...new Set([...prev, bug])]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([
        fetch('/api/trades'),
        fetch('/api/dashboard/summary')
      ]);
      const tData = await tRes.json();
      const sData = await sRes.json();
      setTrades(tData.data);
      setSummary(sData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewTradeDetail = async (id) => {
    const res = await fetch(`/api/trades/${id}`);
    const data = await res.json();
    setActiveTrade(data);
    if (data.bugId) addBug(data.bugId);
  };

  const handlePayment = async (tradeId) => {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tradeId })
    });
    const data = await res.json();
    if (data.bugId) addBug(data.bugId);
    fetchData();
  };

  const updateStatus = async (tradeId, status) => {
    const res = await fetch('/api/trades/updateStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tradeId, status })
    });
    const data = await res.json();
    if (data.bugId) addBug(data.bugId);
    fetchData();
  };

  const completeTrade = async (tradeId) => {
    const res = await fetch('/api/trades/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tradeId })
    });
    const data = await res.json();
    if (data.bugId) addBug(data.bugId);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>SafePay</h2>
        <nav>
          <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div className={`nav-item ${view === 'trades' ? 'active' : ''}`} onClick={() => setView('trades')}>
            <ShoppingBag size={20} /> Trades
          </div>
          <div className={`nav-item ${view === 'payments' ? 'active' : ''}`} onClick={() => setView('payments')}>
            <CreditCard size={20} /> Payments
          </div>
          <div className={`nav-item ${view === 'status' ? 'active' : ''}`} onClick={() => setView('status')}>
            <ShieldCheck size={20} /> Status
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header>
          <div>
            <h1 className="text-2xl font-bold">에스크로 관리 시스템</h1>
            <p className="text-gray-500">안전한 중고거래를 위한 통합 관제</p>
          </div>
          <div className="flex gap-4">
            {bugs.length > 0 && <span className="bug-id-tag">Active Bugs: {bugs.join(', ')}</span>}
          </div>
        </header>

        {bugs.includes('site048-bug04') && (
          <div className="alert-banner">
            <AlertTriangle size={20} />
            <div>
              <strong>상태 불일치 경고:</strong> 거래 완료 처리 중 부분 실패가 발생했습니다. 에스크로 정산 상태를 확인하십시오.
            </div>
          </div>
        )}

        {view === 'dashboard' && (
          <div>
            <div className="summary-grid">
              <div className="stat-card">
                <div className="label">총 거래 건수</div>
                <div className="value">{summary.totalTrades}</div>
              </div>
              <div className="stat-card">
                <div className="label">완료된 거래</div>
                <div className="value">{summary.completed}</div>
              </div>
              <div className="stat-card">
                <div className="label">나의 잔액</div>
                <div className="value">{summary.balance.toLocaleString()}원</div>
              </div>
              <div className="stat-card">
                <div className="label">누적 거래액</div>
                <div className="value">{summary.totalVolume?.toLocaleString()}원</div>
              </div>
            </div>

            <h3 className="mb-6 font-bold">최근 거래 현황</h3>
            <div className="trade-list">
              {trades.map(trade => (
                <div key={trade.id} className="trade-card">
                  <div>
                    <div className="font-bold text-lg">{trade.item}</div>
                    <div className="text-sm text-gray-500">판매자: {trade.seller}</div>
                  </div>
                  <div className="text-right">
                    <div className="amount-text mb-2">{trade.amount.toLocaleString()}원</div>
                    <span className={`badge badge-${trade.status}`}>{trade.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'trades' && (
          <div className="space-y-6">
            <h3 className="font-bold">거래 상세 및 수수료 확인</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                {trades.map(t => (
                  <div key={t.id} className="trade-card cursor-pointer" onClick={() => viewTradeDetail(t.id)} data-bug-id="site048-bug03">
                    <span>{t.item}</span>
                    <span className="text-gray-400">조회하기 &gt;</span>
                  </div>
                ))}
              </div>
              {activeTrade && (
                <div className="stat-card border-mint">
                  <h4 className="font-bold mb-4">{activeTrade.item} 상세</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span>거래 금액</span><span>{activeTrade.amount.toLocaleString()}원</span></div>
                    <div className="flex justify-between text-mint font-bold">
                      <span>플랫폼 수수료</span>
                      <span>{activeTrade.fee.toFixed(2)}원</span>
                    </div>
                    <p className="text-xs text-gray-400">※ 수수료 계산 드리프트 발생 가능 (site048-bug03)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'payments' && (
          <div className="space-y-6">
            <h3 className="font-bold">안전 결제 시뮬레이션</h3>
            <div className="trade-list">
              {trades.filter(t => t.status === 'pending').map(t => (
                <div key={t.id} className="trade-card">
                  <span>{t.item} - {t.amount.toLocaleString()}원</span>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handlePayment(t.id)}
                    data-bug-id="site048-bug02"
                  >
                    결제하기 (중복 클릭 시 오류)
                  </button>
                </div>
              ))}
              {trades.filter(t => t.status === 'pending').length === 0 && <p>결제 대기 중인 거래가 없습니다.</p>}
            </div>
          </div>
        )}

        {view === 'status' && (
          <div className="space-y-6">
             <h3 className="font-bold">상태 전이 및 거래 종료</h3>
             <div className="space-y-6">
                <div className="stat-card">
                  <h4 className="font-bold mb-4">비정상 상태 변경 테스트</h4>
                  <div className="flex gap-4">
                    <button className="btn btn-outline" onClick={() => updateStatus(1, 'completed')} data-bug-id="site048-bug01">
                      Macbook: Paid -> Completed (Skip Shipping)
                    </button>
                  </div>
                </div>

                <div className="stat-card">
                   <h4 className="font-bold mb-4">거래 완료 및 부분 실패 테스트</h4>
                   <div className="flex gap-4">
                      <button className="btn btn-primary" onClick={() => completeTrade(2)} data-bug-id="site048-bug04">
                        iPhone: Shipping -> Complete (Rollback Test)
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
