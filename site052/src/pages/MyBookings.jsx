import React, { useState, useEffect } from 'react';
import { api, notifyBugDetected } from '../api/client';

export default function MyBookings({ onSelectRoom, showToast, bookings: initialBookings = [], onUpdateBookings }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Memo Modal & SEC-437 State
  const [selectedBookingForMemo, setSelectedBookingForMemo] = useState(null);
  const [memoDraft, setMemoDraft] = useState('');
  const [dirtyDraftStore, setDirtyDraftStore] = useState({}); // Stores lingering draft across ESC closes

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getBookings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined
      });
      if (res && res.bookings) {
        setBookings(res.bookings);
        if (onUpdateBookings) onUpdateBookings(res.bookings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  // Sync when initialBookings changes (e.g. newly created booking from parent)
  useEffect(() => {
    if (initialBookings && initialBookings.length > 0) {
      setBookings(initialBookings);
    }
  }, [initialBookings]);

  // Handle opening memo modal
  const handleOpenMemoModal = (booking) => {
    setSelectedBookingForMemo(booking);
    // INTENTIONAL BACKEND BUG: site052-SEC-437
    // If there is a lingering dirty draft from previous ESC dismissal, reuse that draft!
    if (dirtyDraftStore[booking.id] !== undefined) {
      setMemoDraft(dirtyDraftStore[booking.id]);
    } else {
      setMemoDraft(booking.memo || '');
    }
  };

  // Close modal with draft retention (ESC or Close button)
  const handleDismissMemoModal = () => {
    if (selectedBookingForMemo) {
      // INTENTIONAL BACKEND BUG: site052-SEC-437
      // On close/ESC: preserve modified draft into dirtyDraftStore
      setDirtyDraftStore(prev => ({
        ...prev,
        [selectedBookingForMemo.id]: memoDraft
      }));

      // Trigger SEC-437 bug notification
      notifyBugDetected({
        id: 'SEC-437',
        category: 'UI Interaction',
        family: 'modal-state',
        severity: 'medium',
        endpoint: `/api/bookings/${selectedBookingForMemo.id}/memo`,
        method: 'PATCH',
        description: '모달에서 ESC 키를 눌러 닫았으나 내부 입력값(draft memo)이 초기화되지 않고 잔존하는 오류'
      });

      setSelectedBookingForMemo(null);
    }
  };

  // Keyboard ESC handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedBookingForMemo) {
        handleDismissMemoModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBookingForMemo, memoDraft]);

  const handleSaveMemo = async () => {
    if (!selectedBookingForMemo) return;
    try {
      const hasResidual = dirtyDraftStore[selectedBookingForMemo.id] !== undefined;
      const headers = hasResidual ? { 'x-draft-residual': 'true' } : {};
      
      const res = await api.updateBookingMemo(selectedBookingForMemo.id, memoDraft, headers);
      if (res && res.booking) {
        // Clean up dirty draft
        setDirtyDraftStore(prev => {
          const next = { ...prev };
          delete next[selectedBookingForMemo.id];
          return next;
        });
        const updated = bookings.map(b => b.id === res.booking.id ? res.booking : b);
        setBookings(updated);
        if (onUpdateBookings) onUpdateBookings(updated);
        if (showToast) showToast('예약 메모가 저장되었습니다.', 'success');
      }
      setSelectedBookingForMemo(null);
    } catch (err) {
      if (showToast) showToast(err.message || '메모 수정 실패', 'error');
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('정말 이 예약을 취소하시겠습니까?')) return;
    try {
      const res = await api.cancelBooking(id);
      if (res && res.booking) {
        const updated = bookings.map(b => b.id === id ? { ...b, status: '취소' } : b);
        setBookings(updated);
        if (onUpdateBookings) onUpdateBookings(updated);
        if (showToast) showToast('예약이 취소되었습니다.', 'info');
      }
    } catch (err) {
      if (showToast) showToast(err.message || '예약 취소 실패', 'error');
    }
  };

  // CSV Export (SEC-439)
  const handleDownloadCsv = async () => {
    try {
      // INTENTIONAL BACKEND BUG: site052-SEC-439
      const response = await fetch('/api/bookings/export');
      const bugInfoJson = response.headers.get('X-Bug-Info');
      if (bugInfoJson) {
        try {
          notifyBugDetected(JSON.parse(decodeURIComponent(bugInfoJson)));
        } catch (e) {
          try {
            notifyBugDetected(JSON.parse(bugInfoJson));
          } catch (err) {}
        }
      } else {
        notifyBugDetected({
          id: 'SEC-439',
          category: 'Export',
          family: 'schema-mismatch',
          severity: 'medium',
          endpoint: '/api/bookings/export',
          method: 'GET',
          description: '예약 정보 CSV 내보내기에서 헤더 순서와 실제 데이터 필드(시작시간↔종료시간, 인원↔상태)가 불일치하는 오류'
        });
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'spacemate_bookings_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      if (showToast) showToast('예약 내역 CSV 파일이 다운로드되었습니다.', 'success');
    } catch (err) {
      if (showToast) showToast('CSV 다운로드에 실패했습니다.', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '6px' }}>
            예약 내역
          </h1>
          <p style={{ color: 'var(--navy-500)', fontSize: '0.95rem' }}>
            예정된 워크스페이스 일정 및 지난 이용 내역을 확인하고 관리하세요.
          </p>
        </div>

        <button 
          className="btn-secondary download-csv-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          onClick={handleDownloadCsv}
        >
          📥 예약 내역 다운로드 (CSV)
        </button>
      </div>

      {/* Tabs Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {['all', '예약 예정', '이용 중', '이용 완료', '취소'].map(tab => (
          <button
            key={tab}
            className={`btn-secondary ${statusFilter === tab ? 'btn-primary' : ''}`}
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '6px 16px',
              fontSize: '0.85rem',
              fontWeight: '700'
            }}
            onClick={() => setStatusFilter(tab)}
          >
            {tab === 'all' ? '전체 예약' : tab}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      {loading && bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--navy-500)' }}>
          예약 내역을 불러오는 중...
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--navy-500)' }}>
          해당 상태의 예약 내역이 없습니다.
        </div>
      ) : (
        <div className="data-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>예약번호</th>
                <th>공간명 / 지점</th>
                <th>이용 일시</th>
                <th>인원</th>
                <th>상태</th>
                <th>메모</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: '700', color: 'var(--navy-900)' }}>{b.id}</td>
                  <td>
                    <div style={{ fontWeight: '700', color: 'var(--indigo-600)', cursor: 'pointer' }} onClick={() => onSelectRoom && onSelectRoom(b.roomId)}>
                      {b.roomName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--navy-500)' }}>{b.branch}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{b.date}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--navy-500)' }}>{b.startTime} ~ {b.endTime}</div>
                  </td>
                  <td>{b.attendees}명</td>
                  <td>
                    <span className={`status-badge ${b.status ? b.status.replace(' ', '-') : '예약-예정'}`}>
                      {b.status || '예약 예정'}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                      {b.memo || <span style={{ color: '#94a3b8' }}>(메모 없음)</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                        onClick={() => handleOpenMemoModal(b)}
                      >
                        메모 수정
                      </button>
                      {b.status === '예약 예정' && (
                        <button 
                          className="btn-danger" 
                          onClick={() => handleCancelBooking(b.id)}
                        >
                          취소
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Memo Edit Modal (SEC-437) */}
      {selectedBookingForMemo && (
        <div className="modal-overlay" onClick={handleDismissMemoModal}>
          <div className="modal-content memo-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--navy-900)' }}>
                예약 메모 수정
              </h3>
              <button 
                onClick={handleDismissMemoModal}
                style={{ fontSize: '1.2rem', color: 'var(--navy-500)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              <div><strong>공간:</strong> {selectedBookingForMemo.roomName} ({selectedBookingForMemo.branch})</div>
              <div><strong>일시:</strong> {selectedBookingForMemo.date} {selectedBookingForMemo.startTime}~{selectedBookingForMemo.endTime}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--navy-700)', marginBottom: '6px' }}>
                이용 목적 및 메모 (ESC 키를 눌러 닫을 수 있습니다)
              </label>
              <textarea
                name="memoDraft"
                rows={4}
                value={memoDraft}
                onChange={(e) => setMemoDraft(e.target.value)}
                placeholder="예: 고객 미팅 준비 및 화상 발표 자료 점검"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleDismissMemoModal}
              >
                닫기 (ESC)
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleSaveMemo}
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
