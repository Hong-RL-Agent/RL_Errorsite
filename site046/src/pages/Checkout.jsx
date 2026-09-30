import React, { useEffect, useState } from 'react';
import { MapPin, Clock, Coins, ShieldCheck, Check, Plus, AlertTriangle } from 'lucide-react';
import { fetchApi } from '../api/client';
import { showToast } from '../components/Toast';

export default function Checkout({ onOrderSuccess, onNavigateAddresses }) {
  const [summary, setSummary] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('slot-1');
  const [usedPoints, setUsedPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    setLoading(true);
    try {
      const [sumData, addrData, slotData] = await Promise.all([
        fetchApi('/api/checkout/summary'),
        fetchApi('/api/addresses'),
        fetchApi('/api/delivery/slots')
      ]);

      setSummary(sumData);
      setAddresses(addrData.addresses || []);
      setSlots(slotData.slots || []);

      if (sumData.address) {
        setSelectedAddressId(sumData.address.id);
      } else if (addrData.addresses?.length > 0) {
        setSelectedAddressId(addrData.addresses[0].id);
      }
    } catch (err) {
      showToast('오류', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = async (addrId) => {
    setSelectedAddressId(addrId);
    try {
      const data = await fetchApi('/api/checkout/address', {
        method: 'PATCH',
        body: JSON.stringify({ addressId: addrId })
      });
      // Refresh summary
      const sumData = await fetchApi('/api/checkout/summary');
      setSummary(sumData);
      showToast('배송지 변경', '선택하신 배송지로 변경되었습니다.', 'info');
    } catch (err) {
      showToast('오류', err.message, 'error');
    }
  };

  const handleApplyAllPoints = () => {
    if (!summary) return;
    const maxUsable = Math.min(summary.availablePoints, summary.finalTotal);
    setUsedPoints(maxUsable);
  };

  const handleCreateOrder = async () => {
    setSubmitting(true);
    try {
      const orderRes = await fetchApi('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          addressId: selectedAddressId,
          slotId: selectedSlotId,
          couponId: summary?.appliedCoupon?.id || null,
          usedPoints: Number(usedPoints) || 0
        })
      });

      showToast('주문 완료!', `주문번호: ${orderRes.order.id}이 성공적으로 접수되었습니다.`, 'success');
      onOrderSuccess(orderRes.order);
    } catch (err) {
      showToast('주문 실패', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !summary) {
    return (
      <div className="main-wrapper" style={{ textAlign: 'center', padding: '100px 0' }}>
        <p style={{ color: '#64748b', fontSize: '16px' }}>주문서를 불러오는 중입니다...</p>
      </div>
    );
  }

  const finalPayAmount = Math.max(0, summary.finalTotal - usedPoints);
  const expectedPoints = Math.floor(finalPayAmount * 0.01);

  return (
    <div className="main-wrapper">
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>주문서 / 결제하기</h1>

      <div className="two-col-layout">
        <div>
          {/* 1. Delivery Address Selection */}
          <div className="card-box">
            <div className="card-box-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color="#10b981" />
                <span>배송지 정보</span>
              </div>
              <button
                onClick={onNavigateAddresses}
                style={{ fontSize: '13px', color: '#059669', fontWeight: 700 }}
              >
                + 새 배송지 추가
              </button>
            </div>

            <div>
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`address-item-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                  onClick={() => handleSelectAddress(addr.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14.5px' }}>{addr.name}</span>
                      {addr.isDefault && (
                        <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>기본</span>
                      )}
                      <span className={addr.isDeliverable ? 'badge-deliverable' : 'badge-undeliverable'}>
                        {addr.isDeliverable ? '배송가능권역' : '배송불가권역'}
                      </span>
                    </div>
                    <div style={{ fontSize: '13.5px', color: '#334155' }}>
                      {addr.address} {addr.detailAddress}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      수령인: {addr.receiver} ({addr.phone})
                    </div>
                  </div>

                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: selectedAddressId === addr.id ? '2px solid #10b981' : '2px solid #cbd5e1',
                    background: selectedAddressId === addr.id ? '#10b981' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    {selectedAddressId === addr.id && <Check size={14} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Delivery Time Slot */}
          <div className="card-box">
            <div className="card-box-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="#10b981" />
                <span>도착 희망 시간 선택</span>
              </div>
            </div>

            <div>
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`slot-card ${selectedSlotId === slot.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSlotId(slot.id)}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#1e293b' }}>{slot.title}</div>
                    <div style={{ fontSize: '12.5px', color: '#64748b' }}>{slot.sub}</div>
                  </div>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: selectedSlotId === slot.id ? '6px solid #10b981' : '2px solid #cbd5e1'
                  }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Loyalty Points Usage */}
          <div className="card-box">
            <div className="card-box-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coins size={20} color="#10b981" />
                <span>적립금(포인트) 사용</span>
              </div>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                보유 잔액: <strong>{summary.availablePoints.toLocaleString()}P</strong>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                min="0"
                max={summary.availablePoints}
                value={usedPoints}
                onChange={(e) => setUsedPoints(Math.min(summary.availablePoints, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleApplyAllPoints}
                style={{
                  padding: '10px 16px',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#1e293b',
                  border: '1px solid #cbd5e1'
                }}
              >
                전액 사용
              </button>
            </div>
          </div>

          {/* 4. Ordered Items Preview */}
          <div className="card-box">
            <div className="card-box-title">
              <span>주문 상품 정보 ({summary.items?.length || 0}개)</span>
            </div>

            <div>
              {summary.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <img src={item.product?.image} alt={item.product?.name} style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{item.product?.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>수량 {item.quantity}개</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '14px' }}>
                    {(item.price * item.quantity).toLocaleString()}원
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Payment Details */}
        <div>
          <div className="card-box" style={{ position: 'sticky', top: '100px' }}>
            <div className="card-box-title">최종 결제 금액</div>

            <div className="summary-row">
              <span>주문 상품 금액</span>
              <span style={{ fontWeight: 700 }}>{summary.itemsTotal.toLocaleString()}원</span>
            </div>

            <div className="summary-row">
              <span>배송비</span>
              <span style={{ fontWeight: 700, color: summary.shippingFee === 0 ? '#10b981' : '#1e293b' }}>
                {summary.shippingFee === 0 ? '무료' : `+${summary.shippingFee.toLocaleString()}원`}
              </span>
            </div>

            {summary.discountAmount > 0 && (
              <div className="summary-row">
                <span>쿠폰 할인</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>
                  -{summary.discountAmount.toLocaleString()}원
                </span>
              </div>
            )}

            {usedPoints > 0 && (
              <div className="summary-row">
                <span>포인트 사용</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>
                  -{usedPoints.toLocaleString()}P
                </span>
              </div>
            )}

            <div className="summary-row total">
              <span>최종 결제 금액</span>
              <span style={{ color: '#059669', fontSize: '22px' }}>
                {finalPayAmount.toLocaleString()}원
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', margin: '16px 0', fontSize: '12.5px', color: '#475569' }}>
              ✨ 이번 주문 완료 시 <strong>{expectedPoints.toLocaleString()}P (1%)</strong> 포인트 적립 예정!
            </div>

            <button
              className="primary-btn"
              onClick={handleCreateOrder}
              disabled={submitting}
            >
              {submitting ? '결제 처리 중...' : `${finalPayAmount.toLocaleString()}원 결제하기`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
