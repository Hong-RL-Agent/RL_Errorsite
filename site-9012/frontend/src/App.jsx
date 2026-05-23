import React, { useState, useEffect } from 'react';

function App() {
  const [market, setMarket] = useState({ price: '64,231.50', change: '+2.45%' });
  const [tradeStatus, setTradeStatus] = useState('Standby');
  const [loading, setLoading] = useState(false);

  // 시세 랜덤 변동 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      const newPrice = (parseFloat(market.price.replace(',', '')) + (Math.random() - 0.5) * 10).toFixed(2);
      setMarket(prev => ({ ...prev, price: newPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ",") }));
    }, 3000);
    return () => clearInterval(interval);
  }, [market.price]);

  const handleTrade = async () => {
    setLoading(true);
    setTradeStatus('Executing Order... Please wait.');
    try {
      const res = await fetch('/api/execute-trade');
      const data = await res.json();
      setTradeStatus(`Order Confirmed: ${data.orderId}`);
    } catch (err) {
      setTradeStatus('❌ Connection Timeout / Server Busy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0e11', color: '#eaecef', fontFamily: 'Inter, sans-serif' }}>
      {/* 상단 바 */}
      <header style={{ height: '60px', backgroundColor: '#1e2329', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ color: '#f0b90b', fontSize: '20px', fontWeight: 'bold' }}>JAWS QUANTUM</h1>
          <div style={{ fontSize: '14px' }}>BTC/USDT <span style={{ color: '#0ecb81' }}>{market.price}</span></div>
        </div>
        <div style={{ fontSize: '12px', color: '#848e9c' }}>Network Status: <span style={{ color: '#0ecb81' }}>Stable (Pool: 9012)</span></div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1px', backgroundColor: '#2b3139', height: 'calc(100vh - 60px)' }}>
        {/* 왼쪽: 차트 및 시세 영역 (가짜 차트 박스) */}
        <div style={{ backgroundColor: '#0b0e11', padding: '20px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '18px' }}>Real-time Market Chart</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['1m', '5m', '15m', '1H', '1D'].map(t => <span key={t} style={{ fontSize: '12px', color: '#848e9c' }}>{t}</span>)}
            </div>
          </div>
          <div style={{ width: '100%', height: '400px', backgroundColor: '#161a1e', border: '1px solid #2b3139', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#474d57' }}>
            [ Candle Chart Visualization Area ]
          </div>
        </div>

        {/* 오른쪽: 주문 입력창 */}
        <div style={{ backgroundColor: '#1e2329', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ flex: 1, padding: '10px', backgroundColor: '#0ecb81', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Buy</button>
            <button style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', color: '#848e9c', border: '1px solid #474d57', borderRadius: '4px' }}>Sell</button>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#848e9c' }}>Price (USDT)</label>
            <input type="text" value={market.price} readOnly style={inputStyle} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#848e9c' }}>Amount (BTC)</label>
            <input type="text" defaultValue="0.005" style={inputStyle} />
          </div>

          <button 
            onClick={handleTrade}
            disabled={loading}
            style={{ width: '100%', padding: '15px', backgroundColor: loading ? '#474d57' : '#f0b90b', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            {loading ? 'Processing...' : 'Place Buy Order'}
          </button>

          <div style={{ marginTop: 'auto', padding: '15px', backgroundColor: '#2b3139', borderRadius: '4px', fontSize: '13px' }}>
            <div style={{ color: '#848e9c', marginBottom: '5px' }}>System Message:</div>
            <div style={{ color: tradeStatus.includes('❌') ? '#f6465d' : '#f0b90b' }}>{tradeStatus}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', backgroundColor: '#2b3139', border: '1px solid #474d57', color: 'white', borderRadius: '4px', marginTop: '5px', outline: 'none' };

export default App;