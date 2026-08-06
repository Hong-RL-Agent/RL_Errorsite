import React, { useState } from 'react';

export default function CenterSection({
  claims,
  policyholders,
  products,
  memos,
  payouts,
  activityLogs,
  deletePayout,
  openPolicyholderModal,
  testUnauthorizedApprove
}) {
  const [activeTab, setActiveTab] = useState('CLAIMS_TABLE'); // 'CLAIMS_TABLE' | 'POLICYHOLDERS_PRODUCTS' | 'MEMOS_PAYOUTS_LOGS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'CLAIMS_TABLE' ? 'active' : ''}`}
          onClick={() => setActiveTab('CLAIMS_TABLE')}
        >
          🛡️ 보험금 청구 & 심사 관제 대장 (45건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'POLICYHOLDERS_PRODUCTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('POLICYHOLDERS_PRODUCTS')}
        >
          👤 가입자 명단 (35명) & 보험 상품 (15개)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'MEMOS_PAYOUTS_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('MEMOS_PAYOUTS_LOGS')}
        >
          💰 지급 내역 (30건) & 심사 감사 로그 (80건)
        </button>
      </div>

      {activeTab === 'CLAIMS_TABLE' && (
        <div className="widget-section">
          <h2>🛡️ ClaimGuard 보험 청구 접수 및 손해사정 대장 (45건)</h2>

          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>청구 ID</th>
                  <th>가입자명</th>
                  <th>보험 상품명</th>
                  <th>청구 사유 / 병명</th>
                  <th>청구 금액</th>
                  <th>지급 예정액</th>
                  <th>담당 심사자</th>
                  <th>청구 심사 상태</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(claim => (
                  <tr key={claim.id}>
                    <td><strong>{claim.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{claim.policyholderName}</strong></td>
                    <td><span className="product-badge">{claim.productName}</span></td>
                    <td>{claim.diseaseName}</td>
                    <td><small>{claim.claimAmount?.toLocaleString()}원</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{claim.payoutAmount?.toLocaleString()}원</strong></td>
                    <td>{claim.adjusterName}</td>
                    <td><span className={`status-badge ${claim.status.toLowerCase()}`}>{claim.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'POLICYHOLDERS_PRODUCTS' && (
        <div className="widget-section">
          <h2>👤 전사 가입자 인적 명단 (35명) & 📋 보험 상품 약관 비율 (15개)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>가입자 ID</th>
                  <th>가입자 성명</th>
                  <th>연락처</th>
                  <th>등록 주소</th>
                  <th>지급 계좌번호</th>
                </tr>
              </thead>
              <tbody>
                {policyholders.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{p.name}</strong></td>
                    <td><small>{p.phone}</small></td>
                    <td>{p.address}</td>
                    <td><small>{p.bankAccount}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ marginTop: '1.25rem' }}>📋 보상 상품별 약관 산정 비율 (15개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>상품 ID</th>
                  <th>보험 상품명</th>
                  <th>보상 카테고리</th>
                  <th>기본 보상율</th>
                </tr>
              </thead>
              <tbody>
                {products.map(prd => (
                  <tr key={prd.id}>
                    <td><strong>{prd.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{prd.name}</strong></td>
                    <td><span className="product-badge">{prd.category}</span></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{prd.payoutRate}% 약관</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'MEMOS_PAYOUTS_LOGS' && (
        <div className="widget-section">
          <h2>💰 완료된 지급 내역 (30건) & 📑 손해사정 활동 감사 로그 (80건)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>지급 ID</th>
                  <th>연관 청구 ID</th>
                  <th>수령 가입자</th>
                  <th>최종 지급 금액</th>
                  <th>지급일</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(pay => (
                  <tr key={pay.id}>
                    <td><strong>{pay.id}</strong></td>
                    <td>{pay.claimId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{pay.policyholderName}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{pay.payoutAmount?.toLocaleString()}원</strong></td>
                    <td><small>{pay.paidDate}</small></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deletePayout(pay.id)}>
                        🗑️ 지급 내역 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 지급 내역 삭제(DELETE) 시 목록에서는 소거되나 월별 지급 총액 및 대시보드 승인율 수치에는 남음 (Error 4)</small>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedApprove('CLM-1001')}>
              🔒 권한 없는 직원의 지급 승인 시도 (Error 7)
            </button>
            <small className="warn-desc">* 권한 없는 직원이 지급 승인 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
