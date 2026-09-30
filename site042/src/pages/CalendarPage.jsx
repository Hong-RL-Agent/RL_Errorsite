import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, PlusCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function CalendarPage({ showToast }) {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('2026-10-01');
  const [selectedTime, setSelectedTime] = useState('00:30'); // Boundary midnight slot
  const [title, setTitle] = useState('모닝 빈야사 요가 프라이빗 세션');
  const [instructor, setInstructor] = useState('김서연');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCalendar = async () => {
    try {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          date: selectedDate,
          time: selectedTime,
          instructor
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`일정이 캘린더에 저장되었습니다. (저장된 날짜: ${data.event.date})`, data.bugId || 'site042-bug04', data.secId || 'SEC-394');
        fetchCalendar();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">수업 일정 & 캘린더</h2>
          <p className="section-subtitle">나의 예약된 운동 일정과 실시간 트레이닝 시간표를 관리합니다.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28 }}>
        {/* Schedule Registration Form */}
        <div style={{ background: '#ffffff', padding: 28, borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.06)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusCircle size={20} color="#10b981" />
            새 운동 일정 추가
          </h3>

          <form onSubmit={handleAddEvent}>
            <div className="form-group">
              <label className="form-label">수업/일정명</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">날짜 선택</label>
              <input
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">시간 선택 (자정/심야 경계 슬롯 지원)</label>
              <select
                className="form-select"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                <option value="00:00">00:00 (자정 세션 - 경계)</option>
                <option value="00:30">00:30 (심야 집중 명상 - 경계)</option>
                <option value="07:00">07:00 (아침 모닝 요가)</option>
                <option value="10:00">10:00 (오전 필라테스)</option>
                <option value="14:00">14:00 (오후 1:1 PT)</option>
                <option value="19:00">19:00 (저녁 크로스핏)</option>
                <option value="23:30">23:30 (야간 스트레칭 - 경계)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">담당 강사</label>
              <select
                className="form-select"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
              >
                <option value="김서연">김서연 강사 (요가)</option>
                <option value="박지훈">박지훈 강사 (PT)</option>
                <option value="이하늘">이하늘 강사 (필라테스)</option>
                <option value="정민지">정민지 강사 (스피닝)</option>
                <option value="윤서아">윤서아 강사 (명상)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-lime"
              style={{ width: '100%', padding: '12px', marginTop: 8 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? '일정 등록 중...' : '캘린더에 일정 등록하기'}
            </button>
          </form>
        </div>

        {/* Calendar Events View */}
        <div style={{ background: '#ffffff', padding: 28, borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.06)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarIcon size={20} color="#064e3b" />
            등록된 일정 목록 ({events.length}건)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {events.map((evt) => (
              <div
                key={evt.id}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 4 }}>
                    {evt.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CalendarIcon size={13} color="#10b981" />
                      {evt.date} {evt.requestedDate && evt.requestedDate !== evt.date ? `(요청: ${evt.requestedDate})` : ''}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} />
                      {evt.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={13} />
                      {evt.instructor}
                    </span>
                  </div>
                </div>

                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 9999, background: '#ecfdf5', color: '#059669' }}>
                  확정됨
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
