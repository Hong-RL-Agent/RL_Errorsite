import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Zap
} from 'lucide-react';

export default function DashboardView({ 
  analytics, 
  subscriptions, 
  onSelectSubscription,
  onNavigateToCatalog
}) {
  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE');

  return (
    <div className="dashboard-content">
      {/* KPI Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">활성 구독 서비스</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="metric-value">{analytics?.active_count || activeSubs.length}개</div>
          <div className="metric-sub">
            <span style={{ color: '#34D399', fontWeight: 600 }}>정상 구독 중</span>
            <span>· 전체 계정 연동</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">이번 달 예상 결제액</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-value">${analytics?.monthly_total?.toFixed(2) || '0.00'}</div>
          <div className="metric-sub">
            <TrendingUp size={14} color="#34D399" />
            <span style={{ color: '#34D399', fontWeight: 600 }}>전월 대비 -4.2%</span>
            <span>절감 중</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">연간 예상 지출액</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22D3EE' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <div className="metric-value">${analytics?.yearly_projected?.toFixed(2) || '0.00'}</div>
          <div className="metric-sub">
            <span>연간 플랜 전환 시 </span>
            <span style={{ color: '#FBBF24', fontWeight: 600 }}>${analytics?.yearly_savings || '142.5'} 절감 가능</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">다음 정기 결제일</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#F472B6' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="metric-value">{analytics?.next_payment_date || '2026-11-01'}</div>
          <div className="metric-sub">
            <span style={{ color: '#A78BFA' }}>Notion & GitHub Copilot</span>
            <span>갱신 예정</span>
          </div>
        </div>
      </div>

      {/* Monthly Expenditure Chart Section */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3 className="section-title">월간 결제 추이 및 지출 분석</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              최근 6개월간 조직 내 SaaS 서비스 총 구독 지출 변동 내역
            </p>
          </div>
          <div className="section-actions">
            <span className="badge badge-active">정상 관리 중</span>
          </div>
        </div>

        {/* Custom SVG Bar Chart */}
        <div style={{ height: '220px', width: '100%', position: 'relative', marginTop: '16px' }}>
          <svg width="100%" height="100%" viewBox="0 0 700 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="activeBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity="1" />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="40" y1="30" x2="680" y2="30" stroke="#1F2A47" strokeDasharray="4" />
            <line x1="40" y1="80" x2="680" y2="80" stroke="#1F2A47" strokeDasharray="4" />
            <line x1="40" y1="130" x2="680" y2="130" stroke="#1F2A47" strokeDasharray="4" />
            <line x1="40" y1="170" x2="680" y2="170" stroke="#1F2A47" />

            {/* Labels Y */}
            <text x="10" y="35" fill="#64748B" fontSize="11">$100</text>
            <text x="15" y="85" fill="#64748B" fontSize="11">$75</text>
            <text x="15" y="135" fill="#64748B" fontSize="11">$50</text>
            <text x="25" y="174" fill="#64748B" fontSize="11">$0</text>

            {/* Bars */}
            {(analytics?.monthly_trend || [
              { month: '05월', amount: 68.5 },
              { month: '06월', amount: 74.0 },
              { month: '07월', amount: 82.5 },
              { month: '08월', amount: 82.5 },
              { month: '09월', amount: 98.9 },
              { month: '10월(현재)', amount: analytics?.monthly_total || 86.5 }
            ]).map((item, idx) => {
              const x = 70 + idx * 102;
              const barHeight = Math.min(130, (item.amount / 120) * 140);
              const y = 170 - barHeight;
              const isCurrent = idx === 5;

              return (
                <g key={idx}>
                  <rect
                    x={x}
                    y={y}
                    width="44"
                    height={barHeight}
                    rx="6"
                    fill={isCurrent ? "url(#activeBarGrad)" : "url(#barGrad)"}
                    filter={isCurrent ? "drop-shadow(0px 0px 8px rgba(139, 92, 246, 0.6))" : "none"}
                  />
                  <text 
                    x={x + 22} 
                    y={y - 8} 
                    fill={isCurrent ? "#C4B5FD" : "#94A3B8"} 
                    fontSize="11" 
                    fontWeight={isCurrent ? "700" : "500"}
                    textAnchor="middle"
                  >
                    ${item.amount.toFixed(1)}
                  </text>
                  <text 
                    x={x + 22} 
                    y="190" 
                    fill={isCurrent ? "#FFFFFF" : "#64748B"} 
                    fontSize="11" 
                    fontWeight={isCurrent ? "600" : "400"}
                    textAnchor="middle"
                  >
                    {item.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Current Subscriptions Overview */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h3 className="section-title">주요 구독 서비스 상태</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              현재 활성화된 서비스의 플랜 및 주기별 상태 요약
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onNavigateToCatalog}>
            <span>신규 서비스 둘러보기</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>서비스명</th>
                <th>현재 플랜</th>
                <th>결제 주기</th>
                <th>금액</th>
                <th>자동 결제</th>
                <th>상태</th>
                <th style={{ textAlign: 'right' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.slice(0, 5).map((sub) => (
                <tr key={sub.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '6px', 
                        background: 'rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#A78BFA'
                      }}>
                        <Zap size={14} />
                      </div>
                      <span>{sub.service_name}</span>
                    </div>
                  </td>
                  <td>{sub.plan_name}</td>
                  <td>
                    <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {sub.billing_cycle === 'yearly' ? '연간 (Yearly)' : '월간 (Monthly)'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    ${sub.price.toFixed(2)}
                  </td>
                  <td>
                    <span style={{ 
                      color: sub.auto_renew ? '#34D399' : '#94A3B8',
                      fontSize: '0.82rem',
                      fontWeight: 600
                    }}>
                      {sub.auto_renew ? 'ON (자동갱신)' : 'OFF (수동)'}
                    </span>
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
                      상세 설정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
