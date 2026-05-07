import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  LayoutDashboard, 
  Grid3X3, 
  Calendar, 
  CreditCard, 
  History, 
  Settings, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Info,
  RefreshCw,
  Wallet,
  User,
  ShieldCheck
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState('seats'); // dashboard, seats, reservations, logs
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [bug, setBug] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 5000);
    return () => clearInterval(interval);
  }, [view]);

  const fetchData = async (bugType = null) => {
    try {
      const resS = await fetch(`/api/seats?triggerBugType=${bugType}`);
      const jsonS = await resS.json();
      setSeats(jsonS.data);
      if (jsonS.bugId) setBug({ id: jsonS.bugId });

      const resR = await fetch(`/api/reservations?triggerBugType=${bugType}`);
      const jsonR = await resR.json();
      setReservations(jsonR.data);
      if (jsonR.bugId === 'site070-bug04') {
        setBug({ id: jsonR.bugId });
        window.alert(`[시간대 오류] ${jsonR.bugId}: 서버 시간대 해석 차이로 인해 결제 시간이 9시간 어긋나게 표시됩니다.`);
      }

      const resSum = await fetch('/api/dashboard/summary');
      setSummary(await resSum.json());
    } catch (e) {
      console.error("Fetch failed", e);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const holdSeat = async (seatId, bugType = null) => {
    const res = await fetch('/api/seats/hold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seatId, userId: 'user_PPO_01', triggerBugType: bugType })
    });
    const json = await res.json();
    if (json.bugId) {
      setBug({ id: json.bugId });
      if (json.bugId === 'site070-bug02') window.alert(`[중복 홀드 오류] ${json.bugId}: 동일한 좌석이 다른 사용자에게 중복 할당되었습니다.`);
      if (json.bugId === 'site070-bug01') window.alert(`[TTL 오류] ${json.bugId}: 홀드 만료 시간이 비정상적으로 계산되어 해제되지 않습니다.`);
    } else {
      setBug(null);
      showToast(`${seatId} 좌석이 임시 홀드되었습니다.`);
    }
    fetchData();
  };

  const processPayment = async (seatId, bugType = null) => {
    setLoading(true);
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seatId, userId: 'user_PPO_01', triggerBugType: bugType })
    });
    const json = await res.json();
    setLoading(false);
    
    if (json.bugId === 'site070-bug03') {
      setBug({ id: json.bugId });
      window.alert(`[멱등성 오류] ${json.bugId}: 중복 결제 요청이 처리되어 이중 과금이 발생했습니다.`);
    } else {
      setBug(null);
      showToast(`${seatId} 좌석 결제가 완료되었습니다.`);
      setSelectedSeat(null);
    }
    fetchData();
  };

  const fetchLogs = async () => {
    const res = await fetch('/api/logs');
    const json = await res.json();
    setLogs(json.data);
  };

  return (
    <div className="ticket-app">
      {toast && <div className="toast" style={{position:'fixed', top:'40px', left:'50%', transform:'translateX(-50%)', background:'var(--purple)', color:'#fff', padding:'12px 24px', borderRadius:'30px', zIndex:3000, boxShadow:'0 10px 20px rgba(0,0,0,0.3)'}}>{toast}</div>}

      <header>
        <div className="brand">TICKE<strong>NIX</strong></div>
        <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
           <div style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--neon-green)', fontSize:'0.9rem', fontWeight:'700'}}>
              <ShieldCheck size={18} /> 실시간 보안 작동중
           </div>
           <User size={20} className="clickable" />
        </div>
      </header>

      <main className="main-container">
        
        {view === 'dashboard' && (
          <div className="fade-in">
             <h2 style={{fontSize:'2.5rem', fontWeight:'900', marginBottom:'40px'}}>공연 분석 현황</h2>
             <div className="card-row">
                <div className="stat-card">
                   <span style={{color:'var(--text-muted)', fontSize:'0.8rem', fontWeight:'800'}}>총 좌석 수</span>
                   <div style={{fontSize:'3rem', fontWeight:'900', marginTop:'12px'}}>{summary?.totalSeats}</div>
                </div>
                <div className="stat-card">
                   <span style={{color:'var(--text-muted)', fontSize:'0.8rem', fontWeight:'800'}}>판매된 좌석</span>
                   <div style={{fontSize:'3rem', fontWeight:'900', marginTop:'12px', color:'var(--neon-green)'}}>{summary?.sold}</div>
                </div>
                <div className="stat-card">
                   <span style={{color:'var(--text-muted)', fontSize:'0.8rem', fontWeight:'800'}}>진행 중인 홀드</span>
                   <div style={{fontSize:'3rem', fontWeight:'900', marginTop:'12px', color:'var(--purple-neon)'}}>{summary?.held}</div>
                </div>
             </div>
             <div className="stat-card" style={{background:'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border:'1px solid var(--purple)'}}>
                <h3 style={{color:'var(--purple-neon)'}}>매출 요약</h3>
                <div style={{fontSize:'3.5rem', fontWeight:'900', marginTop:'20px'}}>₩{summary?.revenue?.toLocaleString()}</div>
                <p style={{marginTop:'12px', color:'var(--text-muted)'}}>전일 대비 12.5% 증가</p>
             </div>
          </div>
        )}

        {view === 'seats' && (
          <div className="fade-in">
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'48px'}}>
                <div>
                   <h2 style={{fontSize:'2rem', fontWeight:'900'}}>좌석 선택</h2>
                   <p style={{color:'var(--text-muted)', marginTop:'8px'}}>잔여석: {seats.filter(s => s.status === 'available').length} / 64</p>
                </div>
                <div style={{display:'flex', gap:'12px'}}>
                   <button className="btn-neon" style={{background:'#1e293b', boxShadow:'none'}} onClick={() => fetchData('bug01')} data-bug-id="site070-bug01">시스템 상태 체크</button>
                   <button className="btn-neon" style={{background:'#4c1d95'}} onClick={() => { if(selectedSeat) holdSeat(selectedSeat.id, 'bug02') }} data-bug-id="site070-bug02">일괄 선택 모드</button>
                </div>
             </div>

             <div style={{display:'grid', gridTemplateColumns:'1fr 350px', gap:'40px'}}>
                <div className="seat-map-container">
                   <div className="stage">STAGE</div>
                   <div className="seat-grid">
                      {seats.map(s => (
                        <div 
                          key={s.id} 
                          className={`seat seat-${s.status} ${selectedSeat?.id === s.id ? 'active' : ''}`}
                          onClick={() => s.status === 'available' && setSelectedSeat(s)}
                          style={{
                            border: selectedSeat?.id === s.id ? '2px solid var(--purple-neon)' : '1px solid rgba(255,255,255,0.1)',
                            background: selectedSeat?.id === s.id ? 'var(--purple-neon)' : ''
                          }}
                        >
                           {s.id}
                        </div>
                      ))}
                   </div>
                   <div style={{marginTop:'40px', display:'flex', gap:'24px'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}><div className="seat seat-available" style={{width:'16px', height:'16px'}}></div><span style={{fontSize:'0.8rem'}}>선택 가능</span></div>
                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}><div className="seat seat-held" style={{width:'16px', height:'16px'}}></div><span style={{fontSize:'0.8rem'}}>홀드 중</span></div>
                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}><div className="seat seat-sold" style={{width:'16px', height:'16px'}}></div><span style={{fontSize:'0.8rem'}}>판매 완료</span></div>
                   </div>
                </div>

                <div className="stat-card" style={{display:'flex', flexDirection:'column', justifyContent:'center', height:'fit-content'}}>
                   {selectedSeat ? (
                     <div className="fade-in">
                        <h4 style={{fontSize:'1.25rem', color:'var(--purple-neon)'}}>선택된 좌석: {selectedSeat.id}</h4>
                        <div style={{margin:'24px 0', fontSize:'2rem', fontWeight:'900'}}>₩{selectedSeat.price.toLocaleString()}</div>
                        <ul style={{listStyle:'none', marginBottom:'32px', display:'flex', flexDirection:'column', gap:'12px'}}>
                           <li style={{display:'flex', gap:'8px', color:'var(--text-muted)'}}><Info size={18}/> 30초간 임시 홀드됩니다.</li>
                           <li style={{display:'flex', gap:'8px', color:'var(--text-muted)'}}><CreditCard size={18}/> 카카오페이 / 신용카드 결제</li>
                        </ul>
                        <button className="btn-neon" style={{width:'100%'}} onClick={() => holdSeat(selectedSeat.id)}>좌석 홀드 요청</button>
                     </div>
                   ) : (
                     <div style={{textAlign:'center', color:'var(--text-muted)'}}>
                        <Grid3X3 size={48} style={{margin:'0 auto 20px', opacity:0.3}} />
                        <p>좌석을 선택하여 예매를 시작하세요.</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        )}

        {view === 'reservations' && (
          <div className="fade-in">
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px'}}>
                <h2 style={{fontSize:'2.5rem', fontWeight:'900'}}>내 예약 정보</h2>
                <button className="btn-neon" style={{background:'#1e293b', boxShadow:'none'}} onClick={() => fetchData('bug04')} data-bug-id="site070-bug04"><RefreshCw size={18}/> 예매 내역 동기화</button>
             </div>
             <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                {reservations.map(r => (
                  <div key={r.id} style={{background:'var(--bg-card)', padding:'24px', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                     <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
                        <div style={{width:'60px', height:'60px', background:'#312e81', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                           <Ticket color="var(--purple-neon)" />
                        </div>
                        <div>
                           <div style={{fontWeight:'800', fontSize:'1.125rem'}}>좌석 번호: {r.seatId}</div>
                           <div style={{fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'4px'}}>{new Date(r.paidAt).toLocaleString()} | {r.id}</div>
                        </div>
                     </div>
                     <div style={{textAlign:'right'}}>
                        <div style={{fontWeight:'900', fontSize:'1.25rem'}}>₩{r.amount.toLocaleString()}</div>
                        <span style={{fontSize:'0.7rem', color:'var(--neon-green)', fontWeight:'800'}}>PAYMENT SUCCESS</span>
                     </div>
                  </div>
                ))}
                {reservations.length === 0 && (
                  <div style={{textAlign:'center', padding:'100px', background:'rgba(255,255,255,0.02)', borderRadius:'24px', border:'2px dashed rgba(255,255,255,0.05)'}}>
                     <p style={{color:'var(--text-muted)'}}>예약된 내역이 없습니다.</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {view === 'payments' && (
          <div className="fade-in" style={{maxWidth:'600px', margin:'0 auto'}}>
             <h2 style={{fontSize:'2.5rem', fontWeight:'900', marginBottom:'40px'}}>결제 대기 리스트</h2>
             {seats.filter(s => s.status === 'held' && s.heldBy === 'user_PPO_01').map(s => (
               <div key={s.id} className="stat-card" style={{marginBottom:'24px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                     <span style={{fontSize:'1.25rem', fontWeight:'900'}}>좌석 {s.id}</span>
                     <span style={{color:'var(--purple-neon)', fontWeight:'800'}}>₩{s.price.toLocaleString()}</span>
                  </div>
                  <div style={{padding:'16px', background:'#0f172a', borderRadius:'12px', marginBottom:'24px', display:'flex', alignItems:'center', gap:'12px'}}>
                     <Clock size={18} color="var(--purple-neon)" />
                     <span style={{fontSize:'0.875rem'}}>남은 홀드 시간: {Math.max(0, Math.floor((s.expiresAt - Date.now()) / 1000))}초</span>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                     <button className="btn-neon" style={{width:'100%'}} onClick={() => processPayment(s.id)}>즉시 결제</button>
                     <button className="btn-neon" style={{width:'100%', background:'#be123c', boxShadow:'none'}} onClick={() => processPayment(s.id, 'bug03')} data-bug-id="site070-bug03">결제 재시도</button>
                  </div>
               </div>
             ))}
             {seats.filter(s => s.status === 'held' && s.heldBy === 'user_PPO_01').length === 0 && (
               <div style={{textAlign:'center', padding:'60px'}}>
                  <Wallet size={48} style={{margin:'0 auto 20px', opacity:0.3}} />
                  <p style={{color:'var(--text-muted)'}}>현재 결제 대기 중인 좌석이 없습니다.</p>
                  <button className="btn-neon" style={{marginTop:'24px'}} onClick={() => setView('seats')}>좌석 예매하러 가기</button>
               </div>
             )}
          </div>
        )}

        {view === 'logs' && (
          <div className="fade-in">
             <h2 style={{fontSize:'2rem', fontWeight:'900', marginBottom:'32px'}}>시스템 트랜잭션 로그</h2>
             <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                {logs.map((l, i) => (
                  <div key={i} style={{padding:'20px', background:'var(--bg-card)', borderRadius:'16px', borderLeft:'4px solid var(--purple)'}}>
                     <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>[{new Date(l.time).toLocaleTimeString()}]</span>
                     <p style={{marginTop:'4px', fontWeight:'500'}}>{l.msg}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
         <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <LayoutDashboard size={24} />
            <span>대시보드</span>
         </div>
         <div className={`nav-item ${view === 'seats' ? 'active' : ''}`} onClick={() => setView('seats')}>
            <Grid3X3 size={24} />
            <span>좌석선택</span>
         </div>
         <div className={`nav-item ${view === 'payments' ? 'active' : ''}`} onClick={() => setView('payments')}>
            <CreditCard size={24} />
            <span>결제대기</span>
         </div>
         <div className={`nav-item ${view === 'reservations' ? 'active' : ''}`} onClick={() => setView('reservations')}>
            <Calendar size={24} />
            <span>내예약</span>
         </div>
         <div className={`nav-item ${view === 'logs' ? 'active' : ''}`} onClick={() => { setView('logs'); fetchLogs(); }}>
            <History size={24} />
            <span>로그</span>
         </div>
      </nav>

      {/* PPO Monitor */}
      <div className="ppo-monitor">
         <div style={{borderBottom:'1px solid #ffffff22', paddingBottom:'8px', marginBottom:'12px', fontSize:'0.7rem', fontWeight:'800', color:'#94a3b8'}}>PPO-TICKET-MONITOR</div>
         <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>상태</span><span style={{color: bug ? '#ef4444' : '#10b981', fontWeight:'900'}}>{bug ? 'DETECTION' : 'NOMINAL'}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>BUG_ID</span><span>{bug ? bug.id : 'N/A'}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>REGION</span><span>Asia-Seoul</span></div>
         </div>
      </div>
    </div>
  );
};

export default App;
