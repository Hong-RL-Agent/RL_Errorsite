'use client';
import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { cancelOrder } from '../lib/api';

export default function CancelOrderModal({ order, filterContext, onClose, onRefresh, onShowToast }) {
  const [reason, setReason] = useState('고객 단순 변심 취소');
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await cancelOrder(order.id, reason, filterContext);
      if (res.success) {
        onShowToast(`[${order.order_no}] 주문 취소 처리가 완료되었습니다.`);
        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error(err);
      onShowToast('주문 취소 처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="#ef4444" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              주문 취소 처리 확인
            </h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ borderRadius: '50%', padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ backgroundColor: '#fef2f2', padding: '14px', borderRadius: '8px', marginBottom: '18px', border: '1px solid #fee2e2' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#991b1b' }}>
                주문번호: {order.order_no} (결제금액: {Number(order.total_amount).toLocaleString()}원)
              </div>
              <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '4px' }}>
                주문 고객: {order.customer_name} ({order.customer_phone})
              </div>
            </div>

            <div className="form-field">
              <label>주문 취소 사유 입력</label>
              <textarea
                className="input-text"
                rows="3"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="상세 취소 사유를 입력하세요..."
                required
              />
            </div>

            <p style={{ fontSize: '12px', color: '#64748b' }}>
              * 취소 확정 시 결제 취소 및 출고 보류 처리가 진행됩니다.
            </p>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              돌아가기
            </button>
            <button type="submit" className="btn btn-danger" disabled={submitting}>
              <span>{submitting ? '처리 중...' : '주문 취소 확정'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
