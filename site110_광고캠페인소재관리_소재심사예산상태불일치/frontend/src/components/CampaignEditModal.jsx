import React, { useState } from 'react';

export default function CampaignEditModal({ campaign, onClose, onConfirm }) {
  const [title, setTitle] = useState(campaign?.title || '');
  const [dailyBudget, setDailyBudget] = useState(campaign?.dailyBudget || 0);
  const [targetRegion, setTargetRegion] = useState(campaign?.targetRegion || '');

  if (!campaign) return null;

  const handleSave = () => {
    onConfirm(campaign.id, title, dailyBudget, targetRegion);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>📢 캠페인 정보 수정 (캠페인명, 일일예산, 타겟지역)</h3>
        <p>캠페인 ID: <strong style={{ color: 'var(--color-primary)' }}>{campaign.id}</strong></p>

        <div className="form-group">
          <label>캠페인명:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="form-group">
          <label>일일 예산 (부분저장 오류 - Error 8):</label>
          <input type="number" value={dailyBudget} onChange={(e) => setDailyBudget(Number(e.target.value))} />
        </div>

        <div className="form-group">
          <label>타겟 지역:</label>
          <input type="text" value={targetRegion} onChange={(e) => setTargetRegion(e.target.value)} />
        </div>

        <div className="modal-foot">
          <button className="save-btn" style={{ backgroundColor: 'var(--color-border)', color: '#ffffff' }} onClick={onClose}>
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
