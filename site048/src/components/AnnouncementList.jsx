import React, { useState } from 'react';
import { Bell, Edit3, Plus, Check } from 'lucide-react';
import Modal from './Modal';
import { fetchApi } from '../api/client';

export default function AnnouncementList({ 
  announcements, 
  classId, 
  onRefresh, 
  onShowToast, 
  isInstructor = false 
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createContent, setCreateContent] = useState('');

  const handleOpenEdit = (ann) => {
    setSelectedAnnouncement(ann);
    setEditTitle(ann.title);
    setEditContent(ann.content);
    setShowEditModal(true);
  };

  // Submit Edit (SEC-416: Missing authorization allows anyone to edit)
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!selectedAnnouncement) return;

    fetchApi(`/api/classes/${classId}/announcements/${selectedAnnouncement.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: editTitle,
        content: editContent
      })
    })
      .then(res => {
        setShowEditModal(false);
        if (onShowToast) onShowToast('공지사항이 수정되었습니다.', 'success');
        if (onRefresh) onRefresh();
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    fetchApi(`/api/classes/${classId}/announcements`, {
      method: 'POST',
      body: JSON.stringify({
        title: createTitle,
        content: createContent
      })
    })
      .then(() => {
        setShowCreateModal(false);
        setCreateTitle('');
        setCreateContent('');
        if (onShowToast) onShowToast('새 공지사항이 등록되었습니다.', 'success');
        if (onRefresh) onRefresh();
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={18} color="var(--soft-blue)" /> 클래스 공지사항 ({announcements.length})
        </h3>

        <button 
          id="btn-open-create-announcement"
          onClick={() => setShowCreateModal(true)}
          className="btn btn-outline btn-sm"
        >
          <Plus size={14} /> 공지 작성
        </button>
      </div>

      {announcements.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--cream-bg)', borderRadius: 'var(--radius-md)' }}>
          등록된 클래스 공지사항이 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {announcements.map(ann => (
            <div
              key={ann.id}
              className="card"
              id={`announcement-item-${ann.id}`}
              style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 15, color: 'var(--primary-navy)' }}>{ann.title}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                  {/* Edit button available for SEC-416 trigger observation */}
                  <button
                    id={`btn-edit-announcement-${ann.id}`}
                    onClick={() => handleOpenEdit(ann)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '3px 8px', fontSize: 11 }}
                    title="공지 수정"
                  >
                    <Edit3 size={12} /> 수정
                  </button>
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {ann.content}
              </p>

              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                작성자: {ann.instructorName || '담당 강사'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Edit Announcement Modal (SEC-416) */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="클래스 공지사항 수정"
      >
        <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">공지 제목</label>
            <input
              id="input-edit-announcement-title"
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">공지 내용</label>
            <textarea
              id="textarea-edit-announcement-content"
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-outline">
              취소
            </button>
            <button id="btn-save-announcement" type="submit" className="btn btn-primary">
              공지 저장
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="새로운 클래스 공지 등록"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">공지 제목</label>
            <input
              id="input-create-announcement-title"
              type="text"
              placeholder="예: 집결 장소 및 준비물 안내"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">공지 내용</label>
            <textarea
              id="textarea-create-announcement-content"
              rows={4}
              placeholder="수강생들에게 전달할 상세 안내 사항을 작성해주세요."
              value={createContent}
              onChange={(e) => setCreateContent(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline">
              취소
            </button>
            <button id="btn-submit-new-announcement" type="submit" className="btn btn-primary">
              공지 등록
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
