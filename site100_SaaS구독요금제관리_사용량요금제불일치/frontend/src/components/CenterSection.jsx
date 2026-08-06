import React, { useState } from 'react';

export default function CenterSection({
  plans,
  organizations,
  teamMembers,
  usageLogs,
  billingHistories,
  deleteUsageLog,
  openOrgModal,
  testUnauthorizedPlanChange
}) {
  const [activeTab, setActiveTab] = useState('PLANS_MATRIX'); // 'PLANS_MATRIX' | 'TEAM_LICENSES' | 'USAGE_BILLING'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'PLANS_MATRIX' ? 'active' : ''}`}
          onClick={() => setActiveTab('PLANS_MATRIX')}
        >
          💳 CloudPlan 요금제 카탈로그 (5종)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'TEAM_LICENSES' ? 'active' : ''}`}
          onClick={() => setActiveTab('TEAM_LICENSES')}
        >
          👥 팀원 라이선스 관리 (40명)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'USAGE_BILLING' ? 'active' : ''}`}
          onClick={() => setActiveTab('USAGE_BILLING')}
        >
          📊 사용량 트래픽 로그 (80건) & 청구 내역 (30건)
        </button>
      </div>

      {activeTab === 'PLANS_MATRIX' && (
        <div className="widget-section">
          <h2>💳 CloudPlan SaaS 구독 요금제 사양 비교</h2>

          <div className="plans-grid-cards">
            {plans.map(p => (
              <div key={p.id} className="plan-card-box">
                <div className="plan-card-header">
                  <h4>{p.name}</h4>
                  <span className="plan-price">₩{p.monthlyFee.toLocaleString()}<small>/월</small></span>
                </div>
                <p className="plan-desc">{p.description}</p>
                <ul className="plan-specs">
                  <li>⚡ API 호출한도: <strong>{p.apiLimit.toLocaleString()}회</strong></li>
                  <li>💾 클라우드 저장공간: <strong>{p.storageLimitGb} GB</strong></li>
                  <li>👥 허용 라이선스: <strong>최대 {p.maxSeats}석</strong></li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'TEAM_LICENSES' && (
        <div className="widget-section">
          <h2>👥 고객사 조직별 팀원 라이선스 현황 대장 (40명)</h2>

          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>팀원 ID</th>
                  <th>소속 조직</th>
                  <th>성명 (이메일)</th>
                  <th>권한 역활</th>
                  <th>월간 API 호출</th>
                  <th>라이선스 할당 상태</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((mem, idx) => (
                  <tr key={mem.id}>
                    <td><strong>{mem.id}</strong></td>
                    <td><span className="plan-badge">{mem.orgId}</span></td>
                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>{mem.name}</strong>
                      <br /><small style={{ color: 'var(--color-muted)' }}>{mem.email}</small>
                    </td>
                    <td><span className="role-tag">{mem.role}</span></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{mem.monthlyCalls.toLocaleString()}회</strong></td>
                    <td>
                      <span className={`status-badge ${mem.licenseStatus === 'ASSIGNED' ? 'completed' : 'danger'}`}>
                        {mem.licenseStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'USAGE_BILLING' && (
        <div className="widget-section">
          <h2>📊 API/저장공간 실시간 사용량 측정 로그 (80건) & 📑 청구 내역 (30건)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>로그 ID</th>
                  <th>조직 ID</th>
                  <th>측정 항목</th>
                  <th>사용량</th>
                  <th>초과 과금액</th>
                  <th>측정 일시</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {usageLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.orgId}</td>
                    <td><span className="plan-badge">{log.metricType}</span></td>
                    <td><strong>{log.amount.toLocaleString()} {log.unit}</strong></td>
                    <td>₩{log.overageFee.toLocaleString()}</td>
                    <td><small>{log.timestamp}</small></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteUsageLog(log.id)}>
                        🗑️ 사용량 로그 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 사용량 로그 삭제(DELETE) 시 목록에서는 소거되나 월별 API 사용량 합계 및 청구 예정 금액 수치에는 남음 (Error 4)</small>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedPlanChange('ORG-1001', 'PLN-ENTERPRISE')}>
              🔒 일반 멤버의 요금제 변경 시도 (Error 7)
            </button>
            <small className="warn-desc">* 일반 멤버가 요금제 변경 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
