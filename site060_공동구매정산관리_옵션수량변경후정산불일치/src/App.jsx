import React, { useState, useEffect } from 'react';

export default function App() {
  const [currentUser, setCurrentUser] = useState('사용자 A');
  
  // Database states
  const [groupBuys, setGroupBuys] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Selections & filters
  const [selectedGb, setSelectedGb] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortProgress, setSortProgress] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  
  // Session & Summary caches (Error 5 Target)
  const [cachedSettlementTotal, setCachedSettlementTotal] = useState(133000);
  
  const [toasts, setToasts] = useState([]);

  // Form input bindings
  const [joinName, setJoinName] = useState('홍길동');
  const [joinQty, setJoinQty] = useState(1);
  const [joinOption, setJoinOption] = useState('기본 블랙');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadGroupBuys();
    await loadParticipants();
    await loadOrders();
  };

  const loadGroupBuys = async () => {
    const res = await fetch('/api/groupbuys');
    const data = await res.json();
    setGroupBuys(data);
    if (data.length > 0 && !selectedGb) {
      setSelectedGb(data[0]);
    }
  };

  const loadParticipants = async () => {
    const res = await fetch('/api/participants');
    const data = await res.json();
    setParticipants(data);
  };

  const loadOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const resetSandbox = async () => {
    await fetch('/api/reset', { method: 'POST' });
    showToast('GroupBuy 공동구매 시스템 디비가 초기화되었습니다.', 'success');
    setSelectedGb(null);
    setCachedSettlementTotal(0);
    await loadAll();
  };

  // User switcher (Error 5 Target)
  const handleUserSwitch = async (newUser) => {
    setCurrentUser(newUser);
    showToast(`로그인 학생 세션이 [${newUser}]로 교체되었습니다.`, 'info');
    
    // Fetch settlement cost for the user
    const res = await fetch(`/api/settlement?user=${newUser}`);
    const data = await res.json();
    
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache
    // DESCRIPTION: 사용자 A에서 B로 계정을 스위칭할 때, 
    // 개별 주문 목록 데이터는 갱신되지만 우측 요약 패널의 총 결제 예정 금액(`cachedSettlementTotal`)을 
    // 리셋하지 않고 A의 금액으로 방치하는 세션 데이터 캐싱 누수 결함입니다.
    // Bypasses setting cachedSettlementTotal!
  };

  // Fix total cost manually
  const syncSettlementMeters = () => {
    if (currentUser === '사용자 B') {
      setCachedSettlementTotal(147000);
    } else {
      setCachedSettlementTotal(133000);
    }
    showToast('총 정산 금액이 서버 디비 수치와 강제 동기화되었습니다.', 'success');
  };

  // Filtered and sorted groupbuys
  const filteredGroupBuys = groupBuys
    .filter(gb => {
      if (selectedCategory !== 'ALL' && gb.category !== selectedCategory) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortProgress) {
        const rateA = a.currentQty / a.targetQty;
        const rateB = b.currentQty / b.targetQty;
        return rateB - rateA; // High progress first
      }
      return a.id.localeCompare(b.id);
    });

  // Stale cancel index (Error 2 Target)
  const handleCancelParticipation = (idxInFiltered) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 정렬된 공동구매 리스트에서 취소 누를 때, 
    // 정렬 결과 매핑 대신 원본 배열(`groupBuys`)의 idx 요소를 호출하여 
    // 실제 백엔드 상에서 전혀 다른 공동구매 참여 데이터가 강제 파기 취소되게 만드는 결함입니다.
    const targetGb = groupBuys[idxInFiltered]; // Bug! Maps to raw array index
    
    fetch(`/api/groupbuys/${targetGb.id}/cancel`, { method: 'POST' })
      .then(async () => {
        showToast('공동구매 취소 요청이 전송되었습니다. (인덱스 타깃 꼬임)', 'warning');
        await loadAll();
      });
  };

  // Qty & Option switch race (Error 1 Target)
  const triggerQtyOptionRace = (part) => {
    showToast('수량을 2개로 변경하고 옵션을 실버 그레이로 순차 요청합니다.', 'info');

    // 1. PATCH quantity 2 (4s delay) -> reverts option inside backend
    fetch(`/api/participants/${part.id}/quantity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 2 })
    });

    // 2. PATCH option '실버 그레이' (1s delay)
    setTimeout(() => {
      fetch(`/api/participants/${part.id}/option`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option: '실버 그레이' })
      });
    }, 150);

    // Optimistically update local UI state
    setParticipants(prev => prev.map(p => p.id === part.id ? { ...p, quantity: 2, option: '실버 그레이' } : p));

    // Refresh after 4.5s to see that the option is reverted back to the old option
    setTimeout(async () => {
      showToast('지연 처리 완료 (최종 DB에는 이전 옵션 상태로 원복 덮어씌워짐)', 'warning');
      await loadAll();
    }, 4500);
  };

  // Participants search race (Error 6 Target)
  const triggerSearchRace = () => {
    showToast('검색 고속 비동기 경합을 시작합니다.', 'info');

    // 1. Fetch '김' (3s delay)
    fetch('/api/participants/search?q=김')
      .then(res => res.json())
      .then(data => {
        setParticipants(data);
        showToast('김씨 성 검색 응답 완료 (3초 지연 오버라이트)', 'warning');
      });

    // 2. Fetch '이' (0.2s delay)
    setTimeout(() => {
      fetch('/api/participants/search?q=이')
        .then(res => res.json())
        .then(data => {
          setParticipants(data);
          showToast('이씨 성 검색 응답 완료 (0.2초)', 'info');
        });
    }, 150);
  };

  // Refund & Delivery race (Error 4 Target)
  const triggerRefundDeliveryRace = (ord) => {
    showToast('환불 신청 직후 배송 중 변경 처리를 동시 요청합니다.', 'info');

    // 1. POST refund (0.1s delay)
    fetch(`/api/orders/${ord.id}/refund`, { method: 'POST' });

    // 2. PATCH delivery SHIPPING (3.0s delay)
    setTimeout(async () => {
      const res = await fetch(`/api/orders/${ord.id}/delivery`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SHIPPING' })
      });
      if (res.ok) {
        showToast('배송 상태 변경 완료 (3초 지연 완료)', 'success');
        await loadAll();
      }
    }, 100);

    // Optimistically update local state
    setOrders(prev => prev.map(o => o.id === ord.id ? { ...o, status: 'REFUNDED' } : o));

    // Refresh after 3.5s to see that the status is SHIPPED (overwriting REFUNDED)
    setTimeout(async () => {
      showToast('배송 지연 저장 완료 (환불된 주문이 다시 배송 중으로 번복됨)', 'danger');
      await loadAll();
    }, 3500);
  };

  // Join Closed group buy (Error 7 Target)
  const triggerClosedJoin = async (gb) => {
    showToast('마감된 공동구매 참여 요청을 전송합니다.', 'info');

    const res = await fetch(`/api/groupbuys/${gb.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '임시참가자', quantity: 3, option: '골드 에디션' })
    });

    if (res.status === 409) {
      showToast('공동구매 모집 마감으로 인해 거부되었습니다. (HTTP 409)', 'danger');
      await loadParticipants(); // Re-fetch to show that it STILL updated the database!
    }
  };

  // Apply join (Normal flow)
  const handleApplyJoin = async (e) => {
    e.preventDefault();
    if (!selectedGb) return;

    const res = await fetch(`/api/groupbuys/${selectedGb.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: joinName,
        quantity: Number(joinQty),
        option: joinOption
      })
    });
    if (res.ok) {
      showToast(`[${selectedGb.title}] 공동구매 신청이 완료되었습니다.`, 'success');
      await loadAll();
    }
  };

  return (
    <div className="groupbuy-app">
      
      {/* Top Header navbar */}
      <header className="app-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="logo-title">GroupBuy</span>
          <span className="logo-subtitle">Cooperative Order & Shipping Management</span>
        </div>

        <div className="header-right">
          <div className="user-session">
            <span>👤 접속 유저: </span>
            <select value={currentUser} onChange={e => handleUserSwitch(e.target.value)}>
              <option value="사용자 A">사용자 A (정산: 13.3만)</option>
              <option value="사용자 B">사용자 B (정산: 14.7만)</option>
            </select>
          </div>

          <button className="sandbox-reset-btn" onClick={resetSandbox}>
            🔄 DB 초기화
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="groupbuy-grid">

        {/* Left Side: Category and Status Filters */}
        <aside className="panel-section filter-sidebar">
          <h3>📂 카테고리 필터</h3>
          <div className="category-list">
            <button 
              className={selectedCategory === 'ALL' ? 'active' : ''} 
              onClick={() => setSelectedCategory('ALL')}
            >
              전체 보기
            </button>
            <button 
              className={selectedCategory === '디지털' ? 'active' : ''} 
              onClick={() => setSelectedCategory('디지털')}
            >
              디지털/기기
            </button>
            <button 
              className={selectedCategory === '생활' ? 'active' : ''} 
              onClick={() => setSelectedCategory('생활')}
            >
              생활/주방
            </button>
            <button 
              className={selectedCategory === '가구' ? 'active' : ''} 
              onClick={() => setSelectedCategory('가구')}
            >
              가구/리빙
            </button>
          </div>

          <div className="sort-box">
            <label>
              <input 
                type="checkbox"
                checked={sortProgress}
                onChange={e => setSortProgress(e.target.checked)}
              />
              진행률순 정렬
            </label>
            <p className="warn-desc">* 진행률 정렬 상태에서 취소 시 엉뚱한 참여 데이터가 해제됨 (Error 2)</p>
          </div>

          {/* Delivery states tracking table */}
          <div className="delivery-tracking-widget">
            <h4>🚚 주문 관리 & 배송 상태</h4>
            <p className="warn-desc">* 환불 신청 즉시 배송상태를 변경하면 배송 중으로 원복됨 (Error 4)</p>
            <div className="orders-stack">
              {orders.map(ord => (
                <div key={ord.id} className="order-item-card">
                  <div className="meta">
                    <strong>{ord.participant}</strong>
                    <span className={`status-badge ${ord.status.toLowerCase()}`}>
                      {ord.status}
                    </span>
                  </div>
                  <small>금액: {ord.price}원</small>
                  <div className="actions">
                    <button 
                      className="race-btn-sm"
                      onClick={() => triggerRefundDeliveryRace(ord)}
                    >
                      ⚡ 환불 후 바로 배송중 (Error 4)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Group buy cards and progress bar */}
        <main className="panel-section catalog-center">
          <div className="catalog-header">
            <h2>🔥 모집 중 공동구매 딜</h2>
            <p className="warn-desc">* 마감 종료 딜에 강제 참여 시 HTTP 409 거부되나 DB에 참여 정보 저장됨 (Error 7)</p>
          </div>

          <div className="groupbuys-grid">
            {filteredGroupBuys.map((gb, idx) => {
              const progressRate = Math.min(100, Math.round((gb.currentQty / gb.targetQty) * 100));
              return (
                <div 
                  key={gb.id} 
                  className={`gb-card ${selectedGb?.id === gb.id ? 'selected' : ''}`}
                  onClick={() => setSelectedGb(gb)}
                >
                  <div className="gb-header">
                    <span className="category-tag">{gb.category}</span>
                    <span className={`status-tag ${gb.status.toLowerCase()}`}>{gb.status}</span>
                  </div>
                  <h3>{gb.title}</h3>
                  <div className="price-tag">{gb.price.toLocaleString()} 원</div>
                  
                  {/* Progress bar */}
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progressRate}%` }}></div>
                    <span className="progress-lbl">{progressRate}% ({gb.currentQty} / {gb.targetQty}개)</span>
                  </div>

                  <div className="gb-actions">
                    {gb.status === 'CLOSED' && (
                      <button 
                        className="closed-join-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerClosedJoin(gb);
                        }}
                      >
                        ⚡ 마감딜 강제참여 (Error 7)
                      </button>
                    )}
                    <button 
                      className="cancel-btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelParticipation(idx);
                      }}
                    >
                      참여 취소 (Error 2)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Right Side: Participant list & settlement summaries */}
        <aside className="panel-section participants-sidebar">
          <div className="sidebar-header">
            <h3>👥 실시간 참여 신청자 목록</h3>
            <button className="search-race-btn" onClick={triggerSearchRace}>
              ⚡ 검색 고속 경합 (Error 6)
            </button>
          </div>
          <p className="warn-desc">* 이전 지연 검색 결과가 최신 상태를 오버라이트함 (Error 6)</p>

          <div className="search-box">
            <input 
              type="text" 
              placeholder="참여자 이름 검색 (예: 김)..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
            />
          </div>

          <div className="participants-table-wrapper">
            <table className="participants-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>옵션</th>
                  <th>수량</th>
                  <th>조작</th>
                </tr>
              </thead>
              <tbody>
                {participants.filter(p => !searchVal || p.name.includes(searchVal)).map(p => (
                  <tr key={p.id} className={p.status === 'CANCELLED' ? 'cancelled' : ''}>
                    <td>{p.name}</td>
                    <td>{p.option}</td>
                    <td>{p.quantity}개</td>
                    <td>
                      <button 
                        className="modify-btn"
                        onClick={() => triggerQtyOptionRace(p)}
                      >
                        ⚡ 수량/옵션 변경 (Error 1)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* User Settlement totals summary (Error 5 Target) */}
          <div className="user-settlement-summary">
            <h3>💳 정산 예상 총계 (세션 요약)</h3>
            <p className="warn-desc">* 유저 교체 시에도 총 정산 금액 캐시가 이전 사람 값으로 유출 유지됨 (Error 5)</p>
            <div className="settlement-total-card">
              <span>{currentUser} 결제 예정 금액:</span>
              <strong className="cost-lbl">{cachedSettlementTotal.toLocaleString()} 원</strong>
            </div>
            <button className="sync-btn" onClick={syncSettlementMeters}>
              정산금 동기화
            </button>
          </div>

          {/* Normal Join form */}
          <div className="join-form-block">
            <h4>✍️ 공동구매 수동 신청</h4>
            <form onSubmit={handleApplyJoin} className="quick-join-form">
              <input type="text" placeholder="참가자 이름..." value={joinName} onChange={e => setJoinName(e.target.value)} />
              <input type="number" min="1" max="10" value={joinQty} onChange={e => setJoinQty(Number(e.target.value))} />
              <input type="text" placeholder="옵션명 기입..." value={joinOption} onChange={e => setJoinOption(e.target.value)} />
              <button type="submit">참여 신청</button>
            </form>
          </div>
        </aside>

      </div>

      {/* Floating Action Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
              &times;
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
