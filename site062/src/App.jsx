import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, MapPin, Clock, Star, RefreshCw, 
  ChevronRight, Ticket, Bell, User, Search,
  Navigation, CheckCircle2, AlertCircle, Info,
  Store, Heart, CreditCard, History
} from 'lucide-react';

const API_BASE = '/api';

const App = () => {
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [bugInfo, setBugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState({ name: "이주이", level: "VIP" });

  const fetchData = async () => {
    try {
      const [sRes, oRes, lRes] = await Promise.all([
        fetch(`${API_BASE}/stores`),
        fetch(`${API_BASE}/orders`),
        fetch(`${API_BASE}/logs`)
      ]);
      const sData = await sRes.json();
      const oData = await oRes.json();
      const lData = await lRes.json();
      setStores(sData);
      setOrders(oData.data || []);
      setLogs(lData.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- Handlers for "Real" feel ---
  const handleStoreClick = (storeName) => alert(`'${storeName}' 매장 상세 페이지로 이동합니다.`);
  const handleNavClick = (tab) => setActiveTab(tab);
  const showProfile = () => alert(`사용자 정보: ${profile.name} (${profile.level} 등급)`);
  const showNotifications = () => alert("새로운 알림이 없습니다.");

  // --- Bug Triggers ---
  const triggerBug01 = async (orderId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/order/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, triggerBug: true })
      });
      const data = await res.json();
      const bugId = res.headers.get('X-Bug-Id') || data.bugId;
      if (bugId === 'site062-bug01') {
        setBugInfo({
          id: bugId,
          title: "버그 1: 상태 전이 검증 결함",
          message: "배달 로직 상 접수-배송-완료 순서를 지켜야 함에도 불구하고, 즉시 '완료' 상태로 강제 전환되었습니다. (State Transition Logic Error)"
        });
      }
      fetchData();
    } catch (e) { } finally { setLoading(false); }
  };

  const triggerBug02 = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/order/eta?triggerBug=true`);
      const data = await res.json();
      const bugId = res.headers.get('X-Bug-Id') || data.bugId;
      if (bugId === 'site062-bug02') {
        setBugInfo({
          id: bugId,
          title: "버그 2: 도착 시간 연산 오류 (ETA Overflow)",
          message: "배달 도착 예정 시간을 계산하는 도중 시스템 산술 오버플로우가 발생하여 시간이 음수(-15분)로 표시되는 중대 결함이 감지되었습니다."
        });
      }
    } catch (e) { } finally { setLoading(false); }
  };

  const triggerBug03 = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/order/location?triggerBug=true`);
      const data = await res.json();
      const bugId = res.headers.get('X-Bug-Id') || data.bugId;
      if (bugId === 'site062-bug03') {
        setBugInfo({
          id: bugId,
          title: "버그 3: 라이더 위치 캐시 불일치",
          message: "라이더의 실시간 GPS 좌표를 가져오는 과정에서 캐시 정합성 오류가 발생하여 비정상적인 위치 정보가 노출되었습니다."
        });
      }
    } catch (e) { } finally { setLoading(false); }
  };

  const triggerBug04 = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/order/coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerBug: true })
      });
      const data = await res.json();
      const bugId = res.headers.get('X-Bug-Id') || data.bugId;
      if (bugId === 'site062-bug04') {
        setBugInfo({
          id: bugId,
          title: "버그 4: 트랜잭션 롤백 실패",
          message: "쿠폰 검증 오류가 발생했으나, 이미 차감된 포인트나 락(Lock)이 원복되지 않고 '처리 중' 상태로 고정되는 데이터베이스 트랜잭션 결함입니다."
        });
      }
    } catch (e) { } finally { setLoading(false); }
  };

  return (
    <div className="app-shell animate-fade">
      <nav className="top-nav">
        <div className="brand" onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>B_DELIVERY</div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Search size={22} color="#333" style={{ cursor: 'pointer' }} onClick={() => alert("검색 창을 엽니다.")} />
          <Bell size={22} color="#333" style={{ cursor: 'pointer' }} onClick={showNotifications} />
          <User size={22} color="#333" style={{ cursor: 'pointer' }} onClick={showProfile} />
        </div>
      </nav>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        <div className="section" style={{ background: 'var(--primary)', color: 'white', padding: '30px 20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <MapPin size={18} />
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>서울특별시 강남구 테헤란로 152</h2>
            <ChevronRight size={18} />
          </div>
          <p style={{ fontSize: '12px', opacity: 0.8 }}>이 위치를 기준으로 맛집을 보여드려요</p>
        </div>

        <div className="section">
          <div className="section-title">주문 현황 실시간 트래킹</div>
          {orders.map(order => (
            <div key={order.id} className="tracking-card animate-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <div className="status-text">
                    {order.status === 'PREPARING' ? '음식을 정성껏 준비 중이에요' : 
                     order.status === 'SHIPPING' ? '라이더가 배달을 시작했어요' : '배달이 완료되었습니다!'}
                  </div>
                  <div className="eta-text" onClick={triggerBug02} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', background: '#f0f9f8', padding: '4px 8px', borderRadius: '4px', width: 'fit-content' }}>
                    <Clock size={14} color="var(--primary)" /> 
                    <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{order.eta}분 후 도착 예정</span>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#aaa', textAlign: 'right' }}>
                  주문번호: {order.id}<br/>{order.time}
                </div>
              </div>
              
              <div className="progress-steps">
                <div className={`step active`}></div>
                <div className={`step ${order.status !== 'PREPARING' ? 'active' : ''}`}></div>
                <div className={`step ${order.status === 'DELIVERED' ? 'active' : ''}`}></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button className="btn-action btn-primary" style={{ gridColumn: 'span 2' }} onClick={() => triggerBug01(order.id)} data-bug-id="site062-bug01">
                  <RefreshCw size={16} /> 실시간 배달 상태 동기화
                </button>
                <button className="btn-action" onClick={triggerBug03} data-bug-id="site062-bug03">
                  <Navigation size={16} /> 라이더 위치 추적
                </button>
                <button className="btn-action" onClick={triggerBug04} data-bug-id="site062-bug04">
                  <Ticket size={16} /> 멤버십 쿠폰 적용
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="section">
          <div className="section-title">오늘의 추천 맛집</div>
          {stores.map(store => (
            <div key={store.id} className="store-card animate-fade" onClick={() => handleStoreClick(store.name)}>
              <div className="store-img">
                <Store size={32} color="#aaa" />
              </div>
              <div className="store-info">
                <h3>{store.name}</h3>
                <div className="store-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#ffcc00' }}>
                    <Star size={14} fill="#ffcc00" /> {store.rating}
                  </span>
                  <span>최소주문 {store.minOrder}</span>
                  <span>{store.deliveryTime}</span>
                </div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '5px' }}>
                  <span style={{ fontSize: '10px', background: '#f8f9fa', padding: '2px 6px', borderRadius: '4px', border: '1px solid #eee' }}>배달비 0원</span>
                  <span style={{ fontSize: '10px', background: '#fff0f0', color: '#ff4d4d', padding: '2px 6px', borderRadius: '4px' }}>쿠폰 할인</span>
                </div>
              </div>
              <Heart size={20} color="#eee" style={{ marginLeft: 'auto' }} onClick={(e) => { e.stopPropagation(); alert("찜 목록에 추가되었습니다."); }} />
            </div>
          ))}
        </div>
      </div>

      <div className="audit-panel">
        <div style={{ fontSize: '10px', fontWeight: 800, marginBottom: '8px', opacity: 0.7, borderBottom: '1px solid #333', paddingBottom: '4px' }}>
          LIVE_AUDIT_LOG_STREAM
        </div>
        {logs.map(log => (
          <div key={log.id} style={{ marginBottom: '4px', fontSize: '10px' }}>
            <span style={{ color: '#555' }}>[{new Date(log.time).toLocaleTimeString()}]</span> {log.msg}
          </div>
        ))}
      </div>

      {/* Bottom Nav Bar (High Fidelity & Fixed) */}
      <div className="bottom-nav">
        <div className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => handleNavClick('home')}>
          <ShoppingBag size={20} />
          <span>홈</span>
        </div>
        <div className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => handleNavClick('search')}>
          <Heart size={20} />
          <span>찜</span>
        </div>
        <div className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleNavClick('orders')}>
          <History size={20} />
          <span>주문내역</span>
        </div>
        <div className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleNavClick('profile')}>
          <User size={20} />
          <span>MY배민</span>
        </div>
      </div>

      {bugInfo && (
        <div className="modal-overlay" onClick={() => setBugInfo(null)}>
          <div className="modal animate-fade" onClick={e => e.stopPropagation()}>
            <div className="bug-id-label">{bugInfo.id}</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '15px' }}>{bugInfo.title}</h2>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px' }}>{bugInfo.message}</p>
            <button className="btn-action btn-primary" onClick={() => setBugInfo(null)}>데이터 분석 완료</button>
          </div>
        </div>
      )}

      {loading && (
        <div className="modal-overlay" style={{ background: 'rgba(255,255,255,0.7)' }}>
          <RefreshCw className="animate-spin" size={40} color="var(--primary)" />
        </div>
      )}
    </div>
  );
};

export default App;
