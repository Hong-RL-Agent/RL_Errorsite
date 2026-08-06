import React, { useState } from 'react';

export default function CenterSection({
  reservations,
  tickets,
  deleteReservation,
  deleteMenuUnauthorized
}) {
  const [activeTab, setActiveTab] = useState('MY_RESERVATIONS'); // 'MY_RESERVATIONS' | 'TICKET_HISTORY' | 'CONGESTION_GRAPH'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'MY_RESERVATIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('MY_RESERVATIONS')}
        >
          🍱 내 메뉴 예약 목록 (30건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'TICKET_HISTORY' ? 'active' : ''}`}
          onClick={() => setActiveTab('TICKET_HISTORY')}
        >
          🎟️ 식권 사용 타임라인 (30건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'CONGESTION_GRAPH' ? 'active' : ''}`}
          onClick={() => setActiveTab('CONGESTION_GRAPH')}
        >
          📊 식당별 실시간 혼잡도 SVG
        </button>
      </div>

      {activeTab === 'MY_RESERVATIONS' && (
        <div className="widget-section">
          <h2>🍱 내 구내식당 메뉴 예약 대장 (최소 30개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>예약 ID</th>
                  <th>사원명</th>
                  <th>예약 메뉴</th>
                  <th>수량</th>
                  <th>예약일자 / 식사</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(resv => (
                  <tr key={resv.id}>
                    <td><strong>{resv.id}</strong></td>
                    <td>{resv.empName}</td>
                    <td>{resv.menuName}</td>
                    <td>{resv.quantity}개</td>
                    <td>{resv.date} ({resv.mealTime})</td>
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
          <small className="warn-desc">* 메뉴 예약 삭제(DELETE) 시 대장에서는 소거되나 메뉴별 예약 수량 및 식당 정산 금액 통계 수치에는 남음 (Error 4)</small>
        </div>
      )}

      {activeTab === 'TICKET_HISTORY' && (
        <div className="widget-section">
          <h2>🎟️ 식권 구매 및 사용 타임라인 (최소 30개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>식권 ID</th>
                  <th>사원명</th>
                  <th>보유 식권 수량</th>
                  <th>식권 권종</th>
                  <th>구매 일자</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(tck => (
                  <tr key={tck.id}>
                    <td><strong>{tck.id}</strong></td>
                    <td>{tck.empName}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{tck.count}장</strong></td>
                    <td><span className="cafeteria-tag">{tck.ticketType}</span></td>
                    <td>{tck.boughtAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CONGESTION_GRAPH' && (
        <div className="widget-section">
          <h2>📊 식당별 시간대별 실시간 혼잡도 (SVG 그래프)</h2>
          <div className="svg-chart-box">
            <svg width="100%" height="180" viewBox="0 0 500 180">
              <line x1="50" y1="150" x2="450" y2="150" stroke="var(--color-border)" strokeWidth="2" />
              
              <!-- Cafeteria 1 -->
              <rect className="svg-bar" x="90" y="40" width="60" height="110" fill="var(--color-primary)" rx="4" />
              <text x="120" y="30" fill="var(--color-dark)" fontSize="12" textAnchor="middle" fontWeight="bold">92% (혼잡)</text>
              <text x="120" y="170" fill="var(--color-text)" fontSize="11" textAnchor="middle">제1식당 (본관)</text>

              <!-- Cafeteria 2 -->
              <rect className="svg-bar" x="220" y="70" width="60" height="80" fill="var(--color-warning)" rx="4" />
              <text x="250" y="60" fill="var(--color-dark)" fontSize="12" textAnchor="middle" fontWeight="bold">68% (보통)</text>
              <text x="250" y="170" fill="var(--color-text)" fontSize="11" textAnchor="middle">제2식당 (신관)</text>

              <!-- Cafeteria 3 -->
              <rect className="svg-bar" x="350" y="100" width="60" height="50" fill="var(--color-success)" rx="4" />
              <text x="380" y="90" fill="var(--color-dark)" fontSize="12" textAnchor="middle" fontWeight="bold">45% (여유)</text>
              <text x="380" y="170" fill="var(--color-text)" fontSize="11" textAnchor="middle">제3식당 (연구동)</text>
            </svg>
          </div>
          <div style={{ marginTop: '0.85rem' }}>
            <button className="delete-btn-sm" onClick={() => deleteMenuUnauthorized('MNU-101')}>
              🔒 관리자 메뉴 무권한 삭제 (Error 7)
            </button>
            <small className="warn-desc">* 일반 직원이 메뉴 삭제 시 HTTP 403 오류가 반환되나 서버 활동 로그에는 성공으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
