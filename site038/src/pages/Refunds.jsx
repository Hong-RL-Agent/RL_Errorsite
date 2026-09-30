import React, { useState, useEffect } from 'react';
import { RotateCcw, AlertCircle, Plus, Send } from 'lucide-react';
import Modal from '../components/Modal';

export default function Refunds({ showToast }) {
  const [refunds, setRefunds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [orderId, setOrderId] = useState('order-701');
  const [reason, setReason] = useState('상품이 설명과 다릅니다.');
  const [submitting, setSubmitting] = useState(false);

  const loadRefunds = () => {
    fetch('/api/refunds')
      .then(res => res.json())
      .then(d => setRefunds(d))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  // Submit Refund Reason (SEC-354 / site038-bug04)
  const handleSubmitRefund = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setSubmitting(true);
    const idempotency_key = `REFUND-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/refunds/reason', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        reason: reason.trim(),
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setSubmitting(false);
      setModalOpen(false);
      loadRefunds();
      showToast('환불 사유 접수 완료', `[주문번호: ${orderId}] 환불 사유가 성공적으로 등록되었습니다.`, 'success', data.transaction_id, data.bugId, data.secId);
    })
    .catch(err => {
      console.error(err);
      setSubmitting(false);
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)' }}>굿즈 주문 환불 및 교환 관리</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>크리에이터 스토어 고객 환불 사유 및 주문 취소 접수 내역</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> 환불 사유 등록
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>환불 ID</th>
              <th>주문 번호</th>
              <th>고객명</th>
              <th>환불 금액</th>
              <th>상세 사유</th>
              <th>접수일</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{r.id}</td>
                <td>{r.orderId}</td>
                <td style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{r.customerName}</td>
                <td style={{ fontWeight: 700, color: 'var(--accent)' }}>₩{r.amount.toLocaleString()}</td>
                <td style={{ color: 'var(--gray-600)' }}>{r.reason}</td>
                <td style={{ fontSize: '0.84rem', color: 'var(--gray-400)' }}>{r.requestedAt}</td>
                <td>
                  <span className={`badge badge-${r.status === '처리완료' ? 'success' : 'warning'}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Refund Modal (SEC-354) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="환불 사유 접수 및 변경"
      >
        <form onSubmit={handleSubmitRefund}>
          <div className="form-group">
            <label className="form-label">대상 주문 번호</label>
            <input
              type="text"
              className="form-control"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">상세 환불 및 반품 사유</label>
            <textarea
              className="form-control"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="예: 상품이 설명과 다릅니다, 사이즈 오배송 등"
              rows="4"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !reason.trim()}>
              <Send size={14} /> {submitting ? '접수 중...' : '환불 사유 제출'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
