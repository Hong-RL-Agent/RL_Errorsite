import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';

export default function EditBudgetModal({ budget, onClose, onSubmit }) {
  if (!budget) return null;

  const [monthlyBudget, setMonthlyBudget] = useState(budget.monthly_budget);

  useEffect(() => {
    setMonthlyBudget(budget.monthly_budget);
  }, [budget]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(budget.id, Number(monthlyBudget));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="var(--mint-600)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              [{budget.category_name}] 월간 예산 수정
            </h3>
          </div>
          <button className="btn btn-outline btn-sm" style={{ padding: '4px', borderRadius: '50%' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">목표 월 예산 한도 (원) *</label>
              <input
                type="number"
                className="form-input"
                required
                min="10000"
                step="10000"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                설정한 예산 한도를 바탕으로 월간 지출 진행률 및 초과 경고를 표시합니다.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              예산 변경 적용
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
