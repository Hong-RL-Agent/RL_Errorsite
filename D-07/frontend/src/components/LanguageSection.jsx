import React, { useState, useEffect } from 'react';
import { Globe, Save } from 'lucide-react';
import { updatePreferences } from '../lib/api';

export default function LanguageSection({ user, preferences, onPreferencesUpdated, onShowToast }) {
  const [language, setLanguage] = useState(preferences?.language || 'ko');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences?.language) {
      setLanguage(preferences.language);
    }
  }, [preferences?.language]);

  async function handleSave() {
    try {
      setSaving(true);
      const res = await updatePreferences(user.id, { language });
      if (res.success) {
        onShowToast('언어 및 지역 설정이 성공적으로 저장되었습니다.');
        onPreferencesUpdated(res.data);
      }
    } catch (err) {
      console.error(err);
      onShowToast('언어 설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-card">
      <div className="section-header">
        <h3 className="section-title">언어 및 다국어 지원 설정</h3>
        <p className="section-desc">사용자 환경에 표시될 기본 인터페이스 언어를 선택합니다.</p>
      </div>

      <div className="form-group" style={{ maxWidth: '420px' }}>
        <label>표시 언어 선택 (Display Language)</label>
        <div style={{ position: 'relative' }}>
          <select
            className="form-control"
            value={language}
            onChange={e => setLanguage(e.target.value)}
            data-language-select
          >
            <option value="ko">한국어 (Korean)</option>
            <option value="en">English (United States)</option>
            <option value="ja">日本語 (Japanese)</option>
            <option value="zh">中文 (Simplified Chinese)</option>
          </select>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
          현재 적용 언어 코드: <strong style={{ color: 'var(--primary)' }}>{language}</strong>
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
          <span>{saving ? '저장 중...' : '언어 설정 저장'}</span>
        </button>
      </div>
    </div>
  );
}
