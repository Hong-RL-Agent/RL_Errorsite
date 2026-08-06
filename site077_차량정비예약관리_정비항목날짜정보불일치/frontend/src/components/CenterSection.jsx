import React from 'react';

export default function CenterSection({
  selectedCenter,
  selectedVehicle,
  userReservations,
  deleteReservation,
  formatPrice,
  getServiceTypeLabel
}) {
  return (
    <main className="panel-section center-section">
      {selectedCenter ? (
        <div className="ctr-detail-header">
          <h2>{selectedCenter.name}</h2>
          <p>위치: <strong>{selectedCenter.region}</strong> | 평점: ⭐ {selectedCenter.rating} | 예상 정비 견적: <span className="price-lbl">{formatPrice(selectedCenter.estPrice)}</span></p>
        </div>
      ) : (
        <div className="ctr-detail-header">
          <h2>정비소를 선택하세요</h2>
        </div>
      )}

      <div className="widget-section history-widget">
        <div className="widget-header">
          <h2>🚘 차량별 누적 정비 이력 타임라인</h2>
        </div>
        
        {selectedVehicle && (
          <div className="vehicles-bar">
            <span>차량: <strong>{selectedVehicle.carNumber}</strong> ({selectedVehicle.model})</span>
            <span>누적 정비비: <strong>{formatPrice(selectedVehicle.totalMaintenanceCost)}</strong></span>
          </div>
        )}

        <div className="table-scroll-box">
          <table>
            <thead>
              <tr>
                <th>예약 ID</th>
                <th>차량 번호</th>
                <th>정비 항목</th>
                <th>예약 날짜</th>
                <th>견적 금액</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {userReservations.map(resv => (
                <tr key={resv.id}>
                  <td><strong>{resv.id}</strong></td>
                  <td>{resv.carNumber}</td>
                  <td>{getServiceTypeLabel(resv.serviceType)}</td>
                  <td>{resv.date}</td>
                  <td>{formatPrice(resv.estPrice)}</td>
                  <td><span className={`status-badge ${resv.status.toLowerCase()}`}>{resv.status}</span></td>
                  <td>
                    <button className="delete-btn-sm" onClick={() => deleteReservation(resv.id)}>
                      🗑️ (Error 4)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <small className="warn-desc">* 정비 이력 삭제(DELETE) 시 대장에서 지워지나 차량별 총 정비 금액 및 관리자 통계에는 기산 포함됨 (Error 4)</small>
      </div>
    </main>
  );
}
