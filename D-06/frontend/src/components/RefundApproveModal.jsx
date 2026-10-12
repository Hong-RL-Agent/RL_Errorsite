'use client';
import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { approveRefund } from '../lib/api';

export default function RefundApproveModal({ order, filterContext, onClose, onRefresh, onShowToast }) {
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  async function handleConfirm() {
    try {
      setSubmitting(true);
      const res = await approveRefund(order.id, filterContext);
      if (res.success) {
        onShowToast(`[${order.order_no}] 환불 승인 처리가 완료되었습니다.`);
        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error(err);
      onShowToast('환불 승인 처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#e11d48" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              환불 요청 승인 처리
            </h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ borderRadius: '50%', padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ backgroundColor: '#fff1f2', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fecdd3' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#be123c' }}>
              주문번호: {order.order_no}
            </div>
            <div style={{ fontSize: '13px', color: '#881337', marginTop: '4px' }}>
              고객명: {order.customer_name} ({order.customer_phone})
            </div>
            <div style={{ fontSize: '13px', color: '#881337', marginTop: '2px' }}>
              환불 요청 금액: <strong>{Number(order.total_amount).toLocaleString()}원</strong>
            </div>
            <div style={{ fontSize: '12px', color: '#9f1239', marginTop: '6px' }}>
              환불 신청 사유: {order.refund_reason || '단순 변심'}
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#475569' }}>
            해당 주문의 환불 요청을 정식 승인하고 PG사 결제 취소 정산 단계로 이관하시겠습니까?
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className="btn btn-danger"
            style={{ backgroundColor: '#e11d48', borderColor: '#e11d48' }}
            onClick={handleConfirm}
            disabled={submitting}
          >
            <span>{submitting ? '승인 중...' : '환불 승인 확정'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
