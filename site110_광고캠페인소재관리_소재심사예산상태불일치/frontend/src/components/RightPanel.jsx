import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedCampaign,
  setSelectedCampaign,
  campaigns,
  creatives,
  triggerCreativeBudgetRace,
  triggerPauseAuditConflict,
  triggerPartialCampaignSave
}) {
  const [title, setTitle] = useState('');
  const [dailyBudget, setDailyBudget] = useState(0);
  const [targetRegion, setTargetRegion] = useState('');

  const targetCampaign = selectedCampaign || campaigns[0];
  const targetCreative = creatives.find(cr => cr.campaignId === targetCampaign?.id) || creatives[0];

  useEffect(() => {
    if (targetCampaign) {
      setTitle(targetCampaign.title || '');
      setDailyBudget(targetCampaign.dailyBudget || 0);
      setTargetRegion(targetCampaign.targetRegion || '');
    }
  }, [targetCampaign]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Creative Audit & Campaign Budget Control Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>🎨 소재 심사 승인 & 예산 변경 관제</h3>
        {targetCampaign ? (
          <div className="detail-panel">
            <p>캠페인 번호: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{targetCampaign.id}</strong></p>
            <p>광고주/제목: <strong>{targetCampaign.advertiserName} ({targetCampaign.title})</strong></p>
            <p>현재 상태: <span className={`status-badge ${targetCampaign.status.toLowerCase()}`}>{targetCampaign.status}</span></p>

            <div className="form-group">
              <label>일일 집행 예산 변경 (0.1초 완료):</label>
              <input 
                type="number" 
                value={targetCampaign.dailyBudget || 1000000} 
                onChange={(e) => setSelectedCampaign({ ...targetCampaign, dailyBudget: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>연결 소재 심사 승인 (Error 1 - 3초 지연):</label>
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerCreativeBudgetRace(targetCampaign, targetCreative)}>
                소재 승인 후 즉시 캠페인 예산 변경 (Error 1)
              </button>
              <small className="warn-desc">* 소재 승인(3초 지연) 직후 예산 변경(0.1초 완료) 시, 3초 뒤 이전 예산 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerPauseAuditConflict(targetCampaign, targetCreative)}>
                ⚡ 캠페인 일시중지 후 소재 심사완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 캠페인 일시중지(0.5초 완료) 직후 심사완료(4초 지연 완료) 시, 늦은 심사완료 요청이 일시중지된 캠페인을 RUNNING 집행중 상태로 복원시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 광고 캠페인 항목을 선택하세요.</div>
        )}
      </div>

      {/* Campaign Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>📢 캠페인명 & 타겟 지역 수정 (Error 8)</h3>
        {targetCampaign ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>캠페인 타이틀:</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="form-group">
              <label>일일 예산 (부분저장 미반영):</label>
              <input type="number" value={dailyBudget} onChange={(e) => setDailyBudget(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>타겟 타겟팅 지역:</label>
              <input type="text" value={targetRegion} onChange={(e) => setTargetRegion(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialCampaignSave(targetCampaign.id, title, dailyBudget, targetRegion)}
            >
              캠페인 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 캠페인명/일일예산/타겟지역을 동시에 수정하면 백엔드에는 일일예산만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 캠페인을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
