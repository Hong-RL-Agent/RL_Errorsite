import React, { useState } from 'react';

export default function CenterSection({ schedules, volunteers, reports, assignmentLogs, activityLogs, deleteAssignmentLog, testUnauthorizedConfirm }) {
  const [activeTab, setActiveTab] = useState('SCHEDULES');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'SCHEDULES' ? 'active' : ''}`} onClick={() => setActiveTab('SCHEDULES')}>📅 선거 유세 일정 대장 (45개)</button>
        <button className={`tab-btn ${activeTab === 'VOLUNTEERS' ? 'active' : ''}`} onClick={() => setActiveTab('VOLUNTEERS')}>🙋 자원봉사자 명단 (60명)</button>
        <button className={`tab-btn ${activeTab === 'REPORTS' ? 'active' : ''}`} onClick={() => setActiveTab('REPORTS')}>📝 현장 활동 보고 (35건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 배정 로그 & 감사 이력</button>
      </div>

      {activeTab === 'SCHEDULES' && (
        <div className="widget-section">
          <h2>📅 CampaignCrew 선거 캠프 행사 일정 (45개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>일정ID</th><th>지역 선거구</th><th>행사 명칭 및 유세 내용</th><th>유세 장소</th><th>행사일자</th><th>시간</th><th>필요인원</th><th>담당 리더</th><th>상태</th></tr>
              </thead>
              <tbody>
                {schedules.map(sch => (
                  <tr key={sch.id}>
                    <td><strong>{sch.id}</strong></td>
                    <td><span className="district-badge">{sch.districtName}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{sch.title}</strong></td>
                    <td><small>{sch.location}</small></td>
                    <td><small>{sch.eventDate}</small></td>
                    <td><strong>{sch.startTime} ~ {sch.endTime}</strong></td>
                    <td><strong>{sch.requiredCount}명</strong></td>
                    <td><small>{sch.assignedVolunteerName}</small></td>
                    <td><span className={`status-badge ${sch.status.toLowerCase()}`}>{sch.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'VOLUNTEERS' && (
        <div className="widget-section">
          <h2>🙋 선거 캠프 등록 자원봉사자 (60명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>봉사자ID</th><th>성명</th><th>연락처</th><th>담당 선거구</th><th>누적 봉사시간</th><th>현재 상태</th></tr>
              </thead>
              <tbody>
                {volunteers.map(vol => (
                  <tr key={vol.id}>
                    <td><strong>{vol.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{vol.name}</strong></td>
                    <td><small>{vol.phone}</small></td>
                    <td><span className="district-badge">{vol.districtName}</span></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{vol.activeHours}시간</strong></td>
                    <td><span className={`status-badge ${vol.status.toLowerCase()}`}>{vol.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'REPORTS' && (
        <div className="widget-section">
          <h2>📝 현장 유세 활동 결과 보고서 (35건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>보고ID</th><th>일정 제목</th><th>보고 봉사자</th><th>유권자 반응 및 주요 의견</th><th>사진 첨부</th><th>보고 시간</th><th>상태</th></tr>
              </thead>
              <tbody>
                {reports.map(rpt => (
                  <tr key={rpt.id}>
                    <td><strong>{rpt.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{rpt.scheduleTitle}</strong></td>
                    <td><small>{rpt.reporterName}</small></td>
                    <td><small>{rpt.voterFeedback}</small></td>
                    <td>{rpt.photoCount}장</td>
                    <td><small>{rpt.reportTime}</small></td>
                    <td><span className={`status-badge ${rpt.status.toLowerCase()}`}>{rpt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 자원봉사자 현장 배정 이력 로그 (70건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>일정ID</th><th>봉사자 성명</th><th>배정 선거구</th><th>배정일자</th><th>활동시간</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {assignmentLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.scheduleId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.volunteerName}</strong></td>
                    <td><small>{log.districtName}</small></td>
                    <td><small>{log.assignedDate}</small></td>
                    <td><strong>{log.hours}시간</strong></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteAssignmentLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 배정 로그 삭제 시 목록에서는 소거되나 지역별 참여율 및 봉사자별 활동 횟수 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 선거 캠프 종합 활동 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>일정ID</th><th>담당자</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.scheduleId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedConfirm('SCH-2001')}>🔒 권한 없는 사용자의 일정 진행확정 강제 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 일정확정 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
