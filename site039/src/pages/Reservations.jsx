import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Edit3, CheckCircle2, Save } from 'lucide-react';
import Modal from '../components/Modal';

export default function Reservations({ onShowToast }) {
  const [reservations, setReservations] = useState([]);
  const [selectedResv, setSelectedResv] = useState(null);
  const [memoInput, setMemoInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openMemoModal = (resv) => {
    setSelectedResv(resv);
    setMemoInput(resv.memo || '');
    setIsModalOpen(true);
  };

  // SEC-367: Reservation Memo Save
  const handleSaveMemo = async (e) => {
    e.preventDefault();
    if (!selectedResv) return;

    try {
      const res = await fetch(`/api/reservations/${selectedResv.id}/memo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memo: memoInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchReservations();
        onShowToast({
          title: '예약 메모 저장 완료',
          message: `[${selectedResv.serviceTitle}]의 상담 요청 메모가 업데이트되었습니다.`,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">쇼룸 & 워크숍 예약 관리</h1>
          <p className="page-subtitle">1:1 홈스타일링 컨설팅, 도예 원데이 클래스, VIP 프리뷰 예약을 관리합니다.</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
          나의 예약 일정 ({reservations.length}건)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {reservations.map((r) => (
            <div
              key={r.id}
              style={{
                padding: '18px 20px',
                background: '#fbf9f6',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-terracotta">{r.category}</span>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{r.serviceTitle}</h4>
                </div>
                <span className="badge badge-emerald">{r.status}</span>
              </div>

              <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CalendarIcon size={14} color="var(--primary)" /> 일시: {r.date} {r.time}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} color="var(--primary)" /> 인원: {r.people}명
                </span>
              </div>

              <div style={{
                padding: '10px 14px',
                background: '#ffffff',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block' }}>요청 메모</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                    {r.memo || '작성된 메모가 없습니다.'}
                  </span>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => openMemoModal(r)}
                >
                  <Edit3 size={13} /> 메모 수정
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEC-367: Reservation Memo Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="예약 요청 메모 작성 및 수정"
      >
        <form onSubmit={handleSaveMemo}>
          <div className="form-group">
            <label className="form-label">예약 항목</label>
            <input
              type="text"
              className="form-input"
              value={selectedResv?.serviceTitle || ''}
              disabled
              style={{ background: '#f5f5f4' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">상담 / 제작 요청 메모 *</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="상담을 원하시는 공간 정보나 제작 희망 작품에 대한 메모를 남겨주세요."
              value={memoInput}
              onChange={(e) => setMemoInput(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={15} /> 메모 저장
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
