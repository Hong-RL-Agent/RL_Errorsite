import React, { useState } from 'react';
import PlanCard from '../components/PlanCard';
import Modal from '../components/Modal';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Plans({
  plans = [],
  subscription,
  onPlanChanged,
  showToast
}) {
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedPlanForChange, setSelectedPlanForChange] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Open Preview (triggers SEC-406 check)
  const handleSelectPlan = async (plan, cycle) => {
    setSelectedPlanForChange(plan);
    try {
      const res = await fetch(`/api/billing/preview?newPlanId=${plan.id}&newPlanType=${cycle}`);
      const data = await res.json();
      if (data.success) {
        setPreviewData(data.data);
        setPreviewModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Confirm Plan Change (triggers SEC-406 or SEC-410)
  const handleConfirmChange = async () => {
    if (!selectedPlanForChange) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/subscriptions/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPlanId: selectedPlanForChange.id,
          newPlanType: billingCycle
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          data.message,
          data.bugId || 'site045-SEC-406',
          data.secId || 'SEC-406'
        );
        setPreviewModalOpen(false);
        onPlanChanged();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 36px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 10, letterSpacing: '-0.5px' }}>
          나에게 딱 맞는 멤버십 플랜
        </h2>
        <p style={{ fontSize: 15, color: '#64748b', marginBottom: 24 }}>
          언제든지 위약금 없이 자유롭게 플랜을 변경하거나 일시정지할 수 있습니다.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 4, borderRadius: 9999, border: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: '8px 20px',
              borderRadius: 9999,
              border: 'none',
              background: billingCycle === 'monthly' ? '#ffffff' : 'transparent',
              color: billingCycle === 'monthly' ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: billingCycle === 'monthly' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            월간 결제
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            style={{
              padding: '8px 20px',
              borderRadius: 9999,
              border: 'none',
              background: billingCycle === 'yearly' ? '#ffffff' : 'transparent',
              color: billingCycle === 'yearly' ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: billingCycle === 'yearly' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            연간 결제 (최대 17% 절약 🎁)
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="pricing-grid">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            currentPlanId={subscription?.planId}
            onSelectPlan={handleSelectPlan}
          />
        ))}
      </div>

      {/* Proration Preview Modal (SEC-406) */}
      <Modal
        isOpen={previewModalOpen}
        title="플랜 변경 및 일할 정산 금액 확인"
        onClose={() => setPreviewModalOpen(false)}
        footer={
          <>
            <button
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}
              onClick={() => setPreviewModalOpen(false)}
            >
              취소
            </button>
            <button
              className="btn-primary"
              onClick={handleConfirmChange}
              disabled={isProcessing}
            >
              {isProcessing ? '플랜 변경 처리 중...' : '확인 및 변경 완료'}
            </button>
          </>
        }
      >
        {previewData && (
          <div>
            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                <span>현재 구독 플랜</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{previewData.currentPlan}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                <span>신규 변경 플랜</span>
                <span style={{ fontWeight: 700, color: '#6366f1' }}>{previewData.newPlan}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                <span>신규 플랜 정가</span>
                <span>{previewData.newPrice.toLocaleString()}원</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#10b981', fontWeight: 700, marginBottom: 12 }}>
                <span>기존 결제 일할 크레딧 차감</span>
                <span>-{previewData.prorationCredit.toLocaleString()}원</span>
              </div>
              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                <span>오늘 즉시 결제 금액</span>
                <span style={{ color: '#6366f1' }}>{previewData.finalAmountToCharge.toLocaleString()}원</span>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
              ✓ 플랜 변경 즉시 새로운 혜택과 사용량 한도가 적용되며, 다음 정기 결제일은 <strong>{previewData.nextBillingDate}</strong> 로 갱신됩니다.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
