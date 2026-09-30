import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trash2, ThumbsUp, MessageSquare } from 'lucide-react';
import CommentList from '../components/CommentList';
import Modal from '../components/Modal';
import { fetchApi } from '../api/client';

export default function PostDetail({ postId, onBack, onShowToast }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadData = () => {
    if (!postId) return;
    setLoading(true);

    Promise.all([
      fetchApi(`/api/posts/${postId}`),
      fetchApi(`/api/posts/${postId}/comments`)
    ])
      .then(([postData, commentsData]) => {
        setPost(postData);
        setComments(commentsData);
        setLoading(false);
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [postId]);

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        게시글을 불러오는 중입니다...
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <h3>게시글 정보를 찾을 수 없습니다.</h3>
        <button onClick={onBack} className="btn btn-primary" style={{ marginTop: 16 }}>
          커뮤니티로 돌아가기
        </button>
      </div>
    );
  }

  // Delete Post (SEC-420: Orphaned comments remain in memory)
  const handleConfirmDelete = (e) => {
    e.preventDefault();
    fetchApi(`/api/posts/${post.id}`, {
      method: 'DELETE'
    })
      .then(res => {
        setShowDeleteModal(false);
        if (onShowToast) onShowToast('게시글이 삭제되었습니다.', 'info');
        if (onBack) onBack();
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800, margin: '0 auto', width: '100%' }}>
      {/* Back Button */}
      <div>
        <button 
          id="btn-back-to-community"
          onClick={onBack}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ChevronLeft size={16} /> 커뮤니티 목록으로
        </button>
      </div>

      {/* Main Post Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={post.authorAvatar} alt={post.authorName} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <span className="badge badge-blue" style={{ marginBottom: 4 }}>{post.category}</span>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-navy)' }}>{post.authorName}</h4>
              <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
                작성일: {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            id="btn-delete-post"
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-danger btn-sm"
          >
            <Trash2 size={14} /> 게시글 삭제
          </button>
        </div>

        {/* Title & Body */}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 16 }}>
            {post.title}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-main)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {post.content}
          </p>
        </div>

        {/* Likes / Interaction */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingTop: 16,
          borderTop: '1px solid var(--border-light)'
        }}>
          <button 
            onClick={() => setPost(p => ({ ...p, likes: (p.likes || 0) + 1 }))}
            className="btn btn-outline btn-sm"
          >
            <ThumbsUp size={14} color="var(--soft-blue)" />
            <span>공감 {post.likes || 0}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <CommentList
          postId={post.id}
          comments={comments}
          onRefresh={loadData}
          onShowToast={onShowToast}
        />
      </div>

      {/* Delete Confirmation Modal (SEC-420) */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="게시글 삭제"
      >
        <form onSubmit={handleConfirmDelete} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text-main)' }}>
            정말로 <strong>'{post.title}'</strong> 게시글을 삭제하시겠습니까?
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            삭제된 게시글은 커뮤니티 목록에서 즉시 제거됩니다.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setShowDeleteModal(false)} className="btn btn-outline">
              취소
            </button>
            <button id="btn-confirm-delete-post" type="submit" className="btn btn-danger">
              삭제 확인
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
