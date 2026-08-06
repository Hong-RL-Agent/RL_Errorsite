import React, { useState } from 'react';

export default function CenterSection({ repairs, instruments, customers, estimates, repairLogs, activityLogs, deleteRepairLog, testUnauthorizedCompleteRepair }) {
  const [activeTab, setActiveTab] = useState('REPAIRS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'REPAIRS' ? 'active' : ''}`} onClick={() => setActiveTab('REPAIRS')}>🎻 수리 접수 (55건)</button>
        <button className={`tab-btn ${activeTab === 'INSTRUMENTS' ? 'active' : ''}`} onClick={() => setActiveTab('INSTRUMENTS')}>🎼 보관 악기 (20개)</button>
        <button className={`tab-btn ${activeTab === 'ESTIMATES' ? 'active' : ''}`} onClick={() => setActiveTab('ESTIMATES')}>💰 산출 견적서 (50건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 작업 & 감사 이력</button>
      </div>

      {activeTab === 'REPAIRS' && (
        <div className="widget-section">
          <h2>🎻 InstrumentFix 마스터 리페어 공방 수리 접수 대장 (55건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>접수ID</th><th>접수코드</th><th>악기 종류</th><th>상세 악기명</th><th>의뢰 고객명</th><th>보관 랙 번호</th><th>수리 증상 민원</th><th>담당 루티어</th><th>수리 견적금액</th><th>상태</th></tr>
              </thead>
              <tbody>
                {repairs.map(rpr => (
                  <tr key={rpr.id}>
                    <td><strong>{rpr.id}</strong></td>
                    <td><small>{rpr.repairCode}</small></td>
                    <td><span className="category-badge">{rpr.category}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{rpr.instrumentName}</strong></td>
                    <td><strong>{rpr.customerName}</strong></td>
                    <td><small>{rpr.storageNo}</small></td>
                    <td><small>{rpr.issueDescription}</small></td>
                    <td><strong>{rpr.workerName}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{rpr.estimatePriceWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${rpr.status.toLowerCase()}`}>{rpr.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'INSTRUMENTS' && (
        <div className="widget-section">
          <h2>🎼 수제 클래식 & 어쿠스틱 보관 악기 명단 (20개 악기)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>악기ID</th><th>악기 명칭</th><th>카테고리</th><th>제조 브랜드/공방</th><th>공방 보관 랙 번호</th><th>상태</th></tr>
              </thead>
              <tbody>
                {instruments.map(inst => (
                  <tr key={inst.id}>
                    <td><strong>{inst.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{inst.instrumentName}</strong></td>
                    <td><span className="category-badge">{inst.category}</span></td>
                    <td><small>{inst.brand}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{inst.storageNo}</small></td>
                    <td><span className={`status-badge ${inst.status.toLowerCase()}`}>{inst.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ESTIMATES' && (
        <div className="widget-section">
          <h2>💰 악기 수리 부품 및 기술 공임 산출 견적서 (50건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>견적ID</th><th>접수ID</th><th>악기명</th><th>고객명</th><th>부품 자재비</th><th>공임 기술료</th><th>최종 산출 견적가</th><th>상태</th></tr>
              </thead>
              <tbody>
                {estimates.map(est => (
                  <tr key={est.id}>
                    <td><strong>{est.id}</strong></td>
                    <td>{est.rprId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{est.instrumentName}</strong></td>
                    <td><strong>{est.customerName}</strong></td>
                    <td><small>{est.partsFee.toLocaleString()}원</small></td>
                    <td><small>{est.laborFee.toLocaleString()}원</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{est.totalFee.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${est.status.toLowerCase()}`}>{est.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 루티어 마스터 복원 및 조율 작업 작업 로그 (80건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>작업로그ID</th><th>접수ID</th><th>악기명</th><th>담당 루티어</th><th>수리 조치 작업 내역</th><th>작업 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {repairLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.rprId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.instrumentName}</strong></td>
                    <td><strong>{log.workerName}</strong></td>
                    <td><small>{log.workContent}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.workTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteRepairLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 작업 로그 삭제 시 목록에서는 소거되나 악기별 평균 수리비, 작업자별 처리량, 월별 출고 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 공방 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>접수ID</th><th>담당 루티어</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.rprId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedCompleteRepair('RPR-7001')}>🔒 권한 없는 직원의 악기 출고 완료 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 출고 완료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
