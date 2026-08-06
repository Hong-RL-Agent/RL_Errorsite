import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedCrop,
  setSelectedCrop,
  triggerIrrigationTimeVolumeRace,
  triggerCancelResolveConflict,
  triggerPartialCropSave
}) {
  const [cropName, setCropName] = useState('');
  const [growthStage, setGrowthStage] = useState('');
  const [manager, setManager] = useState('');

  useEffect(() => {
    if (selectedCrop) {
      setCropName(selectedCrop.name || '');
      setGrowthStage(selectedCrop.growthStage || '');
      setManager(selectedCrop.manager || '');
    }
  }, [selectedCrop]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Irrigation Schedule & Volume Race Widget (Error 1 Target) */}
      <div className="detail-widget">
        <h3>💦 관수 예약 시간 & 공급량 제어</h3>
        {selectedCrop ? (
          <div className="detail-panel">
            <p>작물 ID: <strong>{selectedCrop.id}</strong></p>
            <p>작물명: <strong>{selectedCrop.name}</strong> ({selectedCrop.growthStage})</p>
            <p>소속 구역: <strong className="zone-tag">{selectedCrop.zoneId}</strong></p>

            <div className="form-group">
              <label>관수 공급량 조정 (ml):</label>
              <input 
                type="number" 
                value={selectedCrop.irrigationVolume || 500} 
                onChange={(e) => setSelectedCrop({ ...selectedCrop, irrigationVolume: parseInt(e.target.value || '0') })}
              />
            </div>

            <div className="form-group">
              <label>예약 시간 선택:</label>
              <div className="input-row">
                <select 
                  value={selectedCrop.scheduledTime || '08:00'} 
                  onChange={(e) => setSelectedCrop({ ...selectedCrop, scheduledTime: e.target.value })}
                >
                  <option value="06:00">06:00 (아침)</option>
                  <option value="08:00">08:00 (오전)</option>
                  <option value="11:00">11:00 (주간)</option>
                  <option value="15:00">15:00 (오후)</option>
                  <option value="18:00">18:00 (일몰)</option>
                </select>
                <button className="save-btn" onClick={() => triggerIrrigationTimeVolumeRace(selectedCrop)}>
                  시간 변경 (Error 1)
                </button>
              </div>
              <small className="warn-desc">* 예약 시간(3초 지연 완료) 직후 관수량 변경(0.1초 완료) 시, 3초 뒤 이전 관수량이 동봉되어 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelResolveConflict(selectedCrop)}>
                ⚡ 관수 취소 후 이상알림 처리 (Error 2)
              </button>
              <small className="warn-desc">* 관수 취소(0.5초 완료) 직후 알림 처리(4초 지연 완료) 시, 늦은 알림 처리 요청이 취소된 작업을 다시 진행중 상태로 재활성화시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">제어할 작물 항목을 선택하세요.</div>
        )}
      </div>

      {/* Crop Edit Partial Save Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>🌱 작물 생육 정보 수정 (Error 8)</h3>
        {selectedCrop ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>작물명:</label>
              <input type="text" value={cropName} onChange={(e) => setCropName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>생육 단계:</label>
              <input type="text" value={growthStage} onChange={(e) => setGrowthStage(e.target.value)} />
            </div>

            <div className="form-group">
              <label>담당자 (부분저장 미반영):</label>
              <input type="text" value={manager} onChange={(e) => setManager(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialCropSave(selectedCrop.id, cropName, growthStage, manager)}
            >
              작물 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 작물명/생육단계/담당자를 동시에 수정하면 백엔드에는 담당자만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 작물을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
