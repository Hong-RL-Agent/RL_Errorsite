import React, { useState, useEffect } from 'react';
import { ShieldCheck, PauseCircle, PlayCircle, XCircle, AlertTriangle, CheckCircle2, RotateCw } from 'lucide-react';
import Modal from '../components/Modal';

export default function Subscription({ subscription, onStateChanged, showToast }) {
  const [usage, setUsage] = useState({ current: 18, limit: 50 });
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/usage');
      const data = await res.json();
      if (data.success) {
        setUsage(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  // Pause subscription
  const handlePause = async () => {
    if (!confirm('구독을 일시정지하시겠습니까? (최대 30일간 정지 가능)')) return;
    try {
      const res = await fetch('/api/subscriptions/pause', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'info');
        onStateChanged();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Resume subscription (Triggers SEC-408: usage counter reset)
  const handleResume = async () => {
    try {
      const res = await fetch('/api/subscriptions/resume', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(
          data.message,
          data.bugId || 'site045-SEC-408',
          data.secId || 'SEC-408'
        );
        onStateChanged();
        fetchUsage();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel subscription (Triggers SEC-407: immediate benefit revocation)
  const handleConfirmCancel = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/subscriptions/cancel', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(
          data.message,
          data.bugId || 'site045-SEC-407',
          data.secId || 'SEC-407'
        );
        setCancelModalOpen(false);
        onStateChanged();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!subscription) return null;

  const usagePercent = Math.min(100, Math.round((usage.current / usage.limit) * 100));

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>내 구독 & 멤버십 관리</h2>
          <p>구독 상태, 남은 이용 기간 및 이번 달 패스 사용량을 확인하세요.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 28, marginBottom: 36 }}>
        {/* Subscription Status Card */}
        <div style={{ background: '#ffffff', padding: 28, borderRadius: 20, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>구독 정보</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 9999,
                background: subscription.status === 'active' ? '#ecfdf5' : subscription.status === 'paused' ? '#fffbeb' : '#fee2e2',
                color: subscription.status === 'active' ? '#059669' : subscription.status === 'paused' ? '#d97706' : '#b91c1c'
              }}
            >
              {subscription.status === 'active' ? '정상 이용중' : subscription.status === 'paused' ? '일시정지' : '해지 예약됨'}
            </span>
          </div>

          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            {subscription.planName}
          </h3>

          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span>현재 결제 기간: 2026.09.01 ~ 2026.10.20</span>
            <span>월 결제 금액: <strong>{subscription.pricePaid?.toLocaleString()}원</strong></span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 'auto', flexWrap: 'wrap' }}>
            {subscription.status === 'active' ? (
              <button
                onClick={handlePause}
                style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <PauseCircle size={15} />
                구독 일시정지
              </button>
            ) : subscription.status === 'paused' ? (
              <button
                onClick={handleResume}
                className="btn-primary"
                style={{ padding: '10px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <PlayCircle size={15} />
                구독 재개하기
              </button>
            ) : null}

            {subscription.status !== 'inactive' && (
              <button
                onClick={() => setCancelModalOpen(true)}
                style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #fee2e2', background: '#fff5f5', color: '#ef4444', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <XCircle size={15} />
                구독 해지 예약
              </button>
            )}
          </div>
        </div>

        {/* Usage Dashboard Card (SEC-408 observation) */}
        <div style={{ background: '#ffffff', padding: 28, borderRadius: 20, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>이번 달 패스 사용량</h3>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#6366f1' }}>
              {usage.current} / {usage.limit} 회 ({usagePercent}%)
            </span>
          </div>

          <div style={{ width: '100%', height: 10, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden', marginBottom: 20 }}>
            <div
              style={{ width: `${usagePercent}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', borderRadius: 9999, transition: 'width 0.4s ease' }}
            />
          </div>

          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>
            ✓ 스트리밍 1회 재생 당 1패스가 차감되며, 매월 결제 갱신일에 한도가 재충전됩니다.
          </p>

          <button
            onClick={fetchUsage}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            <RotateCw size={14} /> 사용량 실시간 새로고침
          </button>
        </div>
      </div>

      {/* Cancellation Modal (SEC-407) */}
      <Modal
        isOpen={cancelModalOpen}
        title="구독 해지 신청"
        onClose={() => setCancelModalOpen(false)}
        footer={
          <>
            <button
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
              onClick={() => setCancelModalOpen(false)}
            >
              구독 유지하기
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={isProcessing}
              style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              {isProcessing ? '해지 처리 중...' : '해지 예약 확인'}
            </button>
          </>
        }
      >
        <div>
          <div style={{ background: '#fff5f5', padding: 18, borderRadius: 14, border: '1px solid #fee2e2', marginBottom: 16 }}>
            <h4 style={{ color: '#b91c1c', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
              정말 해지하시겠습니까?
            </h4>
            <p style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.6 }}>
              구독을 해지하더라도 <strong>2026년 10월 20일</strong>까지는 결제된 혜택을 계속 이용하실 수 있어야 합니다.
            </p>
          </div>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            해지 신청 즉시 다음 결제일부터 요금이 청구되지 않습니다.
          </p>
        </div>
      </Modal>
    </div>
  );
}
