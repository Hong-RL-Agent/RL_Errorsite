import React, { useState } from 'react';

export default function CenterSection({
  campaigns,
  creatives,
  advertisers,
  activityLogs,
  deleteBudgetLog,
  openCampaignModal,
  testUnauthorizedApprove
}) {
  const [activeTab, setActiveTab] = useState('CAMPAIGNS_TABLE'); // 'CAMPAIGNS_TABLE' | 'CREATIVES_GRID' | 'BUDGET_LOGS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'CAMPAIGNS_TABLE' ? 'active' : ''}`}
          onClick={() => setActiveTab('CAMPAIGNS_TABLE')}
        >
          📊 디스플레이 광고 캠페인 대장 (35건) & 광고주 계정 (20개)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'CREATIVES_GRID' ? 'active' : ''}`}
          onClick={() => setActiveTab('CREATIVES_GRID')}
        >
          🎨 광고 소재 심사 보드 (50건 - 배너/비디오/네이티브/피드)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'BUDGET_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('BUDGET_LOGS')}
        >
          📋 예산 변경 감사 로그 (80건) & 소재 심사 메모 (60건)
        </button>
      </div>

      {activeTab === 'CAMPAIGNS_TABLE' && (
        <div className="widget-section">
          <h2>📊 AdPilot 디지털 마케팅 광고 캠페인 통합 대장 (35건)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>캠페인 ID</th>
                  <th>캠페인명</th>
                  <th>광고주</th>
                  <th>일일 예산</th>
                  <th>누적 소진액</th>
                  <th>소진율</th>
                  <th>클릭률 CTR</th>
                  <th>타겟 지역</th>
                  <th>캠페인 상태</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(cmp => (
                  <tr key={cmp.id}>
                    <td><strong>{cmp.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cmp.title}</strong></td>
                    <td><span className="adv-badge">{cmp.advertiserName}</span></td>
                    <td><strong>{cmp.dailyBudget?.toLocaleString()}원</strong></td>
                    <td><small>{cmp.spentAmount?.toLocaleString()}원</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{cmp.exhaustionRate}%</strong></td>
                    <td><small>{cmp.ctr}%</small></td>
                    <td><small>{cmp.targetRegion}</small></td>
                    <td><span className={`status-badge ${cmp.status.toLowerCase()}`}>{cmp.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ marginTop: '1.25rem' }}>🏢 등록 광고주 어카운트 명단 (20개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>광고주 ID</th>
                  <th>기업명</th>
                  <th>마케팅 담당자</th>
                  <th>연락처</th>
                  <th>업종 분야</th>
                  <th>월 총 집행 예산</th>
                </tr>
              </thead>
              <tbody>
                {advertisers.map(adv => (
                  <tr key={adv.id}>
                    <td><strong>{adv.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{adv.companyName}</strong></td>
                    <td><strong>{adv.contactName}</strong></td>
                    <td><small>{adv.phone}</small></td>
                    <td><span className="adv-badge">{adv.industry}</span></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{adv.totalBudget?.toLocaleString()}원</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CREATIVES_GRID' && (
        <div className="widget-section">
          <h2>🎨 광고 소재 심사 & 비주얼 카탈로그 보드 (50건)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>소재 ID</th>
                  <th>연결 캠페인 ID</th>
                  <th>소재 타이틀</th>
                  <th>소재 유형</th>
                  <th>심사 상태</th>
                  <th>심사관 메모</th>
                </tr>
              </thead>
              <tbody>
                {creatives.map(cr => (
                  <tr key={cr.id}>
                    <td><strong>{cr.id}</strong></td>
                    <td><small>{cr.campaignId}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cr.title}</strong></td>
                    <td><span className="adv-badge">{cr.type}</span></td>
                    <td><span className={`status-badge ${cr.status.toLowerCase()}`}>{cr.status}</span></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{cr.auditMemo}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BUDGET_LOGS' && (
        <div className="widget-section">
          <h2>📋 캠페인 예산 변경 감사 로그 (80건) & 📑 소재 심사 가이드 대장 (60건)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>로그 ID</th>
                  <th>캠페인 ID</th>
                  <th>작업 마케터</th>
                  <th>처리 내용</th>
                  <th>일시</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.campaignId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteBudgetLog(log.id)}>
                        🗑️ 로그 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 예산 변경 로그 삭제(DELETE) 시 로그 대장에서는 소거되나 캠페인별 소진 금액 및 광고주별 집행액 통계 수치에는 남음 (Error 4)</small>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedApprove('CR-2001')}>
              🔒 권한 없는 일반 직원의 광고 소재 강제 승인 시도 (Error 7)
            </button>
            <small className="warn-desc">* 권한 없는 직원이 광고 소재 승인 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
