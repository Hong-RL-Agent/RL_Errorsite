'use client';

import React, { useState, useEffect } from 'react';
import { fetchActivities } from '../lib/api';

const ACTION_BADGES = {
  TASK_CREATED: { label: '업무 생성', bg: 'bg-emerald-100 text-emerald-700' },
  STATUS_CHANGED: { label: '상태 변경', bg: 'bg-blue-100 text-blue-700' },
  ASSIGNEE_CHANGED: { label: '담당자 변경', bg: 'bg-purple-100 text-purple-700' },
  ASSIGNEE_MISMATCH: { label: '담당자 변경', bg: 'bg-amber-100 text-amber-700' },
  COMMENT_ADDED: { label: '댓글 작성', bg: 'bg-slate-100 text-slate-700' },
  DEFAULT: { label: '활동', bg: 'bg-slate-100 text-slate-700' }
};

export default function ActivityLogModal({
  projectId,
  projectName,
  isOpen,
  onClose
}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      loadActivities();
    }
  }, [isOpen, projectId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const res = await fetchActivities(projectId);
      if (res.success) {
        setActivities(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              활동 타임라인
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{projectName} 프로젝트</p>
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

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : activities.length === 0 ? (
            <p className="text-center py-12 text-sm text-slate-400">최근 활동 내역이 없습니다.</p>
          ) : (
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
              {activities.map((act) => {
                const badge = ACTION_BADGES[act.action] || ACTION_BADGES.DEFAULT;
                return (
                  <div key={act.id} className="relative group">
                    <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-purple-500 border-2 border-white shadow-sm ring-2 ring-purple-100" />
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 group-hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">{act.actor}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{act.created_at}</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        {act.details}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
