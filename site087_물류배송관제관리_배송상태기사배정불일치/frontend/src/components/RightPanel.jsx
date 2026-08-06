import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedOrder,
  setSelectedOrder,
  triggerStatusDriverRace,
  drivers,
  triggerCancelReassignConflict,
  triggerPartialAddressSave
}) {
  const [zipcode, setZipcode] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [deliveryMemo, setDeliveryMemo] = useState('');

  useEffect(() => {
    if (selectedOrder) {
      setZipcode(selectedOrder.zipcode || '');
      setDetailAddress(selectedOrder.detailAddress || '');
      setDeliveryMemo(selectedOrder.deliveryMemo || '');
    }
  }, [selectedOrder]);

  return (
    <aside className="panel-section operations-sidebar">
      <!-- Order Status & Driver adjust (Error 1 Target) -->
      <div className="detail-widget">
        <h3>🚚 배송 상태 & 담당 기사 변경</h3>
        {selectedOrder ? (
          <div className="detail-panel">
            <p>운송장 번호: <strong className="wb-tag">{selectedOrder.waybillNo}</strong></p>
            <p>수령인: <strong>{selectedOrder.customerName}</strong> ({selectedOrder.customerPhone})</p>
            <p>상품: <strong>{selectedOrder.itemTitle}</strong></p>
            <p>담당 기사: <strong style={{ color: 'var(--color-primary)' }}>{selectedOrder.driverName}</strong></p>

            <div className="form-group">
              <label>담당 기사 변경:</label>
              <select 
                value={selectedOrder.driverId || 'DRV-001'} 
                onChange={(e) => {
                  const d = drivers.find(drv => drv.id === e.target.value);
                  setSelectedOrder({ ...selectedOrder, driverId: e.target.value, driverName: d?.name || '' });
                }}
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.vehicleNo})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>배송 상태 조정:</label>
              <div className="input-row">
                <select 
                  value={selectedOrder.status || 'IN_DELIVERY'} 
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
                >
                  <option value="RECEIVED">접수완료 (RECEIVED)</option>
                  <option value="SORTING">분류중 (SORTING)</option>
                  <option value="IN_DELIVERY">배송중 (IN_DELIVERY)</option>
                  <option value="DELAYED">지연 (DELAYED)</option>
                  <option value="COMPLETED">배송완료 (COMPLETED)</option>
                </select>
                <button className="save-btn" onClick={() => triggerStatusDriverRace(selectedOrder)}>
                  상태 변경 (Error 1)
                </button>
              </div>
              <small className="warn-desc">* 상태 변경(3초 지연 완료) 직후 기사 변경(0.1초 완료) 시, 3초 뒤 이전 기사가 동봉되어 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-ord-btn" onClick={() => triggerCancelReassignConflict(selectedOrder)}>
                ⚡ 배송 취소 후 기사 재배정 (Error 2)
              </button>
              <small className="warn-desc">* 배송 취소(0.5초 완료) 직후 기사 재배정(4초 지연 완료) 시, 늦은 재배정 요청이 취소된 배송을 다시 배송중 상태로 재활성화시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">수정할 배송 항목을 선택하세요.</div>
        )}
      </div>

      <!-- Address Partial Save Widget (Error 8 Target) -->
      <div className="detail-widget">
        <h3>📍 배송 주소 및 메모 수정 (Error 8)</h3>
        {selectedOrder ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>우편번호:</label>
              <input type="text" value={zipcode} onChange={(e) => setZipcode(e.target.value)} />
            </div>

            <div className="form-group">
              <label>상세주소 (부분저장 미반영):</label>
              <input type="text" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} />
            </div>

            <div className="form-group">
              <label>배송 메모:</label>
              <input type="text" value={deliveryMemo} onChange={(e) => setDeliveryMemo(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialAddressSave(selectedOrder.id, zipcode, detailAddress, deliveryMemo)}
            >
              주소 수정 저장 (Error 8)
            </button>
            <small className="warn-desc">* 우편번호/상세주소/메모를 수정하면 백엔드에는 상세주소만 빼고 부분 저장되며, UI 토스트는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">주소를 수정할 배송 항목을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
