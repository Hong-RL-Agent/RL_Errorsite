import React, { useState, useEffect } from 'react';

// Static countdown times corresponding to original array indices (Error 1 Target)
const initialTimes = [
  "23분 남음", 
  "1시간 10분 남음", 
  "45분 남음", 
  "2시간 50분 남음", 
  "12분 남음", 
  "5시간 남음", 
  "1일 남음", 
  "18분 남음", 
  "3일 남음", 
  "10시간 남음", 
  "2일 남음", 
  "7시간 남음", 
  "30분 남음", 
  "12시간 남음", 
  "6시간 남음", 
  "4시간 남음"
];

export default function App() {
  // DB States
  const [auctions, setAuctions] = useState([]);
  const [activeBids, setActiveBids] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All'); // 'All' | 'active' | 'ending'
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'priceAsc' | 'priceDesc'

  // Selected Item Detail State
  const [selectedItemId, setSelectedItemId] = useState('auction-01');

  // Watchlist (Error 4 Target)
  const [watchlist, setWatchlist] = useState(['auction-01', 'auction-05']);
  const [watchlistBadgeCount, setWatchlistBadgeCount] = useState(2); // Top badge count tracker

  // Current tab view ('browse' | 'notifications' | 'sell' | 'my-bids')
  const [currentTab, setCurrentTab] = useState('browse');

  // User input states
  const [bidAmount, setBidAmount] = useState('');
  const [bidderName, setBidderName] = useState('한호성');

  // New Item registration form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('전자제품');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Toasts
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadAuctions();
    loadNotifications();
  }, []);

  useEffect(() => {
    if (selectedItemId) {
      loadBidsHistory(selectedItemId);
    }
  }, [selectedItemId]);

  const loadAuctions = async () => {
    try {
      const res = await fetch('/api/auctions');
      const data = await res.json();
      setAuctions(data);
    } catch (err) {
      showToast('경매 상품 카탈로그 로딩 실패', 'danger');
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      showToast('알림 로그 로딩 실패', 'danger');
    }
  };

  // Error 5: Fetch history for auction-05 hits port 9596
  const loadBidsHistory = async (itemId) => {
    let url = `/api/auctions/${itemId}/bids`;

    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: 특정 빈티지 롤렉스 시계(auction-05) 상품의 입찰 이력을 조회할 때만 
    // 정상 상대 주소가 아닌 오프라인/미할당 포트 주소인 'http://localhost:9596/api/auctions/auction-05/bids'로 
    // 강제 fetch 요청을 전송하게 조작하여 커넥션 거절 네트워크 에러를 유발합니다.
    if (itemId === 'auction-05') {
      url = 'http://localhost:9596/api/auctions/auction-05/bids';
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP 에러 코드 ${res.status}`);
      }
      const data = await res.json();
      setActiveBids(data);
    } catch (err) {
      showToast(`[네트워크 에러] 입찰 정보 통신 실패: ${err.message}`, 'danger');
      setActiveBids([]); // Clean list upon error
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Watchlist toggle (Error 4 logic: decrement neglected)
  const handleToggleWatchlist = (id) => {
    if (watchlist.includes(id)) {
      // Remove from list
      setWatchlist(prev => prev.filter(x => x !== id));
      
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 관심 경매를 해제하여 watchlist 배열에서 제거했음에도 불구하고, 
      // 헤더 등에 표출되는 찜 개수 지시 배지 변수(watchlistBadgeCount)에 대해 감산 조치(prev => prev - 1)를 
      // 취해주지 않고 묵인하여 최종 개수가 줄지 않는 UI 불일치 오류를 생성합니다.
      
      showToast('관심 경매에서 제거되었습니다.', 'info');
    } else {
      // Add to list
      setWatchlist(prev => [...prev, id]);
      setWatchlistBadgeCount(prev => prev + 1);
      showToast('관심 경매 상품으로 등록되었습니다.', 'success');
    }
  };

  // Submit Bid (Error 2 targets exact match to current bid amount)
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!selectedItemId || !bidAmount) return;

    const item = auctions.find(a => a.id === selectedItemId);
    if (!item) return;

    const amountNum = Number(bidAmount);

    try {
      const res = await fetch(`/api/auctions/${selectedItemId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum,
          bidder: bidderName
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '입찰에 실패했습니다.');
      }

      showToast(`성공적으로 ${amountNum.toLocaleString()}원 입찰 신청이 수락되었습니다!`, 'success');
      setBidAmount('');
      loadAuctions();
      loadBidsHistory(selectedItemId);
      loadNotifications();
    } catch (err) {
      showToast(`[입찰 거절] ${err.message}`, 'danger');
    }
  };

  // Cancel bid (Error 3 targets rollback inventory cost leak)
  const handleCancelBid = async (bidId) => {
    try {
      const res = await fetch(`/api/bids/${bidId}/cancel`, { method: 'POST' });
      if (res.ok) {
        showToast('내 입찰 내역 중 최고 입찰 기록을 취소했습니다.', 'warning');
        loadAuctions();
        if (selectedItemId) {
          loadBidsHistory(selectedItemId);
        }
      }
    } catch (err) {
      showToast('입찰 취소 API 통신 오류', 'danger');
    }
  };

  // Submit Sell item
  const handleRegisterAuction = async (e) => {
    e.preventDefault();
    if (!newTitle || !newPrice) {
      showToast('물품명과 시작가를 입력해주십시오.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          basePrice: Number(newPrice),
          desc: newDesc,
          seller: bidderName || '나의 상점'
        })
      });

      if (res.ok) {
        showToast('중고 물품 경매가 성황리에 신규 등록되었습니다!', 'success');
        setNewTitle('');
        setNewPrice('');
        setNewDesc('');
        loadAuctions();
        setCurrentTab('browse');
      }
    } catch (err) {
      showToast('물품 경매 등록 오류', 'danger');
    }
  };

  // Filter & Search logic
  const filteredAuctions = auctions.filter(auc => {
    const matchesSearch = auc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          auc.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || auc.category === selectedCategory;
    
    // Status filters
    let matchesStatus = true;
    if (selectedStatusFilter === 'ending') {
      matchesStatus = auc.id === 'auction-01' || auc.id === 'auction-02' || auc.id === 'auction-05' || auc.id === 'auction-13'; // Mock ending
    } else if (selectedStatusFilter === 'active') {
      matchesStatus = auc.id !== 'auction-02';
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sorting logic (Error 1 source)
  const getSortedItems = () => {
    let result = [...filteredAuctions];
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.currentBid - b.currentBid);
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.currentBid - a.currentBid);
    }
    return result;
  };

  const sortedItems = getSortedItems();
  const selectedItem = auctions.find(a => a.id === selectedItemId);

  // Ending Soon Slider subset (1st, 2nd, 5th, 13th)
  const endingSoonSubset = auctions.filter(a => ['auction-01', 'auction-02', 'auction-05', 'auction-13'].includes(a.id));

  return (
    <div className="bidsquare-app">
      {/* Upper Navigation Header Bar */}
      <header className="app-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 21h12M12 3v14M19 12H5" />
          </svg>
          <span className="logo-title">BidSquare</span>
          <span className="logo-subtitle">스마트 실시간 경매 중개 센터</span>
        </div>

        {/* Global Search Bar */}
        <div className="search-box">
          <input 
            type="text" 
            placeholder="경매 상품명, 설명 키워드 검색..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="navbar-search"
          />
        </div>

        {/* Tabs and Badges */}
        <div className="navbar-controls">
          <button 
            type="button" 
            onClick={() => { setCurrentTab('browse'); setSelectedStatusFilter('All'); }}
            className={`nav-tab-btn ${currentTab === 'browse' ? 'active' : ''}`}
          >
            📋 경매 둘러보기
          </button>
          
          <button 
            type="button" 
            onClick={() => setCurrentTab('sell')}
            className={`nav-tab-btn ${currentTab === 'sell' ? 'active' : ''}`}
          >
            ➕ 판매 등록
          </button>

          <button 
            type="button" 
            onClick={() => setCurrentTab('notifications')}
            className={`nav-tab-btn ${currentTab === 'notifications' ? 'active' : ''}`}
          >
            🔔 알림 센터
            {notifications.length > 0 && <span className="badge-alert">{notifications.length}</span>}
          </button>

          <button 
            type="button" 
            className="nav-tab-btn watchlist-btn"
          >
            ⭐ 관심 목록
            {/* Error 4 Target: watchlistBadgeCount does not decrement */}
            <span className="badge-count">{watchlistBadgeCount}</span>
          </button>
        </div>
      </header>

      {/* Top Ending Soon horizontal slider widget */}
      {currentTab === 'browse' && (
        <section className="ending-soon-slider-panel">
          <div className="panel-header">
            <h3>⏳ 마감 임박 상품 타임라인</h3>
          </div>
          <div className="ending-soon-slider-track">
            {endingSoonSubset.map(item => (
              <div 
                key={item.id} 
                className="slide-card" 
                onClick={() => setSelectedItemId(item.id)}
              >
                <div className="slide-badge">🚨 마감임박</div>
                <h4>{item.title}</h4>
                <div className="price-info">
                  <span className="lbl">현재가</span>
                  <span className="val">{item.currentBid.toLocaleString()}원</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Workspace Grid */}
      <div className="workspace-grid">
        
        {/* Left Categories and Status Filter */}
        <aside className="panel-section filter-sidebar">
          <div className="panel-header">
            <h3>📁 카테고리 분류</h3>
          </div>
          <div className="category-stack">
            {['All', '전자제품', '패션/의류', '패션/잡화', '도서/음반', '스포츠/레저', '뷰티/미용', '완구/취미', '가구/인테리어', '식품/주류'].map(cat => (
              <button 
                key={cat}
                type="button" 
                onClick={() => setSelectedCategory(cat)}
                className={`sidebar-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat === 'All' ? '전체 카테고리' : cat}
              </button>
            ))}
          </div>

          <div className="panel-header" style={{ marginTop: '1.5rem' }}>
            <h3>⚡ 경매 진행 상태</h3>
          </div>
          <div className="category-stack">
            <button 
              type="button" 
              onClick={() => { setSelectedStatusFilter('All'); setCurrentTab('browse'); }}
              className={`sidebar-tab-btn ${selectedStatusFilter === 'All' && currentTab === 'browse' ? 'active' : ''}`}
            >
              전체 진행 경매
            </button>
            <button 
              type="button" 
              onClick={() => { setSelectedStatusFilter('ending'); setCurrentTab('browse'); }}
              className={`sidebar-tab-btn ${selectedStatusFilter === 'ending' ? 'active' : ''}`}
            >
              종료 직전 경매
            </button>
          </div>
        </aside>

        {/* Center main workspace catalog / other views */}
        <main className="center-stage-workspace">
          
          {/* TAB 1: BROWSE AUCTIONS */}
          {currentTab === 'browse' && (
            <div className="panel-section browse-auctions-panel">
              <div className="panel-header-row">
                <h2>📢 입찰 가능한 경매 물품 ({sortedItems.length}개)</h2>
                
                {/* Sort controls */}
                <div className="sort-selector">
                  <label>정렬 기준: </label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                    <option value="default">기본 정렬</option>
                    <option value="priceAsc">낮은 입찰가순</option>
                    <option value="priceDesc">높은 입찰가순</option>
                  </select>
                </div>
              </div>

              <div className="auctions-list-table">
                <div className="table-header">
                  <span>이미지</span>
                  <span>카테고리</span>
                  <span>상품명 및 요약</span>
                  <span>입찰횟수</span>
                  <span>남은 시간 (Error 1)</span>
                  <span>최고 입찰가</span>
                  <span>액션</span>
                </div>

                <div className="table-body">
                  {sortedItems.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className={`auction-row-row ${selectedItemId === item.id ? 'active' : ''}`}
                      onClick={() => setSelectedItemId(item.id)}
                    >
                      <div className="img-cell">
                        <img src={`/images/${item.id}.png`} alt={item.title} className="auc-thumb" />
                      </div>
                      
                      <div className="cat-cell">
                        <span className="cat-badge">{item.category}</span>
                      </div>

                      <div className="info-cell">
                        <h4>{item.title}</h4>
                        <p>{item.desc.substring(0, 40)}...</p>
                      </div>

                      <div className="bids-count-cell">
                        <strong>{item.bidsCount}회</strong>
                      </div>

                      {/* Remaining Time (Error 1 Target) */}
                      <div className="time-cell">
                        {/* INTENTIONAL_ERROR */}
                        {/* CATEGORY: Frontend */}
                        {/* DESCRIPTION: 경매 리스트 정렬 시 각 상품 오브젝트 고유의 마감시각(item.timeLeft)을 */}
                        {/* 계산해 렌더링하지 않고, 초기 리스트 렌더링용 임의의 정적 문자열 배열에서 현재 순회 인덱스 */}
                        {/* (initialTimes[idx])를 직접 가리켜 화면을 채웁니다. 이로써 정렬 변환이 일어나면 */}
                        {/* 상품의 남은시간 타이머가 뒤죽박죽 꼬이는 결함을 만듭니다. */}
                        <span className="remaining-badge">{initialTimes[idx]}</span>
                      </div>

                      <div className="price-cell">
                        <strong>{item.currentBid.toLocaleString()}원</strong>
                      </div>

                      <div className="action-cell" onClick={(e) => e.stopPropagation()}>
                        <button 
                          type="button" 
                          onClick={() => handleToggleWatchlist(item.id)}
                          className={`watch-btn ${watchlist.includes(item.id) ? 'active' : ''}`}
                        >
                          {watchlist.includes(item.id) ? '⭐ 찜취소' : '☆ 찜하기'}
                        </button>
                      </div>
                    </div>
                  ))}

                  {sortedItems.length === 0 && (
                    <div className="empty-placeholder">조건에 부합하는 진행 중인 경매 물품이 없습니다.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SELL REGISTRATION FORM */}
          {currentTab === 'sell' && (
            <div className="panel-section register-sell-panel">
              <div className="panel-header">
                <h2>📦 나의 중고 물품 경매 등록</h2>
              </div>

              <form onSubmit={handleRegisterAuction} className="sell-form">
                <div className="form-group">
                  <label>판매자 명의</label>
                  <input 
                    type="text" 
                    value={bidderName} 
                    onChange={(e) => setBidderName(e.target.value)} 
                    className="form-input" 
                  />
                </div>

                <div className="form-group">
                  <label>경매 물품 명칭</label>
                  <input 
                    type="text" 
                    placeholder="예: 애플 아이패드 프로 11인치 M1" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    className="form-input" 
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>카테고리</label>
                    <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="form-select">
                      {['전자제품', '패션/의류', '패션/잡화', '도서/음반', '스포츠/레저', '뷰티/미용', '완구/취미', '가구/인테리어', '식품/주류'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>최소 경매 시작가 (원)</label>
                    <input 
                      type="number" 
                      placeholder="10000" 
                      value={newPrice} 
                      onChange={(e) => setNewPrice(e.target.value)} 
                      className="form-input" 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>경매 물품 설명 (외관 상태, 구성품, 하자 명시)</label>
                  <textarea 
                    rows="5" 
                    placeholder="입찰 희망자들이 신뢰할 수 있게 최대한 상세하게 기록해주세요."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="form-textarea"
                  ></textarea>
                </div>

                <button type="submit" className="submit-sell-btn">🚀 경매 시장에 물품 출품하기</button>
              </form>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS CENTER */}
          {currentTab === 'notifications' && (
            <div className="panel-section notifications-panel">
              <div className="panel-header">
                <h2>🔔 입찰 상황 실시간 알림 센터</h2>
              </div>
              <div className="notifications-stack">
                {notifications.map(not => (
                  <div key={not.id} className="notification-row">
                    <span className="not-ic">📢</span>
                    <div className="not-text">
                      <p>{not.text}</p>
                      <span className="time">{not.time}</span>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="empty-placeholder">최근 수신된 입찰 거래 알림이 없습니다.</div>
                )}
              </div>
            </div>
          )}

        </main>

        {/* Right Auction Details and Bidding Panel */}
        {selectedItem && (
          <aside className="right-details-column">
            
            {/* Item Card Details */}
            <div className="panel-section detail-preview-panel">
              <div className="panel-header">
                <h3>🔍 실시간 상품 상세 정보</h3>
              </div>

              <div className="detail-header-card">
                <img src={`/images/${selectedItem.id}.png`} alt={selectedItem.title} className="detail-hero-img" />
                <div className="title-row">
                  <span className="cat">{selectedItem.category}</span>
                  <h4>{selectedItem.title}</h4>
                  <p className="seller-name">판매자: {selectedItem.seller} (신뢰도 98%)</p>
                </div>
              </div>

              <div className="item-description-block">
                <p>{selectedItem.desc}</p>
              </div>

              {/* Bids Prices summary bar */}
              <div className="price-summary-box">
                <div className="p-row">
                  <span>시작 가격</span>
                  <span>{selectedItem.basePrice.toLocaleString()}원</span>
                </div>
                <div className="p-row highlight">
                  <span>현재 최고가</span>
                  <span className="current-max">{selectedItem.currentBid.toLocaleString()}원</span>
                </div>
                <div className="p-row">
                  <span>총 입찰 횟수</span>
                  <span>{selectedItem.bidsCount}회</span>
                </div>
              </div>

              {/* Place Bid Form (Error 2 match price S500) */}
              <form onSubmit={handlePlaceBid} className="bid-entry-form">
                <div className="input-group">
                  <label>내 명의:</label>
                  <input 
                    type="text" 
                    value={bidderName} 
                    onChange={(e) => setBidderName(e.target.value)} 
                    className="bidder-name-input"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>입찰 희망액:</label>
                  <div className="amount-input-row">
                    <input 
                      type="number" 
                      placeholder={`${(selectedItem.currentBid + 10000).toLocaleString()}원 이상 입력`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="amount-input"
                      required
                    />
                    <button type="submit" className="bid-submit-btn">🔨 입찰</button>
                  </div>
                </div>
                <p className="helper-txt">* 최고가와 동일하거나 낮은 액수는 접수 불허됩니다. (동일 입력시 Error 2)</p>
              </form>

              {/* Bid history timelines (Error 5 connection refuse target) */}
              <div className="bid-history-timeline-box">
                <div className="history-header">
                  <h5>📝 경매 입찰 실시간 타임라인</h5>
                  <button 
                    type="button" 
                    onClick={() => loadBidsHistory(selectedItem.id)}
                    className="refresh-history-btn"
                  >
                    🔄 새로고침
                  </button>
                </div>

                <div className="timeline-stack">
                  {activeBids.map(bid => (
                    <div key={bid.id} className="timeline-item">
                      <span className="dot"></span>
                      <div className="info">
                        <span className="bidder">{bid.bidder}</span>
                        <span className="amt">{bid.amount.toLocaleString()}원</span>
                      </div>
                      <div className="meta">
                        <span className="time">{bid.date}</span>
                        {/* Can cancel if matches current bidder */}
                        {bid.bidder === bidderName && (
                          <button 
                            type="button" 
                            onClick={() => handleCancelBid(bid.id)}
                            className="cancel-bid-action-btn"
                            title="입찰 취소 (Error 3 검증)"
                          >
                            &times; 취소
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {activeBids.length === 0 && (
                    <div className="empty-placeholder">최근 등록된 입찰 로그 내역이 비어 있습니다.</div>
                  )}
                </div>
              </div>

            </div>
          </aside>
        )}

      </div>

      {/* Toast Alert Systems */}
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
