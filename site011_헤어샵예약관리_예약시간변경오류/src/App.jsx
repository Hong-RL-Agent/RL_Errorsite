import React, { useState, useEffect } from 'react';

export default function App() {
  const [designers, setDesigners] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [reservations, setReservations] = useState([]);

  // Active selections
  const [selectedDesignerId, setSelectedDesignerId] = useState('des-elly');
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  const [estimatedTotal, setEstimatedTotal] = useState(0); // Error 1 target

  const [selectedDate, setSelectedDate] = useState('2026-06-25');
  const [selectedTime, setSelectedTime] = useState('11:00');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]); // Error 2 target

  // Form states
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('booking'); // booking, history
  const [toasts, setToasts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reschedule state
  const [editingResId, setEditingResId] = useState(null);
  
  // Track designer changes (used to trigger Error 2)
  const [designerChanged, setDesignerChanged] = useState(false);

  useEffect(() => {
    loadDesigners();
    loadTreatments();
    loadReservations();
  }, []);

  useEffect(() => {
    // Initial slots load
    const slots = getDesignerSlots(selectedDesignerId, selectedDate);
    setAvailableTimeSlots(slots);
  }, [selectedDesignerId]);

  const loadDesigners = async () => {
    try {
      const res = await fetch('/api/designers');
      const data = await res.json();
      setDesigners(data);
    } catch (err) {
      showToast('디자이너 정보를 로딩할 수 없습니다.', 'danger');
    }
  };

  const loadTreatments = async () => {
    try {
      const res = await fetch('/api/treatments');
      const data = await res.json();
      setTreatments(data);
    } catch (err) {
      showToast('시술 메뉴 리스트를 로딩할 수 없습니다.', 'danger');
    }
  };

  const loadReservations = async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      showToast('예약 현황 목록 로딩 실패', 'danger');
    }
  };

  // Static time slots generator
  const getDesignerSlots = (designerId, dateStr) => {
    if (designerId === 'des-elly') {
      return dateStr.endsWith('25') ? ["10:00", "11:00", "14:00", "15:00"] : ["09:00", "11:00", "15:00", "17:00"];
    } else {
      return dateStr.endsWith('25') ? ["11:00", "13:00", "16:00", "18:00"] : ["10:00", "12:00", "14:00", "19:00"];
    }
  };

  // Toggle treatment menu (Error 1)
  const handleToggleTreatment = (treatment) => {
    const exists = selectedTreatments.some(t => t.id === treatment.id);

    if (exists) {
      setSelectedTreatments(prev => prev.filter(t => t.id !== treatment.id));

      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 두 개 이상의 시술 품목이 선택되어 있을 때 특정 항목을 체크 해제(삭제)하면 
      // 화면의 '선택한 메뉴' 목록에서는 정상 제외되지만, 총합 예상 결제 금액(estimatedTotal) 계산에서는 
      // 제외된 시술 단가를 빼주지 않고 누적 합산 상태로 유지하여 금액 정합성 오류를 유발합니다.
      if (selectedTreatments.length <= 1) {
        setEstimatedTotal(prev => prev - treatment.price);
      } else {
        showToast('시술 해제됨: 합계 금액 산출식에는 기존 금액이 그대로 유지됩니다.', 'warning');
      }
    } else {
      setSelectedTreatments(prev => [...prev, treatment]);
      setEstimatedTotal(prev => prev + treatment.price);
    }
  };

  // Designer Change handler (sets change flag)
  const handleDesignerChange = (id) => {
    setSelectedDesignerId(id);
    setDesignerChanged(true);
  };

  // Date Change handler (Error 2 trigger)
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    
    let slots = getDesignerSlots(selectedDesignerId, newDate);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 사용자가 디자이너를 엘리/레오 간 변경한 이력이 있는 상태에서 
    // 예약 일자를 연달아 클릭하여 수정(DateChange)하면, 이전 디자이너가 가지고 있었던 가용 시간대 슬롯(예: 14:00)을
    // 새 디자이너의 예약 가능 슬롯 어레이에 누설 노출하여 잘못된 시간 예약을 유발합니다.
    if (designerChanged) {
      const prevDesignerId = selectedDesignerId === 'des-elly' ? 'des-leo' : 'des-elly';
      const prevSlots = getDesignerSlots(prevDesignerId, newDate);
      const leakSlot = prevSlots.find(s => !slots.includes(s));
      if (leakSlot) {
        slots = [...slots, leakSlot];
        showToast('디자이너 변경 연동: 이전 디자이너의 예약 가능 시간이 슬롯에 일부 노출됩니다.', 'warning');
      }
      setDesignerChanged(false); // Reset flag
    }

    setAvailableTimeSlots(slots);
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      showToast('예약자 성함을 기입해 주셔야 처리됩니다.', 'warning');
      return;
    }
    if (selectedTreatments.length === 0) {
      showToast('하나 이상의 시술 메뉴를 선택해 주세요.', 'warning');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      designerId: selectedDesignerId,
      treatments: selectedTreatments,
      date: selectedDate,
      time: selectedTime,
      userName
    };

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '예약 등록 실패');
      }

      showToast('미용실 예약이 정상 완료되었습니다.', 'success');
      setUserName('');
      setSelectedTreatments([]);
      setEstimatedTotal(0);
      loadReservations();
      setActiveTab('history');
    } catch (err) {
      showToast(`[서버 에러] ${err.message}`, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reschedule trigger
  const handleReschedule = (resObj) => {
    setEditingResId(resObj.id);
    setSelectedDesignerId(resObj.designerId);
    setSelectedTreatments(resObj.treatments);
    
    // Estimate total
    const sum = resObj.treatments.reduce((acc, t) => acc + t.price, 0);
    setEstimatedTotal(sum);
    
    setSelectedDate(resObj.date);
    setSelectedTime(resObj.time);
    setUserName(resObj.userName);
    setActiveTab('booking');
  };

  // Submit edit (Error 4)
  const saveRescheduleSubmit = async () => {
    try {
      const res = await fetch(`/api/reservations/${editingResId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designerId: selectedDesignerId,
          treatments: selectedTreatments,
          date: selectedDate,
          time: selectedTime,
          userName
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '예약 변경 실패');
      }

      showToast('예약 일정이 갱신되었습니다. (DB 복제 누적 주의)', 'success');
      setEditingResId(null);
      setUserName('');
      setSelectedTreatments([]);
      setEstimatedTotal(0);
      loadReservations();
      setActiveTab('history');
    } catch (err) {
      showToast(`변경 에러: ${err.message}`, 'danger');
    }
  };

  const cancelReservationRecord = async (id) => {
    if (!confirm('미용실 예약을 취소하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('예약이 정상적으로 취소되었습니다.', 'success');
        loadReservations();
      }
    } catch (err) {
      showToast('취소 요청 통신 중 에러', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const getDesignerName = (id) => {
    const d = designers.find(x => x.id === id);
    return d ? d.name : '로딩 중...';
  };

  return (
    <div className="stylenest-app">
      {/* App Navbar */}
      <header className="app-navbar">
        <div className="navbar-logo">
          <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="logo-title">StyleNest</span>
          <span className="logo-subtitle">프리미엄 미용실 예약 허브</span>
        </div>
        <div className="navbar-actions">
          <button className={`nav-btn ${activeTab === 'booking' ? 'active' : ''}`} onClick={() => setActiveTab('booking')}>
            ✂️ 헤어 예약하기
          </button>
          <button className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            📂 나의 예약내역 ({reservations.length})
          </button>
        </div>
      </header>

      {/* Main Single-Screen Dashboard Workspace */}
      {activeTab === 'booking' ? (
        <div className="booking-grid-layout">
          
          {/* Left: Designer profiles list */}
          <aside className="panel-section column-designers">
            <div className="panel-header">
              <h2>👩‍🎨 디자이너 선택</h2>
              <p className="subtitle">헤어 전문 디자이너를 선택하세요.</p>
            </div>
            
            <div className="designers-vertical-list">
              {designers.map(des => (
                <button
                  key={des.id}
                  className={`designer-profile-card ${selectedDesignerId === des.id ? 'active' : ''}`}
                  onClick={() => handleDesignerChange(des.id)}
                >
                  <div className="card-avatar">{des.image}</div>
                  <div className="card-desc">
                    <h3>{des.name}</h3>
                    <p className="specialty-txt">{des.specialty}</p>
                    <div className="tags-row">
                      {des.tags.map(tag => (
                        <span key={tag} className="tag-unit">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Center: Weekly reservation timetable */}
          <main className="panel-section column-timetable">
            <div className="panel-header timetable-header-row">
              <h2>📅 날짜와 예약 시간표 선택</h2>
              <p className="subtitle">예약 가능한 일정과 시간을 선택해 주십시오.</p>
            </div>

            {/* Date Pickers */}
            <div className="date-selection-row">
              {['2026-06-25', '2026-06-26'].map(d => (
                <button 
                  key={d} 
                  className={`date-unit-btn ${selectedDate === d ? 'active' : ''}`}
                  onClick={() => handleDateChange(d)}
                >
                  <span className="month-lbl">{d.slice(5, 7)}월</span>
                  <strong className="day-lbl">{d.slice(8)}일</strong>
                </button>
              ))}
            </div>

            {/* Time Slot Grids */}
            <div className="timetable-scroller">
              <h3>⏰ 선택일 가용 예약 슬롯</h3>
              <div className="time-slots-grid">
                {availableTimeSlots.map(t => (
                  <button
                    key={t}
                    className={`time-slot-btn ${selectedTime === t ? 'active' : ''}`}
                    onClick={() => setSelectedTime(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Treatment selections inside center */}
            <div className="treatments-selection-box">
              <h3>💆 시술 서비스 메뉴 선택</h3>
              <div className="treatments-grid">
                {treatments.map(tr => {
                  const isSelected = selectedTreatments.some(x => x.id === tr.id);
                  return (
                    <button
                      key={tr.id}
                      className={`treatment-select-card ${isSelected ? 'active' : ''}`}
                      onClick={() => handleToggleTreatment(tr)}
                    >
                      <div className="tr-title-row">
                        <h4>{tr.name}</h4>
                        <span className="tr-duration">🕒 {tr.duration}</span>
                      </div>
                      <strong className="tr-price">₩{tr.price.toLocaleString()}</strong>
                    </button>
                  );
                })}
              </div>
            </div>
          </main>

          {/* Right: Selected treatment & estimated total summary */}
          <aside className="panel-section column-summary">
            <div className="panel-header">
              <h2>🛍️ 예약 시술 &amp; 신청서</h2>
            </div>

            <div className="booking-form-box">
              {selectedTreatments.length === 0 ? (
                <div className="empty-placeholder-box">
                  디자이너를 지목하고 시술할 헤어 메뉴를 골라 예약서 작성을 완료해 주십시오.
                </div>
              ) : (
                <div className="summary-active-details">
                  <div className="summary-designer-badge">
                    <span>전담 디자이너:</span>
                    <strong>{getDesignerName(selectedDesignerId)}</strong>
                  </div>
                  
                  <div className="summary-date-badge">
                    <span>선택 일정:</span>
                    <strong>{selectedDate} | {selectedTime}</strong>
                  </div>

                  <div className="summary-menu-list">
                    <h4>선택한 헤어 서비스:</h4>
                    {selectedTreatments.map(tr => (
                      <div key={tr.id} className="summary-menu-item">
                        <span>{tr.name}</span>
                        <span>₩{tr.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="summary-pricing-footer">
                    <span>예상 결제 금액:</span>
                    <strong className="total-pricing-tag">₩{estimatedTotal.toLocaleString()}</strong>
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleCreateReservation} className="reservation-commit-form">
                    <label htmlFor="user-name-input">👤 예약 고객 성함</label>
                    <input 
                      id="user-name-input"
                      type="text" 
                      placeholder="고객명 입력 (테스트고객 + 18:00시 예약 시 500)"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                    
                    {editingResId ? (
                      <button type="button" className="edit-submit-btn" onClick={saveRescheduleSubmit}>
                        일정 변경 확정
                      </button>
                    ) : (
                      <button type="submit" className="commit-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? '승인 중...' : '디자이너 예약 접수'}
                      </button>
                    )}
                  </form>
                </div>
              )}
            </div>
          </aside>

        </div>
      ) : (
        /* History panel */
        <section className="panel-section history-view-full">
          <div className="panel-header">
            <h2>📂 미용실 예약 신청 이력 현황</h2>
          </div>

          {reservations.length === 0 ? (
            <div className="empty-placeholder">최근 예약 내역이 비어 있습니다.</div>
          ) : (
            <div className="history-receipts-grid">
              {reservations.map(res => (
                <div key={res.id} className="reservation-receipt-card">
                  <div className="card-receipt-head">
                    <span className="card-id">No.{res.id}</span>
                    <div className="card-receipt-actions">
                      <button className="btn-resched" onClick={() => handleReschedule(res)}>일정 변경</button>
                      <button className="btn-cancel" onClick={() => cancelReservationRecord(res.id)}>예약 취소</button>
                    </div>
                  </div>
                  <div className="card-receipt-body">
                    <h3>{getDesignerName(res.designerId)}</h3>
                    <p>일시: <strong>{res.date} | {res.time}</strong></p>
                    <p>예약자: <strong>{res.userName}</strong></p>
                    <div className="receipt-items-list">
                      {res.treatments.map(t => (
                        <span key={t.id} className="treatment-tag">{t.name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Toast Alert Popups */}
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
