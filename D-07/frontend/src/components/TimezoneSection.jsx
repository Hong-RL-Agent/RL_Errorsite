import React, { useState, useEffect } from 'react';
import { Clock, Save } from 'lucide-react';
import { updatePreferences } from '../lib/api';

export default function TimezoneSection({ user, preferences, onPreferencesUpdated, onShowToast }) {
  const [timezone, setTimezone] = useState(preferences?.timezone || 'Asia/Seoul');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences?.timezone) {
      setTimezone(preferences.timezone);
    }
  }, [preferences?.timezone]);

  async function handleSave() {
    try {
      setSaving(true);
      const res = await updatePreferences(user.id, { timezone });
      if (res.success) {
        onShowToast('표준 시간대 설정이 성공적으로 저장되었습니다.');
        onPreferencesUpdated(res.data);
      }
    } catch (err) {
      console.error(err);
      onShowToast('시간대 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-card">
      <div className="section-header">
        <h3 className="section-title">표준 시간대 (Timezone) 설정</h3>
        <p className="section-desc">활동 타임스탬프, 예약 작업 및 알림 발송 기준이 되는 표준 시간대를 지정합니다.</p>
      </div>

      <div className="form-group" style={{ maxWidth: '440px' }}>
        <label>표준 시간대 선택</label>
        <div style={{ position: 'relative' }}>
          <select
            className="form-control"
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            data-timezone-select
          >
            <option value="Asia/Seoul">대한민국 표준시 (Asia/Seoul - GMT+09:00)</option>
            <option value="America/New_York">미국 동부 표준시 (America/New_York - GMT-05:00)</option>
            <option value="Europe/London">영국 런던 그리니치 표준시 (Europe/London - GMT+00:00)</option>
            <option value="Asia/Tokyo">일본 도쿄 표준시 (Asia/Tokyo - GMT+09:00)</option>
            <option value="Europe/Paris">중앙유럽 표준시 (Europe/Paris - GMT+01:00)</option>
          </select>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
          현재 시스템 적용 시간대: <strong style={{ color: 'var(--primary)' }}>{timezone}</strong>
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={14} />
          <span>{saving ? '저장 중...' : '시간대 설정 저장'}</span>
        </button>
      </div>
    </div>
  );
}
