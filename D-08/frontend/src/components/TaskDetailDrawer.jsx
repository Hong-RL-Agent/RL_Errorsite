'use client';

import React, { useState, useEffect } from 'react';
import { updateTask, updateTaskStatus, updateTaskAssignee, addComment, deleteComment, fetchTask } from '../lib/api';

export default function TaskDetailDrawer({
  task,
  members = [],
  filterContext = {},
  onClose,
  onTaskUpdated,
  onNotify
}) {
  const [currentTask, setCurrentTask] = useState(task);
  const [description, setDescription] = useState(task.description || '');
  const [title, setTitle] = useState(task.title || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [priority, setPriority] = useState(task.priority || 'MEDIUM');
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [newCommentAuthor, setNewCommentAuthor] = useState('김도현');
  const [newCommentText, setNewCommentText] = useState('');
  const [comments, setComments] = useState(task.comments || []);
  const [loading, setLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Load latest task details including comments
  const loadLatestTask = async () => {
    try {
      const res = await fetchTask(task.id);
      if (res.success && res.data) {
        setCurrentTask(res.data);
        setTitle(res.data.title);
        setDescription(res.data.description || '');
        setPriority(res.data.priority);
        setDueDate(res.data.due_date || '');
        setComments(res.data.comments || []);
      }
    } catch (err) {
      console.error('Failed to load task details:', err);
    }
  };

  useEffect(() => {
    loadLatestTask();
  }, [task.id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      setLoading(true);
      const res = await updateTaskStatus(currentTask.id, newStatus, filterContext);
      if (res.success) {
        onNotify && onNotify(`업무 상태가 '${newStatus}'(으)로 변경되었습니다.`, 'success');
        await loadLatestTask();
        onTaskUpdated && onTaskUpdated();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '상태 변경 실패', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssigneeChange = async (e) => {
    const selectedMemberId = parseInt(e.target.value, 10);
    const selectedMember = members.find((m) => m.id === selectedMemberId);
    if (!selectedMember) return;

    try {
      setLoading(true);
      const res = await updateTaskAssignee(
        currentTask.id,
        {
          assigneeId: selectedMember.id,
          assigneeName: selectedMember.name
        },
        filterContext
      );

      if (res.success) {
        onNotify && onNotify(`담당자가 '${selectedMember.name}'(으)로 변경되었습니다.`, 'success');
        await loadLatestTask();
        onTaskUpdated && onTaskUpdated();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '담당자 변경 실패', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (e) => {
    const newPriority = e.target.value;
    setPriority(newPriority);
    try {
      setLoading(true);
      const res = await updateTask(currentTask.id, { priority: newPriority });
      if (res.success) {
        onNotify && onNotify('우선순위가 변경되었습니다.', 'success');
        await loadLatestTask();
        onTaskUpdated && onTaskUpdated();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '우선순위 변경 실패', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDueDateChange = async (e) => {
    const newDueDate = e.target.value;
    setDueDate(newDueDate);
    try {
      const res = await updateTask(currentTask.id, { dueDate: newDueDate });
      if (res.success) {
        onNotify && onNotify('마감일이 설정되었습니다.', 'success');
        await loadLatestTask();
        onTaskUpdated && onTaskUpdated();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '마감일 설정 실패', 'error');
    }
  };

  const handleSaveDetails = async () => {
    try {
      setLoading(true);
      const res = await updateTask(currentTask.id, {
        title,
        description,
        priority,
        dueDate
      });
      if (res.success) {
        setIsEditingTitle(false);
        onNotify && onNotify('업무 내용이 저장되었습니다.', 'success');
        await loadLatestTask();
        onTaskUpdated && onTaskUpdated();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '저장 실패', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await addComment(currentTask.id, {
        authorName: newCommentAuthor,
        content: newCommentText.trim()
      });
      if (res.success) {
        setNewCommentText('');
        onNotify && onNotify('댓글이 등록되었습니다.', 'success');
        await loadLatestTask();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '댓글 등록 실패', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('이 댓글을 삭제하시겠습니까?')) return;

    try {
      const res = await deleteComment(commentId);
      if (res.success) {
        onNotify && onNotify('댓글이 삭제되었습니다.', 'info');
        await loadLatestTask();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '댓글 삭제 실패', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-50 overflow-hidden animate-slide-left">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-700 tracking-wider">
              {currentTask.task_key}
            </span>
            <span className="text-xs text-slate-400">ID #{currentTask.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadLatestTask}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              title="새로고침"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              title="닫기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title Area */}
          <div>
            {isEditingTitle ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-purple-400 rounded-lg text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleSaveDetails}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 font-medium"
                >
                  확인
                </button>
                <button
                  onClick={() => {
                    setTitle(currentTask.title);
                    setIsEditingTitle(false);
                  }}
                  className="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300 font-medium"
                >
                  취소
                </button>
              </div>
            ) : (
              <div className="group flex items-start justify-between cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                <h2 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-purple-700 transition-colors">
                  {title}
                </h2>
                <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 pt-1">
                  ✎ 수정
                </span>
              </div>
            )}
          </div>

          {/* Key Properties Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">상태</label>
              <select
                value={currentTask.status}
                onChange={handleStatusChange}
                disabled={loading}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="TODO">대기 (TODO)</option>
                <option value="IN_PROGRESS">진행중 (IN_PROGRESS)</option>
                <option value="REVIEW">검토 (REVIEW)</option>
                <option value="DONE">완료 (DONE)</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">우선순위</label>
              <select
                value={priority}
                onChange={handlePriorityChange}
                disabled={loading}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="LOW">낮음 (LOW)</option>
                <option value="MEDIUM">보통 (MEDIUM)</option>
                <option value="HIGH">높음 (HIGH)</option>
                <option value="URGENT">긴급 (URGENT)</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">담당자</label>
              <select
                value={currentTask.assignee_id || ''}
                onChange={handleAssigneeChange}
                disabled={loading}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">미지정</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">마감일</label>
              <input
                type="date"
                value={dueDate}
                onChange={handleDueDateChange}
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Description Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700">상세 설명</label>
              <button
                onClick={handleSaveDetails}
                disabled={loading}
                className="text-xs px-2.5 py-1 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-md font-semibold transition-colors"
              >
                설명 저장
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="업무에 대한 세부 내용, 목표 및 관련 링크를 입력하세요..."
              className="w-full p-3 text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white placeholder-slate-400 leading-relaxed"
            />
          </div>

          <hr className="border-slate-200" />

          {/* Comments Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>댓글 및 피드백</span>
                <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full font-semibold">
                  {comments.length}
                </span>
              </h3>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">작성자:</span>
                <select
                  value={newCommentAuthor}
                  onChange={(e) => setNewCommentAuthor(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="김도현">김도현 (나)</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="업무 진행 상황이나 피드백을 남겨보세요..."
                rows={2}
                className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !newCommentText.trim()}
                  className="px-4 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {submittingComment ? '등록 중...' : '댓글 등록'}
                </button>
              </div>
            </form>

            {/* Comment List */}
            <div className="space-y-3 pt-2">
              {comments.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">아직 작성된 댓글이 없습니다.</p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                          {comment.author_name ? comment.author_name[0] : 'U'}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{comment.author_name}</span>
                        <span className="text-[10px] text-slate-400">{comment.created_at}</span>
                        <span className="text-[10px] text-slate-300">#C{comment.id}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-slate-300 hover:text-red-500 text-xs p-1 rounded transition-colors group-hover:opacity-100"
                        title="댓글 삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed pl-8">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            생성일: {currentTask.created_at || '기록 없음'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
