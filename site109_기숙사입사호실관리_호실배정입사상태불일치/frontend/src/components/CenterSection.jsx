import React, { useState } from 'react';

export default function CenterSection({
  students,
  rooms,
  applications,
  activityLogs,
  deleteAllocationLog,
  openStudentModal,
  testUnauthorizedForceChange
}) {
  const [activeTab, setActiveTab] = useState('STUDENTS_TABLE'); // 'STUDENTS_TABLE' | 'FLOOR_PLAN' | 'ALLOCATION_LOGS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'STUDENTS_TABLE' ? 'active' : ''}`}
          onClick={() => setActiveTab('STUDENTS_TABLE')}
        >
          🎓 기숙사 입사 학생 대장 (45명) & 입사 신청 (40건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'FLOOR_PLAN' ? 'active' : ''}`}
          onClick={() => setActiveTab('FLOOR_PLAN')}
        >
          🏢 기숙사 층별 호실 배치도 (60개 호실 - 명덕관/진리관/봉사관)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ALLOCATION_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALLOCATION_LOGS')}
        >
          📋 호실 배정 감사 로그 (80건) & 사관 점검 기록 (50건)
        </button>
      </div>

      {activeTab === 'STUDENTS_TABLE' && (
        <div className="widget-section">
          <h2>🎓 DormLink 생활관 재적 학생 대장 (45명)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>학생 ID</th>
                  <th>학생 성명</th>
                  <th>성별</th>
                  <th>전공 학과</th>
                  <th>GPA 성적</th>
                  <th>배정 기숙사동</th>
                  <th>배정 호실</th>
                  <th>희망 룸메이트</th>
                  <th>입사 상태</th>
                </tr>
              </thead>
              <tbody>
                {students.map(stu => (
                  <tr key={stu.id}>
                    <td><strong>{stu.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{stu.name}</strong></td>
                    <td><small>{stu.gender === 'M' ? '남성' : '여성'}</small></td>
                    <td>{stu.major}</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{stu.gpa} / 4.5</strong></td>
                    <td><span className="dorm-badge">{stu.dormBuilding}</span></td>
                    <td><strong>{stu.roomNo}</strong></td>
                    <td><small>{stu.preferredRoommate}</small></td>
                    <td><span className={`status-badge ${stu.status.toLowerCase()}`}>{stu.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'FLOOR_PLAN' && (
        <div className="widget-section">
          <h2>🏢 기숙사 층별 호실 현황 배치도 (명덕관 3~4층 / 진리관 1~5층 Grid)</h2>

          <div className="room-grid-layout">
            {rooms.map(room => (
              <div 
                key={room.id}
                className={`room-grid-cell ${room.occupied >= room.capacity ? 'full' : room.occupied > 0 ? 'partial' : 'empty'}`}
              >
                <div className="room-cell-head">
                  <strong>{room.building} {room.roomNo}</strong>
                  <span className="room-gender-tag">{room.gender === 'M' ? '남' : '여'}</span>
                </div>
                <div className="room-cell-body">
                  <small>수용: {room.occupied} / {room.capacity}명</small>
                  <div className="room-progress-bar">
                    <div 
                      className="room-progress-fill" 
                      style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ALLOCATION_LOGS' && (
        <div className="widget-section">
          <h2>📋 기숙사 호실 배정 감사 로그 (80건) & 📑 사감점검 대장 (50건)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>로그 ID</th>
                  <th>신청 ID</th>
                  <th>담당 사감</th>
                  <th>처리 내용</th>
                  <th>일시</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.appId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteAllocationLog(log.id)}>
                        🗑️ 로그 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 호실 배정 로그 삭제(DELETE) 시 로그 대장에서는 소거되나 층별 점유율 및 성별 배정 통계 수치에는 남음 (Error 4)</small>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedForceChange('ROOM-101')}>
              🔒 권한 없는 일반 직원의 호실 강제 변경 시도 (Error 7)
            </button>
            <small className="warn-desc">* 권한 없는 직원이 호실 강제 변경 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
