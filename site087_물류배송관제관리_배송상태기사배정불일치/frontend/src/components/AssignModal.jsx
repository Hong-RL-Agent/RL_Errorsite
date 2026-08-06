import React, { useState } from 'react';

export default function AssignModal({ order, drivers, onClose, onConfirm }) {
  const [selectedDriverId, setSelectedDriverId] = useState(order?.driverId || 'DRV-001');

  if (!order) return null;

  const handleSave = () => {
    const drv = drivers.find(d => d.id === selectedDriverId);
    onConfirm(order.id, selectedDriverId, drv?.name || '');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>🚚 기사 재배정 모달</h3>
        <p>운송장: <strong>{order.waybillNo}</strong> ({order.customerName} 고객)</p>
        <p>상품: {order.itemTitle}</p>

        <div className="form-group">
          <label>새 담당 기사 선택:</label>
          <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)}>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.vehicleNo}) - {d.assignedCount}건 진행중</option>
            ))}
          </select>
        </div>

        <div className="modal-foot">
          <button className="save-btn" style={{ backgroundColor: 'var(--color-border)' }} onClick={onClose}>
            취소
          </button>
          <button className="save-btn" onClick={handleSave}>
            배정 확정
          </button>
        </div>
      </div>
    </div>
  );
}
