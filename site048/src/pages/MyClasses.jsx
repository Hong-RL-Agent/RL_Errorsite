import React, { useState, useEffect } from 'react';
import { CalendarCheck, Calendar, Clock, MapPin, XCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { fetchApi, getCurrentUser } from '../api/client';

export default function MyClasses({ onSelectClass, onNavigateSearch, onShowToast }) {
  const [enrollments, setEnrollments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const [selectedForCancel, setSelectedForCancel] = useState(null);

  const currentUser = getCurrentUser();

  const loadEnrollments = () => {
    setLoading(true);
    fetchApi(`/api/enrollments?userId=${currentUser.id}`)
      .then(data => {
        setEnrollments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadEnrollments();
    const handleUserChange = () => loadEnrollments();
    window.addEventListener('classmate-user-changed', handleUserChange);
    return () => window.removeEventListener('classmate-user-changed', handleUserChange);
  }, []);

  // Handle Cancel (SEC-419: State Transition Missing)
  const handleConfirmCancel = (e) => {
    e.preventDefault();
    if (!selectedForCancel) return;

    fetchApi(`/api/enrollments/${selectedForCancel.id}/cancel`, {
      method: 'PATCH'
    })
      .then(res => {
        setSelectedForCancel(null);
        if (onShowToast) onShowToast('클래스 신청이 취소 처리되었습니다.', 'info');
        loadEnrollments();
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  const filteredEnrollments = filterStatus === 'all'
    ? enrollments
    : enrollments.filter(e => e.status === filterStatus);

  const statusMap = {
    enrolled: { label: '신청 완료', badgeClass: 'badge-blue' },
    completed: { label: '참여 완료', badgeClass: 'badge-green' },
    cancelled: { label: '취소됨', badgeClass: 'badge-red' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 8 }}>
          나의 수강 클래스 내역
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          신청하신 원데이 클래스 일정 확인 및 출석 현황을 관리하세요.
        </p>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginTop: 20,
          flexWrap: 'wrap',
          borderTop: '1px solid var(--border-light)',
          paddingTop: 16
        }}>
          {[
            { id: 'all', label: '전체 신청' },
            { id: 'enrolled', label: '신청 완료' },
            { id: 'completed', label: '참여 완료' },
            { id: 'cancelled', label: '취소된 내역' }
          ].map(tab => (
            <button
              key={tab.id}
              id={`tab-my-class-${tab.id}`}
              onClick={() => setFilterStatus(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: filterStatus === tab.id ? 'var(--primary-navy)' : '#f1f5f9',
                color: filterStatus === tab.id ? '#ffffff' : 'var(--text-main)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          수강 내역을 조회하는 중입니다...
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck size={32} />}
          title="해당 조건의 클래스 내역이 없습니다"
          description="새로운 취미 워크숍을 둘러보고 나만의 클래스를 신청해보세요."
          actionText="인기 클래스 둘러보기"
          onAction={onNavigateSearch}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredEnrollments.map(enr => {
            const statusInfo = statusMap[enr.status] || { label: enr.status, badgeClass: 'badge-gray' };
            return (
              <div
                key={enr.id}
                className="card"
                id={`enrollment-card-${enr.id}`}
                style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`badge ${statusInfo.badgeClass}`}>
                      {statusInfo.label}
                    </span>
                    <span className="badge badge-gray">
                      출석: {enr.attendance || '미출석'}
                    </span>
                  </div>

                  <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                    신청일: {new Date(enr.enrolledAt).toLocaleDateString()}
                  </span>
                </div>

                <div 
                  onClick={() => onSelectClass && onSelectClass(enr.classId)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
                >
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 6 }}>
                      {enr.classTitle}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={14} color="var(--soft-blue)" /> {enr.classDate}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={14} color="var(--soft-blue)" /> {enr.classTime}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={14} color="var(--soft-blue)" /> {enr.classLocation}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={18} color="var(--text-light)" />
                </div>

                {/* Actions (SEC-419 cancellation button triggerable on any state) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 8,
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-light)'
                }}>
                  <button
                    id={`btn-view-class-detail-${enr.id}`}
                    onClick={() => onSelectClass && onSelectClass(enr.classId)}
                    className="btn btn-outline btn-sm"
                  >
                    상세 정보
                  </button>

                  <button
                    id={`btn-cancel-enrollment-${enr.id}`}
                    onClick={() => setSelectedForCancel(enr)}
                    className="btn btn-danger btn-sm"
                  >
                    <XCircle size={13} /> 신청 취소
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Modal (SEC-419) */}
      <Modal
        isOpen={!!selectedForCancel}
        onClose={() => setSelectedForCancel(null)}
        title="클래스 수강 신청 취소"
      >
        {selectedForCancel && (
          <form onSubmit={handleConfirmCancel} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--text-main)' }}>
              <strong>{selectedForCancel.classTitle}</strong> 신청을 정말로 취소하시겠습니까?
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              현재 상태: <span className="badge badge-gray">{selectedForCancel.status}</span>
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button type="button" onClick={() => setSelectedForCancel(null)} className="btn btn-outline">
                닫기
              </button>
              <button id="btn-confirm-cancel-enrollment" type="submit" className="btn btn-danger">
                취소 확정
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
