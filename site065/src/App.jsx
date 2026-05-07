import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  LayoutDashboard, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Activity, 
  History, 
  User, 
  Bell, 
  Info,
  CalendarDays,
  ListTodo,
  FileText,
  RefreshCw,
  LogOut
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [slots, setSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bug, setBug] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'dashboard') await fetchSummary();
    if (activeTab === 'slots') await fetchSlots();
    if (activeTab === 'reservations') await fetchReservations();
    if (activeTab === 'logs') await fetchLogs();
    setLoading(false);
  };

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSummary = async () => {
    const res = await fetch('/api/dashboard/summary');
    setSummary(await res.json());
  };

  const fetchSlots = async (start = null, end = null) => {
    const query = start && end ? `&start=${start}&end=${end}` : '';
    const res = await fetch(`/api/slots?date=${selectedDate}${query}`);
    const data = await res.json();
    setSlots(data.data);
    if (data.bugId) {
      setBug({ id: data.bugId });
      if (data.bugId === 'site065-bug02') {
         // Natural trigger: viewing slots on a specific date triggers timezone shift
         window.alert(`[데이터 오류] ${data.bugId}: 서버 타임존 설정 문제로 인해 예약 시간이 실제와 1시간 차이가 납니다.`);
      }
      if (data.bugId === 'site065-bug03') {
         window.alert(`[필터 오류] ${data.bugId}: 경계 시간 처리 누락으로 인해 선택 범위 밖의 시간이 포함되었습니다.`);
      }
    } else {
      setBug(null);
    }
  };

  const fetchReservations = async () => {
    const res = await fetch('/api/reservations');
    const data = await res.json();
    setReservations(data.data);
  };

  const fetchLogs = async () => {
    const res = await fetch('/api/logs');
    const data = await res.json();
    setLogs(data.data);
  };

  const handleReserve = async (slotId) => {
    // Normal booking attempt
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId, user: 'Admin' })
    });
    const data = await res.json();
    
    if (data.bugId === 'site065-bug01') {
      window.alert(`[예약 위험] ${data.bugId}: 중복 예약이 허용되었습니다! 동일한 시간대에 여러 명이 예약되어 충돌이 예상됩니다.`);
      setBug({ id: data.bugId });
    } else {
      showToast("예약이 완료되었습니다.", "success");
    }
    fetchData();
  };

  const handleCancel = async (reservationId) => {
    const res = await fetch('/api/reservations/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId })
    });
    const data = await res.json();
    if (data.bugId === 'site065-bug04') {
      window.alert(`[상태 복구 실패] ${data.bugId}: 예약은 취소되었으나, 해당 시간 슬롯이 사용 가능(available) 상태로 돌아가지 않았습니다.`);
      setBug({ id: data.bugId });
    } else {
      showToast("예약이 취소되었습니다.");
    }
    fetchData();
  };

  const handleFilterRange = () => {
    // Trigger Bug 03
    fetchSlots(10, 12);
  };

  const handleUnprepared = (feature) => {
    showToast(`'${feature}' 기능은 곧 제공될 예정입니다.`, "info");
  };

  return (
    <div className="reserve-container">
      {toast && (
        <div className={`toast-popup fade-in`}>
          <Info size={18} color="var(--primary)" />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="reserve-sidebar">
        <div className="brand">
          <Clock size={32} />
          <span>Time<strong>Block</strong></span>
        </div>

        <nav className="nav-menu">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> 대시보드
          </div>
          <div className={`nav-item ${activeTab === 'slots' ? 'active' : ''}`} onClick={() => setActiveTab('slots')}>
            <CalendarDays size={20} /> 예약 슬롯
          </div>
          <div className={`nav-item ${activeTab === 'reservations' ? 'active' : ''}`} onClick={() => setActiveTab('reservations')}>
            <ListTodo size={20} /> 내 예약
          </div>
          <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <History size={20} /> 시스템 로그
          </div>
        </nav>

        <div style={{marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '20px'}}>
           <div className="nav-item" onClick={() => handleUnprepared('설정')}><Settings size={20} /> 설정</div>
           <div className="nav-item" onClick={() => handleUnprepared('로그아웃')}><LogOut size={20} /> 로그아웃</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="reserve-main">
        {/* Header Area */}
        <div className="view-header">
           <div>
              <h2>{
                activeTab === 'dashboard' ? '운영 현황' : 
                activeTab === 'slots' ? '시간대 선택' : 
                activeTab === 'reservations' ? '예약 리스트' : '활동 기록'
              }</h2>
              <p>실시간 예약 시스템의 현재 상태를 모니터링합니다.</p>
           </div>
           <div style={{display: 'flex', gap: '12px'}}>
              <button className="h-btn"><Bell size={20} /></button>
              <div className="user-box" style={{display:'flex', alignItems:'center', gap:'8px', background:'#fff', padding:'6px 12px', borderRadius:'20px', border:'1px solid var(--border)'}}>
                 <div style={{width:'24px', height:'24px', background:'var(--primary)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff'}}><User size={14}/></div>
                 <span style={{fontSize:'0.875rem', fontWeight:'600'}}>Manager</span>
              </div>
           </div>
        </div>

        <div className="view-content">
           {activeTab === 'dashboard' && (
             <div className="view-dashboard fade-in">
                <div className="stats-row">
                   <div className="stat-card">
                      <span className="label">전체 슬롯</span>
                      <span className="value">{summary?.totalSlots || 0}</span>
                   </div>
                   <div className="stat-card">
                      <span className="label">예약 완료</span>
                      <span className="value" style={{color: 'var(--primary)'}}>{summary?.booked || 0}</span>
                   </div>
                   <div className="stat-card">
                      <span className="label">예약 가능</span>
                      <span className="value" style={{color: 'var(--secondary)'}}>{summary?.available || 0}</span>
                   </div>
                   <div className="stat-card">
                      <span className="label">누적 트랜잭션</span>
                      <span className="value">{summary?.totalReservations || 0}</span>
                   </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px'}}>
                   <div className="panel white-panel" style={{background:'#fff', padding:'24px', borderRadius:'16px', boxShadow:'var(--shadow)'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                         <h3>주간 예약 트렌드</h3>
                         <button className="btn-txt" onClick={() => handleUnprepared('상세 통계')}>상세보기 <ChevronRight size={16}/></button>
                      </div>
                      <div style={{height:'180px', display:'flex', alignItems:'flex-end', gap:'10px', padding:'0 20px'}}>
                         {[30, 45, 60, 40, 80, 50, 70].map((h, i) => (
                           <div key={i} style={{flex:1, height:`${h}%`, background:'var(--primary)', opacity:0.8, borderRadius:'4px 4px 0 0'}}></div>
                         ))}
                      </div>
                   </div>
                   <div className="panel white-panel" style={{background:'#fff', padding:'24px', borderRadius:'16px', boxShadow:'var(--shadow)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center'}}>
                      <div style={{width:'60px', height:'60px', background:'#eff6ff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px'}}>
                         <Activity size={30} color="var(--primary)" />
                      </div>
                      <h4>시스템 동기화 상태</h4>
                      <p style={{fontSize:'0.875rem', color:'var(--text-muted)', margin:'8px 0'}}>모든 서버 노드가 정상 동작 중입니다.</p>
                      <button className="btn-primary" style={{marginTop:'12px', width:'100%'}} onClick={() => showToast("서버 동기화 중...")}>상태 리프레시</button>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'slots' && (
             <div className="view-slots fade-in">
                <div className="calendar-nav">
                   <div style={{display:'flex', gap:'8px', flex:1}}>
                      {Array.from({length: 5}).map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() + i);
                        const iso = d.toISOString().split('T')[0];
                        return (
                          <button 
                            key={i} 
                            className={`date-btn ${selectedDate === iso ? 'active' : ''}`}
                            onClick={() => setSelectedDate(iso)}
                            data-bug-id="site065-bug02"
                          >
                            {d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                          </button>
                        );
                      })}
                   </div>
                   <button className="btn-outline" onClick={handleFilterRange} data-bug-id="site065-bug03">
                      오전 집중 근무 (10:00~12:00)
                   </button>
                </div>

                <div className="slots-grid">
                   {slots.map(s => (
                     <div 
                      key={s.slotId} 
                      className={`slot-item ${s.status === 'booked' ? 'booked' : ''}`}
                      onClick={() => s.status === 'available' ? handleReserve(s.slotId) : handleReserve(s.slotId)} // Forced attempt for Bug 01
                      data-bug-id="site065-bug01"
                     >
                        <span className="slot-time">{s.time}</span>
                        <span className={`slot-status ${s.status}`}>{s.status === 'booked' ? 'Booked' : 'Available'}</span>
                        {s.originalTime && s.originalTime !== s.time && (
                          <div style={{fontSize:'10px', color:'#ef4444'}}>Shifted from {s.originalTime}</div>
                        )}
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'reservations' && (
             <div className="view-reservations fade-in">
                <table className="res-table">
                   <thead>
                      <tr>
                         <th>ID</th>
                         <th>날짜</th>
                         <th>시간</th>
                         <th>예약자</th>
                         <th>상태</th>
                         <th>관리</th>
                      </tr>
                   </thead>
                   <tbody>
                      {reservations.length === 0 ? (
                        <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color:'var(--text-muted)'}}>현재 예약 내역이 없습니다.</td></tr>
                      ) : (
                        reservations.map(r => (
                          <tr key={r.id}>
                             <td>#{r.id}</td>
                             <td>{r.slotInfo?.date}</td>
                             <td>{r.slotInfo?.time}</td>
                             <td><span className="badge badge-blue">{r.user}</span></td>
                             <td><CheckCircle size={16} color="var(--secondary)" /></td>
                             <td>
                                <button 
                                  className="btn-danger-sm" 
                                  onClick={() => handleCancel(r.id)}
                                  data-bug-id="site065-bug04"
                                >
                                   예약 취소
                                </button>
                             </td>
                          </tr>
                        ))
                      )}
                   </tbody>
                </table>
             </div>
           )}

           {activeTab === 'logs' && (
             <div className="view-logs fade-in">
                <div className="panel white-panel" style={{background:'#fff', borderRadius:'16px', overflow:'hidden', border:'1px solid var(--border)'}}>
                   <div style={{padding:'20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between'}}>
                      <h3>활동 로그</h3>
                      <button className="btn-txt" onClick={fetchLogs}><RefreshCw size={16}/></button>
                   </div>
                   <div style={{padding:'20px', maxHeight:'500px', overflowY:'auto'}}>
                      {logs.map((l, i) => (
                        <div key={i} style={{padding:'12px', borderBottom:'1px solid #f8fafc', display:'flex', gap:'12px'}}>
                           <span style={{color:'var(--text-muted)', fontSize:'0.875rem'}}>[{new Date(l.time).toLocaleTimeString()}]</span>
                           <span>{l.msg}</span>
                        </div>
                      ))}
                      {logs.length === 0 && <div style={{textAlign:'center', padding:'20px', color:'var(--text-muted)'}}>기록된 활동이 없습니다.</div>}
                   </div>
                </div>
             </div>
           )}
        </div>
      </main>

      {/* PPO Monitor */}
      <div className="ppo-monitor">
         <div className="mon-head">PPO-ENVIRONMENT-MONITOR</div>
         <div className="mon-body">
            <div className="mon-row"><span>BUG DETECTED</span><span className={`v highlight ${bug ? 'active' : ''}`}>{bug ? 'YES' : 'NO'}</span></div>
            <div className="mon-row"><span>BUG ID</span><span className="v highlight">{bug ? bug.id : 'NONE'}</span></div>
            <div className="mon-row"><span>SITE ID</span><span className="v">site065</span></div>
         </div>
      </div>
    </div>
  );
};

export default App;
