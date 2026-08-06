import React, { useState } from 'react';

export default function CenterSection({
  seats,
  selectedSeat,
  setSelectedSeat,
  sortedBooks,
  selectedBook,
  setSelectedBook,
  confirmReserveBook,
  userReservations,
  deleteReservation,
  triggerReserveCancelConflict
}) {
  const [activeTab, setActiveTab] = useState('SEAT_MAP'); // 'SEAT_MAP' | 'BOOK_SEARCH' | 'MY_RESERVATIONS'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'SEAT_MAP' ? 'active' : ''}`}
          onClick={() => setActiveTab('SEAT_MAP')}
        >
          🗺️ 열람실 좌석 배치도 (40개)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'BOOK_SEARCH' ? 'active' : ''}`}
          onClick={() => setActiveTab('BOOK_SEARCH')}
        >
          📚 도서 자료 검색 (30권)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'MY_RESERVATIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('MY_RESERVATIONS')}
        >
          📋 내 예약 및 대출 현황
        </button>
      </div>

      {activeTab === 'SEAT_MAP' && (
        <div className="seat-map-header">
          <h2>🏢 층별 실시간 좌석 배치도</h2>
          <div className="seat-grid-canvas">
            {seats.map(s => (
              <div 
                key={s.id}
                className={`seat-block ${s.status === 'OCCUPIED' ? 'occupied' : ''} ${selectedSeat?.id === s.id ? 'active' : ''}`}
                onClick={() => setSelectedSeat(s)}
              >
                <div><strong>{s.id}</strong></div>
                <div>{s.name.split(' ').pop()}</div>
                <div>{s.status === 'OCCUPIED' ? '사용중' : '가능'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'BOOK_SEARCH' && (
        <div className="books-widget">
          <h2>📚 도서 자료 대장 (최소 30개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>자료 ID</th>
                  <th>도서명</th>
                  <th>저자</th>
                  <th>출판연도</th>
                  <th>대기수</th>
                  <th>예약</th>
                </tr>
              </thead>
              <tbody>
                {sortedBooks.map((b, idx) => (
                  <tr 
                    key={b.id}
                    className={`book-tr ${selectedBook?.id === b.id ? 'active' : ''}`}
                    onClick={() => setSelectedBook(b)}
                  >
                    <td><strong>{b.id}</strong></td>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.pubYear}년</td>
                    <td>{b.waitingCount}명</td>
                    <td>
                      <button 
                        className="reserve-book-btn"
                        onClick={(e) => { e.stopPropagation(); confirmReserveBook(idx); }}
                      >
                        자료 예약 (Error 3)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'MY_RESERVATIONS' && (
        <div className="widget-section">
          <h2>📋 내 예약/대출 내역 대장</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>예약 ID</th>
                  <th>대상 구분</th>
                  <th>좌석/자료명</th>
                  <th>시간/구분</th>
                  <th>인원</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {userReservations.map(resv => (
                  <tr key={resv.id}>
                    <td><strong>{resv.id}</strong></td>
                    <td>{resv.targetType}</td>
                    <td>{resv.targetName}</td>
                    <td>{resv.timeSlot}</td>
                    <td>{resv.capacity}명</td>
                    <td><span className={`status-badge ${resv.status.toLowerCase()}`}>{resv.status}</span></td>
                    <td>
                      {resv.targetType === 'SEAT' && (
                        <button 
                          className="delete-btn-sm" 
                          onClick={() => triggerReserveCancelConflict(resv)}
                        >
                          ⚡ 취소 후 재예약 (Error 2)
                        </button>
                      )}
                      <button 
                        className="delete-btn-sm" 
                        onClick={() => deleteReservation(resv.id)}
                      >
                        🗑️ 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 자료 예약 삭제(DELETE) 시 대장에서 지워지나 자료별 대기 수 및 관리자 통계에는 계속 남아 불일치함 (Error 4)</small>
        </div>
      )}
    </main>
  );
}
