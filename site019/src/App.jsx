import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Ticket, 
  CreditCard, 
  Calendar, 
  User, 
  Activity, 
  LogOut, 
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Send
} from 'lucide-react';

const API_BASE = '/api';

function App() {
  const [activeTab, setActiveTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [health, setHealth] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [lastBugId, setLastBugId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHealth();
    fetchMovies();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setHealth(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/movies`);
      const data = await res.json();
      setMovies(data);
    } catch (e) {
      setError('영화 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/movies/schedule`);
      const data = await res.json();
      setSchedule(data);
      if (data[0]?.bugId) setLastBugId(data[0].bugId);
    } catch (e) {
      setError('상영 시간표를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google' })
      });
      const data = await res.json();
      setUser(data.user);
      setSessionId(data.sessionId);
    } catch (e) {
      setError('로그인에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      
      // 로컬 상태는 초기화하지만, 서버 버그로 인해 세션이 남아있음
      setUser(null);
      if (data.bugId) setLastBugId(data.bugId);
      
      alert('로컬 로그아웃 완료. 서버 세션 상태를 확인합니다...');
      checkServerSession();
    } catch (e) {
      setError('로그아웃 실패');
    }
  };

  const checkServerSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/user/profile`, {
        headers: { 'Authorization': sessionId }
      });
      const data = await res.json();
      if (data.user) {
        alert('버그 감지: 로그아웃 후에도 서버 세션이 유지되고 있습니다! (site019-bug01)');
        setLastBugId(data.bugId);
      }
    } catch (e) {
      console.log('세션이 정상적으로 삭제되었습니다.');
    }
  };

  const handleBooking = async () => {
    if (!selectedMovie) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: selectedMovie.id, seats: selectedSeats })
      });
      const data = await res.json();
      setActiveTab('payment');
      setPaymentStatus({ bookingId: data.id, status: 'pending' });
    } catch (e) {
      setError('예매에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (mode = 'normal') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/payment/process?bookingId=${paymentStatus.bookingId}&mode=${mode}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || '결제 처리 중 오류가 발생했습니다.');
        if (data.bugId) setLastBugId(data.bugId);
        return;
      }
      setPaymentStatus(prev => ({ ...prev, ...data }));
    } catch (e) {
      setError('결제 서비스 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const triggerWebhook = async () => {
    if (!paymentStatus?.id) return;
    try {
      // 멱등성 실패를 보여주기 위해 두 번 호출
      const trigger = async () => {
        const res = await fetch(`${API_BASE}/payment/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: paymentStatus.id, status: 'completed' })
        });
        return await res.json();
      };

      const result1 = await trigger();
      const result2 = await trigger();
      
      alert(`웹훅이 두 번 전송되었습니다. 응답 2: ${result2.message} (처리 횟수: ${result2.processedCount})`);
      if (result2.bugId) setLastBugId(result2.bugId);
      
      // 로컬 상태 업데이트
      const statusRes = await fetch(`${API_BASE}/payment/status?bookingId=${paymentStatus.bookingId}`);
      const statusData = await statusRes.json();
      setPaymentStatus(prev => ({ ...prev, ...statusData }));
    } catch (e) {
      setError('웹훅 트리거 실패');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'movies':
        return (
          <div className="movie-grid">
            {movies.map(movie => (
              <div key={movie.id} className="movie-card" onClick={() => setSelectedMovie(movie)}>
                <img src={movie.poster} alt={movie.title} className="movie-poster" />
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <div className="movie-meta">
                    <span>{movie.genre}</span>
                    <span style={{color: 'var(--primary)'}}>★ {movie.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'booking':
        if (!selectedMovie) return <div className="status-panel">먼저 영화를 선택해주세요.</div>;
        return (
          <div className="booking-panel">
            <h2>예매: {selectedMovie.title}</h2>
            <div className="seat-grid">
              {Array.from({ length: 48 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`seat ${selectedSeats.includes(i) ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedSeats(prev => prev.includes(i) ? prev.filter(s => s !== i) : [...prev, i]);
                  }}
                />
              ))}
            </div>
            <button className="btn btn-primary" onClick={handleBooking} disabled={selectedSeats.length === 0}>
              좌석 선택 완료 ({selectedSeats.length}석)
            </button>
          </div>
        );
      case 'payment':
        if (!paymentStatus) return <div className="status-panel">진행 중인 결제가 없습니다.</div>;
        return (
          <div className="booking-panel">
            <h2>결제: 예매 번호 #{paymentStatus.bookingId}</h2>
            <div className="status-panel">
              <div className="status-item">
                <span>상태:</span>
                <span className={paymentStatus.status === 'confirmed' ? 'status-ok' : ''}>{paymentStatus.status === 'pending' ? '대기 중' : paymentStatus.status === 'confirmed' ? '완료' : '진행 중'}</span>
              </div>
              <div className="status-item">
                <span>금액:</span>
                <span>₩ 12,000</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => handlePayment('normal')} 
                disabled={paymentStatus.status !== 'pending'}
              >
                지금 결제하기 (정상)
              </button>
              <button 
                className={`btn ${paymentStatus.status === 'pending' ? 'btn-error' : 'btn-outline'}`}
                onClick={() => handlePayment('maintenance')} 
                disabled={paymentStatus.status !== 'pending'}
                data-bug-id="site019-bug02"
              >
                지금 결제하기 (점검 모드 - 오류 발생)
              </button>
            </div>

            {paymentStatus.status === 'confirmed' && (
              <div style={{ marginTop: '2rem' }}>
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => { setActiveTab('movies'); setSelectedMovie(null); setPaymentStatus(null); }}>
                  영화 목록으로 돌아가기
                </button>
              </div>
            )}

            {paymentStatus.id && (
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ marginBottom: '1rem', color: 'var(--text-dim)' }}>시뮬레이터: 외부 웹훅 트리거</p>
                <button className="btn btn-error" onClick={triggerWebhook} data-bug-id="site019-bug04">
                  <Send size={16} style={{marginRight: 8}} /> 웹훅 전송 (2회 중복 - 오류 발생)
                </button>
              </div>
            )}
          </div>
        );
      case 'schedule':
        return (
          <div className="booking-panel">
            <div style={{display:'flex', justifyContent:'space-between', marginBottom: '1.5rem'}}>
              <h2>상영 시간표</h2>
              <button className="btn btn-error" onClick={fetchSchedule} data-bug-id="site019-bug03">
                <RefreshCw size={16} style={{marginRight: 8}} /> 새로고침 (오류 발생)
              </button>
            </div>
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>영화 ID</th>
                  <th>시간</th>
                  <th>날짜</th>
                </tr>
              </thead>
              <tbody>
                {schedule.length > 0 ? schedule.map((s, i) => (
                  <tr key={i}>
                    <td>{s.movieId}</td>
                    <td>{s.time}</td>
                    <td className={typeof s.date === 'object' ? 'breaking-data' : ''}>
                      {typeof s.date === 'object' ? JSON.stringify(s.date) : s.date}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" style={{textAlign:'center', padding:'2rem', color:'var(--text-dim)'}}>
                      시간표를 불러오려면 '새로고침'을 눌러주세요.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {schedule.length > 0 && (
              <div className="bug-indicator">참고: 일부 날짜가 API 계약 불일치로 인해 객체 형태로 표시될 수 있음 (site019-bug03)</div>
            )}
          </div>
        );
      case 'admin':
        return (
          <div className="booking-panel">
            <h2>API 상태 모니터링</h2>
            <div className="status-panel">
              <div className="status-item">
                <span>사이트 ID:</span>
                <span>{health?.site}</span>
              </div>
              <div className="status-item">
                <span>백엔드 상태:</span>
                <span className={health?.ok ? 'status-ok' : 'status-error'}>
                  {health?.ok ? '정상 작동 중' : '오류 발생'}
                </span>
              </div>
              <div className="status-item">
                <span>최근 감지된 버그:</span>
                <span style={{color:'var(--secondary)'}}>{lastBugId || '없음'}</span>
              </div>
            </div>
            {error && (
              <div className="status-panel" style={{background:'rgba(255,0,0,0.1)', borderColor:'rgba(255,0,0,0.3)'}}>
                <div style={{display:'flex', gap:'10px', color:'#ff4444'}}>
                  <AlertCircle size={20} />
                  <div>
                    <strong>API 오류:</strong>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {loading && (
        <div className="modal-overlay" style={{zIndex: 2000}}>
          <div className="status-panel" style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem'}}>
            <RefreshCw size={32} className="animate-spin" style={{color:'var(--primary)'}} />
            <p>데이터를 불러오는 중...</p>
          </div>
        </div>
      )}

      <div className="sidebar">
        <div className="logo">NEON CINEMA</div>
        <ul className="nav-links">
          <li className={`nav-item ${activeTab === 'movies' ? 'active' : ''}`} onClick={() => setActiveTab('movies')}>
            <Film size={20} /> 영화 목록
          </li>
          <li className={`nav-item ${activeTab === 'booking' ? 'active' : ''}`} onClick={() => setActiveTab('booking')}>
            <Ticket size={20} /> 예매하기
          </li>
          <li className={`nav-item ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>
            <CreditCard size={20} /> 결제 확인
          </li>
          <li className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
            <Calendar size={20} /> 상영 시간표
          </li>
          <li className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
            <ShieldCheck size={20} /> API 모니터
          </li>
        </ul>

        <div style={{ marginTop: 'auto' }}>
          {user ? (
            <div className="status-panel" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>에이전트 ID: {user.id}</div>
                </div>
              </div>
              <button 
                className="btn btn-error" 
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
                onClick={handleLogout}
                data-bug-id="site019-bug01"
              >
                <LogOut size={14} style={{ marginRight: 8 }} /> 로그아웃 (오류 발생)
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleLogin}>
              소셜 로그인 (정상)
            </button>
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>{activeTab === 'movies' ? '영화 목록' : activeTab === 'booking' ? '예매하기' : activeTab === 'payment' ? '결제 확인' : activeTab === 'schedule' ? '상영 시간표' : 'API 모니터'}</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Activity size={18} color={health?.ok ? 'var(--primary)' : '#ff4444'} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>시스템 온라인</span>
          </div>
        </div>

        {renderContent()}

        {selectedMovie && activeTab === 'movies' && (
          <div className="modal-overlay">
            <div className="modal">
              <div style={{ display: 'flex', gap: '2rem' }}>
                <img src={selectedMovie.poster} style={{ width: 180, borderRadius: 12 }} alt="" />
                <div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{selectedMovie.title}</h2>
                  <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
                    {selectedMovie.title}과 함께 시네마틱 엑셀런스의 다음 단계를 경험하세요.
                    {selectedMovie.genre} 스토리텔링의 걸작입니다.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-primary" onClick={() => { setActiveTab('booking'); }}>
                      지금 예매
                    </button>
                    <button className="btn btn-outline" onClick={() => setSelectedMovie(null)}>
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
