import React, { useState } from 'react';

export default function CenterSection({
  units,
  bills,
  reservations,
  complaints,
  activityLogs,
  deleteReservationLog,
  openUnitModal,
  testUnauthorizedPayment
}) {
  const [activeTab, setActiveTab] = useState('BILLS_UNITS'); // 'BILLS_UNITS' | 'RESERVATIONS_CALENDAR' | 'ACTIVITY_LOGS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'BILLS_UNITS' ? 'active' : ''}`}
          onClick={() => setActiveTab('BILLS_UNITS')}
        >
          💳 세대별 관리비 (60건) & 입주 세대 대장 (40세대)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'RESERVATIONS_CALENDAR' ? 'active' : ''}`}
          onClick={() => setActiveTab('RESERVATIONS_CALENDAR')}
        >
          🏊 공용시설 예약 캘린더 (45건 - 헬스장/독서실/게스트룸/커뮤니티/주차)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ACTIVITY_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ACTIVITY_LOGS')}
        >
          📋 시설 이용 감사 로그 (80건) & 민원 처리 현황 (35건)
        </button>
      </div>

      {activeTab === 'BILLS_UNITS' && (
        <div className="widget-section">
          <h2>💳 AptLife 당월 세대별 관리비 고지 및 납부 대장 (60건)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>고지서 ID</th>
                  <th>동/호수</th>
                  <th>세대주</th>
                  <th>부과월</th>
                  <th>청구 관리비</th>
                  <th>납부 기한</th>
                  <th>납부 상태</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.id}</strong></td>
                    <td><span className="building-badge">{b.building} {b.room}</span></td>
                    <td><strong>{b.ownerName} 세대</strong></td>
                    <td><small>{b.month}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{b.amount?.toLocaleString()}원</strong></td>
                    <td><small>{b.dueDate}</small></td>
                    <td>
                      <span className={`status-badge ${b.status.toLowerCase()}`}>
                        {b.status === 'PAID' ? '납부완료' : '미납'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ marginTop: '1.25rem' }}>🏢 아파트 등록 입주 세대 (40세대)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>세대 ID</th>
                  <th>동/호수</th>
                  <th>세대주 성명</th>
                  <th>연락처</th>
                  <th>등록 차량번호</th>
                  <th>특이사항 메모</th>
                </tr>
              </thead>
              <tbody>
                {units.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.id}</strong></td>
                    <td><span className="building-badge">{u.building} {u.room}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{u.ownerName}</strong></td>
                    <td><small>{u.phone}</small></td>
                    <td><strong>{u.carNo}</strong></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{u.note}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'RESERVATIONS_CALENDAR' && (
        <div className="widget-section">
          <h2>🏊 단지 공용시설 예약 캘린더 (45건) (헬스장, 독서실, 게스트룸, 커뮤니티룸, 주차장)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>예약 ID</th>
                  <th>동/호수</th>
                  <th>예약자</th>
                  <th>시설 종류</th>
                  <th>예약 일자</th>
                  <th>예약 시간대</th>
                  <th>이용 인원</th>
                  <th>예약 상태</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(resv => (
                  <tr key={resv.id}>
                    <td><strong>{resv.id}</strong></td>
                    <td><span className="building-badge">{resv.building} {resv.room}</span></td>
                    <td><strong>{resv.residentName}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{resv.facilityType}</strong></td>
                    <td><small>{resv.resDate}</small></td>
                    <td><small>{resv.resTime}</small></td>
                    <td><strong>{resv.attendees}명</strong></td>
                    <td><span className={`status-badge ${resv.status.toLowerCase()}`}>{resv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ACTIVITY_LOGS' && (
        <div className="widget-section">
          <h2>📋 공용시설 예약 처리 감사 로그 (80건) & 🚨 입주민 민원 대장 (35건)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>로그 ID</th>
                  <th>예약 ID</th>
                  <th>작업자</th>
                  <th>처리 내용</th>
                  <th>일시</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.resvId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteReservationLog(log.id)}>
                        🗑️ 로그 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 시설 예약 로그 삭제(DELETE) 시 로그 대장에서는 소거되나 시설별 이용률 및 세대별 예약 횟수 통계 수치에는 남음 (Error 4)</small>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedPayment('BILL-1001')}>
              🔒 권한 없는 일반 직원의 관리비 강제 납부완료 처리 시도 (Error 7)
            </button>
            <small className="warn-desc">* 권한 없는 직원이 관리비 강제 수납 처리 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
