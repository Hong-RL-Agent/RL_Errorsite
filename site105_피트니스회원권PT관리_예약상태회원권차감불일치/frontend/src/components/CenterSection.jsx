import React, { useState } from 'react';

export default function CenterSection({
  members,
  trainers,
  membershipPasses,
  reservations,
  attendanceLogs,
  activityLogs,
  deleteAttendanceLog,
  openMemberModal,
  testUnauthorizedDeduct
}) {
  const [activeTab, setActiveTab] = useState('MEMBERS_TABLE'); // 'MEMBERS_TABLE' | 'RESERVATIONS_CALENDAR' | 'ATTENDANCE_LOGS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'MEMBERS_TABLE' ? 'active' : ''}`}
          onClick={() => setActiveTab('MEMBERS_TABLE')}
        >
          🏋️ 회원 명단 (40명) & 회원권 현황 (35개)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'RESERVATIONS_CALENDAR' ? 'active' : ''}`}
          onClick={() => setActiveTab('RESERVATIONS_CALENDAR')}
        >
          📅 PT 예약 캘린더 (45건) & 트레이너 일정 (12명)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ATTENDANCE_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ATTENDANCE_LOGS')}
        >
          📋 출석 차감 로그 (70건) & 센터 활동 감사 로그 (80건)
        </button>
      </div>

      {activeTab === 'MEMBERS_TABLE' && (
        <div className="widget-section">
          <h2>🏋️ FitMember 피트니스 센터 전사 회원 대장 (40명)</h2>

          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>회원 ID</th>
                  <th>회원 성명</th>
                  <th>연락처</th>
                  <th>담당 트레이너</th>
                  <th>보유 회원권</th>
                  <th>잔여 횟수</th>
                  <th>회원권 만료일</th>
                </tr>
              </thead>
              <tbody>
                {members.map(mem => (
                  <tr key={mem.id}>
                    <td><strong>{mem.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{mem.name} 회원</strong></td>
                    <td><small>{mem.phone}</small></td>
                    <td><strong>{mem.assignedTrainer}</strong></td>
                    <td><span className="pass-badge">{mem.passType}</span></td>
                    <td><strong style={{ color: mem.remainingCount <= 3 ? 'var(--color-danger)' : 'var(--color-success)' }}>{mem.remainingCount}회 남음</strong></td>
                    <td><small>{mem.expiryDate}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'RESERVATIONS_CALENDAR' && (
        <div className="widget-section">
          <h2>📅 PT 레슨 예약 캘린더 (45건) & 트레이너 담당 일정 (12명)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>예약 ID</th>
                  <th>예약 회원</th>
                  <th>담당 트레이너</th>
                  <th>예약 일자/시간</th>
                  <th>레슨 종류</th>
                  <th>예약 상태</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(resv => (
                  <tr key={resv.id}>
                    <td><strong>{resv.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{resv.memberName}</strong></td>
                    <td>{resv.trainerName}</td>
                    <td><small>{resv.resDate} {resv.resTime}</small></td>
                    <td>{resv.lessonType}</td>
                    <td><span className={`status-badge ${resv.status.toLowerCase()}`}>{resv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ATTENDANCE_LOGS' && (
        <div className="widget-section">
          <h2>📋 센터 출석 체크 & 회원권 차감 로그 (70건)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>출석 로그 ID</th>
                  <th>출석 회원명</th>
                  <th>담당 트레이너</th>
                  <th>입장 일시</th>
                  <th>회원권 차감 내역</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLogs.map(att => (
                  <tr key={att.id}>
                    <td><strong>{att.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{att.memberName}</strong></td>
                    <td>{att.trainerName}</td>
                    <td><small>{att.checkInTime}</small></td>
                    <td><span className="count-tag">{att.deductPass}</span></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteAttendanceLog(att.id)}>
                        🗑️ 출석 로그 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 출석 로그 삭제(DELETE) 시 출석 목록에서는 소거되나 회원별 출석률 및 월별 매출 수치에는 남음 (Error 4)</small>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedDeduct('PASS-4001')}>
              🔒 권한 없는 일반 트레이너의 회원권 임의 차감 시도 (Error 7)
            </button>
            <small className="warn-desc">* 권한 없는 트레이너가 회원권 임의 차감 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
