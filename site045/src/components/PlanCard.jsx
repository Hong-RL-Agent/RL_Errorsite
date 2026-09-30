import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

export default function PlanCard({
  plan,
  billingCycle,
  currentPlanId,
  onSelectPlan
}) {
  const isCurrent = currentPlanId?.includes(plan.id);
  const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <div className={`pricing-card ${plan.id === 'premium' ? 'popular' : ''}`}>
      {plan.id === 'premium' && <span className="popular-badge">가장 인기있는 선택</span>}

      <h3 className="plan-name">{plan.name}</h3>
      <p className="plan-desc">{plan.description}</p>

      <div className="plan-price-row">
        <span className="plan-price">{price.toLocaleString()}원</span>
        <span className="plan-period">/ {billingCycle === 'yearly' ? '년 (연간 17% 할인)' : '월'}</span>
      </div>

      <div className="plan-features-list">
        {plan.features.map((feat, idx) => (
          <div key={idx} className="feature-item">
            <Check size={16} color="#10b981" />
            <span>{feat}</span>
          </div>
        ))}
      </div>

      <button
        className="btn-primary"
        onClick={() => onSelectPlan(plan, billingCycle)}
        style={{ width: '100%', justifyContent: 'center', background: isCurrent ? '#f1f5f9' : undefined, color: isCurrent ? '#64748b' : undefined, border: isCurrent ? '1px solid #cbd5e1' : undefined }}
      >
        {isCurrent ? '현재 이용 중인 플랜' : '이 플랜으로 변경하기'}
      </button>
    </div>
  );
}
