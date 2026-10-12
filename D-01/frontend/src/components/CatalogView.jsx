import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  Plus, 
  Zap, 
  Layers, 
  ExternalLink 
} from 'lucide-react';

export default function CatalogView({ 
  catalog, 
  onSubscribe, 
  searchQuery 
}) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlans, setSelectedPlans] = useState({});

  const filtered = catalog.filter(svc => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return svc.name.toLowerCase().includes(q) ||
           svc.category.toLowerCase().includes(q) ||
           svc.description?.toLowerCase().includes(q);
  });

  const handlePlanChange = (svcId, plan) => {
    setSelectedPlans(prev => ({ ...prev, [svcId]: plan }));
  };

  return (
    <div className="catalog-view">
      {/* Header Banner */}
      <div className="section-card" style={{ 
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(19, 25, 43, 0.9) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A78BFA', marginBottom: '8px' }}>
              <Sparkles size={18} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SaaS App Marketplace
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
              구독 가능한 서비스 카탈로그
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px' }}>
              팀과 조직에 필요한 최적의 SaaS 도구를 손쉽게 구독하고, 통합 인보이스와 중앙 결제로 효율성을 극대화하세요.
            </p>
          </div>

          {/* Billing Cycle Switch */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--bg-input)', 
            padding: '4px', 
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              className={`btn btn-sm ${billingCycle === 'monthly' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setBillingCycle('monthly')}
            >
              월간 청구 (Monthly)
            </button>
            <button
              className={`btn btn-sm ${billingCycle === 'yearly' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setBillingCycle('yearly')}
            >
              연간 청구 (최대 20% 할인)
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '24px' 
      }}>
        {filtered.map((item) => {
          const plans = Array.isArray(item.available_plans) ? item.available_plans : [];
          const currentChosenPlan = selectedPlans[item.id] || plans[0] || 'Standard';
          const price = billingCycle === 'yearly' ? item.base_price_yearly : item.base_price_monthly;

          return (
            <div 
              key={item.id} 
              className="section-card" 
              style={{ 
                margin: 0, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.1))',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#C4B5FD'
                  }}>
                    <Zap size={22} />
                  </div>
                  <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                    {item.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', color: '#FFFFFF' }}>
                  {item.name}
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '18px', minHeight: '42px', lineHeight: '1.45' }}>
                  {item.description}
                </p>

                {/* Price Display */}
                <div style={{ 
                  padding: '12px 14px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>시작 요금</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#A78BFA' }}>
                      ${price.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      / {billingCycle === 'yearly' ? '년' : '월'}
                    </span>
                  </div>
                </div>

                {/* Plan Selection Dropdown */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
                    희망 요금제 선택:
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
                    value={currentChosenPlan}
                    onChange={(e) => handlePlanChange(item.id, e.target.value)}
                  >
                    {plans.map((p) => (
                      <option key={p} value={p}>{p} 플랜</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Button */}
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
                onClick={() => onSubscribe(item.id, currentChosenPlan, billingCycle)}
              >
                <Plus size={16} />
                <span>지금 구독 신청하기</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
