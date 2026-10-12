'use client';

import React, { useState, useEffect } from 'react';
import { updateProjectSettings, fetchProject } from '../lib/api';

export default function ProjectSettingsModal({
  project,
  isOpen,
  onClose,
  onSettingsSaved,
  onNotify
}) {
  const [slackNotification, setSlackNotification] = useState(false);
  const [emailDigest, setEmailDigest] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setSlackNotification(Boolean(project.slack_notification));
      setEmailDigest(Boolean(project.email_digest));
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateProjectSettings(project.id, {
        slack_notification: slackNotification,
        email_digest: emailDigest
      });

      if (res.success) {
        onNotify && onNotify(res.message || '프로젝트 설정이 저장되었습니다.', 'success');
        onSettingsSaved && onSettingsSaved(res.data);
        onClose();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '설정 저장 실패', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: project.color || '#7C3AED' }}
            />
            <h3 className="font-bold text-slate-900 text-base">
              [{project.key}] {project.name} 설정
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">프로젝트 고유 정보</p>
            <p>ID: #{project.id} | 키: {project.key}</p>
            <p className="text-slate-500">{project.description || '설명 없음'}</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              알림 및 통합 설정
            </h4>

            {/* Slack Notification Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-800 block">Slack 실시간 알림</span>
                <span className="text-xs text-slate-500">
                  업무 상태 변경 및 담당자 지정 시 지정 채널로 웹훅을 발송합니다.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  checked={slackNotification}
                  onChange={(e) => setSlackNotification(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Email Digest Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-800 block">주간 업무 요약 리포트 이메일</span>
                <span className="text-xs text-slate-500">
                  매주 월요일 오전 팀원들에게 마감 업무 및 주간 요약을 전송합니다.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              닫기
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? '저장 중...' : '설정 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
