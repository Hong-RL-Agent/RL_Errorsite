import React from 'react';

function BudgetBars({ transactions, budgetLimits }) {
  return (
    <div className="budget-section">
      <h2>카테고리별 예산</h2>
      <div className="budget-bars">
        {Object.entries(budgetLimits).map(([cat, limit]) => {
          const spent = transactions
            .filter(t => t.category === cat && t.type === 'expense')
            .reduce((s, t) => s + Math.abs(t.amount), 0);
          const pct = Math.min((spent / limit) * 100, 100);
          const over = spent > limit;
          return (
            <div key={cat} className="budget-bar-card">
              <div className="cat-label">
                <span>{cat}</span>
                <span>{spent.toLocaleString()}원 / {limit.toLocaleString()}원</span>
              </div>
              <div className="bar-track">
                <div className={`bar-fill ${over ? 'over' : ''}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BudgetBars;
