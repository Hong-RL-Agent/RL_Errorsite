import React, { useState } from 'react';

export default function CenterSection({
  patients,
  rooms,
  medications,
  nurses,
  deleteMedication,
  openRoomMoveModal,
  testUnauthorizedRoomMove
}) {
  const [activeTab, setActiveTab] = useState('ROOM_LAYOUT'); // 'ROOM_LAYOUT' | 'MEDICATION_SCHEDULE' | 'NURSE_ASSIGNMENT'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'ROOM_LAYOUT' ? 'active' : ''}`}
          onClick={() => setActiveTab('ROOM_LAYOUT')}
        >
          🏥 병실 배치도 & 잔여 베드 (20개 병실)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'MEDICATION_SCHEDULE' ? 'active' : ''}`}
          onClick={() => setActiveTab('MEDICATION_SCHEDULE')}
        >
          💊 투약 일정표 & 이력 대장 (70건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'NURSE_ASSIGNMENT' ? 'active' : ''}`}
          onClick={() => setActiveTab('NURSE_ASSIGNMENT')}
        >
          👩‍⚕️ 간호사 담당 환자 배정표 (12명)
        </button>
      </div>

      {activeTab === 'ROOM_LAYOUT' && (
        <div className="widget-section">
          <h2>🏥 병동 병실 배치도 & 재실 환자 현황 (최소 20개)</h2>
          <div className="room-grid-box">
            {rooms.map(rm => (
              <div key={rm.id} className="room-unit-card">
                <div className="room-header">
                  <span>{rm.roomNo}</span>
                  <span className="room-tag">{rm.ward}</span>
                </div>
                <div className="room-occ">{rm.currentCount} / {rm.capacity} 베드 ({rm.type})</div>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: '1.25rem' }}>📋 병동 재실 환자 목록 대장 (최소 30명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>환자 ID</th>
                  <th>성함 (성별/나이)</th>
                  <th>현재 병실</th>
                  <th>병동</th>
                  <th>진단명</th>
                  <th>담당 간호사</th>
                  <th>입원 상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.id}</strong></td>
                    <td>{p.name} ({p.gender}/{p.age})</td>
                    <td><span className="room-tag">{p.roomNo}</span></td>
                    <td>{p.ward}</td>
                    <td>{p.diagnosis}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{p.nurseName}</strong></td>
                    <td><span className={`status-badge ${p.status.toLowerCase()}`}>{p.status}</span></td>
                    <td>
                      <button className="detail-btn-sm" onClick={() => openRoomMoveModal(p)}>
                        병실 이동
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'MEDICATION_SCHEDULE' && (
        <div className="widget-section">
          <h2>💊 통합 투약 일정표 & 기록 관리 대장 (최소 70개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>투약 ID</th>
                  <th>환자명</th>
                  <th>기록 병실</th>
                  <th>처방 의약품명</th>
                  <th>용법/용량</th>
                  <th>투약 예정시간</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {medications.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.id}</strong></td>
                    <td>{m.patientName}</td>
                    <td><span className="room-tag">{m.roomNo}</span></td>
                    <td>{m.medicineName}</td>
                    <td><small>{m.dose}</small></td>
                    <td>{m.timeSlot}</td>
                    <td><span className={`status-badge ${m.status.toLowerCase()}`}>{m.status}</span></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteMedication(m.id)}>
                        🗑️ 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 투약 기록 삭제(DELETE) 시 이력 대장에서는 소거되나 병동별 투약 완료율 및 간호사 처리량 그래프 수치에는 남음 (Error 4)</small>
        </div>
      )}

      {activeTab === 'NURSE_ASSIGNMENT' && (
        <div className="widget-section">
          <h2>👩‍⚕️ 간호사 근무 시프트 & 담당 환자 수 (최소 12명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>간호사 ID</th>
                  <th>성함</th>
                  <th>직급</th>
                  <th>담당 병동</th>
                  <th>근무 시프트</th>
                  <th>담당 환자 수</th>
                </tr>
              </thead>
              <tbody>
                {nurses.map(n => (
                  <tr key={n.id}>
                    <td><strong>{n.id}</strong></td>
                    <td>{n.name}</td>
                    <td>{n.role}</td>
                    <td>{n.ward}</td>
                    <td><span className="status-badge completed">{n.shift}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{n.assignedPatientCount}명</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '0.85rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedRoomMove('PAT-1001')}>
              🔒 일반 간호사의 병실 이동 시도 (Error 7)
            </button>
            <small className="warn-desc">* 일반 간호사가 병실 이동 시 HTTP 403 오류를 반환하나 백엔드 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
