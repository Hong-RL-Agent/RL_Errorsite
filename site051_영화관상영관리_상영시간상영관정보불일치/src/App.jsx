import React, { useState, useEffect } from 'react';

export default function App() {
  const [selectedTheater, setSelectedTheater] = useState('강남점');
  const [revenueSummary, setRevenueSummary] = useState({ totalSales: 15600000, bookingsCount: 1040 });

  // Database states
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [logs, setLogs] = useState([]);

  // Filter & UI states
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [sortByTime, setSortByTime] = useState(false);
  const [statBookings, setStatBookings] = useState(850);

  // Form Inputs
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [newMovieDirector, setNewMovieDirector] = useState('');
  const [newMovieGenre, setNewMovieGenre] = useState('드라마');
  const [newMovieDuration, setNewMovieDuration] = useState(120);

  const [newSTMovie, setNewSTMovie] = useState('');
  const [newSTRoom, setNewSTRoom] = useState('상영관 1');
  const [newSTTime, setNewSTTime] = useState('14:00');

  const [editTime, setEditTime] = useState('');
  const [editRoom, setEditRoom] = useState('');

  // Toast array
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadMovies();
    loadRooms();
    loadShowtimes();
    loadLogs();
  }, []);

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Cache
  // DESCRIPTION: 영화관 지점을 강남점 ➔ 홍대점 ➔ 신촌점 등으로 바꿀 때 
  // 매출 요약 수치(`revenueSummary`)를 갱신해오는 훅의 의존성 변수(`[selectedTheater]`)를 
  // 누락시켜, 지점명은 교체되나 우측 상단의 실시간 매출 지표 카드는 이전 지점(A)의 데이터가 
  // 박제 보존되는 동기화 누수 결함입니다.
  useEffect(() => {
    fetchRevenueSummary();
  }, []); // BUG! Empty dependency triggers once on mount

  const fetchRevenueSummary = () => {
    fetch(`/api/statistics/revenue?theater=${selectedTheater}`)
      .then(res => res.json())
      .then(data => setRevenueSummary(data));
  };

  const loadMovies = () => {
    fetch('/api/movies').then(res => res.json()).then(data => {
      setMovies(data);
      if (data.length > 0) setNewSTMovie(data[0].title);
    });
  };

  const loadRooms = () => {
    fetch('/api/rooms').then(res => res.json()).then(data => setRooms(data));
  };

  const loadShowtimes = () => {
    fetch('/api/showtimes').then(res => res.json()).then(data => setShowtimes(data));
  };

  const loadLogs = () => {
    fetch('/api/logs').then(res => res.json()).then(data => setLogs(data));
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Reset sandbox
  const handleResetSandbox = async () => {
    await fetch('/api/reset', { method: 'POST' });
    showToast('영화관 스케줄 데이터베이스 초기화 완료', 'success');
    loadMovies();
    loadRooms();
    loadShowtimes();
    loadLogs();
    fetchRevenueSummary(); // Force refresh once
  };

  // Switch Theater normal
  const handleSwitchTheater = (theater) => {
    setSelectedTheater(theater);
    showToast(`영화관 지점을 [${theater}] 지점으로 스위칭했습니다.`, 'info');
    // Notice that we intentionally do NOT trigger fetchRevenueSummary() here (Error 6 target)
  };

  // Register new movie
  const handleRegisterMovie = async (e) => {
    e.preventDefault();
    if (!newMovieTitle.trim()) return;

    const res = await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newMovieTitle,
        director: newMovieDirector,
        genre: newMovieGenre,
        runningTime: newMovieDuration
      })
    });
    if (res.ok) {
      showToast('신규 영화 정보가 등록되었습니다.', 'success');
      setNewMovieTitle('');
      setNewMovieDirector('');
      loadMovies();
    }
  };

  // Create new showtime
  const handleCreateShowtime = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/showtimes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        movieTitle: newSTMovie,
        screenRoom: newSTRoom,
        time: newSTTime
      })
    });
    if (res.ok) {
      showToast('신규 상영 일정이 편성 스케줄표에 반영되었습니다.', 'success');
      loadShowtimes();
    }
  };

  // Toggle room inspection downtime (Error 4 Target)
  const handleToggleRoomStatus = async (roomId, currentStatus) => {
    const nextStatus = currentStatus === 'OPERATIONAL' ? 'UNDER_INSPECTION' : 'OPERATIONAL';
    const res = await fetch(`/api/rooms/${roomId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });
    if (res.ok) {
      showToast(`상영관 상태가 [${nextStatus}]으로 강제 전입되었습니다.`, 'warning');
      loadRooms();
      loadLogs();
      // Note: 기존 예매 가능 일정(showtimes)은 비활성화되지 않습니다 (Error 4)
    }
  };

  // Trigger time & room patch race (Error 1 Simulator)
  const triggerTimeRoomRace = (stId, originalRoom) => {
    showToast('시간 및 상영관 연쇄 변경 레이스를 구동합니다.', 'info');

    // 1. PATCH time (4s delay on server)
    // Sends: time: "18:00", screenRoom: originalRoom (e.g. old screenRoom)
    fetch(`/api/showtimes/${stId}/time`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ time: "18:00", screenRoom: originalRoom })
    });

    // 2. PATCH room (1s delay on server)
    // Sends: screenRoom: editRoom (new room value, e.g. "상영관 3")
    setTimeout(() => {
      fetch(`/api/showtimes/${stId}/room`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenRoom: editRoom })
      }).then(() => {
        showToast('상영관 변경 승인 (1초 완료)', 'success');
        loadShowtimes();
      });
    }, 100);

    // Refresh display after 4.5s to see the rollback of screenRoom
    setTimeout(() => {
      showToast('시간 변경 지연 완료 (상영관 정보가 이전 정보로 덮어써짐 확인)', 'warning');
      loadShowtimes();
    }, 4500);
  };

  // Trigger delete and immediate recreation race (Error 3 Simulator)
  const triggerDeleteRecreateRace = (st) => {
    showToast('스케줄 삭제 후 동일 영화 일정 고속 재등록 레이스 시작', 'info');

    // 1. DELETE showtime (3s delay on server)
    fetch(`/api/showtimes/${st.id}`, { method: 'DELETE' });

    // 2. POST create new showtime for the same movie (immediate)
    setTimeout(async () => {
      const res = await fetch('/api/showtimes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieTitle: st.movieTitle,
          screenRoom: "상영관 2",
          time: "15:00"
        })
      });
      if (res.ok) {
        showToast('신규 대체 일정 추가 완료', 'success');
        loadShowtimes();
      }
    }, 400);

    // Reload after 3.5s to witness the newly created showtime being deleted as well
    setTimeout(() => {
      showToast('삭제 지연 작업 완료 (동일 영화 삭제 휩쓸기 결함에 의해 신규 스케줄도 삭제됨)', 'danger');
      loadShowtimes();
    }, 3500);
  };

  // Select Showtime (Error 2 sorting index mismatch)
  const handleSelectShowtime = (st, index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 정렬된 리스트 배열의 인덱스(`index`)를 사용해 원본 무정렬 
    // `showtimes` 배열의 인덱스로 접근하여 상영 일정을 선택합니다.
    // 그 결과 시작 시간순 정렬을 켠 채 특정 일정을 클릭하면 
    // 우측 패널에 전혀 엉뚱한 상영 스케줄 카드와 상세 정보가 전개되게 만드는 결함입니다.
    if (sortByTime) {
      const mismatchedST = showtimes[index];
      setSelectedShowtime(mismatchedST);
      if (mismatchedST) {
        setEditTime(mismatchedST.time);
        setEditRoom(mismatchedST.screenRoom);
      }
    } else {
      setSelectedShowtime(st);
      setEditTime(st.time);
      setEditRoom(st.screenRoom);
    }
  };

  // Stats fast refresh clicks (Error 5 Simulator)
  const triggerStatsRace = () => {
    showToast('예매 현황 고속 삼중 새로고침 연산 경합을 시뮬레이션합니다.', 'info');

    // 1st click
    fetch('/api/statistics/bookings').then(res => res.json()).then(data => {
      setStatBookings(data.bookingsCount);
    });

    // 2nd click (delayed by 2s on backend)
    setTimeout(() => {
      fetch('/api/statistics/bookings').then(res => res.json()).then(data => {
        setStatBookings(data.bookingsCount);
        showToast(`2차 응답 수신 (지연 도착): 예매수 ${data.bookingsCount}건으로 최신본을 오버라이트!`, 'warning');
      });
    }, 50);

    // 3rd click (100ms delay on backend)
    setTimeout(() => {
      fetch('/api/statistics/bookings').then(res => res.json()).then(data => {
        setStatBookings(data.bookingsCount);
        showToast(`3차 응답 수신 (고속 완료): 예매수 ${data.bookingsCount}건`, 'success');
      });
    }, 100);
  };

  // Generate simple seat layout (8 columns x 6 rows)
  const renderSeatsLayout = () => {
    const cols = 8;
    const rows = 6;
    const seats = [];
    const bookedCount = selectedShowtime ? selectedShowtime.seatsBooked : 0;
    
    let index = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isBooked = index < bookedCount;
        seats.push({ row: r, col: c, isBooked });
        index++;
      }
    }

    return (
      <svg className="seats-svg" viewBox="0 0 320 200">
        <rect x="10" y="5" width="300" height="15" fill="#475569" rx="3" />
        <text x="160" y="16" fill="#f8fafc" fontSize="8" textAnchor="middle" fontWeight="bold">SCREEN</text>
        {seats.map((s, idx) => {
          const x = 20 + s.col * 35;
          const y = 35 + s.row * 25;
          return (
            <g key={idx}>
              <rect 
                x={x} 
                y={y} 
                width="25" 
                height="20" 
                rx="4" 
                fill={s.isBooked ? '#e11d48' : '#10b981'} 
              />
              <text x={x + 12.5} y={y + 13} fill="#f8fafc" fontSize="8" textAnchor="middle">
                {String.fromCharCode(65 + s.row)}{s.col + 1}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Calculations for sorting
  const displayShowtimes = sortByTime 
    ? [...showtimes].sort((a, b) => a.time.localeCompare(b.time)) 
    : showtimes;

  return (
    <div className="cinemaops-app">
      
      {/* Top Header Bar */}
      <header className="app-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
          </svg>
          <span className="logo-title">CinemaOps</span>
          <span className="logo-subtitle">Theater Schedule Control</span>
        </div>

        {/* Global stats and reset */}
        <div className="header-right">
          {/* Revenue card for current selected theater (Error 6 Target) */}
          <div className="revenue-summary-card">
            <span className="lbl">{selectedTheater} 매출 요약 (Error 6)</span>
            <div className="val-group">
              <strong>{revenueSummary.totalSales.toLocaleString()}원</strong>
              <span>({revenueSummary.bookingsCount}건)</span>
            </div>
          </div>

          <button className="sandbox-reset-btn" onClick={handleResetSandbox}>
            🔄 DB 초기화
          </button>
        </div>
      </header>

      {/* Main Grid View */}
      <div className="cinemaops-grid">

        {/* Left Column: Movie Theaters selection & room statuses */}
        <aside className="panel-section left-menu-sidebar">
          <h3>📍 영화관 지점</h3>
          <div className="theaters-list">
            {['강남점', '홍대점', '신촌점'].map(th => (
              <button 
                key={th} 
                className={`theater-btn ${selectedTheater === th ? 'active' : ''}`}
                onClick={() => handleSwitchTheater(th)}
              >
                {th}
              </button>
            ))}
          </div>

          <div className="rooms-status-block">
            <h3>🎬 상영관 점검 상태</h3>
            <div className="rooms-stack">
              {rooms.map(room => (
                <div key={room.id} className="room-status-item">
                  <div className="info">
                    <strong>{room.name}</strong>
                    <span className={`status-badge ${room.status.toLowerCase()}`}>
                      {room.status === 'OPERATIONAL' ? '상영 가능' : '점검 필요 (Error 4)'}
                    </span>
                  </div>
                  <button 
                    className="toggle-room-btn"
                    onClick={() => handleToggleRoomStatus(room.id, room.status)}
                  >
                    점검 토글
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats with fast refresh button (Error 5 Target) */}
          <div className="quick-stats-block">
            <h3>📊 실시간 예매율 지표</h3>
            <div className="stats-metric">
              <span>총 예매 완료수</span>
              <strong>{statBookings}건</strong>
            </div>
            <button className="stats-race-btn" onClick={triggerStatsRace}>
              ⚡ 예매율 삼중 갱신 (Error 5)
            </button>
          </div>
        </aside>

        {/* Center Column: weekly time scheduler table list */}
        <main className="panel-section center-schedule-list">
          <div className="table-header">
            <h2>📅 상영 일정 편성 스케줄표 (총 {displayShowtimes.length}건)</h2>
            
            <div className="sort-controls">
              <label className="switch-lbl">
                <input 
                  type="checkbox" 
                  checked={sortByTime} 
                  onChange={e => setSortByTime(e.target.checked)} 
                />
                <span>⏱️ 시작 시간순 정렬 (Error 2)</span>
              </label>
            </div>
          </div>

          <div className="scheduler-timeline-wrapper">
            <div className="showtime-cards-grid">
              {displayShowtimes.map((st, idx) => (
                <div 
                  key={st.id} 
                  className={`showtime-timeline-card ${selectedShowtime?.id === st.id ? 'active' : ''}`}
                  onClick={() => handleSelectShowtime(st, idx)}
                >
                  <div className="time-tag">
                    <span>⏱️ {st.time}</span>
                    <span className="room">{st.screenRoom}</span>
                  </div>
                  <div className="body">
                    <h4>{st.movieTitle}</h4>
                    <div className="seat-occupancy">
                      <span>예약 {st.seatsBooked} / 48석</span>
                    </div>
                  </div>
                </div>
              ))}

              {displayShowtimes.length === 0 && (
                <p className="empty-lbl">편성 완료된 영화 상영 스케줄이 존재하지 않습니다.</p>
              )}
            </div>
          </div>

          {/* Forms to Register movie & add schedule */}
          <div className="admin-forms-box">
            <form className="admin-form" onSubmit={handleRegisterMovie}>
              <h3>🎬 신규 영화 등록</h3>
              <div className="form-fields">
                <input 
                  type="text" 
                  placeholder="영화 제목..." 
                  value={newMovieTitle} 
                  onChange={e => setNewMovieTitle(e.target.value)} 
                />
                <input 
                  type="text" 
                  placeholder="감독명..." 
                  value={newMovieDirector} 
                  onChange={e => setNewMovieDirector(e.target.value)} 
                />
                <button type="submit">등록</button>
              </div>
            </form>

            <form className="admin-form" onSubmit={handleCreateShowtime}>
              <h3>📅 상영 일정 편성 등록</h3>
              <div className="form-fields">
                <select value={newSTMovie} onChange={e => setNewSTMovie(e.target.value)}>
                  {movies.map(m => (
                    <option key={m.id} value={m.title}>{m.title}</option>
                  ))}
                </select>
                <select value={newSTRoom} onChange={e => setNewSTRoom(e.target.value)}>
                  {rooms.map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  placeholder="시간 (예: 14:30)" 
                  value={newSTTime} 
                  onChange={e => setNewSTTime(e.target.value)} 
                />
                <button type="submit">편성</button>
              </div>
            </form>
          </div>
        </main>

        {/* Right Column: Selected Showtime details editor & SVG seat layout */}
        <aside className="panel-section right-details-sidebar">
          {selectedShowtime ? (
            <div className="details-editor-wrapper">
              <div className="header">
                <h3>🛠️ 상영 스케줄 상세 & 일정 변경</h3>
                <span>일정 고유 번호: <code>{selectedShowtime.id}</code></span>
              </div>

              <div className="editor-fields">
                <h4>상영 정보: {selectedShowtime.movieTitle}</h4>
                
                {/* Time & Room editor (Error 1 Target) */}
                <div className="field-group">
                  <label>⏱️ 상영 시각 수정</label>
                  <input 
                    type="text" 
                    value={editTime} 
                    onChange={e => setEditTime(e.target.value)} 
                  />
                </div>

                <div className="field-group">
                  <label>🎬 상영관 변경</label>
                  <select value={editRoom} onChange={e => setEditRoom(e.target.value)}>
                    {rooms.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <button 
                  className="update-race-btn"
                  onClick={() => triggerTimeRoomRace(selectedShowtime.id, selectedShowtime.screenRoom)}
                >
                  ⚡ 시간 및 상영관 변경 (Error 1)
                </button>

                <button 
                  className="delete-schedule-btn"
                  onClick={() => triggerDeleteRecreateRace(selectedShowtime)}
                >
                  상영 스케줄 삭제 (Error 3)
                </button>
              </div>

              {/* SVG Seat layout display */}
              <div className="seats-layout-block">
                <h3>💺 실시간 상영관 좌석 현황</h3>
                <div className="svg-container">
                  {renderSeatsLayout()}
                </div>
                <div className="legend-row">
                  <span className="legend-item"><span className="box green"></span> 예매 가능</span>
                  <span className="legend-item"><span className="box red"></span> 예매 불가</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="empty-lbl">상영 일정표에서 특정 카드를 선택하면 세부 좌석 현황과 일정 변경 옵션이 개방됩니다.</p>
          )}
        </aside>

      </div>

      {/* Staff Activity Trace logs footer */}
      <footer className="panel-section staff-logs-footer">
        <h3>🕒 직원 활동 기록 로그 (Cinema Staff Logs)</h3>
        <div className="logs-stack">
          {logs.map(log => (
            <div key={log.id} className="log-card">
              <span className="time">{log.time}</span>
              <p><strong>{log.staff}</strong>: {log.action}</p>
            </div>
          ))}
        </div>
      </footer>

      {/* Toast Messaging */}
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
