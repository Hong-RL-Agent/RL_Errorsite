import React, { useState } from 'react';

export default function CenterSection({
  tiers,
  customers,
  coupons,
  points,
  purchases,
  activityLogs,
  deleteCouponUsage,
  openCustomerModal,
  testUnauthorizedDowngrade
}) {
  const [activeTab, setActiveTab] = useState('TIERS_CUSTOMERS'); // 'TIERS_CUSTOMERS' | 'COUPONS_POINTS' | 'PURCHASES_LOGS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'TIERS_CUSTOMERS' ? 'active' : ''}`}
          onClick={() => setActiveTab('TIERS_CUSTOMERS')}
        >
          👑 멤버십 등급 체계 & 회원 대장 (35명)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'COUPONS_POINTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('COUPONS_POINTS')}
        >
          🎟️ 쿠폰 발급/사용 대장 & 포인트 내역 (60건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'PURCHASES_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('PURCHASES_LOGS')}
        >
          🛍️ 고객 구매 이력 (50건) & 활동 감사 로그
        </button>
      </div>

      {activeTab === 'TIERS_CUSTOMERS' && (
        <div className="widget-section">
          <h2>👑 MemberPlus 5단계 멤버십 등급 혜택 안내</h2>
          <div className="tier-cards-grid">
            {tiers.map(t => (
              <div key={t.id} className={`tier-card ${t.name.toLowerCase()}`}>
                <div className="tier-card-head">
                  <span className="tier-name-badge">{t.name}</span>
                  <small className="tier-spend">₩{(t.minSpend / 10000).toLocaleString()}만원 이상</small>
                </div>
                <div className="tier-card-body">
                  <div>상시 할인: <strong style={{ color: 'var(--color-primary)' }}>{t.discountRate}%</strong></div>
                  <div>포인트 적립: <strong>{t.pointRate}%</strong></div>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: '1.25rem' }}>👥 회원 고객 상세 리스트 (35명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>고객 ID</th>
                  <th>성명</th>
                  <th>멤버십 등급</th>
                  <th>누적 구매금액</th>
                  <th>보유 포인트</th>
                  <th>연락처</th>
                  <th>선호 매장</th>
                  <th>마케팅 동의</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(cst => (
                  <tr key={cst.id}>
                    <td><strong>{cst.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cst.name} 고객</strong></td>
                    <td><span className={`tier-badge ${cst.tier.toLowerCase()}`}>{cst.tier}</span></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>₩{cst.totalSpend.toLocaleString()}</strong></td>
                    <td>{cst.points.toLocaleString()}P</td>
                    <td><small>{cst.phone}</small></td>
                    <td>{cst.preferredStore}</td>
                    <td><span className={`status-badge ${cst.marketingConsent ? 'completed' : 'danger'}`}>{cst.marketingConsent ? '동의' : '거부'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'COUPONS_POINTS' && (
        <div className="widget-section">
          <h2>🎟️ 발급 쿠폰 현황 (40개) 및 💰 포인트 내역 (60건)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>쿠폰 ID</th>
                  <th>쿠폰명</th>
                  <th>혜택률</th>
                  <th>발급 대상</th>
                  <th>발급 일시</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(cpn => (
                  <tr key={cpn.id}>
                    <td><strong>{cpn.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cpn.name}</strong></td>
                    <td><span className="tier-badge gold">{cpn.discountRate}% 할인</span></td>
                    <td>{cpn.customerName} ({cpn.customerId})</td>
                    <td><small>{cpn.issuedAt}</small></td>
                    <td><span className={`status-badge ${cpn.status === 'UNUSED' ? 'completed' : 'danger'}`}>{cpn.status}</span></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteCouponUsage(cpn.id)}>
                        🗑️ 쿠폰 내역 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 쿠폰 내역 삭제(DELETE) 시 목록에서는 소거되나 대시보드 쿠폰 사용률 및 혜택 총액 수치에는 남음 (Error 4)</small>

          <h2 style={{ marginTop: '1.25rem' }}>💰 포인트 적립/차감 이력 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>포인트 ID</th>
                  <th>고객명</th>
                  <th>구분</th>
                  <th>포인트 수량</th>
                  <th>적립/차감 사유</th>
                  <th>일시</th>
                </tr>
              </thead>
              <tbody>
                {points.map(pnt => (
                  <tr key={pnt.id}>
                    <td><strong>{pnt.id}</strong></td>
                    <td>{pnt.customerName}</td>
                    <td><span className={`status-badge ${pnt.type === 'EARN' ? 'completed' : 'danger'}`}>{pnt.type}</span></td>
                    <td><strong style={{ color: pnt.amount > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>{pnt.amount > 0 ? `+${pnt.amount.toLocaleString()}` : pnt.amount.toLocaleString()}P</strong></td>
                    <td>{pnt.reason}</td>
                    <td><small>{pnt.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PURCHASES_LOGS' && (
        <div className="widget-section">
          <h2>🛍️ 고객 결제/구매 이력 (50건) & 📑 CRM 감사 로그</h2>
          
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>구매 ID</th>
                  <th>고객명</th>
                  <th>결제 금액</th>
                  <th>구매 매장</th>
                  <th>결제 일시</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(pur => (
                  <tr key={pur.id}>
                    <td><strong>{pur.id}</strong></td>
                    <td>{pur.customerName}</td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>₩{pur.amount.toLocaleString()}</strong></td>
                    <td>{pur.store}</td>
                    <td><small>{pur.purchasedAt}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedDowngrade('CST-1001')}>
              🔒 일반 사원의 강제 등급 강등 시도 (Error 7)
            </button>
            <small className="warn-desc">* 일반 사원이 등급 강등 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
