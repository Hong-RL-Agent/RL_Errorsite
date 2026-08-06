import React, { useState } from 'react';

export default function CenterSection({
  seats,
  reservations,
  ticketLogs,
  deleteReservation,
  openTicketModal,
  testUnauthorizedTicketIssue
}) {
  const [activeTab, setActiveTab] = useState('SEAT_MAP'); // 'SEAT_MAP' | 'MY_TICKETS' | 'TICKET_LOGS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'SEAT_MAP' ? 'active' : ''}`}
          onClick={() => setActiveTab('SEAT_MAP')}
        >
          🎭 공연장 좌석배치도 (120석)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'MY_TICKETS' ? 'active' : ''}`}
          onClick={() => setActiveTab('MY_TICKETS')}
        >
          🎟️ 예매 내역 & 내 티켓 (35건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'TICKET_LOGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('TICKET_LOGS')}
        >
          📜 발권 및 좌석변경 로그 (50건)
        </button>
      </div>

      {activeTab === 'SEAT_MAP' && (
        <div className="widget-section">
          <h2>🎭 메인 무대 & 실시간 좌석 현황 배치도 (120석)</h2>
          <div className="stage-banner">STAGE / MAIN PERFORMANCE AREA</div>
          <div className="seat-grid-box">
            {seats.map(st => (
              <div 
                key={st.id} 
                className={`seat-unit-btn ${st.grade.toLowerCase()} ${st.status === 'OCCUPIED' ? 'occupied' : ''}`}
              >
                {st.seatNo}
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: '1.25rem' }}>🎫 공연장 예매 현황 대장 (최소 35개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>예매 ID</th>
                  <th>공연명</th>
                  <th>공연 일시</th>
                  <th>예매자명</th>
                  <th>좌석 번호</th>
                  <th>결제 금액</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(resv => (
                  <tr key={resv.id}>
                    <td><strong>{resv.id}</strong></td>
                    <td>{resv.showTitle}</td>
                    <td>{resv.showDate}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{resv.userName}</strong></td>
                    <td><span className="genre-tag">{resv.seatNo}</span></td>
                    <td>{resv.price.toLocaleString()}원</td>
                    <td><span className={`status-badge ${resv.status.toLowerCase()}`}>{resv.status}</span></td>
                    <td>
                      <button className="detail-btn-sm" onClick={() => openTicketModal(resv)}>
                        좌석 변경
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'MY_TICKETS' && (
        <div className="widget-section">
          <h2>🎟️ 예매 확인 대장 & 내 티켓</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>티켓 ID</th>
                  <th>공연명</th>
                  <th>예매자명</th>
                  <th>발급 좌석</th>
                  <th>결제 금액</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(resv => (
                  <tr key={resv.id}>
                    <td><strong>{resv.id}</strong></td>
                    <td>{resv.showTitle}</td>
                    <td>{resv.userName}</td>
                    <td><span className="genre-tag">{resv.seatNo}</span></td>
                    <td>{resv.price.toLocaleString()}원</td>
                    <td><span className={`status-badge ${resv.status.toLowerCase()}`}>{resv.status}</span></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteReservation(resv.id)}>
                        🗑️ 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 예매 삭제(DELETE) 시 대장에서는 소거되나 공연별 예매율 및 매출 통계 수치에는 남음 (Error 4)</small>
        </div>
      )}

      {activeTab === 'TICKET_LOGS' && (
        <div className="widget-section">
          <h2>📜 티켓 발권 및 상태 변동 이력 로그 (최소 50개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>로그 ID</th>
                  <th>예매 ID</th>
                  <th>이벤트 액션</th>
                  <th>대상 좌석</th>
                  <th>발생 일시</th>
                  <th>작업자</th>
                </tr>
              </thead>
              <tbody>
                {ticketLogs.map(tl => (
                  <tr key={tl.id}>
                    <td><strong>{tl.id}</strong></td>
                    <td>{tl.reservationId}</td>
                    <td>{tl.action}</td>
                    <td><span className="genre-tag">{tl.seatNo}</span></td>
                    <td><small>{tl.timestamp}</small></td>
                    <td>{tl.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '0.85rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedTicketIssue('RES-5001')}>
              🔒 일반 직원의 티켓 발권 시도 (Error 7)
            </button>
            <small className="warn-desc">* 일반 직원이 발권 시 HTTP 403 오류를 반환하나 백엔드 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
