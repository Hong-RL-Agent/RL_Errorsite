import React, { useState, useEffect } from 'react';
import { BookmarkCheck, Calendar, Clock, AlertTriangle, ArrowRight, CheckCircle, RefreshCw, XCircle, DollarSign } from 'lucide-react';

export default function MyReservations({ onRevisit }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, CONFIRMED, COMPLETED, CANCELLED
  
  // Partial Cancel / Refund Modal state
  const [partialModalRes, setPartialModalRes] = useState(null);
  const [partialTargetSpace, setPartialTargetSpace] = useState(null);
  const [refundData, setRefundData] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);

  // Fetch reservations
  const fetchReservations = async () => {
    setLoading(true);
    try {
      const url = activeFilter === 'ALL' 
        ? 'http://localhost:5007/api/reservations' 
        : `http://localhost:5007/api/reservations?status=${activeFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      console.error('Failed to load reservations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    if (onRevisit) onRevisit();
  }, [activeFilter]);

  // Full cancel handler (for Single Reservation)
  const handleCancelReservation = async (reservationId) => {
    try {
      const res = await fetch(`http://localhost:5007/api/reservations/${reservationId}/cancel`, {
        method: 'POST'
      });
      if (res.ok) {
        // UI shows '취소' immediately
        setReservations(prev => prev.map(r => {
          if (r.id === reservationId) {
            return { ...r, status: 'CANCELLED' };
          }
          return r;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Partial Cancel modal
  const handleOpenPartialCancel = async (resItem, targetSpaceId) => {
    setPartialModalRes(resItem);
    setPartialTargetSpace(targetSpaceId);
    setRefundLoading(true);
    try {
      const res = await fetch('http://localhost:5007/api/refund/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservation_id: resItem.id,
          target_space_id: targetSpaceId,
          type: 'PARTIAL'
        })
      });
      const data = await res.json();
      setRefundData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefundLoading(false);
    }
  };

  // Execute Partial Cancel
  const handleExecutePartialCancel = async () => {
    if (!partialModalRes || !partialTargetSpace) return;
    try {
      await fetch(`http://localhost:5007/api/reservations/${partialModalRes.id}/partial-cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_space_id: partialTargetSpace })
      });
      setPartialModalRes(null);
      fetchReservations();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(26, 40, 34, 0.9), rgba(20, 30, 26, 0.9))',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', marginBottom: '6px' }}>
            <BookmarkCheck size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              예약 관리 센터
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            내 예약 내역
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            확정된 일정 및 과거 예약 내역을 조회하고 변경 및 취소를 처리할 수 있습니다.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'var(--bg-surface)',
          padding: '6px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {[
            { id: 'ALL', label: '전체' },
            { id: 'CONFIRMED', label: '예약 확정' },
            { id: 'COMPLETED', label: '이용 완료' },
            { id: 'CANCELLED', label: '취소' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '700',
                fontSize: '0.85rem',
                color: activeFilter === f.id ? '#0c1210' : 'var(--text-secondary)',
                background: activeFilter === f.id ? 'var(--brand-primary)' : 'transparent'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reservation List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          예약 내역을 불러오는 중입니다...
        </div>
      ) : reservations.length === 0 ? (
        <div style={{
          padding: '48px',
          textAlign: 'center',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)'
        }}>
          등록된 예약 내역이 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reservations.map(res => {
            const isConfirmed = res.status === 'CONFIRMED';
            const isCancelled = res.status === 'CANCELLED';
            const isCompleted = res.status === 'COMPLETED';
            const isMultiRoom = res.items && res.items.length > 1;

            return (
              <div
                key={res.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--brand-primary)' }}>
                      예약 #{res.id}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {res.created_at || '2026-10-15'}
                    </span>
                    {isMultiRoom && (
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: 'rgba(82, 121, 111, 0.25)',
                        color: 'var(--brand-primary)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        다중 공간 예약 ({res.items.length}개)
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isConfirmed && (
                      <span className="badge badge-confirmed">
                        <CheckCircle size={14} />
                        예약 확정
                      </span>
                    )}
                    {isCancelled && (
                      <span className="badge badge-cancelled">
                        <XCircle size={14} />
                        취소
                      </span>
                    )}
                    {isCompleted && (
                      <span className="badge badge-completed">
                        <CheckCircle size={14} />
                        이용 완료
                      </span>
                    )}
                  </div>
                </div>

                {/* Items & Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {res.items && res.items.length > 0 ? (
                    res.items.map(item => (
                      <div
                        key={item.id || item.space_name}
                        style={{
                          background: 'rgba(12, 18, 16, 0.5)',
                          padding: '14px 18px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>
                            {item.space_name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {item.start_at ? item.start_at.replace('T', ' ') : ''} ~ {item.end_at ? item.end_at.replace('T', ' ') : ''}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>
                            {item.item_price.toLocaleString()}원
                          </span>

                          {/* Partial cancel button for multi-room item */}
                          {isMultiRoom && isConfirmed && item.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleOpenPartialCancel(res, item.space_id)}
                              className="btn-danger"
                              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                            >
                              {item.space_name} 부분 취소
                            </button>
                          )}
                          {item.status === 'CANCELLED' && (
                            <span className="badge badge-cancelled" style={{ fontSize: '0.75rem' }}>
                              부분 취소됨
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      background: 'rgba(12, 18, 16, 0.5)',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>
                          {res.space_name || '예약 공간'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          이용 시간: {res.start_at ? res.start_at.replace('T', ' ') : ''} ~ {res.end_at ? res.end_at.replace('T', ' ') : ''}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          예약자: {res.guest_name} ({res.guest_count}명)
                        </div>
                      </div>

                      <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--brand-primary)' }}>
                        {res.total_price.toLocaleString()}원
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '14px'
                }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    총 결제 금액: <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{res.total_price.toLocaleString()}원</strong>
                  </div>

                  {isConfirmed && !isMultiRoom && (
                    <button
                      onClick={() => handleCancelReservation(res.id)}
                      className="btn-danger"
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      예약 취소
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Partial Cancel & Refund Preview Modal (BUG 4) */}
      {partialModalRes && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 15, 13, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--brand-accent)', fontWeight: '700' }}>
                부분 취소 및 환불 확인
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>
                환불 예상 금액 확인
              </h2>
            </div>

            {refundLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                환불 규정 및 예상 금액 산출 중...
              </div>
            ) : refundData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  background: 'var(--bg-card)',
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>취소 대상:</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{refundData.target_space_name}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>결제 금액:</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{refundData.paid_amount.toLocaleString()}원</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>위약금:</span>
                    <span style={{ fontWeight: '700', color: 'var(--brand-accent)' }}>{refundData.penalty_fee.toLocaleString()}원</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '10px',
                    marginTop: '4px'
                  }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>환불 예상 금액:</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--brand-primary)' }}>
                      {refundData.refund_amount.toLocaleString()}원
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  * 취소 처리 시 위 환불 예상 금액이 원 결제 수단으로 환불됩니다.
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setPartialModalRes(null)}
                className="btn-secondary"
                style={{ flex: 1, padding: '12px' }}
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleExecutePartialCancel}
                className="btn-primary"
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, var(--brand-accent), #c2593f)', color: '#fff' }}
              >
                부분 취소 실행
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
