'use client';

import React, { useState } from 'react';
import { createTask } from '../lib/api';

export default function NewTaskModal({
  projectId,
  members = [],
  isOpen,
  onClose,
  onTaskCreated,
  onNotify
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      onNotify && onNotify('업무 제목을 입력해주세요.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const selectedMember = members.find((m) => m.id === parseInt(assigneeId, 10));

      const res = await createTask({
        projectId,
        title: title.trim(),
        description: description.trim(),
        priority,
        assigneeId: selectedMember ? selectedMember.id : null,
        assigneeName: selectedMember ? selectedMember.name : null,
        dueDate: dueDate || null
      });

      if (res.success) {
        onNotify && onNotify(`업무 [${res.data.task_key}]가 생성되었습니다.`, 'success');
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setAssigneeId('');
        setDueDate('');
        onTaskCreated && onTaskCreated();
        onClose();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '업무 생성 실패', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            새 업무 만들기
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
              업무 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: OAuth2.0 소셜 로그인 API 연동"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">업무 상세 내용</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="필요한 요구사항이나 관련 메모를 작성하세요..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">우선순위</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="LOW">낮음 (LOW)</option>
                <option value="MEDIUM">보통 (MEDIUM)</option>
                <option value="HIGH">높음 (HIGH)</option>
                <option value="URGENT">긴급 (URGENT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">담당자</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">미지정</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">마감일</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
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
              {submitting ? '생성 중...' : '업무 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
