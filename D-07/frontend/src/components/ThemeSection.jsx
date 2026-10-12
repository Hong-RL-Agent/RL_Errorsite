import React, { useState, useEffect } from 'react';
import { Sun, Moon, Laptop, Save } from 'lucide-react';
import { updatePreferences } from '../lib/api';

export default function ThemeSection({ user, preferences, onPreferencesUpdated, onShowToast }) {
  const [theme, setTheme] = useState(preferences?.theme || 'light');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences?.theme) {
      setTheme(preferences.theme);
    }
  }, [preferences?.theme]);

  async function handleSave() {
    try {
      setSaving(true);
      const res = await updatePreferences(user.id, { theme });
      if (res.success) {
        onShowToast('화면 테마 설정이 성공적으로 저장되었습니다.');
        onPreferencesUpdated(res.data);
      }
    } catch (err) {
      console.error(err);
      onShowToast('테마 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-card">
      <div className="section-header">
        <h3 className="section-title">화면 테마 및 디스플레이 모드</h3>
        <p className="section-desc">사용자 취향에 맞는 인터페이스 테마(라이트/다크)를 선택하고 영속 저장합니다.</p>
      </div>

      <div className="form-group">
        <label>화면 인터페이스 모드 선택</label>
        <div className="theme-options-grid" data-theme-container data-selected-theme={theme}>
          {/* 라이트 모드 */}
          <div
            className={`theme-card-option ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
            data-option-theme="light"
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sun size={24} color="#f59e0b" />
            </div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>라이트 모드</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>밝고 선명한 기본 테마</div>
          </div>

          {/* 다크 모드 */}
          <div
            className={`theme-card-option ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
            data-option-theme="dark"
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Moon size={24} color="#38bdf8" />
            </div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>다크 모드</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>눈의 피로를 줄여주는 어두운 테마</div>
          </div>

          {/* 시스템 동기화 모드 */}
          <div
            className={`theme-card-option ${theme === 'system' ? 'active' : ''}`}
            onClick={() => setTheme('system')}
            data-option-theme="system"
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Laptop size={24} color="#475569" />
            </div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>시스템 동기화</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>운영체제 환경설정에 맞춤</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={14} />
          <span>{saving ? '저장 중...' : '테마 설정 저장'}</span>
        </button>
      </div>
    </div>
  );
}
