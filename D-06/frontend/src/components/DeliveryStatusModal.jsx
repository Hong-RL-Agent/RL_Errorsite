'use client';
import React, { useState } from 'react';
import { X, Truck, Check } from 'lucide-react';
import { updateDelivery } from '../lib/api';

export default function DeliveryStatusModal({ order, filterContext, onClose, onRefresh, onShowToast }) {
  const [deliveryStatus, setDeliveryStatus] = useState(order?.delivery_status || 'PREPARING');
  const [courier, setCourier] = useState(order?.courier || 'CJ대한통운');
  const [trackingNumber, setTrackingNumber] = useState(order?.tracking_number || '');
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await updateDelivery(
        order.id,
        {
          deliveryStatus,
          courier,
          trackingNumber
        },
        filterContext
      );
      if (res.success) {
        onShowToast(`[${order.order_no}] 배송 정보가 성공적으로 반영되었습니다.`);
        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error(err);
      onShowToast('배송 상태 변경에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} color="#f97316" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              배송 상태 변경 및 운송장 번호 등록
            </h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ borderRadius: '50%', padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '18px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                주문번호: {order.order_no}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                고객명: {order.customer_name} · 수령지: {order.address}
              </div>
            </div>

            <div className="form-field">
              <label>변경할 배송 상태</label>
              <select
                className="select-box"
                style={{ width: '100%' }}
                value={deliveryStatus}
                onChange={e => setDeliveryStatus(e.target.value)}
              >
                <option value="PREPARING">배송 준비중 (PREPARING)</option>
                <option value="SHIPPING">배송 중 (SHIPPING)</option>
                <option value="DELIVERED">배송 완료 (DELIVERED)</option>
              </select>
            </div>

            <div className="form-field">
              <label>택배사 선택</label>
              <select
                className="select-box"
                style={{ width: '100%' }}
                value={courier}
                onChange={e => setCourier(e.target.value)}
              >
                <option value="CJ대한통운">CJ대한통운</option>
                <option value="우체국택배">우체국택배</option>
                <option value="한진택배">한진택배</option>
                <option value="로젠택배">로젠택배</option>
                <option value="롯데택배">롯데택배</option>
              </select>
            </div>

            <div className="form-field">
              <label>운송장 번호 입력</label>
              <input
                type="text"
                className="input-text"
                placeholder="숫자 10~12자리 운송장 번호"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Check size={14} />
              <span>{submitting ? '저장 중...' : '배송 정보 저장'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
