import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Video, Radio, FileText, CheckCircle } from 'lucide-react';
import Modal from '../components/Modal';

export default function Calendar({ onShowToast }) {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-10-05');
  const [type, setType] = useState('upload');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/calendar/events');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  // SEC-357: Calendar Events
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setLoading(true);
    try {
      // Idempotency key per title & date combination
      const idempotency_key = `CALENDAR-${date}-${title.trim().toUpperCase().replace(/\s+/g, '_')}`;

      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          date,
          type,
          idempotency_key
        })
      });

      const data = await res.json();
      if (data.success) {
        onShowToast({
          title: '캘린더 일정 등록 완료',
          message: `"${title}" 일정이 ${date}에 등록되었습니다.`,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          txId: data.transaction_id,
          idempotency_key
        });
        setIsModalOpen(false);
        setTitle('');
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEventBadge = (evtType) => {
    switch (evtType) {
      case 'upload':
        return <span className="badge badge-indigo"><Video size={11} /> 유튜브 업로드</span>;
      case 'live':
        return <span className="badge badge-coral"><Radio size={11} /> 라이브 스트리밍</span>;
      case 'recording':
        return <span className="badge badge-purple"><FileText size={11} /> 콘텐츠 기획/녹음</span>;
      default:
        return <span className="badge badge-gray">기타 일정</span>;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">콘텐츠 제작 & 발행 캘린더</h1>
          <p className="page-subtitle">채널별 콘텐츠 릴리즈 일정과 촬영/편집 마일스톤을 관리합니다.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> 새 일정 추가
        </button>
      </div>

      <div className="grid-layout grid-2" style={{ gridTemplateColumns: '1fr 340px' }}>
        {/* Calendar View */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>2026년 10월 콘텐츠 마스터 플랜</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm"><ChevronLeft size={14} /></button>
              <button className="btn btn-secondary btn-sm"><ChevronRight size={14} /></button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const dateStr = `2026-10-${String(day).padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.date === dateStr);

              return (
                <div
                  key={day}
                  style={{
                    minHeight: '85px',
                    padding: '6px',
                    borderRadius: 'var(--radius-sm)',
                    background: dayEvents.length > 0 ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    fontSize: '12px'
                  }}
                >
                  <span style={{ fontWeight: 600, color: dayEvents.length > 0 ? 'var(--primary-color)' : 'var(--text-muted)', marginBottom: '4px' }}>
                    {day}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dayEvents.map(e => (
                      <div
                        key={e.id}
                        style={{
                          fontSize: '10px',
                          padding: '2px 4px',
                          borderRadius: '3px',
                          background: 'var(--primary-color)',
                          color: '#fff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: 500
                        }}
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event List Sidebar */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            예정된 일정 목록 ({events.length}건)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '480px', overflowY: 'auto' }}>
            {events.map(e => (
              <div
                key={e.id}
                style={{
                  padding: '12px',
                  background: 'var(--bg-main)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-color)' }}>{e.date}</span>
                  {getEventBadge(e.type)}
                </div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{e.title}</h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>담당: {e.creator}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEC-357: Create Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="새 콘텐츠 일정 추가"
      >
        <form onSubmit={handleCreateEvent}>
          <div className="form-group">
            <label className="form-label">일정 제목 *</label>
            <input
              type="text"
              className="form-input"
              placeholder="예: YouTube 영상 업로드, 가을 룩북 촬영"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">예정 일자 *</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">일정 유형</label>
            <select
              className="form-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="upload">유튜브 영상 업로드</option>
              <option value="live">라이브 방송</option>
              <option value="recording">녹화 및 기획</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '등록 중...' : '일정 등록'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
