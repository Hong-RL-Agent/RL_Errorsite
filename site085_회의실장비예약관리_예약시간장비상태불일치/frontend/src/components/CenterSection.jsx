import React, { useState } from 'react';

export default function CenterSection({
  rooms,
  reservations,
  deleteReservation,
  testUnauthorizedEquipmentStatusUpdate
}) {
  const [activeTab, setActiveTab] = useState('MEETING_ROOMS'); // 'MEETING_ROOMS' | 'MY_RESERVATIONS' | 'EQUIPMENT_STATUS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'MEETING_ROOMS' ? 'active' : ''}`}
          onClick={() => setActiveTab('MEETING_ROOMS')}
        >
          🏢 회의실 배치도 & 시간표 (15개)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'MY_RESERVATIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('MY_RESERVATIONS')}
        >
          📅 내 예약 현황 대장 (30건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'EQUIPMENT_STATUS' ? 'active' : ''}`}
          onClick={() => setActiveTab('EQUIPMENT_STATUS')}
        >
          ⚙️ 관리자 장비 점검표
        </button>
      </div>

      {activeTab === 'MEETING_ROOMS' && (
        <div className="widget-section">
          <h2>🏢 층별 회의실 수용 인원 및 장비 옵션 (최소 15개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>회의실 ID</th>
                  <th>회의실명</th>
                  <th>위치 층</th>
                  <th>수용 인원</th>
                  <th>고정 설치 장비</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(rm => (
                  <tr key={rm.id}>
                    <td><strong>{rm.id}</strong></td>
                    <td>{rm.name}</td>
                    <td><span className="eqp-type-tag">{rm.floor}층</span></td>
                    <td>{rm.capacity}명</td>
                    <td><small>{rm.equipmentOptions?.join(', ')}</small></td>
                    <td><span className={`status-badge ${rm.status === 'AVAILABLE' ? 'confirmed' : 'cancelled'}`}>{rm.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'MY_RESERVATIONS' && (
        <div className="widget-section">
          <h2>📅 회의실 & 공용 장비 예약 대장 (최소 30개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>예약 ID</th>
                  <th>예약자</th>
                  <th>회의실명</th>
                  <th>예약 일시</th>
                  <th>동봉 신청 장비</th>
                  <th>목적</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(resv => (
                  <tr key={resv.id}>
                    <td><strong>{resv.id}</strong></td>
                    <td>{resv.empName}</td>
                    <td>{resv.roomName}</td>
                    <td>{resv.date} ({resv.timeSlot})</td>
                    <td><small>{resv.equipments?.join(', ') || '없음'}</small></td>
                    <td><small>{resv.purpose}</small></td>
                    <td><span className={`status-badge ${resv.status.toLowerCase()}`}>{resv.status}</span></td>
                    <td>
                      <button 
                        className="delete-btn-sm"
                        onClick={() => deleteReservation(resv.id)}
                      >
                        🗑️ 취소/삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 장비 예약 삭제(DELETE) 시 대장에서는 소거되나 장비별 사용 횟수 및 월별 사용 통계 수치에는 남음 (Error 4)</small>
        </div>
      )}

      {activeTab === 'EQUIPMENT_STATUS' && (
        <div className="widget-section">
          <h2>⚙️ 관리자 사내 공용 장비 점검표</h2>
          <div style={{ marginTop: '0.85rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedEquipmentStatusUpdate('EQP-001')}>
              🔒 무권한 직원의 장비 상태 변경 (Error 7)
            </button>
            <small className="warn-desc">* 일반 직원이 장비 상태 변경 시 HTTP 403 오류가 반환되나 서버 활동 로그에는 변경 성공(Status 200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
