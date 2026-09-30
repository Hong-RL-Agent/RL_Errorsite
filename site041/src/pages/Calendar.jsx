import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Plus, CheckCircle, Clock } from 'lucide-react';
import { fetchApi } from '../api/client';
import { showToast } from '../components/Toast';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('2026-10-01');
  const [eventType, setEventType] = useState('health');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await fetchApi('/api/calendar/events');
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Triggers SEC-387: async-no-feedback on Calendar Title
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newTitle = eventTitle.trim();
    setShowAddModal(false);
    setEventTitle('');

    // Intentionally without progress/loading feedback UI state for SEC-387
    fetchApi('/api/calendar/events', {
      method: 'POST',
      body: JSON.stringify({
        title: newTitle,
        date: eventDate,
        type: eventType
      })
    }).then(() => {
      showToast('일정 등록 완료', '새로운 반려동물 일정이 캘린더에 추가되었습니다.', 'success');
      loadEvents();
    }).catch((err) => {
      showToast('오류', err.message, 'error');
    });
  };

  return (
    <div className="main-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>반려동물 케어 캘린더</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>접종, 구충, 산책, 돌봄 예약 일정을 한눈에 관리합니다.</p>
        </div>

        <button className="primary-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>새 케어 일정 등록</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {events.map((evt) => (
          <div key={evt.id} className="card-box" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: evt.type === 'health' ? '#e8f5e9' : '#fff3e0', color: evt.type === 'health' ? '#2d6a4f' : '#f4a261', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarIcon size={24} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8d99ae', fontWeight: 700 }}>{evt.date}</div>
              <div style={{ fontWeight: 800, fontSize: '15.5px', color: '#1b261e', margin: '2px 0' }}>{evt.title}</div>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b' }}>
                {evt.type === 'health' ? '건강/접종' : '돌봄예약'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '460px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>새 케어 일정 등록</h3>
            <form onSubmit={handleAddEvent}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>일정 제목</label>
                <input
                  type="text"
                  required
                  placeholder="예: 초코 심장사상충 예방약 복용"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>일정 날짜</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>구분</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="health">건강/접종</option>
                    <option value="reservation">돌봄/산책</option>
                    <option value="custom">기타 일정</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                  취소
                </button>
                <button type="submit" className="primary-btn">
                  일정 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
