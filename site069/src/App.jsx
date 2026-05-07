import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  LayoutDashboard, 
  Package, 
  Users, 
  History, 
  Settings, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRightLeft, 
  Navigation,
  RotateCcw,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  Bell,
  UserCheck
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState('dashboard'); // dashboard, orders, riders, logs
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [bug, setBug] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState(null);

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async (unstableSort = false) => {
    setLoading(true);
    const resO = await fetch(`/api/orders?sort=createdAt&triggerBug=${unstableSort}`);
    const jsonO = await resO.json();
    setOrders(jsonO.data);
    
    if (jsonO.bugId) {
      setBug({ id: jsonO.bugId });
      if (jsonO.bugId === 'site069-bug03') {
        window.alert(`[정렬 오류] ${jsonO.bugId}: 동일한 시간대 데이터의 정렬 순서가 보장되지 않아 데이터 위치가 변경되었습니다.`);
      }
      if (jsonO.bugId === 'site069-bug04') {
        window.alert(`[캐시 오류] ${jsonO.bugId}: 상태 변경이 완료되었으나 캐시 지연으로 인해 이전 데이터가 조회되었습니다.`);
      }
    } else {
      setBug(null);
    }

    const resS = await fetch('/api/dashboard/summary');
    setSummary(await resS.json());

    const resR = await fetch('/api/riders');
    setRiders((await resR.json()).data);
    setLoading(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatus = async (orderId, status, bugType = null) => {
    const res = await fetch('/api/orders/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status, triggerBugType: bugType })
    });
    const json = await res.json();
    
    if (json.bugId) {
      setBug({ id: json.bugId });
      if (json.bugId === 'site069-bug01') window.alert(`[상태 전이 오류] ${json.bugId}: 완료된 주문이 다시 조리중 상태로 역행하였습니다.`);
      if (json.bugId === 'site069-bug02') window.alert(`[중복 처리 오류] ${json.bugId}: 동일한 상태 변경 이벤트가 중복 기록되었습니다 (로그 확인 필요).`);
    } else {
      setBug(null);
      showToast("상태가 성공적으로 업데이트되었습니다.");
    }
    fetchData();
  };

  const assignRider = async (orderId, riderId) => {
    await fetch('/api/orders/assign-rider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, riderId })
    });
    setAssigningOrder(null);
    showToast("라이더가 배정되었습니다.");
    fetchData();
  };

  const fetchLogs = async () => {
    const res = await fetch('/api/orders/logs');
    const json = await res.json();
    setLogs(json.data);
    if (json.bugId === 'site069-bug02') {
       setBug({ id: json.bugId });
    }
  };

  const createOrder = async () => {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menu: "신규 주문 메뉴", user: "홍길동" })
    });
    showToast("새 주문이 생성되었습니다.");
    fetchData();
  };

  const statuses = ['created', 'cooking', 'delivering', 'completed'];
  const statusMap = {
    'created': '접수완료',
    'cooking': '조리중',
    'delivering': '배달중',
    'completed': '배달완료'
  };

  return (
    <div className="deliv-app">
      {toast && <div className="toast" style={{position:'fixed', top:'90px', right:'40px', background:'var(--red)', color:'#fff', padding:'12px 24px', borderRadius:'10px', zIndex:3000, boxShadow:'var(--shadow)'}}>{toast}</div>}

      {/* Rider Assignment Modal */}
      {assigningOrder && (
        <div className="modal-overlay" style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:4000}}>
           <div className="modal-content" style={{background:'#fff', padding:'32px', borderRadius:'24px', width:'400px', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'}}>
              <h3 style={{marginBottom:'20px'}}>라이더 배정 (#00{assigningOrder})</h3>
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                 {riders.map(r => (
                   <div key={r.id} className="rider-select-item" style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px', border:'1px solid var(--border)', borderRadius:'12px', cursor:'pointer'}} onClick={() => assignRider(assigningOrder, r.id)}>
                      <span>{r.name}</span>
                      <span style={{fontSize:'0.7rem', color: r.status === 'available' ? '#10b981' : '#f59e0b'}}>{r.status === 'available' ? '가용' : '배달중'}</span>
                   </div>
                 ))}
              </div>
              <button className="btn-red" style={{marginTop:'24px', width:'100%', background:'#f1f5f9', color:'var(--black)'}} onClick={() => setAssigningOrder(null)}>취소</button>
           </div>
        </div>
      )}

      {/* Top Nav */}
      <nav className="top-nav">
        <div className="brand" onClick={() => setView('dashboard')} style={{cursor:'pointer'}}>
          <Truck size={32} />
          <span>Deliv<strong>Dash</strong></span>
        </div>
        <ul className="nav-links">
          <li className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>대시보드</li>
          <li className={`nav-item ${view === 'orders' ? 'active' : ''}`} onClick={() => setView('orders')}>주문 관리</li>
          <li className={`nav-item ${view === 'riders' ? 'active' : ''}`} onClick={() => setView('riders')}>라이더 관리</li>
          <li className={`nav-item ${view === 'logs' ? 'active' : ''}`} onClick={() => { setView('logs'); fetchLogs(); }}>로그 기록</li>
        </ul>
        <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
           <Bell size={20} className="clickable" />
           <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700'}}>AD</div>
        </div>
      </nav>

      <main className="main-content">
        
        {view === 'dashboard' && (
          <div className="fade-in">
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px'}}>
                <h2 style={{fontSize:'1.8rem', fontWeight:'900'}}>운영 현황 대시보드</h2>
                <button className="btn-red" onClick={() => createOrder()}><Plus size={20}/> 새 주문 생성</button>
             </div>
             <div className="card-grid">
                <div className="stat-card">
                   <span style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)'}}>총 주문 수</span>
                   <div style={{fontSize:'2.5rem', fontWeight:'900', marginTop:'8px'}}>{summary?.totalOrders}</div>
                </div>
                <div className="stat-card">
                   <span style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)'}}>진행 중 주문</span>
                   <div style={{fontSize:'2.5rem', fontWeight:'900', marginTop:'8px', color:'var(--red)'}}>{summary?.active}</div>
                </div>
                <div className="stat-card">
                   <span style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)'}}>배달 중인 라이더</span>
                   <div style={{fontSize:'2.5rem', fontWeight:'900', marginTop:'8px'}}>{summary?.assignedRiders}</div>
                </div>
                <div className="stat-card">
                   <span style={{fontSize:'0.8rem', fontWeight:'700', color:'var(--text-muted)'}}>평균 배달 시간</span>
                   <div style={{fontSize:'2.5rem', fontWeight:'900', marginTop:'8px', color:'#2563eb'}}>{summary?.avgDeliveryTime}</div>
                </div>
             </div>

             <div style={{marginTop:'48px', background:'#fff', padding:'32px', borderRadius:'24px', boxShadow:'var(--shadow)'}}>
                <h3>실시간 주문 모니터링</h3>
                <div style={{marginTop:'24px', display:'flex', flexDirection:'column', gap:'12px'}}>
                   {orders.slice(0, 5).map(o => (
                     <div key={o.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px', borderBottom:'1px solid var(--border)'}}>
                        <div>
                           <span style={{fontWeight:'700'}}>#{o.id} - {o.menu}</span>
                           <p style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{o.user} {o.rider && <span style={{color:'var(--red)', fontWeight:'800'}}>• {o.rider}</span>}</p>
                        </div>
                        <span className={`badge ${o.status === 'completed' ? 'badge-gray' : 'badge-red'}`}>{statusMap[o.status]}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {view === 'orders' && (
          <div className="fade-in">
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px'}}>
                <h2 style={{fontSize:'1.8rem', fontWeight:'900'}}>주문 관제 보드</h2>
                <div style={{display:'flex', gap:'12px'}}>
                   <button className="btn-red" style={{background:'#0f172a'}} onClick={() => fetchData(true)} data-bug-id="site069-bug03"><RefreshCw size={18}/> 데이터 동기화</button>
                   <button className="btn-red" onClick={() => fetchData()}><RotateCcw size={18}/> 새로고침</button>
                </div>
             </div>

             <div className="kanban-board">
                {statuses.map(status => (
                  <div key={status} className="kanban-column">
                     <div className="column-header">
                        <span className="column-title">{statusMap[status]}</span>
                        <span className="column-count">{orders.filter(o => o.status === status).length}</span>
                     </div>
                     {orders.filter(o => o.status === status).map(o => (
                       <div key={o.id} className="order-card fade-in">
                          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px'}}>
                             <span style={{fontSize:'0.75rem', fontWeight:'800', color: 'var(--red)'}}>#00{o.id}</span>
                             <Clock size={14} color="#64748b" />
                          </div>
                          <p style={{fontWeight:'700', fontSize:'0.9rem', marginBottom:'8px'}}>{o.menu}</p>
                          <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.75rem', color:'var(--text-muted)'}}>
                             <Users size={12} /> {o.user}
                          </div>
                          {o.rider && (
                            <div style={{marginTop:'8px', display:'flex', alignItems:'center', gap:'6px', fontSize:'0.75rem', color:'var(--red)', fontWeight:'700'}}>
                               <Navigation size={12} /> {o.rider} 배정됨
                            </div>
                          )}
                          <div style={{marginTop:'16px', borderTop:'1px solid #f1f5f9', paddingTop:'12px', display:'flex', flexDirection: 'column', gap:'8px'}}>
                             {status === 'created' && <button className="btn-red" style={{padding:'6px 10px', fontSize:'0.75rem'}} onClick={() => updateStatus(o.id, 'cooking')}>조리 시작</button>}
                             {status === 'cooking' && (
                               <>
                                 <button className="btn-red" style={{padding:'6px 10px', fontSize:'0.75rem', background: o.rider ? '#10b981' : 'var(--red)'}} onClick={() => setAssigningOrder(o.id)}>
                                    <UserCheck size={14} style={{marginRight:'4px'}} /> {o.rider ? '라이더 변경' : '라이더 배정'}
                                 </button>
                                 <button className="btn-red" disabled={!o.rider} style={{padding:'6px 10px', fontSize:'0.75rem', opacity: !o.rider ? 0.5 : 1}} onClick={() => updateStatus(o.id, 'delivering')}>배달 출발</button>
                               </>
                             )}
                             {status === 'delivering' && <button className="btn-red" style={{padding:'6px 10px', fontSize:'0.75rem'}} onClick={() => updateStatus(o.id, 'completed')}>배달 완료</button>}
                             {status === 'completed' && (
                               <div style={{display:'flex', flexDirection: 'column', gap:'6px'}}>
                                  <button className="btn-red" style={{padding:'6px 10px', fontSize:'0.75rem', background:'#1e293b'}} onClick={() => updateStatus(o.id, 'cooking', 'bug01')} data-bug-id="site069-bug01">관리자 상태 조정</button>
                                  <button className="btn-red" style={{padding:'6px 10px', fontSize:'0.75rem', background:'#475569'}} onClick={() => updateStatus(o.id, 'cooking', 'bug02')} data-bug-id="site069-bug02">일괄 상태 처리</button>
                                  <button className="btn-red" style={{padding:'6px 10px', fontSize:'0.75rem', background:'#be123c'}} onClick={() => updateStatus(o.id, 'cooking', 'bug04')} data-bug-id="site069-bug04">캐시 강제 갱신</button>
                               </div>
                             )}
                          </div>
                       </div>
                     ))}
                  </div>
                ))}
             </div>
          </div>
        )}

        {view === 'riders' && (
          <div className="fade-in">
             <h2 style={{fontSize:'1.8rem', fontWeight:'900', marginBottom:'32px'}}>라이더 관리</h2>
             <div className="card-grid">
                {riders.map(r => (
                  <div key={r.id} className="stat-card" style={{borderLeftColor: r.status === 'available' ? '#10b981' : '#f59e0b'}}>
                     <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                        <div style={{width:'50px', height:'50px', borderRadius:'50%', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center'}}>
                           <Navigation size={24} color="var(--red)" />
                        </div>
                        <div>
                           <h4 style={{fontSize:'1.125rem'}}>{r.name}</h4>
                           <span className={`badge ${r.status === 'available' ? 'badge-blue' : 'badge-gray'}`} style={{marginTop:'4px', display:'inline-block'}}>{r.status === 'available' ? '가용' : '배달중'}</span>
                        </div>
                     </div>
                     <button className="btn-red" style={{width:'100%', marginTop:'20px', padding:'8px'}} onClick={() => showToast(`${r.name} 라이더의 상태를 확인했습니다.`)}>상태 확인</button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {view === 'logs' && (
          <div className="fade-in">
             <h2 style={{fontSize:'1.8rem', fontWeight:'900', marginBottom:'32px'}}>주문 상태 변경 로그</h2>
             <div style={{background:'#fff', borderRadius:'24px', overflow:'hidden', boxShadow:'var(--shadow)'}}>
                <table style={{width:'100%', borderCollapse:'collapse'}}>
                   <thead style={{background:'#f8fafc'}}>
                      <tr>
                         <th style={{padding:'16px', textAlign:'left'}}>시간</th>
                         <th style={{padding:'16px', textAlign:'left'}}>주문 번호</th>
                         <th style={{padding:'16px', textAlign:'left'}}>변경 상태</th>
                         <th style={{padding:'16px', textAlign:'left'}}>수행 작업</th>
                      </tr>
                   </thead>
                   <tbody>
                      {logs.map((l, i) => (
                        <tr key={i} style={{borderBottom:'1px solid var(--border)'}}>
                           <td style={{padding:'16px', fontSize:'0.875rem', color:'var(--text-muted)'}}>{new Date(l.time).toLocaleString()}</td>
                           <td style={{padding:'16px', fontWeight:'700'}}>#{l.orderId}</td>
                           <td style={{padding:'16px'}}><span className="badge badge-blue">{statusMap[l.status]}</span></td>
                           <td style={{padding:'16px', fontSize:'0.875rem'}}>시스템 자동 갱신</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

      </main>

      {/* PPO Monitor */}
      <div className="ppo-monitor">
         <div style={{borderBottom:'1px solid #334155', paddingBottom:'8px', marginBottom:'12px', fontSize:'0.7rem', fontWeight:'800', color:'#94a3b8'}}>PPO-DELIVERY-MONITOR</div>
         <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>버그 탐지</span><span style={{color: bug ? '#ef4444' : '#10b981'}}>{bug ? '활성화' : '정상'}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>BUG_ID</span><span style={{color: '#fff'}}>{bug ? bug.id : 'N/A'}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>시스템 상태</span><span style={{color: '#fff'}}>ONLINE</span></div>
         </div>
      </div>
    </div>
  );
};

export default App;
