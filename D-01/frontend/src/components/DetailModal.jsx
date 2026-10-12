import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Calendar, 
  DollarSign, 
  User, 
  CheckCircle, 
  AlertTriangle,
  RotateCcw,
  Zap
} from 'lucide-react';

export default function DetailModal({ 
  subscription, 
  onClose, 
  onUpdatePlan, 
  onToggleAutoRenew,
  onOpenCancelConfirm 
}) {
  if (!subscription) return null;

  const [selectedPlan, setSelectedPlan] = useState(subscription.plan_name);
  const [selectedCycle, setSelectedCycle] = useState(subscription.billing_cycle);
  const [priceInput, setPriceInput] = useState(subscription.price);

  useEffect(() => {
    setSelectedPlan(subscription.plan_name);
    setSelectedCycle(subscription.billing_cycle);
    setPriceInput(subscription.price);
  }, [subscription]);

  // Plan list based on service
  const planOptions = subscription.service_name === 'Notion'
    ? ['Plus', 'Business', 'Enterprise']
    : subscription.service_name === 'Slack'
    ? ['Pro', 'Business+', 'Enterprise Grid']
    : subscription.service_name === 'GitHub Copilot'
    ? ['Individual', 'Business', 'Enterprise']
    : ['Basic', 'Standard', 'Pro', 'Enterprise'];

  const handlePlanSave = () => {
    let newPrice = priceInput;
    if (selectedPlan === 'Business' && subscription.service_name === 'Notion') {
      newPrice = 18.0;
    } else if (selectedPlan === 'Enterprise' && subscription.service_name === 'Notion') {
      newPrice = 25.0;
    }

    onUpdatePlan(subscription.id, {
      plan_name: selectedPlan,
      billing_cycle: selectedCycle,
      price: newPrice
    });
  };

  // BUG-D01-03: Visual display in modal for GitHub Copilot (id 3) also stays ON
  const isSwitchChecked = subscription.id === 3 ? true : Boolean(subscription.auto_renew);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, var(--primary-600), var(--accent-indigo))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Zap size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
                {subscription.service_name} 상세 관리
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                구독 ID: #{subscription.id} · {subscription.category}
              </span>
            </div>
          </div>
          <button className="icon-btn" style={{ width: '32px', height: '32px' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Status info box */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '12px',
            background: 'var(--bg-input)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>현재 상태</span>
              <div style={{ marginTop: '4px' }}>
                <span className={`badge ${subscription.status === 'ACTIVE' ? 'badge-active' : 'badge-cancelled'}`}>
                  {subscription.status === 'ACTIVE' ? '이용 중 (Active)' : '해지 완료'}
                </span>
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>담당 계정</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '4px', color: 'var(--text-main)' }}>
                {subscription.account_user}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>시작일자</span>
              <div style={{ fontSize: '0.85rem', marginTop: '4px', color: 'var(--text-secondary)' }}>
                {subscription.started_at}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>다음 결제일</span>
              <div style={{ fontSize: '0.85rem', marginTop: '4px', color: '#A78BFA', fontWeight: 600 }}>
                {subscription.next_billing_at}
              </div>
            </div>
          </div>

          {/* Plan Settings Section */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: '#F8FAFC' }}>
              요금제 및 결제 주기 변경
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  요금제 선택
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                >
                  {planOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt} 플랜</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  청구 주기
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                  value={selectedCycle}
                  onChange={(e) => setSelectedCycle(e.target.value)}
                >
                  <option value="monthly">월간 청구 (Monthly)</option>
                  <option value="yearly">연간 청구 (Yearly)</option>
                </select>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
              onClick={handlePlanSave}
            >
              <span>요금제 변경사항 저장</span>
            </button>
          </div>

          {/* Auto Renew Setting */}
          <div style={{ 
            borderTop: '1px solid var(--border-subtle)', 
            paddingTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#F8FAFC' }}>자동 결제 갱신 설정</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                활성화 시 다음 결제일에 등록된 법인 카드로 자동 청구됩니다.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isSwitchChecked}
                  onChange={() => onToggleAutoRenew(subscription.id, !subscription.auto_renew)}
                />
                <span className="slider" />
              </label>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isSwitchChecked ? '#A78BFA' : '#64748B' }}>
                {isSwitchChecked ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          {/* Cancellation Danger Zone */}
          {subscription.status === 'ACTIVE' && (
            <div style={{ 
              borderTop: '1px solid var(--border-subtle)', 
              paddingTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(244, 63, 94, 0.05)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed rgba(244, 63, 94, 0.25)'
            }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FDA4AF' }}>구독 계약 해지</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  해지 시 다음 갱신일부터 서비스 라이선스가 회수됩니다.
                </div>
              </div>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => onOpenCancelConfirm(subscription)}
              >
                <span>구독 해지</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
