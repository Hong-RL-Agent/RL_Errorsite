import React, { useState, useEffect } from 'react';

export default function App() {
  const [currentUser, setCurrentUser] = useState('사용자 A');
  const [subscriptions, setSubscriptions] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Stats
  const [statsRange, setStatsRange] = useState('3개월');
  const [statsPoints, setStatsPoints] = useState([120000, 134000, 142000]);

  // Selections & forms
  const [selectedSub, setSelectedSub] = useState(null);
  const [newFamName, setNewFamName] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubPlan, setNewSubPlan] = useState('');
  const [newSubPrice, setNewSubPrice] = useState(10000);
  const [newSubDate, setNewSubDate] = useState('15');
  const [newSubCategory, setNewSubCategory] = useState('영상');

  // Stale cache indicators (Error 4 Target)
  const [cachedTotalCost, setCachedTotalCost] = useState(310840);
  const [cachedNextAlert, setCachedNextAlert] = useState("넷플릭스 프리미엄 (결제일: 07-15)");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadSubscriptions();
    await loadFamily();
    await loadSessionInfo();
  };

  const loadSubscriptions = async () => {
    const res = await fetch('/api/subscriptions');
    const data = await res.json();
    setSubscriptions(data);
    if (data.length > 0 && !selectedSub) {
      setSelectedSub(data[0]);
    }
  };

  const loadFamily = async () => {
    const res = await fetch('/api/family');
    const data = await res.json();
    setFamilyMembers(data);
  };

  const loadSessionInfo = async () => {
    const res = await fetch(`/api/session?user=${currentUser}`);
    const data = await res.json();
    setCachedTotalCost(data.totalCost);
    setCachedNextAlert(data.nextAlert);
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
    showToast('SubTrack 다중 구독 정보 디비가 초기화되었습니다.', 'success');
    setSelectedSub(null);
    await loadAll();
  };

  // User Switcher (Error 4 Target)
  const handleUserSwitch = async (newUser) => {
    setCurrentUser(newUser);
    showToast(`회원 세션이 [${newUser}]로 변경되었습니다.`, 'info');
    
    // Load subscription list for B
    await loadSubscriptions();
    await loadFamily();

    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache
    // DESCRIPTION: 사용자를 A에서 B로 전환할 때 목록 필드는 갱신되지만, 
    // 상단 월 구독 총액(`cachedTotalCost`)과 다음 결제 알림(`cachedNextAlert`)의 캐시를 
    // 리셋하지 않고 A의 비싼 결제액 정보를 그대로 잔존 전시하여 유출하는 세션 보안 결함입니다.
  };

  // Force recalculate (manual sync to fix Error 4)
  const syncSessionMeters = async () => {
    await loadSessionInfo();
    showToast('스마트 세션 통계 인디케이터 동기화 완료', 'success');
  };

  // Auto Pay Toggle Index Error (Error 3 Target)
  const sortedSubs = [...subscriptions].sort((a, b) => b.price - a.price);

  const handleAutoPayToggle = (idxInFiltered) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 정렬된 비용순 인덱스 대신 원본 구독 배열(`subscriptions`)의 index 요소를 
    // 토글 변경하여 정렬 시 엉뚱한 구독 카드의 자동결제 여부가 켜고 꺼지는 결함입니다.
    const updated = subscriptions.map((s, idx) => {
      if (idx === idxInFiltered) { // Bug: Using original index ID mapping!
        return { ...s, autoPay: !s.autoPay };
      }
      return s;
    });
    setSubscriptions(updated);
    showToast(`구독 자동결제 스위치 상태 변경 완료 (엉뚱한 대상 갱신 가능성 있음)`, 'warning');
  };

  // Plan & Date Change Race (Error 1 Target)
  const triggerPlanDateRace = (sub) => {
    showToast('요금제 수정 및 결제일 변경 비동기 요청을 동시에 호출합니다.', 'info');

    // 1. PATCH plan (3s delay) -> sends old plan/price payload (reverts newPlan)
    fetch(`/api/subscriptions/${sub.id}/plan`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: sub.plan, price: sub.price }) 
    });

    // 2. PATCH billing-date (0.1s delay) -> sends new date '01'
    setTimeout(() => {
      fetch(`/api/subscriptions/${sub.id}/billing-date`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingDate: '01' })
      });
    }, 100);

    // Update local UI immediately so user sees new values optimistically
    setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, plan: '프리미엄 4K 플러스', price: 29000, billingDate: '01' } : s));

    // Refresh after 3.5s
    setTimeout(async () => {
      showToast('요금제 지연 처리 스케줄러 완료 (요금제는 이전으로 복원되고 결제일만 01일로 변경됨)', 'warning');
      await loadSubscriptions();
    }, 3500);
  };

  // Cancel & Reactivate state conflict (Error 2 Target)
  const triggerCancelReactivateRace = (subId) => {
    showToast('구독 해지 직후 즉시 재활성화를 진행합니다.', 'info');

    // 1. Cancel request (3s delay)
    fetch(`/api/subscriptions/${subId}/cancel`, { method: 'POST' });

    // 2. Reactivate request (0.1s delay)
    setTimeout(async () => {
      const res = await fetch(`/api/subscriptions/${subId}/reactivate`, { method: 'POST' });
      if (res.ok) {
        showToast('재활성화 성공 완료 (0.1초 실행)', 'success');
        await loadSubscriptions();
      }
    }, 100);

    // Refresh after 3.5s
    setTimeout(async () => {
      showToast('구독 해지 지연 요청 완료 (최종 DB 상태는 CANCELLED로 남음)', 'danger');
      await loadSubscriptions();
    }, 3500);
  };

  // Stats range race (Error 5 Target)
  const triggerStatsRangeRace = () => {
    showToast('비용 통계 범위 탭 고속 전환 레이스를 시작합니다.', 'info');

    // 1. Fetch 6개월 (3s delay)
    fetch('/api/stats?range=6개월')
      .then(res => res.json())
      .then(data => {
        setStatsPoints(data.points);
        setStatsRange('6개월');
        showToast('6개월 통계 그래프 수신 완료 (3초 지연)', 'warning');
      });

    // 2. Fetch 3개월 (0.2s delay)
    setTimeout(() => {
      fetch('/api/stats?range=3개월')
        .then(res => res.json())
        .then(data => {
          setStatsPoints(data.points);
          setStatsRange('3개월');
          showToast('3개월 통계 그래프 수신 완료 (0.2초)', 'info');
        });
    }, 150);
  };

  // Delete family member (Error 6 Target)
  const deleteFamilyMember = async (famId) => {
    const res = await fetch(`/api/family/${famId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('가족 멤버 공유 리스트가 삭제되었습니다.', 'success');
      await loadFamily();
      // Note: We bypass decreasing occupied seats (Error 6)
      await loadSubscriptions();
    }
  };

  // Add family member
  const addFamilyMember = async (e) => {
    e.preventDefault();
    if (!newFamName.trim() || !selectedSub) return;

    const res = await fetch('/api/family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newFamName,
        subId: selectedSub.id
      })
    });
    if (res.ok) {
      showToast('가족 공유원이 등록되었습니다.', 'success');
      setNewFamName('');
      await loadFamily();
      await loadSubscriptions();
    }
  };

  // Bind payment method (Error 7 Target)
  const handlePaymentMethodChange = async (subId, pmId) => {
    const res = await fetch(`/api/subscriptions/${subId}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethodId: pmId })
    });

    if (res.status === 400) {
      showToast('유효하지 않은 카드 결제 수단입니다. (HTTP 400)', 'danger');
      await loadSubscriptions();
    } else {
      showToast('결제 카드가 성공적으로 변경되었습니다.', 'success');
      await loadSubscriptions();
    }
  };

  // Add new subscription
  const handleAddSubscription = async (e) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newSubName,
        plan: newSubPlan,
        price: newSubPrice,
        billingDate: newSubDate,
        category: newSubCategory
      })
    });
    if (res.ok) {
      showToast(`새 구독 [${newSubName}]이 등록되었습니다.`, 'success');
      setNewSubName('');
      setNewSubPlan('');
      setNewSubPrice(10000);
      await loadSubscriptions();
    }
  };

  return (
    <div className="subtrack-app">
      
      {/* Top Total Costs bar */}
      <header className="app-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <span className="logo-title">SubTrack</span>
          <span className="logo-subtitle">Unified Subscription Manager</span>
        </div>

        {/* Global Costs (Error 4 Target) */}
        <div className="total-costs-banner">
          <div className="banner-left">
            <span>나의 이번 달 총 구독 지출액:</span>
            <strong className="cost-lbl">{cachedTotalCost.toLocaleString()} 원</strong>
          </div>
          <div className="banner-right">
            <span>🚨 예정된 알림: </span>
            <span className="alert-lbl">{cachedNextAlert}</span>
          </div>
        </div>

        <div className="header-right">
          <div className="user-session">
            <span>👤 로그인 세션: </span>
            <select value={currentUser} onChange={e => handleUserSwitch(e.target.value)}>
              <option value="사용자 A">사용자 A (정우진 - 31만원)</option>
              <option value="사용자 B">사용자 B (김미영 - 3만원)</option>
            </select>
          </div>

          <button className="sync-btn" onClick={syncSessionMeters}>
            📊 세션 동기화
          </button>
          <button className="sandbox-reset-btn" onClick={resetSandbox}>
            🔄 초기화
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="subtrack-grid">

        {/* Left Column: Categories and quick sub add */}
        <aside className="panel-section categories-sidebar">
          <h3>📂 카테고리 분류</h3>
          <div className="category-stack">
            <button className="cat-btn active">전체 구독 목록 ({subscriptions.length})</button>
            <button className="cat-btn">영상 서비스</button>
            <button className="cat-btn">음악 음악 스트리밍</button>
            <button className="cat-btn">소프트웨어 도구</button>
          </div>

          <div className="quick-add-form-block">
            <h3>➕ 신규 요금 구독 추가</h3>
            <form onSubmit={handleAddSubscription} className="sub-add-form">
              <input 
                type="text" 
                placeholder="구독 이름 (예: 멜론)..." 
                value={newSubName} 
                onChange={e => setNewSubName(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="요금제명 (예: 프리미엄)..." 
                value={newSubPlan} 
                onChange={e => setNewSubPlan(e.target.value)}
              />
              <input 
                type="number" 
                placeholder="금액 (원)..." 
                value={newSubPrice} 
                onChange={e => setNewSubPrice(Number(e.target.value))}
              />
              <button type="submit" className="add-sub-btn">구독 등록</button>
            </form>
          </div>
        </aside>

        {/* Center Column: Subscription cards list & automatic payment (Error 3 Target) */}
        <main className="panel-section subs-timeline-center">
          <div className="timeline-header">
            <h2>💳 정렬된 나의 활성 구독 목록 (비용순)</h2>
            <p className="warn-desc">* 비용 정렬 상태에서 토글 시 다른 카드가 갱신됨 (Error 3)</p>
          </div>

          <div className="sorted-subs-list">
            {sortedSubs.map((sub, idx) => (
              <div 
                key={sub.id} 
                className={`sub-card ${sub.status}`}
                onClick={() => setSelectedSub(sub)}
              >
                <div class="card-top">
                  <span className={`status-tag ${sub.status}`}>{sub.status}</span>
                  <span className="cat-tag">{sub.category}</span>
                </div>
                <h4>{sub.name}</h4>
                <p className="plan-name">{sub.plan}</p>
                
                <div className="card-middle">
                  <strong className="price-lbl">{sub.price.toLocaleString()} 원</strong>
                  <span>매월 {sub.billingDate}일 결제</span>
                </div>

                <div className="card-bottom" onClick={e => e.stopPropagation()}>
                  <div className="autopay-toggle">
                    <span>자동 결제:</span>
                    <input 
                      type="checkbox" 
                      checked={sub.autoPay}
                      onChange={() => handleAutoPayToggle(idx)} 
                    />
                  </div>
                  <button 
                    className="cancel-btn"
                    onClick={() => triggerCancelReactivateRace(sub.id)}
                  >
                    ⚡ 해지 후 즉각 재활성화 (Error 2)
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SVG Cost statistics (Error 5 Target) */}
          <div className="stats-graph-block">
            <div className="graph-header">
              <h3>📈 월별 비용 통계 추이</h3>
              <button className="race-trigger-btn" onClick={triggerStatsRangeRace}>
                ⚡ 기간 고속 탭 전환 (Error 5)
              </button>
            </div>
            <p className="warn-desc">* 6개월 클릭 후 3개월 바로 클릭 시 최신 기간을 덮어씀 (Error 5)</p>
            
            <div className="svg-graph-container">
              <svg className="stats-svg" viewBox="0 0 300 120">
                <rect width="300" height="120" fill="#0d1527" rx="6" />
                {/* Horizontal gridlines */}
                <line x1="20" y1="30" x2="280" y2="30" stroke="#1d2e50" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="20" y1="60" x2="280" y2="60" stroke="#1d2e50" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="20" y1="90" x2="280" y2="90" stroke="#1d2e50" strokeWidth="1" strokeDasharray="4,4" />
                
                {/* Dynamic SVG polyline path */}
                <polyline 
                  fill="none" 
                  stroke="#8b5cf6" 
                  strokeWidth="3"
                  points={statsPoints.map((p, i) => {
                    const x = 30 + i * (240 / (statsPoints.length - 1 || 1));
                    const y = 100 - (p / 180000) * 80;
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* Render nodes */}
                {statsPoints.map((p, i) => {
                  const x = 30 + i * (240 / (statsPoints.length - 1 || 1));
                  const y = 100 - (p / 180000) * 80;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="4" fill="#10b981" />
                      <text x={x} y={y - 8} fill="#f8fafc" fontSize="8" textAnchor="middle">
                        {(p / 10000).toFixed(0)}만
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="graph-footer">
                <span>현재 선택된 통계 범위: <strong>{statsRange}</strong></span>
              </div>
            </div>
          </div>
        </main>

        {/* Right Column: Selected sub edit & Family sharing */}
        <aside className="panel-section details-sidebar">
          {selectedSub ? (
            <div className="sub-details-card">
              <h3>🛠️ 선택한 구독 세부 제어</h3>
              <div className="detail-meta">
                <h4>{selectedSub.name}</h4>
                <p>현재 상태: <strong className={selectedSub.status}>{selectedSub.status}</strong></p>
                <p>차지 중인 공유 좌석: <strong className="lbl-primary">{selectedSub.occupiedSeats} 석</strong></p>
              </div>

              {/* 요금제 및 결제일 동시 변경 (Error 1 Target) */}
              <div className="plan-date-race-block">
                <h4>변경 결제 컨트롤러</h4>
                <p className="warn-desc">* 변경 완료 시 이전 요금제로 롤백되고 날짜만 01일로 변경됨 (Error 1)</p>
                <button 
                  className="race-btn"
                  onClick={() => triggerPlanDateRace(selectedSub)}
                >
                  ⚡ 요금제 및 결제일 동시 변경 (Error 1)
                </button>
              </div>

              {/* Payment binding dropdown (Error 7 Target) */}
              <div className="payment-bind-block">
                <h4>💳 결제 수단 카드 변경</h4>
                <p className="warn-desc">* 무효 카드(pm-invalid) 선택 시 에러를 뱉지만 내부 매핑은 등록됨 (Error 7)</p>
                <select 
                  value={selectedSub.paymentMethodId}
                  onChange={e => handlePaymentMethodChange(selectedSub.id, e.target.value)}
                >
                  <option value="pm-01">신한 개인 신용카드</option>
                  <option value="pm-02">국민 법인 신용카드</option>
                  <option value="pm-invalid">종료된 무효 카드 (pm-invalid)</option>
                </select>
                <div className="current-pm-badge">
                  <span>등록된 수단 ID: <code>{selectedSub.paymentMethodId}</code></span>
                </div>
              </div>
            </div>
          ) : (
            <p className="empty-lbl">구독 카드를 선택해 주세요.</p>
          )}

          {/* Family sharing seats (Error 6 Target) */}
          <div className="family-sharing-block">
            <h3>👥 가족 계정 공유 관리</h3>
            <p className="warn-desc">* 멤버 삭제를 해도 구독 좌석 점유수가 감소하지 않음 (Error 6)</p>
            
            <div className="family-list">
              {familyMembers.map(fam => (
                <div key={fam.id} className="family-card">
                  <div className="info">
                    <strong>{fam.name}</strong>
                    <span>연동구독: {fam.subId.toUpperCase()}</span>
                  </div>
                  <button 
                    className="delete-member-btn"
                    onClick={() => deleteFamilyMember(fam.id)}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={addFamilyMember} className="family-add-form">
              <input 
                type="text" 
                placeholder="가족 이름..." 
                value={newFamName} 
                onChange={e => setNewFamName(e.target.value)}
              />
              <button type="submit">공유원 추가</button>
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
