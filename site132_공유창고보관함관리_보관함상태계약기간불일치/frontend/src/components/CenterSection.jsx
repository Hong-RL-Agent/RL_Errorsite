import React, { useState } from 'react';

export default function CenterSection({ lockers, branches, contracts, inOutLogs, activityLogs, deleteInOutLog, testUnauthorizedTerminate }) {
  const [activeTab, setActiveTab] = useState('LOCKERS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'LOCKERS' ? 'active' : ''}`} onClick={() => setActiveTab('LOCKERS')}>🔒 보관함 배치도 (70개)</button>
        <button className={`tab-btn ${activeTab === 'BRANCHES' ? 'active' : ''}`} onClick={() => setActiveTab('BRANCHES')}>🏬 창고 지점 현황 (8개)</button>
        <button className={`tab-btn ${activeTab === 'CONTRACTS' ? 'active' : ''}`} onClick={() => setActiveTab('CONTRACTS')}>📝 보관 계약 대장 (50건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📦 입출고 & 감사 이력</button>
      </div>

      {activeTab === 'LOCKERS' && (
        <div className="widget-section">
          <h2>🔒 BoxSpace 지점 스마트 보관함 현황 배치도 (70개)</h2>
          <div className="locker-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.65rem', marginTop: '0.75rem', maxHeight: '350px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
            {lockers.map(lck => (
              <div key={lck.id} className={`locker-grid-cell ${lck.status.toLowerCase()}`} style={{ background: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.45rem', fontSize: '0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--color-dark)' }}>{lck.lockerNo}</strong>
                  <span className={`status-badge ${lck.status.toLowerCase()}`}>{lck.status}</span>
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--color-text)', marginTop: '0.2rem' }}>{lck.customerName}</div>
                <div style={{ fontSize: '0.58rem', color: 'var(--color-muted)' }}>~{lck.endDate}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'BRANCHES' && (
        <div className="widget-section">
          <h2>🏬 24h 셀프 공유창고 전국 지점 현황 (8개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>지점ID</th><th>지점 명칭</th><th>상세 위치</th><th>총 보관함 수</th><th>현재 계약 이용 수</th><th>점유율</th></tr>
              </thead>
              <tbody>
                {branches.map(brn => (
                  <tr key={brn.id}>
                    <td><strong>{brn.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{brn.name}</strong></td>
                    <td><small>{brn.location}</small></td>
                    <td>{brn.totalLockers}개</td>
                    <td><strong>{brn.occupiedCount}개</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{brn.occupancyRate}%</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CONTRACTS' && (
        <div className="widget-section">
          <h2>📝 보관함 정기 임대차 계약 대장 (50건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>계약ID</th><th>보관함 번호</th><th>계약 고객명</th><th>연락처</th><th>계약 시작일</th><th>계약 만료일</th><th>월 이용료</th><th>상태</th></tr>
              </thead>
              <tbody>
                {contracts.map(ctr => (
                  <tr key={ctr.id}>
                    <td><strong>{ctr.id}</strong></td>
                    <td><span className="locker-no-badge">{ctr.lockerNo}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ctr.customerName}</strong></td>
                    <td><small>{ctr.phone}</small></td>
                    <td><small>{ctr.startDate}</small></td>
                    <td><small>{ctr.endDate}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{ctr.monthlyFeeWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${ctr.status.toLowerCase()}`}>{ctr.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📦 24시간 스마트 센서 물품 입출고 로그 (80건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>계약ID</th><th>보관함 번호</th><th>고객명</th><th>구분</th><th>입출고 물품 상세</th><th>시간</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {inOutLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.contractId}</td>
                    <td><span className="locker-no-badge">{log.lockerNo}</span></td>
                    <td><strong>{log.customerName}</strong></td>
                    <td><span className={`status-badge ${log.actionType === '입고' ? 'in_use' : 'expiring_soon'}`}>{log.actionType}</span></td>
                    <td><small>{log.itemsDesc}</small></td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteInOutLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 입출고 로그 삭제 시 목록에서는 소거되나 지점별 점유율 및 월별 계약 수 통계에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 공유창고 시스템 통합 운영 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>계약ID</th><th>담당 직원</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.contractId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedTerminate('LCK-2001')}>🔒 권한 없는 직원의 보관함 계약 강제종료 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 계약 종료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
