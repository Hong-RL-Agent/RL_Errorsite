import React from 'react';

export default function RightPanel({
  selectedReservation,
  setSelectedReservation,
  triggerServiceDateRace,
  triggerCancelStatusConflict,
  triggerUnauthorizedStatusChange
}) {
  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>📅 정비 항목 및 예약 날짜 변경</h3>
        {selectedReservation ? (
          <div className="detail-panel">
            <p>선택 예약번호: <strong>{selectedReservation.id}</strong> ({selectedReservation.centerName})</p>

            <div className="form-group">
              <label>예약 방문 날짜 변경:</label>
              <input 
                type="date" 
                value={selectedReservation.date || ''} 
                onChange={(e) => setSelectedReservation({ ...selectedReservation, date: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>정비 항목 선택:</label>
              <div className="input-row">
                <select 
                  value={selectedReservation.serviceType || 'ENGINE_OIL'} 
                  onChange={(e) => setSelectedReservation({ ...selectedReservation, serviceType: e.target.value })}
                >
                  <option value="ENGINE_OIL">엔진오일 교환</option>
                  <option value="BRAKE_PAD">브레이크 패드</option>
                  <option value="TIRE">타이어 교체</option>
                  <option value="BATTERY">배터리 점검</option>
                  <option value="INSPECTION">정밀 점검</option>
                </select>
                <button className="save-btn" onClick={() => triggerServiceDateRace(selectedReservation)}>
                  정비 수정 (Error 1)
                </button>
              </div>
              <small className="warn-desc">* 정비 항목 수정(3초 지연 완료) 직후 날짜 변경(0.1초 완료) 시, 3초 뒤 이전 날짜 데이터가 동봉되어 롤백됨 (Error 1)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">
            수정할 예약을 대장 테이블에서 클릭해 선택하세요.
          </div>
        )}
      </div>

      <div className="detail-widget">
        <h3>⚡ 예약 취소 및 정비사 작업 상태 변경</h3>
        {selectedReservation ? (
          <div className="detail-panel">
            <p>현재 상태: <span className={`status-badge ${selectedReservation.status.toLowerCase()}`}>{selectedReservation.status}</span></p>

            <div className="front-actions-group">
              <button 
                className="cancel-resv-btn"
                onClick={() => triggerCancelStatusConflict(selectedReservation)}
              >
                ⚡ 취소 후 상태 변경 (Error 2)
              </button>
            </div>
            <small className="warn-desc">* 취소(0.5초 완료) 직후 상태 변경(4초 지연 완료) 요청 시 취소 완료된 예약이 QUEUED 대기 상태로 재부활함 (Error 2)</small>

            <div className="unauth-section">
              <button className="unauth-btn" onClick={() => triggerUnauthorizedStatusChange(selectedReservation)}>
                🚨 일반 정비사 무단 상태 변경 (Error 7)
              </button>
              <small className="warn-desc">* HTTP 403 에러를 반환하나 활동 서버 로그(activityLogs)에는 정상 성공으로 기록됨 (Error 7)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">
            작업 상태를 관리하려면 예약을 선택하십시오.
          </div>
        )}
      </div>
    </aside>
  );
}
