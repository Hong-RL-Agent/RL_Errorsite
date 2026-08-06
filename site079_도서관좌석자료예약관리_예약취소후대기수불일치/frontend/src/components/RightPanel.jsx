import React from 'react';

export default function RightPanel({
  selectedReservation,
  setSelectedReservation,
  triggerTimeCapacityRace,
  selectedBookDetail
}) {
  return (
    <aside className="panel-section operations-sidebar">
      <!-- Study room time/capacity adjust (Error 1 Target) -->
      <div className="detail-widget">
        <h3>⏰ 스터디룸 시간 & 이용 인원 변경</h3>
        {selectedReservation ? (
          <div className="detail-panel">
            <p>예약 ID: <strong>{selectedReservation.id}</strong> ({selectedReservation.targetName})</p>

            <div className="form-group">
              <label>이용 인원 설정 (명):</label>
              <input 
                type="number" 
                value={selectedReservation.capacity || 1} 
                onChange={(e) => setSelectedReservation({ ...selectedReservation, capacity: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>예약 시간대 선택:</label>
              <div className="input-row">
                <select 
                  value={selectedReservation.timeSlot || '10:00-14:00'} 
                  onChange={(e) => setSelectedReservation({ ...selectedReservation, timeSlot: e.target.value })}
                >
                  <option value="09:00-12:00">09:00 - 12:00 (오전)</option>
                  <option value="12:00-15:00">12:00 - 15:00 (오후 A)</option>
                  <option value="15:00-18:00">15:00 - 18:00 (오후 B)</option>
                  <option value="18:00-21:00">18:00 - 21:00 (야간)</option>
                </select>
                <button className="save-btn" onClick={() => triggerTimeCapacityRace(selectedReservation)}>
                  시간 변경 (Error 1)
                </button>
              </div>
              <small className="warn-desc">* 시간 변경(3초 지연 완료) 직후 인원 변경(0.1초 완료) 시, 3초 뒤 이전 인원이 동봉되어 롤백 저장됨 (Error 1)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">수정할 스터디룸 예약을 선택하세요.</div>
        )}
      </div>

      <!-- Book detail inspector & image 404 test (Error 7 Target) -->
      <div className="detail-widget">
        <h3>📖 도서 자료 상세 & 표지 미리보기</h3>
        {selectedBookDetail ? (
          <div className="detail-panel">
            <p>도서명: <strong>{selectedBookDetail.title}</strong></p>
            <p>저자: <strong>{selectedBookDetail.author}</strong> ({selectedBookDetail.pubYear}년)</p>
            <p>현재 대기수: <strong>{selectedBookDetail.waitingCount}명</strong></p>

            <div className="form-group">
              <label>도서 표지 이미지:</label>
              <div className="book-cover-frame">
                {selectedBookDetail.imageUrl ? (
                  <img src={selectedBookDetail.imageUrl} alt="도서 표지" className="book-cover-img" />
                ) : (
                  <div className="empty-lbl-dark">표지 이미지 없음</div>
                )}
              </div>
              <small className="warn-desc">* 파일명에 공백/괄호 포함 시('도서 표지 (최신).jpg') 이중 인코딩으로 상세 페이지에서만 이미지 404 깨짐 (Error 7)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">상세 정보를 보려면 도서를 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
