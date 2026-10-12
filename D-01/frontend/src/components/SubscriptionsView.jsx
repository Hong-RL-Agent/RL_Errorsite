import React, { useState } from 'react';
import { 
  Filter, 
  Search, 
  Settings, 
  Clock, 
  ShieldCheck, 
  User, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function SubscriptionsView({ 
  subscriptions, 
  onSelectSubscription, 
  onToggleAutoRenew,
  searchQuery 
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cycleFilter, setCycleFilter] = useState('ALL');

  const filtered = subscriptions.filter(sub => {
    if (statusFilter !== 'ALL' && sub.status !== statusFilter) return false;
    if (cycleFilter !== 'ALL' && sub.billing_cycle !== cycleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = sub.service_name.toLowerCase().includes(q) ||
                    sub.plan_name.toLowerCase().includes(q) ||
                    sub.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="subscriptions-view">
      {/* Filter and Control Bar */}
      <div className="section-card" style={{ padding: '16px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>상태 필터:</span>
            {['ALL', 'ACTIVE', 'CANCELLED'].map((st) => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === 'ALL' ? '전체 보기' : st === 'ACTIVE' ? '활성 구독' : '해지 완료'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>결제 주기:</span>
            {['ALL', 'monthly', 'yearly'].map((cy) => (
              <button
                key={cy}
                className={`btn btn-sm ${cycleFilter === cy ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setCycleFilter(cy)}
              >
                {cy === 'ALL' ? '전체' : cy === 'monthly' ? '월간' : '연간'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3 className="section-title">구독 서비스 목록 ({filtered.length}건)</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              각 서비스의 요금제, 자동 결제 갱신 여부 및 상세 계약 조건을 관리합니다.
            </p>
          </div>
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>서비스명 및 카테고리</th>
                <th>플랜 / 이용권</th>
                <th>주기</th>
                <th>결제 금액</th>
                <th>담당 계정</th>
                <th>다음 결제일</th>
                <th>자동 결제 갱신</th>
                <th>상태</th>
                <th style={{ textAlign: 'right' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    조건에 해당하는 구독 서비스가 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => {
                  // BUG-D01-03: For GitHub Copilot (id: 3), switch visually remains ON (checked)
                  const isSwitchChecked = sub.id === 3 ? true : Boolean(sub.auto_renew);

                  return (
                    <tr key={sub.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{sub.service_name}</div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub.category}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          fontWeight: 500,
                          padding: '3px 8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '4px'
                        }}>
                          {sub.plan_name}
                        </span>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                          {sub.billing_cycle === 'yearly' ? '연간' : '월간'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#F8FAFC' }}>
                        ${sub.price.toFixed(2)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          <User size={13} />
                          <span>{sub.account_user}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {sub.next_billing_at}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={isSwitchChecked}
                              onChange={() => onToggleAutoRenew(sub.id, !sub.auto_renew)}
                            />
                            <span className="slider" />
                          </label>
                          <span style={{ 
                            fontSize: '0.78rem', 
                            color: isSwitchChecked ? '#A78BFA' : '#64748B',
                            fontWeight: 600 
                          }}>
                            {isSwitchChecked ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${sub.status === 'ACTIVE' ? 'badge-active' : 'badge-cancelled'}`}>
                          {sub.status === 'ACTIVE' ? '활성' : '해지됨'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => onSelectSubscription(sub)}
                        >
                          <Settings size={14} />
                          <span>상세 관리</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
