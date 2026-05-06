import React, { useState } from 'react';
import { Save, Share, Download } from 'lucide-react';

export default function TripSummaryPanel({ trips }) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleOfflineSave = async () => {
    setSaving(true);
    setSaveError('');
    
    try {
      // Mock the API call first to make it a "real" interaction
      await fetch('/api/trips/save', { method: 'POST' });
      
      // INTENTIONAL GUI BUG: site018-bug01
      // Type: storage-quota-ui-lock
      // Description: 저장소 할당량 초과 상황에서 loading state를 해제하지 않아 저장 중 UI가 고착됨.
      throw new DOMException('QuotaExceededError: Failed to execute setItem on Storage: Setting the value of `offline_trips` exceeded the quota.', 'QuotaExceededError');
    } catch (e) {
      console.error('Offline save failed:', e);
      // Bug implementation: intentionally forgetting to call setSaving(false)
      // setSaving(false); 
      setSaveError('저장소 공간이 부족하여 오프라인 저장에 실패했습니다.');
    }
  };

  const totalDestinations = new Set(trips.map(t => t.city)).size;

  return (
    <div className="summary-panel">
      <h3 style={{fontSize: '1.25rem', marginBottom: '1.5rem'}}>내 일정 요약</h3>
      
      <div className="summary-item">
        <span className="text-muted">총 여행 수</span>
        <span style={{fontWeight: 600}}>{trips.length}개</span>
      </div>
      <div className="summary-item">
        <span className="text-muted">방문 도시</span>
        <span style={{fontWeight: 600}}>{totalDestinations}개 도시</span>
      </div>
      
      <div style={{marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <button 
          data-bug-id="site018-bug01"
          className="btn btn-primary flex items-center justify-center gap-2" 
          onClick={handleOfflineSave}
          disabled={saving}
          style={{width: '100%', padding: '1rem'}}
        >
          {saving ? <span className="spinner"></span> : <><Download size={18} /> 오프라인 저장</>}
        </button>
        {saveError && <p style={{color: 'var(--status-danger)', fontSize: '0.875rem', textAlign: 'center'}}>{saveError}</p>}
        
        <button className="btn btn-outline flex items-center justify-center gap-2" onClick={() => alert('준비중입니다.')}>
          <Share size={18} /> 친구와 공유하기
        </button>
      </div>
    </div>
  );
}
