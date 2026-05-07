import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Star, MessageSquare, LayoutDashboard, History, AlertTriangle,
  Plus, Send, CheckCircle2, TrendingUp, X, Pizza, UtensilsCrossed, Clock,
  User, Activity, Share2, Trash2, Bell, Settings, Search, Download, 
  RefreshCcw, Tag, Ticket
} from 'lucide-react';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('foods');
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [summary, setSummary] = useState({ totalOrders: 0, revenue: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bugInfo, setBugInfo] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [reviewModal, setReviewModal] = useState(null); 
  const [toast, setToast] = useState(null);

  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [foodFilter, setFoodFilter] = useState('전체');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async (showLoad = false) => {
    if (showLoad) setLoading(true);
    try {
      const [fRes, oRes, rRes, sRes, dRes, lRes] = await Promise.all([
        fetch(`${API_BASE}/foods`),
        fetch(`${API_BASE}/orders`),
        fetch(`${API_BASE}/review`),
        fetch(`${API_BASE}/review/stats`),
        fetch(`${API_BASE}/dashboard/summary`),
        fetch(`${API_BASE}/logs`)
      ]);
      const [fData, oData, rData, sData, dData, lData] = await Promise.all([
        fRes.json(), oRes.json(), rRes.json(), sRes.json(), dRes.json(), lRes.json()
      ]);

      setFoods(fData?.data || []);
      setOrders(oData?.data || []);
      setReviews(rData?.data || []);
      setStats(sData || { averageRating: 0 });
      setSummary(dData || { totalOrders: 0, revenue: 0 });
      setLogs(lData?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoad) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOrder = async (food) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodId: food.id })
      });
      if (res.ok) {
        showToast(`'${food.name}' 주문 완료!`);
        await fetchData();
        setActiveTab('orders');
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setSelectedFood(null); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: reviewModal?.orderId,
          foodName: reviewModal?.foodName,
          rating: reviewRating,
          content: reviewContent
        })
      });
      const data = await res.json();
      const bugId = res.headers.get('X-Bug-Id') || data.bugId;
      
      if (bugId) {
        setBugInfo({ id: bugId, title: getBugTitle(bugId), message: getBugMessage(bugId) });
      }
      
      setReviewModal(null);
      setReviewContent('');
      setReviewRating(5);
      showToast("리뷰 등록이 완료되었습니다.");
      await fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getBugTitle = (id) => ({
    'site088-bug01': "Bug 01: 입력 검증 누락",
    'site088-bug02': "Bug 02: 규칙 엔진 우회",
    'site088-bug03': "Bug 03: 점수 계산 조건 오류",
    'site088-bug04': "Bug 04: 제출 제한 미적용"
  }[id] || "시스템 로직 오류");

  const getBugMessage = (id) => ({
    'site088-bug01': "평점 입력 시 5점을 초과하는 비정상적인 값이 검증 없이 수락되어 저장되었습니다.",
    'site088-bug02': "유효 주문 내역이 없는 게스트 사용자의 리뷰 작성이 권한 검증 없이 승인되었습니다.",
    'site088-bug03': "평균 평점 집계 로직에서 의도적인 오계산(+1.5)이 발생하여 데이터가 왜곡되었습니다.",
    'site088-bug04': "이미 리뷰가 등록된 동일 주문 건에 대해 중복 작성이 차단되지 않았습니다."
  }[id] || "정의되지 않은 비즈니스 로직 결함이 감지되었습니다.");

  const filteredFoods = useMemo(() => {
    return (foods || []).filter(f => 
      (foodFilter === '전체' || f.name.includes(foodFilter)) &&
      f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [foods, searchTerm, foodFilter]);

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="logo" onClick={() => setActiveTab('foods')} style={{ cursor: 'pointer' }}>
          <ShoppingBag color="var(--primary)" size={28} strokeWidth={3} />
          <span>DeliveryCore</span>
        </div>
        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === 'foods' ? 'active' : ''}`} onClick={() => setActiveTab('foods')}><UtensilsCrossed size={20} /> 메뉴 탐색</button>
          <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}><Clock size={20} /> 주문 내역</button>
          <button className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}><MessageSquare size={20} /> 리뷰 피드</button>
          <button className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}><LayoutDashboard size={20} /> 통계 분석</button>
          <button className={`nav-item ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => setActiveTab('coupons')}><Ticket size={20} /> 쿠폰함</button>
        </nav>
        <div className="sidebar-footer">
          <div className="summary-card">
            <div className="s-item"><span>전체 주문</span><strong>{summary?.totalOrders || 0}</strong></div>
            <div className="s-item"><span>평균 평점</span><strong>⭐ {stats?.averageRating || 0}</strong></div>
          </div>
          <button className="nav-item" style={{ marginTop: '16px' }} onClick={() => setShowSettings(true)}><Settings size={18} /> 설정</button>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div className="search-bar"><Search size={18} color="#64748b" /><input type="text" placeholder="검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}><Bell size={20} /></button>
            <div className="user-profile"><div className="avatar"><User size={18} /></div><span>Admin_088</span></div>
          </div>
        </header>

        {activeTab === 'foods' && (
          <div className="content animate-fade">
            <div className="banner">
              <div className="banner-content"><h2>실시간 인기 메뉴</h2><p>오늘 가장 핫한 메뉴를 바로 주문해보세요.</p></div>
              <div className="banner-icon"><TrendingUp size={64} /></div>
            </div>
            <div className="section-header">
              <div className="filter-tabs">{['전체', '치킨', '피자', '짬뽕'].map(f => (<button key={f} className={`filter-tab ${foodFilter === f ? 'active' : ''}`} onClick={() => setFoodFilter(f)}>{f}</button>))}</div>
            </div>
            <div className="food-grid">
              {filteredFoods.map(food => (
                <div key={food.id} className="food-card" onClick={() => setSelectedFood(food)}>
                  <img src={food.img} alt={food.name} className="food-img" />
                  <div className="food-info">
                    <div className="food-name">{food.name}</div>
                    <div className="food-price">₩{food.price?.toLocaleString()}</div>
                    <button className="order-btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedFood(food); }}>지금 주문</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="content animate-fade">
            <div className="section-header"><h3>진행 중인 주문</h3></div>
            <div className="order-list">
              {orders.length === 0 ? <div className="empty-state"><p>내역이 없습니다.</p></div> : orders.map(order => (
                <div key={order.id} className="order-item-card">
                  <div className="order-main">
                    <div className="order-icon"><ShoppingBag size={24} /></div>
                    <div className="order-details"><strong>{order.foodName}</strong><span>#{order.id} | {new Date(order.createdAt).toLocaleTimeString()}</span></div>
                  </div>
                  <div className="order-status-group">
                    <span className="status-badge">{order.status}</span>
                    <button className="btn-review" onClick={() => setReviewModal({ orderId: order.id, foodName: order.foodName })}>리뷰 등록하기</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="content animate-fade">
            <div className="review-top-bar">
              <div className="rating-summary">
                <div className="avg-rating">⭐ {stats?.averageRating || 0}</div>
                <span>{stats?.totalReviews || 0} Ratings</span>
              </div>
              <button className="btn-secondary" onClick={() => setReviewModal({ orderId: null, foodName: "이벤트 참여" })}>
                <Plus size={18} /> 리뷰 작성하고 포인트 받기
              </button>
            </div>
            <div className="review-feed">
              {reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-card-header">
                    <div className="review-user"><div className="user-avatar">{review.foodName?.[0]}</div><div className="user-info"><strong>User_{review.id % 1000}</strong><span>{new Date(review.createdAt).toLocaleDateString()}</span></div></div>
                    <div className="review-stars">⭐ {review.rating}</div>
                  </div>
                  <p style={{ marginTop: '15px' }}>{review.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="content animate-fade">
            <div className="dashboard-grid">
               <div className="dash-card"><h3>누적 트래픽</h3><div className="dash-value">{summary?.totalOrders || 0}<span>건</span></div></div>
               <div className="dash-card" onClick={() => fetchData(true)} style={{ cursor: 'pointer' }}>
                 <h3>리뷰 통계 리포트</h3>
                 <div className="dash-value" style={{ color: (stats?.averageRating || 0) > 5 ? 'var(--danger)' : 'inherit' }}>{stats?.averageRating || 0}<span>/ 5.0</span></div>
                 <p style={{ fontSize: '12px', color: '#64748b' }}>* 평점 데이터 오계산 상시 감지 중</p>
               </div>
            </div>
            <div className="log-container">
               <div className="log-header"><h3>Audit Trace</h3></div>
               <div className="log-panel">
                 {(logs || []).map(log => (<div key={log.id} className="log-line"><span>[{new Date(log.time).toLocaleTimeString()}]</span> <span className={`l-type ${log.type}`}>{log.type}</span> <span>{log.msg}</span></div>))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="content animate-fade">
             <div className="section-header"><h3>쿠폰함</h3></div>
             <div className="coupon-card-lg">
                <Tag size={48} color="var(--primary)" />
                <h2>월간 정기 할인 쿠폰</h2>
                <p>3,000원 할인 쿠폰이 준비되었습니다.</p>
                <button className="btn-confirm" onClick={async () => {
                   const res = await fetch(`${API_BASE}/coupons/collect`, { method: 'POST' });
                   const data = await res.json();
                   showToast(`쿠폰 발급 완료: ${data.couponCode}`);
                   fetchData();
                }}>쿠폰 받기</button>
             </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedFood && (
        <div className="modal-overlay" onClick={() => setSelectedFood(null)}>
          <div className="modal food-detail-modal animate-fade" onClick={e => e.stopPropagation()}>
            <img src={selectedFood.img} className="modal-img" />
            <div className="modal-body">
              <div className="modal-food-name">{selectedFood.name}</div>
              <div className="modal-food-price">₩{selectedFood.price?.toLocaleString()}</div>
              <div className="modal-actions"><button className="btn-cancel" onClick={() => setSelectedFood(null)}>닫기</button><button className="btn-confirm" onClick={() => handleOrder(selectedFood)}>주문 확정</button></div>
            </div>
          </div>
        </div>
      )}

      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal animate-fade" style={{ padding: '35px' }} onClick={e => e.stopPropagation()}>
            <h3>후기 등록</h3>
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>별점 (1~5)</label>
              <input type="number" className="input-field" value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>리뷰 내용</label>
              <textarea className="textarea-field" rows="4" value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} required placeholder="솔직한 후기를 남겨주세요." />
            </div>
            <button className="btn-confirm-full" onClick={handleReviewSubmit}>리뷰 등록하기</button>
          </div>
        </div>
      )}

      {bugInfo && (
        <div className="bug-overlay" onClick={() => setBugInfo(null)}>
          <div className="bug-modal animate-fade">
            <div className="bug-icon-bg"><AlertTriangle color="white" size={32} /></div>
            <div className="bug-badge">{bugInfo.id}</div>
            <h3>{bugInfo.title}</h3>
            <p>{bugInfo.message}</p>
            <button className="btn-bug-close" onClick={() => setBugInfo(null)}>보고서 닫기</button>
          </div>
        </div>
      )}

      {toast && <div className="toast-message animate-fade">{toast}</div>}
      {loading && <div className="loader-overlay"><RefreshCcw className="spin" size={24} /></div>}
    </div>
  );
};

export default App;
