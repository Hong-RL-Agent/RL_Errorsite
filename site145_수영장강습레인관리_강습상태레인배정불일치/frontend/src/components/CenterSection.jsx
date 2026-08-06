import React, { useState } from 'react';

export default function CenterSection({ members, lanes, instructors, attendanceLogs, activityLogs, deleteAttendanceLog, testUnauthorizedChangeLane }) {
  const [activeTab, setActiveTab] = useState('MEMBERS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'MEMBERS' ? 'active' : ''}`} onClick={() => setActiveTab('MEMBERS')}>🏊 강습 회원 (70명)</button>
        <button className={`tab-btn ${activeTab === 'LANES' ? 'active' : ''}`} onClick={() => setActiveTab('LANES')}>🌊 레인 배치 (20개)</button>
        <button className={`tab-btn ${activeTab === 'INSTRUCTORS' ? 'active' : ''}`} onClick={() => setActiveTab('INSTRUCTORS')}>👨‍🏫 수영 강사 (15명)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 출석 체크 & 감사 이력</button>
      </div>

      {activeTab === 'MEMBERS' && (
        <div className="widget-section">
          <h2>🏊 SwimClass 시립 스포츠센터 수영 강습 회원 대장 (70명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>회원ID</th><th>회원코드</th><th>회원 성명</th><th>수강 강습반명</th><th>강습 레벨</th><th>배정 레인</th><th>담당 강사</th><th>출석률</th><th>상태</th></tr>
              </thead>
              <tbody>
                {members.map(mbr => (
                  <tr key={mbr.id}>
                    <td><strong>{mbr.id}</strong></td>
                    <td><small>{mbr.mbCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{mbr.name}</strong></td>
                    <td><small>{mbr.className}</small></td>
                    <td><small>{mbr.level}</small></td>
                    <td><span className="lane-badge">{mbr.laneNo}</span></td>
                    <td><strong>{mbr.instructor}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{mbr.attendanceRatePercent}%</strong></td>
                    <td><span className={`status-badge ${mbr.status.toLowerCase()}`}>{mbr.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LANES' && (
        <div className="widget-section">
          <h2>🌊 수영장 규격 레인 및 수업 배정 배치도 (20개 레인)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>레인ID</th><th>레인 번호 및 규격</th><th>레인 유형</th><th>배정 강습반명</th><th>담당 강사</th><th>상태</th></tr>
              </thead>
              <tbody>
                {lanes.map(lne => (
                  <tr key={lne.id}>
                    <td><strong>{lne.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{lne.laneNo}</strong></td>
                    <td><small>{lne.type}</small></td>
                    <td>{lne.assignedClass}</td>
                    <td><strong>{lne.instructor}</strong></td>
                    <td><span className={`status-badge ${lne.status.toLowerCase()}`}>{lne.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'INSTRUCTORS' && (
        <div className="widget-section">
          <h2>👨‍🏫 전문 수영 강사 및 지도 레인 현황 (15명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>강사ID</th><th>강사 성명</th><th>연락처</th><th>보유 자격증</th><th>배정 레인 수</th><th>평점</th></tr>
              </thead>
              <tbody>
                {instructors.map(ins => (
                  <tr key={ins.id}>
                    <td><strong>{ins.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ins.name}</strong></td>
                    <td><small>{ins.phone}</small></td>
                    <td><small>{ins.cert}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{ins.assignedLanes}개 레인</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>⭐ {ins.rating} / 5.0</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 락커키/바코드 출석 체킹 기록 로그 (90건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>출석ID</th><th>회원ID</th><th>회원 성명</th><th>강습반명</th><th>레인 번호</th><th>입장 태그시각</th><th>인증 수단</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {attendanceLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.mbId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.name}</strong></td>
                    <td><small>{log.className}</small></td>
                    <td><span className="lane-badge">{log.laneNo}</span></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.checkInTime}</small></td>
                    <td><small>{log.authMethod}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteAttendanceLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 출석 로그 삭제 시 목록에서는 소거되나 강습반별 출석률, 강사별 수업 수, 레인별 이용률 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 수영장 운영 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>회원ID</th><th>담당 직원</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.mbId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedChangeLane('MBR-7001')}>🔒 권한 없는 강사의 레인 변경 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 레인 변경 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
