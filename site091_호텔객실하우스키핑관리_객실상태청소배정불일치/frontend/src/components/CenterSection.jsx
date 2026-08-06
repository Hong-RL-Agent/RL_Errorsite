import React, { useState } from 'react';

export default function CenterSection({
  rooms,
  cleaningLogs,
  guestRequests,
  deleteCleaningLog,
  openRoomModal,
  testUnauthorizedInspect
}) {
  const [activeTab, setActiveTab] = useState('FLOOR_MAP'); // 'FLOOR_MAP' | 'CLEANING_LOGS' | 'GUEST_REQUESTS'

  const floor1Rooms = rooms.filter(r => r.floor === 1);
  const floor2Rooms = rooms.filter(r => r.floor === 2);
  const floor3Rooms = rooms.filter(r => r.floor === 3);

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'FLOOR_MAP' ? 'active' : ''}`}
          onClick={() => setActiveTab('FLOOR_MAP')}
        >
          🏨 층별 객실 배치도 (총 45개 객실)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'CLEANING_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('CLEANING_LOGS')}
        >
          🧹 하우스키핑 청소 수행 대장 (50건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'GUEST_REQUESTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('GUEST_REQUESTS')}
        >
          🛎️ 고객 서비스 요청 목록 (25건)
        </button>
      </div>

      {activeTab === 'FLOOR_MAP' && (
        <div className="widget-section">
          <h2>🏨 층별 객실 상태 배치도</h2>

          <div className="floor-container">
            <div className="floor-title-bar">
              <span>3층 (스위트 / 이그제큐티브 층)</span>
              <small>총 15개 객실</small>
            </div>
            <div className="room-grid-box">
              {floor3Rooms.map(rm => (
                <div key={rm.id} className={`room-unit-card ${rm.status.toLowerCase()}`}>
                  <div className="room-unit-head">
                    <span className="room-num">{rm.id}호</span>
                    <span className={`status-badge ${rm.status.toLowerCase()}`}>{rm.status}</span>
                  </div>
                  <div className="room-unit-type">{rm.type}</div>
                  <div className="room-unit-staff">👤 {rm.cleanerName}</div>
                  <small className="room-unit-guest">투숙객: {rm.guestName || '-'}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="floor-container">
            <div className="floor-title-bar">
              <span>2층 (디럭스 / 스탠다드 층)</span>
              <small>총 15개 객실</small>
            </div>
            <div className="room-grid-box">
              {floor2Rooms.map(rm => (
                <div key={rm.id} className={`room-unit-card ${rm.status.toLowerCase()}`}>
                  <div className="room-unit-head">
                    <span className="room-num">{rm.id}호</span>
                    <span className={`status-badge ${rm.status.toLowerCase()}`}>{rm.status}</span>
                  </div>
                  <div className="room-unit-type">{rm.type}</div>
                  <div className="room-unit-staff">👤 {rm.cleanerName}</div>
                  <small className="room-unit-guest">투숙객: {rm.guestName || '-'}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="floor-container">
            <div className="floor-title-bar">
              <span>1층 (로비연계 / 스탠다드 층)</span>
              <small>총 15개 객실</small>
            </div>
            <div className="room-grid-box">
              {floor1Rooms.map(rm => (
                <div key={rm.id} className={`room-unit-card ${rm.status.toLowerCase()}`}>
                  <div className="room-unit-head">
                    <span className="room-num">{rm.id}호</span>
                    <span className={`status-badge ${rm.status.toLowerCase()}`}>{rm.status}</span>
                  </div>
                  <div className="room-unit-type">{rm.type}</div>
                  <div className="room-unit-staff">👤 {rm.cleanerName}</div>
                  <small className="room-unit-guest">투숙객: {rm.guestName || '-'}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'CLEANING_LOGS' && (
        <div className="widget-section">
          <h2>🧹 하우스키핑 청소 및 점검 수행 이력 (50개 로그)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>로그 ID</th>
                  <th>객실 번호</th>
                  <th>담당 직원 ID</th>
                  <th>담당 직원명</th>
                  <th>청소 유형</th>
                  <th>완료/진행 일시</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {cleaningLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.roomId}호</strong></td>
                    <td>{log.staffId}</td>
                    <td>{log.staffName}</td>
                    <td>{log.type}</td>
                    <td><small>{log.completedAt}</small></td>
                    <td><span className={`status-badge ${log.status.toLowerCase()}`}>{log.status}</span></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteCleaningLog(log.id)}>
                        🗑️ 로그 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 청소 완료 로그 삭제(DELETE) 시 이력 대장에서는 소거되나 직원별 완료 건수 및 대시보드 청소율 그래프 통계 수치에는 남음 (Error 4)</small>
        </div>
      )}

      {activeTab === 'GUEST_REQUESTS' && (
        <div className="widget-section">
          <h2>🛎️ 실시간 고객 요청 접수 대장 (25개 요청)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>요청 ID</th>
                  <th>객실 번호</th>
                  <th>고객명</th>
                  <th>요청 사항 내용</th>
                  <th>접수 일시</th>
                  <th>처리 상태</th>
                </tr>
              </thead>
              <tbody>
                {guestRequests.map(req => (
                  <tr key={req.id}>
                    <td><strong>{req.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{req.roomId}호</strong></td>
                    <td>{req.guestName}</td>
                    <td>{req.request}</td>
                    <td><small>{req.createdAt}</small></td>
                    <td><span className={`status-badge ${req.status === 'COMPLETED' ? 'completed' : 'danger'}`}>{req.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedInspect('107')}>
              🔒 일반 사원의 강제 객실 점검 완료 시도 (Error 7)
            </button>
            <small className="warn-desc">* 일반 사원이 점검 승인 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
