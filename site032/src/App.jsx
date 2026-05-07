import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  ShoppingBag, 
  ClipboardList, 
  Database, 
  Cpu, 
  Settings, 
  RefreshCw, 
  Search, 
  Plus, 
  AlertCircle,
  CheckCircle2,
  Package,
  Activity,
  History,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeBug, setActiveBug] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, sumRes] = await Promise.all([
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/dashboard/summary`)
      ]);
      const prodData = await prodRes.json();
      const sumData = await sumRes.json();
      
      setProducts(prodData.data);
      setSummary(sumData);
      
      // Only set Bug 04 if no other bug is currently active
      if (prodData.bugId && !activeBug) setActiveBug(prodData);
      addLog("데이터 동기화 완료");
    } catch (e) {
      addLog("시스템 연결 오류");
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      const data = await res.json();
      addLog(`주문 생성됨: ID ${data.orderId}`);
      if (data.bugId) {
        setActiveBug(null); // Clear previous (likely Bug 04)
        setTimeout(() => setActiveBug(data), 10); // Trigger Bug 02
      }
      setSelectedProduct(null);
      fetchData();
    } catch (e) {
      addLog("주문 처리 실패");
    }
  };

  const runRecovery = async () => {
    setLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/system/recover`, { method: 'POST' });
      const data = await res.json();
      addLog(data.message);
      fetchData();
    } catch (e) {
      addLog("복구 프로세스 중단됨");
    } finally {
      setLoading(false);
    }
  };

  const checkQueueMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/queue/messages`);
      const data = await res.json();
      setQueueInfo(data);
      addLog(`큐 메시지 확인: 실제 ${data.actual}건`);
      if (data.bugId) setActiveBug(data);
    } catch (e) {
      addLog("큐 데이터 조회 실패");
    }
  };

  const checkQueueStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/queue/status`);
      const data = await res.json();
      addLog(`큐 상태 조회: 크기 ${data.queueSize}`);
      if (data.bugId) setActiveBug(data);
    } catch (e) {
      addLog("큐 상태 확인 실패");
    }
  };

  const checkCacheStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/cache/status`);
      const data = await res.json();
      setCacheInfo(data);
      addLog(`캐시 상태: ${data.cacheLoaded ? "준비됨" : "비어있음"}`);
      if (data.bugId) setActiveBug(data);
    } catch (e) {
      addLog("캐시 조회 실패");
    }
  };

  const warmupCache = async () => {
    try {
      const res = await fetch(`${API_BASE}/cache/warmup`, { method: 'POST' });
      const data = await res.json();
      addLog(data.message);
      checkCacheStatus();
    } catch (e) {
      addLog("캐시 워밍업 실패");
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Sprout size={32} />
          <span>ORGANIC MALL</span>
        </div>

        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <Activity size={20} /> 대시보드
            </li>
            <li className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              <ShoppingBag size={20} /> 상품목록
            </li>
            <li className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              <ClipboardList size={20} /> 주문관리
            </li>
            <li className={`nav-item ${activeTab === 'queue' ? 'active' : ''}`} onClick={() => setActiveTab('queue')}>
              <Cpu size={20} /> 큐 상태
            </li>
            <li className={`nav-item ${activeTab === 'cache' ? 'active' : ''}`} onClick={() => setActiveTab('cache')}>
              <Database size={20} /> 캐시 상태
            </li>
            <li className={`nav-item ${activeTab === 'recovery' ? 'active' : ''}`} onClick={() => setActiveTab('recovery')}>
              <Settings size={20} /> 복구 랩
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.8rem' }}>
          <div style={{ marginBottom: '0.5rem', opacity: 0.7 }}>Server Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }}></div>
            <span style={{ fontWeight: 700 }}>운영 중 (Port 9141)</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>팜투테이블 운영지원 시스템</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>농장 직송 유기농 상품 관리 플랫폼</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => { addLog("알림 기능을 실행했습니다."); alert("알림 기능 준비 중입니다."); }}>
              알림 센터
            </button>
            <div style={{ width: 45, height: 45, borderRadius: '50%', background: 'var(--light-green)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
               <Activity size={20} color="var(--primary-green)" />
            </div>
          </div>
        </header>

        {activeBug && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bug-banner">
            <AlertCircle size={24} />
            <div>
              <div style={{ fontWeight: 800 }}>시스템 로직 이상 탐지</div>
              <div style={{ fontSize: '0.85rem' }}>유형: {activeBug.type} | <span className="bug-id-badge">{activeBug.bugId}</span></div>
            </div>
            <button className="btn btn-outline" style={{ marginLeft: 'auto', padding: '0.4rem 1rem' }} onClick={() => setActiveBug(null)}>닫기</button>
          </motion.div>
        )}

        {activeTab === 'overview' && (
          <div className="fade-in">
            <div className="summary-grid">
              <div className="stat-card">
                <h4>총 등록 상품</h4>
                <div className="value">{summary?.totalProducts}</div>
              </div>
              <div className="stat-card">
                <h4>누적 주문량</h4>
                <div className="value">{summary?.totalOrders}</div>
              </div>
              <div className="stat-card">
                <h4>시스템 가동률</h4>
                <div className="value">99.9%</div>
              </div>
            </div>

            <div className="lab-panel">
               <h3 style={{ fontSize: '1.1rem' }}><History size={20} /> 실시간 시스템 로그</h3>
               <div className="log-panel">
                 {logs.map((log, i) => (
                   <div key={i} className="log-entry">{log}</div>
                 ))}
                 {logs.length === 0 && <div style={{ opacity: 0.5 }}>이벤트 대기 중...</div>}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="fade-in">
            <div className="product-grid">
              {products.map(p => (
                <div key={p.id} className="product-card" onClick={() => setSelectedProduct(p)}>
                  <div className="product-img">
                    <img src={p.img} alt={p.name} />
                  </div>
                  <div className="product-info">
                    <div className="product-cat">{p.category}</div>
                    <div className="product-name">{p.name}</div>
                    <div className="product-footer">
                      <div style={{ fontWeight: 800, color: 'var(--primary-green)' }}>₩{p.price.toLocaleString()}</div>
                      <span className="badge badge-stock">재고 {p.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="fade-in">
            <div className="lab-panel">
               <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--beige)' }}>
                       <tr>
                          <th style={{ padding: '1rem', textAlign: 'left' }}>주문번호</th>
                          <th style={{ padding: '1rem', textAlign: 'left' }}>상품명</th>
                          <th style={{ padding: '1rem', textAlign: 'left' }}>수량</th>
                          <th style={{ padding: '1rem', textAlign: 'left' }}>날짜</th>
                          <th style={{ padding: '1rem', textAlign: 'left' }}>상태</th>
                       </tr>
                    </thead>
                    <tbody>
                       {orders.length === 0 ? (
                         <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>주문 내역이 없습니다.</td></tr>
                       ) : (
                         orders.map(o => (
                           <tr key={o.orderId} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '1rem' }}>#{o.orderId}</td>
                              <td style={{ padding: '1rem', fontWeight: 600 }}>{o.productName}</td>
                              <td style={{ padding: '1rem' }}>{o.quantity}개</td>
                              <td style={{ padding: '1rem' }}>{o.date}</td>
                              <td style={{ padding: '1rem' }}>
                                 <span className={`badge ${o.status === '중복처리됨' ? 'badge-error' : 'badge-stock'}`}>{o.status}</span>
                              </td>
                           </tr>
                         ))
                       )}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="fade-in">
            <div className="lab-panel">
               <h3><Cpu size={24} color="var(--primary-green)" /> 메시지 큐 모니터링</h3>
               <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>주문 메시지의 정합성 및 큐 적재 상태를 실시간으로 확인합니다.</p>
               <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <button className="btn btn-primary" onClick={checkQueueMessages} data-bug-id="site032-bug01">메시지 상세 조회</button>
                  <button className="btn btn-outline" onClick={checkQueueStatus} data-bug-id="site032-bug03">큐 상태 새로고침</button>
               </div>
               
               {queueInfo && (
                 <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--beige)', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span>기대되는 메시지 수: <strong>{queueInfo.expected}</strong></span>
                       <span>실제 감지된 메시지 수: <strong style={{ color: queueInfo.actual < queueInfo.expected ? 'red' : 'inherit' }}>{queueInfo.actual}</strong></span>
                    </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'cache' && (
          <div className="fade-in">
            <div className="lab-panel">
               <h3><Database size={24} color="var(--primary-green)" /> 인메모리 캐시 관리</h3>
               <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>데이터베이스 부하 분산을 위한 상품 캐시 상태를 제어합니다.</p>
               <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <button className="btn btn-primary" onClick={checkCacheStatus} data-bug-id="site032-bug04">캐시 정합성 체크</button>
                  <button className="btn btn-outline" onClick={warmupCache}>캐시 강제 워밍업</button>
               </div>

               {cacheInfo && (
                 <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', margin: '1rem 0' }}>{cacheInfo.cacheLoaded ? '✅' : '❌'}</div>
                    <div style={{ fontWeight: 700 }}>캐시 로드 상태: {cacheInfo.cacheLoaded ? '준비됨' : '비어있음 (Warm-up 필요)'}</div>
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'recovery' && (
          <div className="fade-in">
            <div className="lab-panel">
               <h3><RefreshCw size={24} color="var(--primary-green)" /> 긴급 복구 제어</h3>
               <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>시스템 장애 발생 시 전체 서비스 레이어를 재시작하고 데이터를 복구합니다.</p>
               <button className="btn btn-primary" style={{ background: '#ef4444', width: '200px' }} onClick={runRecovery}>
                  긴급 복구 실행
               </button>
               <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px dashed var(--border)', borderRadius: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>복구 대상 섹터</h4>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '1.5rem' }}>
                     <li>트랜잭션 메시지 큐 (RabbitMQ Mock)</li>
                     <li>인메모리 상품 캐시 (Redis Mock)</li>
                     <li>주문 영속성 레이어</li>
                  </ul>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-content" onClick={e => e.stopPropagation()}>
               <div style={{ width: '100%', height: '250px', borderRadius: '20px', overflow: 'hidden', marginBottom: '2rem' }}>
                  <img src={selectedProduct.img} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               </div>
               <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{selectedProduct.name}</h3>
               <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>산지에서 직접 수확한 신선한 {selectedProduct.name}입니다. 유기농 인증 완료.</p>
               <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                  <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>가격</div>
                     <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>₩{selectedProduct.price.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>남은 수량</div>
                     <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedProduct.stock}개</div>
                  </div>
               </div>
               <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedProduct(null)}>닫기</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { createOrder(selectedProduct.id); addLog(`${selectedProduct.name} 주문을 시작합니다.`); }}>구매하기</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
