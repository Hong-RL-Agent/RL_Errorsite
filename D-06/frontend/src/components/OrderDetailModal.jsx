'use client';
import React, { useState, useEffect } from 'react';
import { X, Save, Clock, PackageCheck, User, MapPin } from 'lucide-react';
import { fetchOrderDetail, updateItemQuantity } from '../lib/api';

export default function OrderDetailModal({ order, filterContext, onClose, onRefresh, onShowToast }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingQuantities, setEditingQuantities] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      loadDetail();
    }
  }, [order]);

  async function loadDetail() {
    try {
      setLoading(true);
      const res = await fetchOrderDetail(order.id);
      if (res.success) {
        setDetail(res.data);
        const qtyMap = {};
        (res.data.items || []).forEach(it => {
          qtyMap[it.id] = it.quantity;
        });
        setEditingQuantities(qtyMap);
      }
    } catch (err) {
      console.error(err);
      onShowToast('주문 상세 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveQuantity(itemId) {
    if (!detail) return;
    const newQty = editingQuantities[itemId];
    try {
      setSaving(true);
      const res = await updateItemQuantity(detail.id, itemId, newQty, filterContext);
      if (res.success) {
        onShowToast('주문 품목 수량 및 총액이 저장되었습니다.');
        loadDetail();
        onRefresh();
      }
    } catch (err) {
      console.error(err);
      onShowToast('수량 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  if (!order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              주문 상세 정보 [ {order.order_no} ]
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>주문일시: {order.order_date}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ borderRadius: '50%', padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {loading || !detail ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              상세 데이터를 불러오는 중입니다...
            </div>
          ) : (
            <div>
              {/* 고객 & 배송지 정보 박스 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px', marginBottom: '8px', color: '#0f172a' }}>
                    <User size={14} color="#f97316" />
                    <span>주문 고객 정보</span>
                  </div>
                  <div style={{ fontSize: '13px' }}>성명: <strong>{detail.customer_name}</strong></div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>연락처: {detail.customer_phone}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>이메일: {detail.customer_email}</div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px', marginBottom: '8px', color: '#0f172a' }}>
                    <MapPin size={14} color="#f97316" />
                    <span>배송지 주소</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e293b' }}>{detail.address}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    운송장: {detail.courier ? `${detail.courier} (${detail.tracking_number})` : '미발급 (출고 준비중)'}
                  </div>
                </div>
              </div>

              {/* 주문 상품 목록 및 수량 수정 */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: '#0f172a' }}>
                  주문 상품 내역 (수량 변경 및 총액 계산)
                </h4>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>상품명</th>
                        <th>단가</th>
                        <th>수량</th>
                        <th>품목 금액</th>
                        <th style={{ textAlign: 'center' }}>수량 저장</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.items || []).map(it => (
                        <tr key={it.id}>
                          <td style={{ fontWeight: '600' }}>{it.product_name}</td>
                          <td>{Number(it.unit_price).toLocaleString()}원</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={editingQuantities[it.id] !== undefined ? editingQuantities[it.id] : it.quantity}
                              onChange={e => setEditingQuantities({ ...editingQuantities, [it.id]: parseInt(e.target.value, 10) || 1 })}
                              style={{ width: '60px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                          </td>
                          <td style={{ fontWeight: '700', color: '#0f172a' }}>
                            {Number(it.subtotal).toLocaleString()}원
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleSaveQuantity(it.id)}
                              disabled={saving}
                              title="수량 변경사항을 적용하고 총액을 재계산합니다."
                            >
                              <Save size={12} />
                              <span>저장</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 주문 총액 요약 바 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', padding: '14px 20px', backgroundColor: '#fff7ed', borderRadius: '8px', marginTop: '12px', border: '1px solid #fed7aa' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#9a3412' }}>최종 주문 총액 :</span>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: '#ea580c' }} data-field="order-total-amount">
                    {Number(detail.total_amount).toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* 주문 타임라인 로그 */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} color="#64748b" />
                  <span>주문 처리 이력 타임라인</span>
                </h4>
                <div style={{ maxHeight: '160px', overflowY: 'auto', padding: '8px 12px' }}>
                  {(detail.logs || []).map(l => (
                    <div key={l.id} className="timeline-item">
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                        {l.note}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {l.action} · {l.created_at}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
