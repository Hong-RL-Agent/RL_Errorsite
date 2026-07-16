import React, { useState, useEffect } from 'react';

export default function App() {
  const [trainers, setTrainers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [reservations, setReservations] = useState([]);

  // Filter configurations
  const [selectedDate, setSelectedDate] = useState('2026-06-25');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('전체');

  // Input workout form states
  const [workoutType, setWorkoutType] = useState('웨이트');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [workoutIntensity, setWorkoutIntensity] = useState('3');
  const [workoutMemo, setWorkoutMemo] = useState('');

  // UI state
  const [userName, setUserName] = useState('홍길동');
  const [toasts, setToasts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // INTENTIONAL_ERROR target
  // We keep the index of the reserved class in the currently active filtered view list.
  const [bookedIndexes, setBookedIndexes] = useState([]);

  useEffect(() => {
    loadTrainers();
    loadClasses();
    loadWorkoutLogs();
    loadReservations();
  }, []);

  const loadTrainers = async () => {
    try {
      const res = await fetch('/api/trainers');
      const data = await res.json();
      setTrainers(data);
    } catch (err) {
      showToast('트레이너 리스트 로딩 실패', 'danger');
    }
  };

  const loadClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      showToast('그룹 수업 일정 조회 실패', 'danger');
    }
  };

  const loadWorkoutLogs = async () => {
    try {
      const res = await fetch('/api/workouts');
      const data = await res.json();
      setWorkoutLogs(data);
    } catch (err) {
      showToast('운동 기록 타임라인 로드 실패', 'danger');
    }
  };

  const loadReservations = async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      showToast('예약 리스트 연동 실패', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Error 1: Book class, then changing date leaks booked indicator by array indices
  const handleBookClass = async (classId, idx) => {
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          userName
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '예약 신청 실패');
      }

      showToast('그룹 수업 예약이 접수 완료되었습니다.', 'success');
      
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 예약을 진행한 뒤 시간표 뱃지에 예약 완료 상태를 표기할 때, 
      // 예약된 수업의 고유 ID가 아닌 현재 화면에 렌더링되고 있는 시간표 배열에서의 인덱스 번호(idx)를 
      //bookedIndexes 상태에 저장합니다. 이 상태에서 날짜 필터를 변경하게 되면 
      // 새 날짜의 시간표에서 똑같은 배열 인덱스 위치에 위치한 전혀 다른 수업에 '예약 완료' 표시가 번져서 렌더링됩니다.
      setBookedIndexes(prev => [...prev, idx]);

      loadClasses();
      loadReservations();
    } catch (err) {
      showToast(`예약 에러: ${err.message}`, 'danger');
    }
  };

  // Error 2: Add workout log (can accept 0 duration, blocks negative)
  const handleAddWorkoutLog = async (e) => {
    e.preventDefault();
    if (workoutDuration === '') {
      showToast('운동 시간을 명시하여 주십시오.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: workoutType,
          duration: Number(workoutDuration),
          intensity: Number(workoutIntensity),
          memo: workoutMemo
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '운동 기록 작성 실패');
      }

      showToast('오늘의 운동 기록이 성공적으로 타임라인에 등록되었습니다.', 'success');
      setWorkoutDuration('');
      setWorkoutMemo('');
      loadWorkoutLogs();
    } catch (err) {
      showToast(`[기록 실패] ${err.message}`, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReservation = async (resId) => {
    if (!confirm('그룹 수업 예약을 철회하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/reservations/${resId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('수업 예약이 취소되었습니다. (수업 잔여석은 복구되지 않음)', 'success');
        // Reset local booked indexes since we changed dates/classes
        setBookedIndexes([]);
        loadClasses();
        loadReservations();
      }
    } catch (err) {
      showToast('취소 전송 중 통신 실패', 'danger');
    }
  };

  // Filter classes shown in the middle timetable
  const filteredClasses = classes.filter(c => {
    const matchDate = c.date === selectedDate;
    const matchType = selectedTypeFilter === '전체' || c.type === selectedTypeFilter;
    return matchDate && matchType;
  });

  // Calculate intensity chart bars (Top Graph)
  const getWeeklyIntensitySummary = () => {
    // Mock days: 06-20 to 06-26
    const days = ['20', '21', '22', '23', '24', '25', '26'];
    return days.map(d => {
      const dateStr = `2026-06-${d}`;
      const logs = workoutLogs.filter(l => l.date === dateStr);
      const totalIntensity = logs.reduce((acc, cur) => acc + (cur.intensity * (cur.duration || 1)), 0);
      return {
        day: d,
        val: Math.min(100, Math.round(totalIntensity / 3.5))
      };
    });
  };

  return (
    <div className="fitroute-app">
      {/* App Navbar */}
      <header className="app-navbar">
        <div className="navbar-logo">
          <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="logo-title">FitRoute</span>
          <span className="logo-subtitle">운동 및 피트니스 수업 스케줄러</span>
        </div>
        <div className="navbar-actions">
          <span className="user-lbl">👤 회원 계정:</span>
          <input 
            type="text" 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)} 
            className="user-input-nav"
            placeholder="회원명"
          />
        </div>
      </header>

      {/* Top: Weekly Workout Intensity Graph */}
      <section className="panel-section intensity-graph-section">
        <div className="panel-header">
          <h2>📊 주간 종합 운동 강도 추이 그래프</h2>
          <p className="subtitle">기록된 운동 종류 및 강도와 가동 시간을 기준으로 환산된 활동 그래프입니다.</p>
        </div>
        <div className="graph-bars-canvas">
          {getWeeklyIntensitySummary().map((item, idx) => (
            <div key={idx} className="bar-column">
              <div className="bar-track">
                <div 
                  className="bar-fill"
                  style={{ height: `${item.val}%` }}
                >
                  <span className="tooltip-val">{item.val}</span>
                </div>
              </div>
              <span className="bar-date-lbl">06/{item.day}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Grid Layout Workspace */}
      <div className="scheduler-grid-layout">
        
        {/* Left Side: Workout Type Menu */}
        <aside className="panel-section column-workout-types">
          <div className="panel-header">
            <h2>🏋️ 종목 메뉴</h2>
          </div>
          <div className="workout-filter-list">
            {['전체', '웨이트', '유산소', '크로스핏', '유연성'].map(type => (
              <button 
                key={type}
                className={selectedTypeFilter === type ? 'active' : ''}
                onClick={() => setSelectedTypeFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Inline Workout Log Entry Panel */}
          <div className="workout-log-form-box">
            <h3>📝 오늘의 운동 기록 기입</h3>
            <form onSubmit={handleAddWorkoutLog} className="workout-form">
              <div className="form-cell">
                <label>운동 종목</label>
                <select value={workoutType} onChange={(e) => setWorkoutType(e.target.value)}>
                  <option value="웨이트">웨이트 트레이닝</option>
                  <option value="유산소">유산소 러닝</option>
                  <option value="크로스핏">고강도 크로스핏</option>
                  <option value="유연성">스트레칭 / 요가</option>
                </select>
              </div>
              <div className="form-cell">
                <label>가동 시간 (분)</label>
                <input 
                  type="number" 
                  value={workoutDuration} 
                  onChange={(e) => setWorkoutDuration(e.target.value)} 
                  placeholder="예: 60 (0 입력 가능)"
                />
              </div>
              <div className="form-cell">
                <label>운동 자각도 (강도)</label>
                <select value={workoutIntensity} onChange={(e) => setWorkoutIntensity(e.target.value)}>
                  <option value="1">1단계 (가벼움)</option>
                  <option value="2">2단계 (보통)</option>
                  <option value="3">3단계 (약간 힘듦)</option>
                  <option value="4">4단계 (힘듦)</option>
                  <option value="5">5단계 (매우 힘듦)</option>
                </select>
              </div>
              <div className="form-cell">
                <label>비고 및 상세 메모</label>
                <textarea 
                  value={workoutMemo} 
                  onChange={(e) => setWorkoutMemo(e.target.value)} 
                  placeholder="특이사항 입력..."
                  rows="2"
                />
              </div>
              <button type="submit" className="save-log-btn" disabled={isSubmitting}>
                {isSubmitting ? '기록 전송 중...' : '운동 기록 저장'}
              </button>
            </form>
          </div>
        </aside>

        {/* Center: Timetable */}
        <main className="panel-section column-timetable">
          <div className="panel-header timetable-controls">
            <h2>📅 그룹 클래스 시간표</h2>
            <div className="date-selectors">
              {['2026-06-25', '2026-06-26'].map(d => (
                <button
                  key={d}
                  className={selectedDate === d ? 'active' : ''}
                  onClick={() => setSelectedDate(d)}
                >
                  {d.endsWith('25') ? '목요일 (6/25)' : '금요일 (6/26)'}
                </button>
              ))}
            </div>
          </div>

          <div className="timetable-cards-scroller">
            {filteredClasses.length === 0 ? (
              <div className="empty-placeholder">해당 날짜 및 종목의 수업 일정이 없습니다.</div>
            ) : (
              filteredClasses.map((c, idx) => {
                // Error 1 Index Check
                const isBooked = bookedIndexes.includes(idx);
                const hasNoSpots = c.remainingCapacity <= 0;

                return (
                  <div key={c.id} className="class-timetable-card">
                    <div className="class-time-block">
                      <span className="cl-time">{c.time}</span>
                      <span className="cl-duration">{c.duration}</span>
                    </div>
                    <div className="class-desc-block">
                      <span className="cl-type-badge">{c.type}</span>
                      <h3>{c.title}</h3>
                      <p className="cl-trainer-lbl">담당: {c.trainer}</p>
                    </div>
                    <div className="class-reserve-block">
                      <span className="cl-spots-left">
                        잔여석: <strong>{c.remainingCapacity}</strong> / {c.capacity}
                      </span>
                      
                      {isBooked ? (
                        <span className="booked-badge">예약 완료</span>
                      ) : (
                        <button 
                          className="book-action-btn"
                          disabled={hasNoSpots}
                          onClick={() => handleBookClass(c.id, idx)}
                        >
                          {hasNoSpots ? '마감됨' : '수업 예약'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* Right Side: Trainers & My Reservations */}
        <aside className="right-multi-panel">
          
          {/* Trainer Lists */}
          <div className="panel-section trainer-cards-section">
            <div className="panel-header">
              <h2>👩‍🏫 우리 지점 크루진</h2>
            </div>
            <div className="trainers-vertical-list">
              {trainers.map(trn => (
                <div key={trn.id} className="trainer-item-card">
                  <div className="trn-avatar">{trn.avatar}</div>
                  <div className="trn-details">
                    <h4>{trn.name}</h4>
                    <p className="specialty">{trn.specialty}</p>
                    <span className="rating">⭐ {trn.rating} / 5.0</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Booked Lists */}
          <div className="panel-section my-reservations-section">
            <div className="panel-header">
              <h2>📋 수강 신청 리스트 ({reservations.length})</h2>
            </div>
            <div className="reservations-vertical-list">
              {reservations.length === 0 ? (
                <div className="empty-placeholder">예약 완료된 그룹 수업이 없습니다.</div>
              ) : (
                reservations.map(res => (
                  <div key={res.id} className="res-mini-card">
                    <div className="res-head">
                      <h4>{res.className}</h4>
                      <button className="res-cancel-btn" onClick={() => handleCancelReservation(res.id)}>&times; 취소</button>
                    </div>
                    <p className="res-time-lbl">일시: {res.date} | {res.time}</p>
                    <p className="res-user-lbl">예약자: {res.userName}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </aside>

      </div>

      {/* Bottom Workout Logs Timeline */}
      <footer className="panel-section workouts-timeline-section">
        <div className="panel-header">
          <h2>📜 운동 타임라인 (최근 활동 기록)</h2>
        </div>
        <div className="timeline-scroller-track">
          {workoutLogs.length === 0 ? (
            <div className="empty-placeholder">최근 기록된 피트니스 운동 일지가 없습니다.</div>
          ) : (
            <div className="timeline-horizontal-flow">
              {workoutLogs.map(log => (
                <div key={log.id} className="timeline-node-card">
                  <div className="node-head">
                    <span className="node-date">{log.date}</span>
                    <span className="node-type">{log.type}</span>
                  </div>
                  <div className="node-body">
                    <div className="node-stats">
                      <span>가동시간: <strong>{log.duration}분</strong></span>
                      <span>자각 강도: <strong>{log.intensity}단계</strong></span>
                    </div>
                    <p className="node-memo">{log.memo || '(상세 설명 없음)'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </footer>

      {/* Toast popup notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}
