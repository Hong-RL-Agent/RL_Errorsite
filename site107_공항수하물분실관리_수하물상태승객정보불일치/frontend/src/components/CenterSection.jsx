import React, { useState } from 'react';

export default function CenterSection({
  baggage,
  passengers,
  flights,
  lostClaims,
  activityLogs,
  deleteProcessingLog,
  openPassengerModal,
  testUnauthorizedClose
}) {
  const [activeTab, setActiveTab] = useState('BAGGAGE_TABLE'); // 'BAGGAGE_TABLE' | 'PASSENGERS_FLIGHTS' | 'PROCESSING_LOGS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'BAGGAGE_TABLE' ? 'active' : ''}`}
          onClick={() => setActiveTab('BAGGAGE_TABLE')}
        >
          🧳 수하물 관제 & 추적 대장 (55개)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'PASSENGERS_FLIGHTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('PASSENGERS_FLIGHTS')}
        >
          ✈️ 승객 명단 (35명) & 공항 노선 항공편 (20개)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'PROCESSING_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('PROCESSING_LOGS')}
        >
          📋 처리 감사 로그 (80건) & 분실 신고 접수대 (30건)
        </button>
      </div>

      {activeTab === 'BAGGAGE_TABLE' && (
        <div className="widget-section">
          <h2>🧳 BagTrace 공항 실시간 수하물 관제 대장 (55개)</h2>

          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>수하물 ID</th>
                  <th>바코드 태그 번호</th>
                  <th>승객명</th>
                  <th>항공편</th>
                  <th>무게(kg)</th>
                  <th>현재 위치</th>
                  <th>담당 핸들러</th>
                  <th>수하물 상태</th>
                </tr>
              </thead>
              <tbody>
                {baggage.map(bag => (
                  <tr key={bag.id}>
                    <td><strong>{bag.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{bag.tagNo}</strong></td>
                    <td><strong>{bag.passengerName}</strong></td>
                    <td><span className="flight-badge">{bag.flightNo}</span></td>
                    <td><small>{bag.weightKg} kg</small></td>
                    <td><small>{bag.location}</small></td>
                    <td><strong>{bag.handlerName}</strong></td>
                    <td><span className={`status-badge ${bag.status.toLowerCase()}`}>{bag.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PASSENGERS_FLIGHTS' && (
        <div className="widget-section">
          <h2>✈️ 공항 노선 운항 항공편 (20개) & 👤 승객 명단 (35명)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>항공편 ID</th>
                  <th>편명</th>
                  <th>항공사</th>
                  <th>출발지</th>
                  <th>도착지</th>
                  <th>게이트</th>
                </tr>
              </thead>
              <tbody>
                {flights.map(flt => (
                  <tr key={flt.id}>
                    <td><strong>{flt.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{flt.flightNo}</strong></td>
                    <td>{flt.airline}</td>
                    <td><small>{flt.origin}</small></td>
                    <td><small>{flt.destination}</small></td>
                    <td><span className="flight-badge">GATE {flt.gate}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ marginTop: '1.25rem' }}>👤 등록 승객 명단 (35명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>승객 ID</th>
                  <th>승객 성명</th>
                  <th>연락처</th>
                  <th>지연 수하물 배송 주소</th>
                  <th>특별 요청사항</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map(psg => (
                  <tr key={psg.id}>
                    <td><strong>{psg.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{psg.name} 승객</strong></td>
                    <td><small>{psg.phone}</small></td>
                    <td><small>{psg.deliveryAddress}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{psg.requests}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PROCESSING_LOGS' && (
        <div className="widget-section">
          <h2>📋 수하물 처리 감사 로그 (80건) & 🚨 분실 신고 (30건)</h2>

          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>로그 ID</th>
                  <th>수하물 ID</th>
                  <th>작업 담당자</th>
                  <th>처리 내용</th>
                  <th>일시</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.baggageId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteProcessingLog(log.id)}>
                        🗑️ 로그 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 수하물 처리 로그 삭제(DELETE) 시 로그 대장에서는 소거되나 지연 수하물 수 및 분실 신고율 통계 수치에는 남음 (Error 4)</small>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedClose('LOST-4001')}>
              🔒 권한 없는 일반 직원의 분실 신고 종결 시도 (Error 7)
            </button>
            <small className="warn-desc">* 권한 없는 직원이 분실 신고 종결 처리 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
