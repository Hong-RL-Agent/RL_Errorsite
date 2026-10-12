import React from 'react';
import { Target, Edit3 } from 'lucide-react';

export default function BudgetProgress({ budgets, transactions, onEditBudget }) {
  const formatKRW = (val) => new Intl.NumberFormat('ko-KR').format(val || 0) + '원';

  // Calculate actual spent per category
  const expenseMap = {};
  for (const t of transactions) {
    if (t.type === 'EXPENSE') {
      expenseMap[t.category_id] = (expenseMap[t.category_id] || 0) + t.amount;
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 className="card-title">
            <Target size={18} color="var(--mint-600)" />
            <span>월별 카테고리 예산 진행률</span>
          </h3>
          <p className="card-subtitle">목표 지출 한도 대비 실소비 현황</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {budgets.map((b) => {
          const spent = expenseMap[b.category_id] || 0;
          
          // BUG-D02-05 Implementation:
          // For category_id === 1 (식비), frontend display locks to 500,000 KRW
          const targetBudget = b.category_id === 1 ? 500000 : b.monthly_budget;
          const ratio = targetBudget > 0 ? (spent / targetBudget) * 100 : 0;
          const isOver = spent > targetBudget;

          return (
            <div key={b.id} style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{b.category_name}</span>
                  <span style={{ fontSize: '0.78rem', color: isOver ? '#DC2626' : '#059669', fontWeight: 600 }}>
                    {ratio.toFixed(1)}% {isOver ? '(초과)' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {formatKRW(spent)} / <strong>{formatKRW(targetBudget)}</strong>
                  </span>
                  <button 
                    className="btn btn-outline btn-sm"
                    style={{ padding: '3px 8px', height: '26px' }}
                    onClick={() => onEditBudget(b)}
                    title="예산 수정"
                  >
                    <Edit3 size={12} />
                  </button>
                </div>
              </div>

              <div className="progress-bar-bg" style={{ height: '7px' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, ratio)}%`,
                    backgroundColor: isOver ? '#EF4444' : ratio > 80 ? '#F59E0B' : '#10B981'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
