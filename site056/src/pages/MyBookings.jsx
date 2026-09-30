import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, XCircle, ChevronRight, FileText, Trash2, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

export default function MyBookings({ onNavigateTab, onViewReport }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('전체');

  // Cancel Modal State
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBookings();
      if (data && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      setError(err.message || '예약 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    setCancelLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      // Calls DELETE /api/bookings/:id
      // Server returns HTTP 204 No Content
      // api.deleteBooking calls response.json() -> causes SyntaxError: Unexpected end of JSON input
      await api.deleteBooking(selectedBookingForCancel.id);
      
      setActionSuccess('예약이 성공적으로 취소되었습니다.');
      setSelectedBookingForCancel(null);
      fetchBookings();
    } catch (err) {
      console.error('[AutoCheck Cancel Error]', err);
      // SyntaxError or error displayed
      setActionError(`예약 취소 처리 중 오류 발생: ${err.message}`);
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeFilter === '전체') return true;
    return b.status === activeFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case '예정':
        return <span className="status-badge status-upcoming"><Clock size={14} /> 방문 예정</span>;
      case '완료':
        return <span className="status-badge status-completed"><CheckCircle2 size={14} /> 점검 완료</span>;
      case '취소':
        return <span className="status-badge status-cancelled"><XCircle size={14} /> 취소됨</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="max-w-screen" style={{ paddingTop: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
          내 점검 예약 내역
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          신청하신 중고차 정밀 점검 일정 및 완료된 진단 결과를 조회할 수 있습니다.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {['전체', '예정', '완료', '취소'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: activeFilter === tab ? '1px solid #1e40af' : '1px solid transparent',
              background: activeFilter === tab ? '#eff6ff' : '#ffffff',
              color: activeFilter === tab ? '#1e40af' : '#64748b',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {actionSuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p>예약 목록을 불러오는 중입니다...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
          <Calendar size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
            해당하는 예약 내역이 없습니다.
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '18px' }}>
            원하시는 차량의 점검을 지금 바로 예약해 보세요.
          </p>
          <button
            onClick={() => onNavigateTab('booking')}
            style={{
              padding: '10px 20px',
              background: '#1e40af',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            점검 예약하러 가기
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)',
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr auto',
                alignItems: 'center',
                gap: '20px'
              }}
            >
              {/* Col 1: Vehicle & Booking ID */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>{b.bookingNumber}</span>
                  {getStatusBadge(b.status)}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  {b.vehicleName}
                </h3>
                <div style={{ fontSize: '0.88rem', color: '#64748b' }}>
                  {b.serviceType}
                </div>
              </div>

              {/* Col 2: Center & Date */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.92rem', color: '#1e293b', fontWeight: 700, marginBottom: '4px' }}>
                  <MapPin size={16} color="#2563eb" />
                  <span>{b.centerName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: '#64748b' }}>
                  <Calendar size={15} />
                  <span>{b.date} {b.time}</span>
                </div>
              </div>

              {/* Col 3: Customer & Price */}
              <div>
                <div style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '2px' }}>
                  예약자: <strong style={{ color: '#0f172a' }}>{b.customerName}</strong> ({b.phone})
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e40af' }}>
                  {b.price?.toLocaleString()}원 ({b.paymentStatus})
                </div>
              </div>

              {/* Col 4: Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {b.status === '완료' && b.reportId && (
                  <button
                    onClick={() => onViewReport(b.reportId)}
                    style={{
                      padding: '8px 14px',
                      background: '#eff6ff',
                      color: '#1e40af',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FileText size={16} />
                    <span>리포트 보기</span>
                  </button>
                )}

                {b.status === '예정' && (
                  <button
                    onClick={() => {
                      setSelectedBookingForCancel(b);
                      setActionError(null);
                    }}
                    style={{
                      padding: '8px 14px',
                      background: '#fff',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={15} />
                    <span>예약 취소</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {selectedBookingForCancel && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
              점검 예약을 취소하시겠습니까?
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '20px', lineHeight: 1.5 }}>
              예약을 취소하시면 배정된 진단사 일정 및 검사 슬롯이 해제됩니다. 정말 취소를 진행하시겠습니까?
            </p>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px', fontSize: '0.9rem' }}>
              <div><strong>차량:</strong> {selectedBookingForCancel.vehicleName}</div>
              <div style={{ marginTop: '4px' }}><strong>일시:</strong> {selectedBookingForCancel.date} {selectedBookingForCancel.time}</div>
              <div style={{ marginTop: '4px' }}><strong>센터:</strong> {selectedBookingForCancel.centerName}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedBookingForCancel(null)}
                disabled={cancelLoading}
                style={{
                  padding: '10px 18px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                style={{
                  padding: '10px 20px',
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: cancelLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {cancelLoading ? '취소 처리 중...' : '예약 취소 확정'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
