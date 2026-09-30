import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, UploadCloud, FileText, Camera, CheckCircle2, AlertCircle, ShieldCheck, MapPin, Calendar, Clock, Truck, X } from 'lucide-react';
import StatusTimeline from '../components/StatusTimeline';
import DeliveryTracker from '../components/DeliveryTracker';
import { api } from '../api/client';

export default function OrderDetail({ orderId, onBack, onNavigateTab }) {
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ETag Status Polling State (SEC-470)
  const [cachedETag, setCachedETag] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Photo Upload State (SEC-466)
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Receipt Modal State (SEC-468 Range preview)
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [rangeMode, setRangeMode] = useState('bytes=0-99');
  const [receiptLoading, setReceiptLoading] = useState(false);

  // Load Order Full Details
  const fetchOrderDetail = async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);

    try {
      // INTENTIONAL BACKEND BUG: site058-SEC-467
      // Promise.all() 중 하나의 실패가 전체 주문 정보 렌더링을 차단하는 오류:
      // 핵심 주문 정보(getOrderById)와 품목(getOrderItems)은 정상이어도,
      // 부가 정보인 배송 정보(getOrderDelivery)가 실패(ord-1004 등에서 500 반환)하면
      // Promise.all 전체가 reject되어 주문 정보 전체가 렌더링되지 않고 에러 화면으로 전환됨.
      const [orderRes, itemsRes, deliveryRes] = await Promise.all([
        api.getOrderById(orderId),
        api.getOrderItems(orderId),
        api.getOrderDelivery(orderId)
      ]);

      if (orderRes?.order) {
        setOrder(orderRes.order);
      }
      if (itemsRes?.items) {
        setItems(itemsRes.items);
      }
      if (deliveryRes?.delivery) {
        setDelivery(deliveryRes.delivery);
      }
    } catch (err) {
      console.error('[FreshLaundry OrderDetail Error]', err);
      setError(err.message || '주문 상세 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  // Refresh Real-time Status with ETag (SEC-470)
  const handleRefreshStatus = async () => {
    if (!order) return;
    setStatusMessage('상태 갱신 확인 중...');
    try {
      // Calls GET /api/orders/:id/status with If-None-Match
      // Server triggers SEC-470: returns 304 Not Modified even if backend status changed
      const res = await api.getOrderStatus(order.id, cachedETag);
      if (res.notModified) {
        setStatusMessage('서버 ETag 검증 완료: 변경 사항 없음 (HTTP 304 Not Modified)');
      } else {
        setCachedETag(res.etag);
        setOrder(prev => ({
          ...prev,
          status: res.status,
          statusStep: res.statusStep
        }));
        setStatusMessage(`최신 상태로 갱신되었습니다: [${res.status}]`);
      }
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage('상태 조회 실패');
    }
  };

  // Photo Upload Handler (SEC-466 Multipart boundary missing trigger)
  const handlePhotoUpload = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append('photo', file);

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      // Calls api.uploadItemPhoto which triggers SEC-466:
      // Explicitly sets headers: { 'Content-Type': 'multipart/form-data' } without boundary!
      const res = await api.uploadItemPhoto(order.id, formData);
      setUploadSuccess('사진이 성공적으로 업로드되었습니다.');
      if (res?.photos) {
        setOrder(prev => ({ ...prev, photos: res.photos }));
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      setUploadError(err.message || '사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Receipt Preview Range Handler (SEC-468)
  const handleOpenReceipt = async (selectedRange = 'bytes=0-99') => {
    setShowReceiptModal(true);
    setReceiptLoading(true);
    setRangeMode(selectedRange);
    try {
      // Calls GET /api/orders/:id/receipt with Range header
      // Server triggers SEC-468: ignores range and returns full content with 200 OK
      const res = await api.getReceiptRange(order.id, selectedRange);
      setReceiptData(res);
    } catch (err) {
      console.error('Receipt preview error:', err);
    } finally {
      setReceiptLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-screen" style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
        <p>주문 상세 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-screen" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertCircle size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
          주문 정보 로딩 실패
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px' }}>
          {error || '주문 정보를 불러올 수 없습니다.'}
        </p>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            background: '#16a34a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          주문 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen" style={{ paddingTop: '28px' }}>
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: '#475569',
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '0.95rem'
        }}
      >
        <ArrowLeft size={18} />
        <span>주문 내역으로 돌아가기</span>
      </button>

      {/* Header Info Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>주문번호: {order.orderNumber}</span>
            <span style={{ fontSize: '0.85rem', background: '#ecfdf5', color: '#15803d', padding: '2px 8px', borderRadius: '9999px', fontWeight: 800 }}>
              {order.status}
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
            {order.serviceName}
          </h1>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
            접수일시: {order.createdAt}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleRefreshStatus}
            style={{
              padding: '10px 16px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.88rem',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={15} />
            <span>상태 새로고침</span>
          </button>

          <button
            onClick={() => handleOpenReceipt('bytes=0-99')}
            style={{
              padding: '10px 18px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.88rem',
              color: '#15803d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={16} />
            <span>영수증 / 인수증</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Status Timeline */}
      <StatusTimeline currentStep={order.statusStep} statusText={order.status} />

      {/* Delivery Tracker */}
      <DeliveryTracker delivery={delivery} />

      {/* Order Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Left: Items List & Photo Upload */}
        <div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>
              맡기신 세탁물 목록 ({items.length}종 / {order.itemCount}개)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{item.icon || '👕'}</span>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>단가 {item.unitPrice.toLocaleString()}원</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.88rem', color: '#64748b' }}>{item.quantity}개</div>
                    <div style={{ fontWeight: 900, color: '#16a34a', fontSize: '1rem' }}>{item.totalPrice.toLocaleString()}원</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Laundry Photos & Upload Box (SEC-466 Trigger) */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} color="#16a34a" />
                세탁물 사진 및 특이사항 등록 ({order.photos?.length || 0})
              </h3>
            </div>

            {uploadError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {order.photos && order.photos.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', overflowX: 'auto' }}>
                {order.photos.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="세탁물 사진"
                    style={{ width: '120px', height: '100px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                  />
                ))}
              </div>
            )}

            <label
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                background: '#f8fafc',
                display: 'block',
                cursor: uploadLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadLoading}
                style={{ display: 'none' }}
              />
              <UploadCloud size={36} color="#16a34a" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                {uploadLoading ? '사진 업로드 처리 중...' : '세탁 전 사진 추가하기'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                오염 부위나 특수 세탁 요청 부위를 촬영하여 업로드하세요.
              </div>
            </label>
          </div>
        </div>

        {/* Right: Pickup Info & Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '14px' }}>
              수거 및 배송 정보
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>수거 주소</span>
                <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{order.address}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>수거 일시</span>
                <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{order.pickupDate} ({order.pickupTime})</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>배송 예정</span>
                <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{order.deliveryDate} ({order.deliveryTime})</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>요청 메모</span>
                <div style={{ color: '#334155', marginTop: '2px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px' }}>
                  {order.pickupNote || '요청사항 없음'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '14px' }}>
              결제 내역 요약
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>
              <span>세탁 총액</span>
              <strong style={{ color: '#0f172a' }}>{order.totalPrice.toLocaleString()}원</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', color: '#64748b' }}>
              <span>왕복 수거·배송비</span>
              <strong style={{ color: '#16a34a' }}>무료</strong>
            </div>
            <div style={{ height: '1px', background: '#f1f5f9', margin: '8px 0 12px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 800, color: '#0f172a' }}>최종 결제 금액</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a' }}>
                {order.totalPrice.toLocaleString()}원
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal with Range Request (SEC-468) */}
      {showReceiptModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#16a34a" />
                전자 세탁 영수증 미리보기
              </h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            {/* Range selection control */}
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span>HTTP Range 요청 헤더:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleOpenReceipt('bytes=0-99')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: rangeMode === 'bytes=0-99' ? '1px solid #16a34a' : '1px solid #cbd5e1',
                    background: rangeMode === 'bytes=0-99' ? '#ecfdf5' : '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Range: 0-99 bytes
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenReceipt('bytes=100-299')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: rangeMode === 'bytes=100-299' ? '1px solid #16a34a' : '1px solid #cbd5e1',
                    background: rangeMode === 'bytes=100-299' ? '#ecfdf5' : '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Range: 100-299 bytes
                </button>
              </div>
            </div>

            {/* Receipt Preview Box */}
            <div style={{ background: '#0f172a', color: '#a7f3d0', padding: '20px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '0.82rem', whiteHeight: '1.5', maxHeight: '320px', overflowY: 'auto', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
              {receiptLoading ? '영수증 데이터를 불러오는 중...' : receiptData?.text}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                응답 상태코드: <strong>{receiptData?.status || 200} OK</strong> (전체 데이터 수신됨)
              </span>
              <button
                onClick={() => setShowReceiptModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
