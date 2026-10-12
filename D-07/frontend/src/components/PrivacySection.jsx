import React, { useState, useEffect } from 'react';
import { Shield, Eye, Users, Lock, Save } from 'lucide-react';
import { updatePreferences } from '../lib/api';

export default function PrivacySection({ user, preferences, onPreferencesUpdated, onShowToast }) {
  const [privacyScope, setPrivacyScope] = useState(preferences?.privacy_scope || 'PUBLIC');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences?.privacy_scope) {
      setPrivacyScope(preferences.privacy_scope);
    }
  }, [preferences?.privacy_scope]);

  async function handleSave() {
    try {
      setSaving(true);
      const res = await updatePreferences(user.id, { privacy_scope: privacyScope });
      if (res.success) {
        onShowToast('개인정보 공개 범위가 성공적으로 저장되었습니다.');
        onPreferencesUpdated(res.data);
      }
    } catch (err) {
      console.error(err);
      onShowToast('공개 범위 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-card">
      <div className="section-header">
        <h3 className="section-title">개인정보 표시 및 공개 범위 설정</h3>
        <p className="section-desc">프로필 활동 및 참여 워크스페이스에 대한 타 사용자의 열람 권한 범위를 설정합니다.</p>
      </div>

      <div className="form-group" data-privacy-container data-current-privacy={privacyScope}>
        <label>프로필 및 활동 공개 수준</label>
        <div className="radio-list">
          {/* 전체 공개 */}
          <div
            className={`radio-card ${privacyScope === 'PUBLIC' ? 'active' : ''}`}
            onClick={() => setPrivacyScope('PUBLIC')}
            data-option-scope="PUBLIC"
          >
            <input
              type="radio"
              name="privacy_scope"
              checked={privacyScope === 'PUBLIC'}
              onChange={() => setPrivacyScope('PUBLIC')}
              data-privacy-option="PUBLIC"
              style={{ marginTop: '3px' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={16} color="var(--primary)" />
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>전체 공개 (Public)</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                SaaS 플랫폼의 모든 조직원 및 검색 결과에 내 프로필 정보가 표시됩니다.
              </p>
            </div>
          </div>

          {/* 소속 팀원에게만 공개 */}
          <div
            className={`radio-card ${privacyScope === 'TEAM_ONLY' ? 'active' : ''}`}
            onClick={() => setPrivacyScope('TEAM_ONLY')}
            data-option-scope="TEAM_ONLY"
          >
            <input
              type="radio"
              name="privacy_scope"
              checked={privacyScope === 'TEAM_ONLY'}
              onChange={() => setPrivacyScope('TEAM_ONLY')}
              data-privacy-option="TEAM_ONLY"
              style={{ marginTop: '3px' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} color="var(--primary)" />
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>동일 팀원에게만 공개 (Team Only)</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                같은 프로젝트 및 워크스페이스에 배정된 동료 팀원에게만 프로필이 표시됩니다.
              </p>
            </div>
          </div>

          {/* 비공개 */}
          <div
            className={`radio-card ${privacyScope === 'PRIVATE' ? 'active' : ''}`}
            onClick={() => setPrivacyScope('PRIVATE')}
            data-option-scope="PRIVATE"
          >
            <input
              type="radio"
              name="privacy_scope"
              checked={privacyScope === 'PRIVATE'}
              onChange={() => setPrivacyScope('PRIVATE')}
              data-privacy-option="PRIVATE"
              style={{ marginTop: '3px' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={16} color="var(--primary)" />
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>완전 비공개 (Private)</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                관리자를 제외한 누구에게도 프로필 정보와 활동 내역을 노출하지 않습니다.
              </p>
            </div>
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
          <span>{saving ? '저장 중...' : '공개 범위 설정 저장'}</span>
        </button>
      </div>
    </div>
  );
}
