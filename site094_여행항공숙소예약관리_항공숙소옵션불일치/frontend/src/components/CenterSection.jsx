import React, { useState } from 'react';

export default function CenterSection({
  destinations,
  flights,
  options,
  bookings,
  deleteOptionFromBooking,
  testUnauthorizedConfirmBooking
}) {
  const [activeTab, setActiveTab] = useState('FLIGHT_MAP'); // 'FLIGHT_MAP' | 'OPTIONS' | 'BOOKINGS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'FLIGHT_MAP' ? 'active' : ''}`}
          onClick={() => setActiveTab('FLIGHT_MAP')}
        >
          ✈️ 항공편 선택 & 아시아/글로벌 여행 지도 (30개)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'OPTIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('OPTIONS')}
        >
          🎁 패키지 여행 액티비티 & 옵션 (20개)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'BOOKINGS' ? 'active' : ''}`}
          onClick={() => setActiveTab('BOOKINGS')}
        >
          📜 예약 대장 & 관리자 현황 (30건)
        </button>
      </div>

      {activeTab === 'FLIGHT_MAP' && (
        <div className="widget-section">
          <h2>🗺️ 글로벌 패키지 여행 지도 & 항공편 검색 (30개)</h2>

          {/* SVG/CSS Dummy Map Component */}
          <div className="dummy-map-container">
            <svg className="dummy-map-svg" viewBox="0 0 800 300">
              <rect width="800" height="300" fill="#0b192c" rx="8" />
              {/* World outline paths */}
              <path d="M100 80 Q200 40 300 90 T500 100 T700 80" stroke="#1e3e62" strokeWidth="3" fill="none" />
              <path d="M150 160 Q250 180 350 150 T650 170" stroke="#1e3e62" strokeWidth="3" fill="none" />

              {/* Destination Nodes */}
              <g className="map-node" transform="translate(560, 130)">
                <circle r="8" fill="#00adb5" />
                <text x="12" y="4" fill="#ffffff" fontSize="11" fontWeight="bold">다낭 🌴</text>
              </g>
              <g className="map-node" transform="translate(680, 90)">
                <circle r="8" fill="#ff6b6b" />
                <text x="12" y="4" fill="#ffffff" fontSize="11" fontWeight="bold">도쿄 🗼</text>
              </g>
              <g className="map-node" transform="translate(640, 110)">
                <circle r="7" fill="#00adb5" />
                <text x="12" y="4" fill="#ffffff" fontSize="11">오사카 🏯</text>
              </g>
              <g className="map-node" transform="translate(520, 160)">
                <circle r="7" fill="#00adb5" />
                <text x="12" y="4" fill="#ffffff" fontSize="11">방콕 🛺</text>
              </g>
              <g className="map-node" transform="translate(540, 210)">
                <circle r="7" fill="#00adb5" />
                <text x="12" y="4" fill="#ffffff" fontSize="11">발리 🏄‍♂️</text>
              </g>
              <g className="map-node" transform="translate(220, 100)">
                <circle r="7" fill="#f59e0b" />
                <text x="12" y="4" fill="#ffffff" fontSize="11">파리 🥐</text>
              </g>
              <g className="map-node" transform="translate(140, 130)">
                <circle r="7" fill="#f59e0b" />
                <text x="12" y="4" fill="#ffffff" fontSize="11">하와이 🌺</text>
              </g>
            </svg>
          </div>

          <div className="table-scroll-box" style={{ marginTop: '0.75rem' }}>
            <table>
              <thead>
                <tr>
                  <th>항공편 ID</th>
                  <th>항공사 및 편명</th>
                  <th>목적지</th>
                  <th>출발/도착 시간</th>
                  <th>1인 왕복가</th>
                  <th>잔여 좌석</th>
                </tr>
              </thead>
              <tbody>
                {flights.map(flt => (
                  <tr key={flt.id}>
                    <td><strong>{flt.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{flt.airline}</strong></td>
                    <td>{flt.destination}</td>
                    <td>{flt.depTime} ➔ {flt.arrTime}</td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>₩{flt.price.toLocaleString()}</strong></td>
                    <td><span className="status-badge normal">{flt.seats}석 남음</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'OPTIONS' && (
        <div className="widget-section">
          <h2>🎁 현지 투어 & 액티비티 여행 옵션 목록 (20개)</h2>
          <div className="options-grid">
            {options.map(opt => (
              <div key={opt.id} className="option-card">
                <div className="option-card-head">
                  <span className="opt-category">{opt.category}</span>
                  <span className="opt-id">{opt.id}</span>
                </div>
                <h4 className="opt-name">{opt.name}</h4>
                <div className="opt-price">₩{opt.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'BOOKINGS' && (
        <div className="widget-section">
          <h2>📜 전체 패키지 예약 및 관리자 현황 대장 (30건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>예약 ID</th>
                  <th>예약자명</th>
                  <th>여행지</th>
                  <th>항공편</th>
                  <th>숙소</th>
                  <th>총 예약금액</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(bkg => (
                  <tr key={bkg.id}>
                    <td><strong>{bkg.id}</strong></td>
                    <td>{bkg.userName}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{bkg.destination}</strong></td>
                    <td><small>{bkg.flightInfo}</small></td>
                    <td><small>{bkg.hotelInfo}</small></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>₩{bkg.totalPrice.toLocaleString()}</strong></td>
                    <td><span className={`status-badge ${bkg.status === 'CONFIRMED' ? 'completed' : 'danger'}`}>{bkg.status}</span></td>
                    <td>
                      {bkg.options && bkg.options.length > 0 ? (
                        <button className="delete-btn-sm" onClick={() => deleteOptionFromBooking(bkg.id, bkg.options[0])}>
                          🗑️ 여행 옵션 삭제 (Error 4)
                        </button>
                      ) : (
                        <small className="empty-lbl-dark">옵션 없음</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 예약 옵션 삭제(DELETE) 시 예약 상세 옵션은 소거되나 총 예약 금액 및 매출 통계 그래프 수치에는 남음 (Error 4)</small>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedConfirmBooking('BKG-5001')}>
              🔒 CS 사원의 강제 예약 확정 시도 (Error 7)
            </button>
            <small className="warn-desc">* 일반 사원이 예약 확정 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
