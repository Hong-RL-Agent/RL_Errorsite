import React, { useState, useEffect } from 'react';

export default function App() {
  // DB States
  const [stocks, setStocks] = useState([]);
  const [cashBalance, setCashBalance] = useState(50000000);
  const [holdings, setHoldings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [news, setNews] = useState([]);

  // Selections
  const [selectedStockId, setSelectedStockId] = useState('STK-01');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Watchlist (Error 4 Target)
  const [watchlist, setWatchlist] = useState(['STK-01', 'STK-02', 'STK-03', 'STK-06', 'STK-07', 'STK-08']);
  const [sortByWatchlist, setSortByWatchlist] = useState('none'); // 'none' | 'asc' | 'desc'

  // Order Form (Error 1 Target)
  const [tradeType, setTradeType] = useState('buy'); // 'buy' | 'sell'
  const [quantity, setQuantity] = useState(10);
  const [orderPrice, setOrderPrice] = useState(72000); // Track price cache

  // Click tracker for Sync (Error 6 Target)
  const [syncClicks, setSyncClicks] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadStocks();
    loadPortfolio();
    loadOrders();
    loadNews();
  }, []);

  const loadStocks = async () => {
    try {
      const res = await fetch('/api/stocks');
      const data = await res.json();
      setStocks(data);
    } catch (err) {
      showToast('주식 시세표 데이터 로드 실패', 'danger');
    }
  };

  const loadPortfolio = async () => {
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      setCashBalance(data.cashBalance);
      setHoldings(data.holdings);
    } catch (err) {
      showToast('계좌 포트폴리오 로드 실패', 'danger');
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      showToast('체결 주문 내역 로드 실패', 'danger');
    }
  };

  const loadNews = async () => {
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      setNews(data);
    } catch (err) {
      showToast('투자 속보 로드 실패', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Sync Realtime prices (Error 6 logic)
  const handleSyncPrices = async () => {
    const nextClicks = syncClicks + 1;
    setSyncClicks(nextClicks);

    if (nextClicks === 3) {
      // INTENTIONAL_ERROR
      // CATEGORY: Network
      // DESCRIPTION: 시세 동기화 버튼을 3회 누를 시 프론트엔드에서 수동 딜레이와 
      // 게이트웨이 타임아웃 오류를 발생시키며, 삼성전자(STK-01)와 테슬라(STK-07)의 가격/등락률 
      // 필드를 null로 오염시켜 화면 일부를 빈 값으로 깨지게 유도합니다.
      showToast('네트워크 오류: 실시간 시세 동기화 세션 타임아웃 (9532 -> 5033 Gateway Timeout)', 'danger');
      setStocks(prev => prev.map(s => s.id === 'STK-01' || s.id === 'STK-07' ? { ...s, price: null, changeRate: null } : s));
      return;
    }

    try {
      const res = await fetch('/api/stocks/sync');
      const data = await res.json();
      setStocks(data);
      showToast('최신 시세 동기화가 완료되었습니다.', 'success');
    } catch (err) {
      showToast('시세 동기화 API 연결 실패', 'danger');
    }
  };

  // Switch Active Stock
  const handleStockSelect = (stock) => {
    setSelectedStockId(stock.id);
    
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 종목을 변경하더라도 주문창에 설정되어 있는 단가 변수(orderPrice)는 
    // 즉시 현재가로 리셋해주지 않고 이전 종목의 단가 그대로 두어, 매수 수량을 수정하는 시점에서야 
    // 곱해진 뒤 업데이트되게 지연 결함을 만듭니다.
    // 원래 들어가야 하는 동기화 로직 누락:
    // setOrderPrice(stock.price);
  };

  const activeStock = stocks.find(s => s.id === selectedStockId) || { name: '', code: '', price: 0, changeRate: 0, high: 0, low: 0 };

  // Handle Quantity modifier (Error 1 trigger)
  const handleQtyChange = (e) => {
    const val = Number(e.target.value);
    setQuantity(val);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 종목이 바뀐 직후 수량을 수정할 때, 주문 금액 계산에 사용되는 
    // orderPrice가 이전 종목 단가로 유지되어 1회성 계산 왜곡이 일어난 후에야 비로소 현재 종목가로 연계 동기화됩니다.
    setOrderPrice(activeStock.price || 0);
  };

  // Submit Order (Error 2 & Error 5 targets)
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStockId || !quantity || !orderPrice) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: tradeType,
          stockId: selectedStockId,
          qty: quantity,
          price: orderPrice
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '주문 처리에 실패했습니다.');
      }

      showToast(`${activeStock.name} ${quantity}주 ${tradeType === 'buy' ? '매수' : '매도'} 주문이 완료되었습니다.`, 'success');
      loadPortfolio();
      loadOrders();
    } catch (err) {
      showToast(`[주문 거절] ${err.message}`, 'danger');
      loadOrders(); // Reload orders in case Error 5 pushed order to database on fail!
    }
  };

  const handleResetSandbox = async () => {
    try {
      const res = await fetch('/api/portfolio/reset', { method: 'POST' });
      if (res.ok) {
        showToast('계좌 잔액과 모의 투자 상태가 초기화되었습니다.', 'warning');
        loadPortfolio();
        loadOrders();
      }
    } catch (err) {
      showToast('초기화 API 통신 에러', 'danger');
    }
  };

  // Toggle watchlist items
  const handleToggleWatchlist = (id) => {
    if (watchlist.includes(id)) {
      setWatchlist(prev => prev.filter(x => x !== id));
      showToast('관심 종목에서 제거되었습니다.', 'info');
    } else {
      setWatchlist(prev => [...prev, id]);
      showToast('관심 종목에 추가되었습니다.', 'success');
    }
  };

  // Filter stocks by search
  const filteredStocks = stocks.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.code.includes(searchQuery)
  );

  // Watchlist Items + Sorting (Error 4 Target)
  const watchlistStocks = stocks.filter(s => watchlist.includes(s.id));
  
  const getSortedWatchlist = () => {
    let list = [...watchlistStocks];
    if (sortByWatchlist === 'asc') {
      list.sort((a, b) => (a.changeRate || 0) - (b.changeRate || 0));
    } else if (sortByWatchlist === 'desc') {
      list.sort((a, b) => (b.changeRate || 0) - (a.changeRate || 0));
    }
    return list;
  };

  const sortedWatchlist = getSortedWatchlist();

  // Portfolio total asset calculations
  const totalHoldingsValue = holdings.reduce((sum, h) => {
    const currentStk = stocks.find(s => s.id === h.stockId) || { price: 0 };
    return sum + (h.qty * (currentStk.price || h.avgPrice));
  }, 0);

  const totalAsset = cashBalance + totalHoldingsValue;
  const initialAsset = 50000000;
  const totalProfit = totalAsset - initialAsset;
  const totalROI = (totalProfit / initialAsset) * 100;

  // Order total cost calculated in order panel
  const calculatedTotalOrderAmount = orderPrice * quantity;

  return (
    <div className="papertrade-app">
      
      {/* Top Index Summary Bar */}
      <header className="market-index-banner">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
          </svg>
          <span className="logo-title">PaperTrade</span>
          <span className="logo-subtitle">가상 모의투자 트레이딩 보드</span>
        </div>

        <div className="indices-row">
          <div className="index-widget">
            <span className="lbl">코스피 KOSPI</span>
            <span className="val up">2,745.88 (+1.12%)</span>
          </div>
          <div className="index-widget">
            <span className="lbl">코스닥 KOSDAQ</span>
            <span className="val down">865.12 (-0.45%)</span>
          </div>
          <div className="index-widget">
            <span className="lbl">나스닥 NASDAQ</span>
            <span className="val up">17,890.30 (+2.38%)</span>
          </div>
        </div>

        <div className="global-actions">
          <button type="button" onClick={handleSyncPrices} className="sync-btn">
            🔄 실시간 시세 동기화
          </button>
          <button type="button" onClick={handleResetSandbox} className="reset-sandbox-btn">
            ⚠️ 계좌 초기화
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="workspace-grid">
        
        {/* Left Watchlist panel */}
        <aside className="panel-section watchlist-sidebar">
          <div className="panel-header-row-vertical">
            <h3>⭐ 관심 종목</h3>
            
            <div className="watchlist-sort-row">
              <label>정렬: </label>
              <select value={sortByWatchlist} onChange={(e) => setSortByWatchlist(e.target.value)} className="mini-sort-select">
                <option value="none">기본</option>
                <option value="asc">등락률 낮은순</option>
                <option value="desc">등락률 높은순</option>
              </select>
            </div>
          </div>

          <div className="watchlist-box">
            {sortedWatchlist.map((item, idx) => {
              // INTENTIONAL_ERROR
              // CATEGORY: Frontend
              // DESCRIPTION: 관심 종목을 등락률 정렬할 때, 즐겨찾기 별(★) 아이콘 표시 유무를 
              // 고유 ID(item.id)가 아닌 루프 인덱스(idx)에 강제 매핑(idx < watchlist.length)합니다.
              // 정렬이 가해지면 등락률에 따라 아이템이 재배열되어도 별의 노출 순번은 고정되므로 
              // 엉뚱한 종목들에 즐겨찾기 별 마크가 잘못 씌워집니다.
              const isStarred = idx < watchlist.length;

              return (
                <div 
                  key={item.id} 
                  className={`watchlist-item-card ${selectedStockId === item.id ? 'active' : ''}`}
                  onClick={() => handleStockSelect(item)}
                >
                  <div className="left-info">
                    <span 
                      className="star-ic" 
                      onClick={(e) => { e.stopPropagation(); handleToggleWatchlist(item.id); }}
                    >
                      {isStarred ? '★' : '☆'}
                    </span>
                    <div className="txt">
                      <span className="n">{item.name}</span>
                      <span className="c">{item.code}</span>
                    </div>
                  </div>

                  <div className="right-prices">
                    <span className="p">
                      {item.price !== null ? `${item.price.toLocaleString()}원` : '데이터 없음'}
                    </span>
                    <span className={`chg ${item.changeRate >= 0 ? 'up' : 'down'}`}>
                      {item.changeRate !== null ? `${item.changeRate >= 0 ? '+' : ''}${item.changeRate}%` : '빈 값'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="search-stocks-box">
            <input 
              type="text" 
              placeholder="종목명 또는 코드 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sidebar-search-input"
            />
            <div className="search-results-mini">
              {searchQuery && filteredStocks.map(stk => (
                <div key={stk.id} className="search-result-row" onClick={() => handleStockSelect(stk)}>
                  <span>{stk.name}</span>
                  <span className="code">{stk.code}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Stock Chart and details */}
        <main className="center-stage-workspace">
          
          <div className="panel-section stock-chart-panel">
            <div className="chart-header">
              <div className="info">
                <h2>{activeStock.name} <span className="code">{activeStock.code}</span></h2>
                <div className="p-row">
                  <span className="price-now">
                    {activeStock.price !== null ? `${activeStock.price.toLocaleString()}원` : '-'}
                  </span>
                  {activeStock.changeRate !== null && (
                    <span className={`chg ${activeStock.changeRate >= 0 ? 'up' : 'down'}`}>
                      {activeStock.changeRate >= 0 ? '▲' : '▼'} {Math.abs(activeStock.changeRate)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="details-grid-mini">
                <div className="item">
                  <span className="lbl">고가</span>
                  <span className="val up">{activeStock.high?.toLocaleString()}원</span>
                </div>
                <div className="item">
                  <span className="lbl">저가</span>
                  <span className="val down">{activeStock.low?.toLocaleString()}원</span>
                </div>
              </div>
            </div>

            {/* SVG price Chart mock */}
            <div className="svg-chart-container">
              <svg viewBox="0 0 500 200" className="chart-svg">
                {/* Grids */}
                <line x1="0" y1="50" x2="500" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#334155" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="#334155" strokeWidth="0.5" strokeDasharray="3" />
                
                {/* Line Path */}
                <path 
                  d="M 10 140 Q 80 80, 150 120 T 290 60 T 400 130 T 490 70" 
                  fill="none" 
                  stroke={activeStock.changeRate >= 0 ? '#10b981' : '#ef4444'} 
                  strokeWidth="3.5" 
                />
                
                {/* Area under line */}
                <path 
                  d="M 10 140 Q 80 80, 150 120 T 290 60 T 400 130 T 490 70 L 490 200 L 10 200 Z" 
                  fill={activeStock.changeRate >= 0 ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)'} 
                />
              </svg>
            </div>
          </div>

          {/* Investment News dummy items */}
          <div className="panel-section news-section-panel">
            <div className="panel-header">
              <h3>📰 실시간 주요 투자 속보</h3>
            </div>
            <div className="news-stack">
              {news.map(n => (
                <div key={n.id} className="news-card">
                  <span className="src">[{n.source}]</span>
                  <p className="headline">{n.headline}</p>
                </div>
              ))}
            </div>
          </div>

        </main>

        {/* Right Buy / Sell Order Panel */}
        <aside className="panel-section right-order-column">
          <div className="panel-header">
            <h3>🔨 주문 실행 센터</h3>
          </div>

          <div className="order-tabs-row">
            <button 
              type="button" 
              onClick={() => setTradeType('buy')}
              className={`order-tab buy ${tradeType === 'buy' ? 'active' : ''}`}
            >
              매수 (Buy)
            </button>
            <button 
              type="button" 
              onClick={() => setTradeType('sell')}
              className={`order-tab sell ${tradeType === 'sell' ? 'active' : ''}`}
            >
              매도 (Sell)
            </button>
          </div>

          <form onSubmit={handleOrderSubmit} className="order-form-control">
            <div className="info-row">
              <span className="stock-n">{activeStock.name}</span>
              <span className="stock-c">{activeStock.code}</span>
            </div>

            <div className="form-group">
              <label>주문 수량 (주)</label>
              <input 
                type="number" 
                min="1" 
                value={quantity}
                onChange={handleQtyChange}
                className="qty-input"
                required
              />
              <p className="helper-txt">* 100주 매수 시 예외발생 (Error 2)</p>
            </div>

            <div className="form-group">
              <label>지정 단가 (원)</label>
              <input 
                type="number"
                value={orderPrice || 0}
                onChange={(e) => setOrderPrice(Number(e.target.value))}
                className="price-input"
                required
              />
            </div>

            <div className="cost-summary-box">
              <div className="cost-row">
                <span>총 주문 예측금</span>
                {/* Error 1 visual display: uses potentially stale orderPrice */}
                <strong className="total-val">{calculatedTotalOrderAmount.toLocaleString()}원</strong>
              </div>
              <div className="cost-row margin-top">
                <span>계좌 예수금 잔액</span>
                <span className="cash-val">{cashBalance.toLocaleString()}원</span>
              </div>
            </div>

            <button 
              type="submit" 
              className={`submit-order-btn ${tradeType === 'buy' ? 'buy' : 'sell'}`}
            >
              {activeStock.name} {quantity}주 {tradeType === 'buy' ? '매수 신청' : '매도 신청'}
            </button>
          </form>
        </aside>

      </div>

      {/* Bottom execution portfolio and logs list */}
      <footer className="bottom-history-panel">
        
        {/* Holdings list */}
        <div className="panel-section portfolio-holdings-panel">
          <div className="panel-header-row-horizontal">
            <h3>💼 나의 계좌 포트폴리오 자산</h3>
            <div className="asset-summary">
              <span>총 자산: <strong>{totalAsset.toLocaleString()}원</strong></span>
              <span className={`roi ${totalROI >= 0 ? 'up' : 'down'}`}>
                수익률: {totalROI.toFixed(2)}% ({totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()}원)
              </span>
            </div>
          </div>

          <table className="holdings-table">
            <thead>
              <tr>
                <th>종목명</th>
                <th>보유수량</th>
                <th>평균매입가 (Error 3)</th>
                <th>현재가</th>
                <th>평가금액</th>
                <th>평가손익 (수익률)</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => {
                const stk = stocks.find(s => s.id === h.stockId) || { price: h.avgPrice };
                const currentPrice = stk.price !== null ? stk.price : h.avgPrice;
                const value = h.qty * currentPrice;
                const profit = value - h.totalCost;
                const roi = h.totalCost > 0 ? (profit / h.totalCost) * 100 : 0;

                return (
                  <tr key={h.stockId}>
                    <td><strong>{h.name}</strong></td>
                    <td>{h.qty}주</td>
                    <td>{h.avgPrice.toLocaleString()}원</td>
                    <td>{currentPrice.toLocaleString()}원</td>
                    <td>{value.toLocaleString()}원</td>
                    <td className={profit >= 0 ? 'up' : 'down'}>
                      {profit >= 0 ? '+' : ''}{profit.toLocaleString()}원 ({roi.toFixed(2)}%)
                    </td>
                  </tr>
                );
              })}

              {holdings.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-txt">보유 중인 주식이 없습니다. 모의 투자를 실행해보세요.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Order History logs */}
        <div className="panel-section execution-logs-panel">
          <div className="panel-header">
            <h3>📜 주식 매매 체결 및 주문 내역 (최신 20건 이상)</h3>
          </div>
          
          <table className="orders-table">
            <thead>
              <tr>
                <th>시간</th>
                <th>종목명</th>
                <th>구분</th>
                <th>수량</th>
                <th>체결단가</th>
                <th>체결금액</th>
                <th>상태 (Error 5)</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>{o.date}</td>
                  <td>{o.stockName}</td>
                  <td>
                    <span className={`badge-type ${o.type}`}>
                      {o.type === 'buy' ? '매수' : '매도'}
                    </span>
                  </td>
                  <td>{o.qty}주</td>
                  <td>{o.price.toLocaleString()}원</td>
                  <td>{(o.qty * o.price).toLocaleString()}원</td>
                  <td>
                    <span className={`status-pill ${o.status === '체결' ? 'success' : 'pending'}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </footer>

      {/* Toast Warning Popup alerts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button 
              className="toast-close" 
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
