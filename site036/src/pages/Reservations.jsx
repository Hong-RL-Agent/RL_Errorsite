import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, User, Plus, Edit3, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function Reservations({ showToast }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit reservation note state (SEC-337)
  const [editingRes, setEditingRes] = useState(null);
  const [editNote, setEditNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // New reservation modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [roomName, setRoomName] = useState('메인 컨퍼런스 룸 A (12인실)');
  const [resDate, setResDate] = useState('2026-04-20');
  const [resTime, setResTime] = useState('14:00 - 16:00');
  const [purpose, setPurpose] = useState('');
  const [note, setNote] = useState('');

  const loadReservations = () => {
    fetch('/api/reservations')
      .then(res => res.json())
      .then(data => {
        setReservations(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadReservations();
  }, []);

  // Save reservation note (SEC-337 / site036-bug07)
  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!editingRes) return;

    setSavingNote(true);
    const idempotency_key = `RES-NOTE-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch(`/api/reservations/${editingRes.id}/note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        note: editNote,
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setSavingNote(false);
      setEditingRes(null);
      loadReservations();
      showToast('예약 메모 저장 완료', '회의실 예약 특이사항 메모가 성공적으로 반영되었습니다.', 'success', data.transaction_id);
    })
    .catch(err => {
      console.error(err);
      setSavingNote(false);
    });
  };

  // Create new reservation
  const handleCreateReservation = (e) => {
    e.preventDefault();
    if (!purpose.trim()) return;

    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName,
        date: resDate,
        time: resTime,
        purpose,
        note
      })
    })
    .then(res => res.json())
    .then(data => {
      setNewModalOpen(false);
      setPurpose('');
      setNote('');
      loadReservations();
      showToast('예약 완료', `[${data.roomName}] 예약이 확정되었습니다.`, 'success');
    })
    .catch(err => console.error(err));
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>회의실 및 자원 예약</h2>
          <p className="card-subtitle">팀 회의, 프로젝트 리뷰 및 포커스 부스 일정을 관리합니다.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setNewModalOpen(true)}>
          <Plus size={16} /> 새 회의실 예약
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
        {reservations.map(r => (
          <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge badge-confirmed">{r.type}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> {r.date}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '8px' }}>
                {r.roomName}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--navy-800)', fontWeight: 600, marginBottom: '4px' }}>
                목적: {r.purpose}
              </p>
              <div style={{ fontSize: '0.84rem', color: 'var(--gray-500)', marginBottom: '14px' }}>
                시간: {r.time} · 예약자: {r.organizer}
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', minHeight: '52px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', marginBottom: '2px' }}>
                  예약 메모 & 준비사항:
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--gray-500)' }}>
                  {r.note || '등록된 특이사항 메모가 없습니다.'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '18px', borderTop: '1px solid var(--gray-100)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEditingRes(r);
                  setEditNote(r.note || '');
                }}
              >
                <Edit3 size={14} /> 메모 수정
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Note Modal (SEC-337) */}
      <Modal
        isOpen={!!editingRes}
        onClose={() => setEditingRes(null)}
        title={editingRes ? `[${editingRes.roomName}] 예약 메모 저장` : '예약 메모'}
      >
        <form onSubmit={handleSaveNote}>
          <div className="form-group">
            <label className="form-label">회의 준비 메모 및 안내사항</label>
            <textarea
              className="form-control"
              value={editNote}
              onChange={e => setEditNote(e.target.value)}
              placeholder="필요 장비, 화상회의 링크, 다과 준비 여부 등을 작성해 주세요."
              rows="4"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingRes(null)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={savingNote}>
              {savingNote ? '저장 중...' : '메모 저장'}
            </button>
          </div>
        </form>
      </Modal>

      {/* New Reservation Modal */}
      <Modal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="신규 회의실 / 자원 예약"
      >
        <form onSubmit={handleCreateReservation}>
          <div className="form-group">
            <label className="form-label">회의실 / 공간 선택</label>
            <select 
              className="form-control"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
            >
              <option value="메인 컨퍼런스 룸 A (12인실)">메인 컨퍼런스 룸 A (12인실)</option>
              <option value="크리에이티브 스튜디오 B (8인실)">크리에이티브 스튜디오 B (8인실)</option>
              <option value="포커스 부스 1호 (1인실)">포커스 부스 1호 (1인실)</option>
              <option value="포커스 부스 2호 (1인실)">포커스 부스 2호 (1인실)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">예약 날짜</label>
              <input 
                type="date" 
                className="form-control" 
                value={resDate} 
                onChange={e => setResDate(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">이용 시간</label>
              <input 
                type="text" 
                className="form-control" 
                value={resTime} 
                onChange={e => setResTime(e.target.value)} 
                placeholder="예: 14:00 - 15:30" 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">회의 목적</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="예: 클라이언트 데모 시연" 
              value={purpose} 
              onChange={e => setPurpose(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">사전 준비 메모</label>
            <textarea 
              className="form-control" 
              placeholder="화상 장비 세팅 요청 등" 
              value={note} 
              onChange={e => setNote(e.target.value)} 
              rows="2" 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setNewModalOpen(false)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={!purpose.trim()}>
              예약 확정
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
