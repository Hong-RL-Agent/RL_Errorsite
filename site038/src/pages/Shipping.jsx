import React, { useState, useEffect } from 'react';
import { Truck, Edit3, Package, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function Shipping({ showToast }) {
  const [shipments, setShipments] = useState([]);
  const [editingShip, setEditingShip] = useState(null);
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  const loadShipments = () => {
    fetch('/api/shipping')
      .then(res => res.json())
      .then(d => setShipments(d))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadShipments();
  }, []);

  // Save Memo handler (SEC-353 / site038-bug03)
  const handleSaveMemo = (e) => {
    e.preventDefault();
    if (!editingShip) return;

    setSaving(true);
    const idempotency_key = `SHIP-MEMO-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch(`/api/shipping/${editingShip.id}/memo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memo: memo.trim(),
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setSaving(false);
      setEditingShip(null);
      loadShipments();
      showToast('배송 메모 저장 완료', '굿즈 배송 특이사항 메모가 안전하게 저장되었습니다.', 'success', data.transaction_id, data.bugId, data.secId);
    })
    .catch(err => {
      console.error(err);
      setSaving(false);
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)' }}>크리에이터 굿즈 배송 및 물류 관리</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>채널 굿즈 및 구독자 리워드 출고 상태와 배송 요청사항</p>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>배송 ID</th>
              <th>수령인</th>
              <th>상품명</th>
              <th>운송장 번호</th>
              <th>배송 메모</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{s.id}</td>
                <td style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{s.recipient}</td>
                <td>{s.item}</td>
                <td style={{ fontSize: '0.84rem', color: 'var(--gray-500)' }}>{s.trackingNo}</td>
                <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{s.memo || '-'}</td>
                <td>
                  <span className={`badge badge-${s.status === '배송완료' ? 'success' : 'warning'}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditingShip(s);
                      setMemo(s.memo || '');
                    }}
                  >
                    <Edit3 size={14} /> 메모 수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Memo Modal (SEC-353) */}
      <Modal
        isOpen={!!editingShip}
        onClose={() => setEditingShip(null)}
        title={editingShip ? `[${editingShip.recipient} 님] 배송 메모 저장` : '배송 메모'}
      >
        <form onSubmit={handleSaveMemo}>
          <div className="form-group">
            <label className="form-label">택배 기사님 전달 메모</label>
            <textarea
              className="form-control"
              placeholder="예: 부재 시 경비실에 맡겨주세요."
              value={memo}
              onChange={e => setMemo(e.target.value)}
              rows="3"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingShip(null)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? '저장 중...' : '메모 저장'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
