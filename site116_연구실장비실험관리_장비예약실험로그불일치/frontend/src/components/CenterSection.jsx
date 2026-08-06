import React, { useState } from 'react';

export default function CenterSection({ equipments, reservations, expLogs, maintenanceRequests, activityLogs, deleteExpLog, testUnauthorizedDisable }) {
  const [activeTab, setActiveTab] = useState('EQUIPMENTS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'EQUIPMENTS' ? 'active' : ''}`} onClick={() => setActiveTab('EQUIPMENTS')}>🧪 연구 장비 대장 (35개)</button>
        <button className={`tab-btn ${activeTab === 'RESERVATIONS' ? 'active' : ''}`} onClick={() => setActiveTab('RESERVATIONS')}>📅 장비 예약 캘린더 (50건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>🔬 실험 기록 로그 (70건)</button>
        <button className={`tab-btn ${activeTab === 'MAINTENANCE' ? 'active' : ''}`} onClick={() => setActiveTab('MAINTENANCE')}>🛠️ 점검 요청 & 활동 이력</button>
      </div>

      {activeTab === 'EQUIPMENTS' && (
        <div className="widget-section">
          <h2>🧪 LabReserve 첨단 연구 장비 대장 (35개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>장비ID</th><th>연구 장비명</th><th>분류 유형</th><th>설치 위치</th><th>사용률(%)</th><th>점검주기</th><th>담당자</th><th>상태</th></tr>
              </thead>
              <tbody>
                {equipments.map(eq => (
                  <tr key={eq.id}>
                    <td><strong>{eq.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{eq.name}</strong></td>
                    <td><span className="cat-badge">{eq.category}</span></td>
                    <td><small>{eq.location}</small></td>
                    <td><strong style={{ color: eq.usageRate > 85 ? 'var(--color-danger)' : 'var(--color-success)' }}>{eq.usageRate}%</strong></td>
                    <td>{eq.inspectCycleDays}일</td>
                    <td><small>{eq.managerName}</small></td>
                    <td><span className={`status-badge ${eq.status.toLowerCase()}`}>{eq.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'RESERVATIONS' && (
        <div className="widget-section">
          <h2>📅 장비 예약 타임라인 캘린더 (50건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>예약ID</th><th>장비명</th><th>예약 연구원</th><th>예약 일자</th><th>사용 시간</th><th>실험 목적</th><th>상태</th></tr>
              </thead>
              <tbody>
                {reservations.map(rsv => (
                  <tr key={rsv.id}>
                    <td><strong>{rsv.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{rsv.equipmentName}</strong></td>
                    <td><small>{rsv.researcherName}</small></td>
                    <td><small>{rsv.reserveDate}</small></td>
                    <td><strong>{rsv.startTime} ~ {rsv.endTime}</strong></td>
                    <td><small>{rsv.purpose}</small></td>
                    <td><span className={`status-badge ${rsv.status.toLowerCase()}`}>{rsv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>🔬 실험 기록 로그 (70건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>장비명</th><th>실험 주제</th><th>연구원</th><th>로그 시간</th><th>특이사항</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {expLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.equipmentName}</strong></td>
                    <td>{log.expTitle}</td>
                    <td><small>{log.researcherName}</small></td>
                    <td><small>{log.logTime}</small></td>
                    <td><small>{log.note}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteExpLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginTop: '0.5rem' }}>* 실험 로그 삭제 시 목록에서는 소거되나 장비별 사용률 및 연구원별 사용시간 통계에는 삭제 전 결과 수치 잔존 (Error 4)</small>
        </div>
      )}

      {activeTab === 'MAINTENANCE' && (
        <div className="widget-section">
          <h2>🛠️ 장비 점검 요청 (35건) & 활동 이력 (90건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>점검ID</th><th>장비명</th><th>신청 연구원</th><th>점검/이상 사유</th><th>요청일</th><th>상태</th></tr>
              </thead>
              <tbody>
                {maintenanceRequests.map(mnt => (
                  <tr key={mnt.id}>
                    <td><strong>{mnt.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{mnt.equipmentName}</strong></td>
                    <td><small>{mnt.applicant}</small></td>
                    <td><small>{mnt.issueType}</small></td>
                    <td><small>{mnt.requestDate}</small></td>
                    <td><span className={`status-badge ${mnt.status.toLowerCase()}`}>{mnt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>📋 연구실 장비 관제 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>장비ID</th><th>담당자</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.equipmentId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedDisable('EQ-1001')}>🔒 권한 없는 연구원의 장비 강제 사용중지 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 장비 사용중지 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
