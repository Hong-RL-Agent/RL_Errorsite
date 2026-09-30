import React, { useState, useEffect } from 'react';
import { User, Calendar, Clock, MapPin, XCircle, Award, CheckCircle } from 'lucide-react';

export default function MyPage({ showToast }) {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!confirm('예약을 취소하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('예약이 성공적으로 취소되었습니다.', 'info');
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      {/* Profile Header */}
      <div style={{ background: '#ffffff', padding: 32, borderRadius: 20, border: '1px solid #e2e8f0', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
          alt="Profile"
          style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid #10b981' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>이수민 회원님</h2>
            <span style={{ background: '#ecfdf5', color: '#059669', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 9999 }}>
              VIP 골드 멤버십
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
            sumin.fit@example.com · 010-4821-7734
          </p>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#0f172a', fontWeight: 600 }}>
            <span>잔여 크레딧: <strong>450,000 P</strong></span>
            <span>수강 완료: <strong>14회</strong></span>
            <span>출석률: <strong>96%</strong></span>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="section-header">
        <div>
          <h2 className="section-title">나의 클래스 예약 내역 ({bookings.length}건)</h2>
          <p className="section-subtitle">현재 예약 확정된 수업 및 과거 수강 이력 목록입니다.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {bookings.map((b) => (
          <div
            key={b.id}
            style={{
              background: '#ffffff',
              padding: 24,
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h4 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{b.classTitle}</h4>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 9999,
                    background: b.status === 'confirmed' ? '#ecfdf5' : '#fee2e2',
                    color: b.status === 'confirmed' ? '#059669' : '#b91c1c'
                  }}
                >
                  {b.status === 'confirmed' ? '예약 확정' : '취소됨'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={14} color="#10b981" /> {b.date} {b.time}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={14} /> {b.instructor} 강사
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={14} /> {b.location}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#064e3b' }}>
                {b.price?.toLocaleString()}원
              </div>
              {b.status === 'confirmed' && (
                <button
                  onClick={() => handleCancelBooking(b.id)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#ef4444',
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  예약 취소
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
