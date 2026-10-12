import React from 'react';
import { ArrowDownRight, ArrowUpRight, PiggyBank, Landmark, TrendingUp } from 'lucide-react';

export default function SummaryCards({ stats, accounts }) {
  const totalAssets = accounts.reduce((acc, a) => acc + a.balance, 0);

  const formatKRW = (val) => {
    return new Intl.NumberFormat('ko-KR').format(val || 0) + '원';
  };

  return (
    <div className="summary-grid">
      {/* 1. Monthly Income */}
      <div className="kpi-card highlight">
        <div className="kpi-header">
          <span className="kpi-label">이번 달 총 수입</span>
          <div className="kpi-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <ArrowDownRight size={20} />
          </div>
        </div>
        <div className="kpi-value" style={{ color: '#059669' }}>
          {formatKRW(stats?.total_income)}
        </div>
        <div className="kpi-footer">
          <TrendingUp size={14} color="#059669" />
          <span>정기 급여 및 부수입 입금 포함</span>
        </div>
      </div>

      {/* 2. Monthly Expense */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-label">이번 달 총 지출</span>
          <div className="kpi-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <ArrowUpRight size={20} />
          </div>
        </div>
        <div className="kpi-value" style={{ color: '#DC2626' }}>
          {formatKRW(stats?.total_expense)}
        </div>
        <div className="kpi-footer">
          <span>총 {stats?.transaction_count || 0}건의 결제 지출</span>
        </div>
      </div>

      {/* 3. Net Savings */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-label">이번 달 순 저축액</span>
          <div className="kpi-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
            <PiggyBank size={20} />
          </div>
        </div>
        <div className="kpi-value" style={{ color: stats?.net_savings >= 0 ? '#0284C7' : '#EF4444' }}>
          {formatKRW(stats?.net_savings)}
        </div>
        <div className="kpi-footer">
          <span>저축률: {stats?.total_income > 0 ? ((stats.net_savings / stats.total_income) * 100).toFixed(1) : 0}%</span>
        </div>
      </div>

      {/* 4. Total Net Worth */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-label">연결 자산 총 잔액</span>
          <div className="kpi-icon" style={{ background: '#F3E8FF', color: '#7E22CE' }}>
            <Landmark size={20} />
          </div>
        </div>
        <div className="kpi-value" style={{ color: '#1E293B' }}>
          {formatKRW(totalAssets)}
        </div>
        <div className="kpi-footer">
          <span>총 {accounts.length}개 은행 및 페이 계좌 합산</span>
        </div>
      </div>
    </div>
  );
}
