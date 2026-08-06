import React, { useState } from 'react';

export default function CropEditModal({ crop, onClose, onConfirm }) {
  const [cropName, setCropName] = useState(crop?.name || '');
  const [growthStage, setGrowthStage] = useState(crop?.growthStage || '');
  const [manager, setManager] = useState(crop?.manager || '');

  if (!crop) return null;

  const handleSave = () => {
    onConfirm(crop.id, cropName, growthStage, manager);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>🌱 작물 관리 및 정보 수정 모달</h3>
        <p>작물 ID: <strong>{crop.id}</strong> ({crop.zoneId})</p>

        <div className="form-group">
          <label>작물명:</label>
          <input type="text" value={cropName} onChange={(e) => setCropName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>생육 단계:</label>
          <input type="text" value={growthStage} onChange={(e) => setGrowthStage(e.target.value)} />
        </div>

        <div className="form-group">
          <label>담당자:</label>
          <input type="text" value={manager} onChange={(e) => setManager(e.target.value)} />
        </div>

        <div className="modal-foot">
          <button className="save-btn" style={{ backgroundColor: 'var(--color-border)' }} onClick={onClose}>
            취소
          </button>
          <button className="save-btn" onClick={handleSave}>
            저장 확정
          </button>
        </div>
      </div>
    </div>
  );
}
