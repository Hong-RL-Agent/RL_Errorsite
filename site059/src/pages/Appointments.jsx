import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Building2, Stethoscope, AlertCircle, RefreshCw, XCircle, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { api } from '../api/client';

export default function Appointments({ onNavigateTab }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [cancelModalApt, setCancelModalApt] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAppointments();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.message || '예약 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelModalApt) return;
    setCancelling(true);
    try {
      await api.cancelAppointment(cancelModalApt.id);
      setCancelModalApt(null);
      await fetchAppointments();
    } catch (err) {
      alert('예약 취소 중 오류가 발생했습니다.');
    } finally {
      setCancelling(false);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case '예약 완료':
        return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
      case '예약 예정':
        return { bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
      case '진료 완료':
        return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
      case '취소':
        return { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div className="max-w-screen" style={{ paddingTop: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
            내 진료 예약 내역
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            신청하신 모든 병원 및 전문의 진료 예약 일정을 확인하고 관리할 수 있습니다.
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          style={{
            padding: '8px 16px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#475569'
          }}
        >
          <RefreshCw size={15} />
          <span>새로고침</span>
        </button>
      </div>

      {/* Filter Status Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['all', '예약 완료', '예약 예정', '진료 완료', '취소'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: filterStatus === st ? '1px solid #0284c7' : '1px solid #e2e8f0',
              background: filterStatus === st ? '#0284c7' : '#ffffff',
              color: filterStatus === st ? '#ffffff' : '#475569'
            }}
          >
            {st === 'all' ? '전체 내역' : st}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p>예약 목록을 불러오는 중입니다...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
          <Calendar size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            해당 조건의 진료 예약 내역이 없습니다.
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            새로운 병원을 검색하고 진료 예약을 진행해 보세요.
          </p>
          <button
            onClick={() => onNavigateTab('booking')}
            style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
          >
            진료 예약하러 가기
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredAppointments.map((apt) => {
            const badgeStyle = getStatusBadgeStyle(apt.status);
            const canCancel = apt.status === '예약 완료' || apt.status === '예약 예정';

            return (
              <div
                key={apt.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'grid',
                  gridTemplateColumns: '1.3fr 1.5fr 1fr auto',
                  alignItems: 'center',
                  gap: '20px'
                }}
              >
                {/* Hospital & Doctor */}
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
                    {apt.bookingNumber}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    {apt.hospitalName}
                  </h3>
                  <div style={{ fontSize: '0.88rem', color: '#0284c7', fontWeight: 700 }}>
                    {apt.doctorName} 전문의 ({apt.departmentName})
                  </div>
                </div>

                {/* Schedule & Symptoms */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    <Calendar size={16} color="#0284c7" />
                    <span>{apt.date} {apt.time}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    증상: {apt.symptoms || '일반 상담'}
                  </div>
                </div>

                {/* Patient & Status Badge */}
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    환자명: <strong>{apt.patientName}</strong>
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        background: badgeStyle.bg,
                        color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.border}`
                      }}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  {canCancel && (
                    <button
                      onClick={() => setCancelModalApt(apt)}
                      style={{
                        padding: '8px 14px',
                        background: '#fef2f2',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
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

      {/* Cancel Confirmation Modal */}
      {cancelModalApt && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
              진료 예약 취소 확인
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
              정말로 해당 진료 예약을 취소하시겠습니까? 취소 후에는 이전 시간대로 복구되지 않을 수 있습니다.
            </p>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px' }}>
              <div>• <strong>병원</strong>: {cancelModalApt.hospitalName}</div>
              <div>• <strong>의사</strong>: {cancelModalApt.doctorName}</div>
              <div>• <strong>일시</strong>: {cancelModalApt.date} {cancelModalApt.time}</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setCancelModalApt(null)}
                style={{ padding: '10px 18px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                닫기
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                style={{ padding: '10px 18px', background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
              >
                {cancelling ? '취소 처리 중...' : '예약 취소 확정'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
