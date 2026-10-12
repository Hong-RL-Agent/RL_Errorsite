'use client';

import React, { useState } from 'react';
import { createProject } from '../lib/api';

const COLOR_OPTIONS = [
  '#7C3AED', // Purple
  '#2563EB', // Blue
  '#059669', // Emerald
  '#D97706', // Amber
  '#DB2777', // Pink
  '#0891B2', // Cyan
  '#4F46E5', // Indigo
  '#DC2626'  // Red
];

export default function NewProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
  onNotify
}) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#7C3AED');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) {
      onNotify && onNotify('프로젝트 이름과 키를 입력해주세요.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createProject({
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim(),
        color
      });

      if (res.success) {
        onNotify && onNotify(`프로젝트 [${res.data.name}]이(가) 생성되었습니다.`, 'success');
        setName('');
        setKey('');
        setDescription('');
        onProjectCreated && onProjectCreated(res.data);
        onClose();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '프로젝트 생성 실패', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
            새 프로젝트 생성
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              프로젝트 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!key) {
                  setKey(e.target.value.substring(0, 3).toUpperCase());
                }
              }}
              placeholder="예: AI 검색 엔진 고도화"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              프로젝트 키 (대문자 2~5글자) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="예: AI, SRCH"
              className="w-full px-3 py-2 text-sm uppercase tracking-wider font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">프로젝트 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="프로젝트 목적 및 마일스톤 개요..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">테마 색상</label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-purple-600' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? '생성 중...' : '프로젝트 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
