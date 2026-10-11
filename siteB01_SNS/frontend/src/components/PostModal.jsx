import React, { useEffect, useState } from 'react';
import {
  addComment,
  deleteComment,
  deletePost,
  getComments,
  getPost,
  likePost,
  savePost,
  unlikePost,
  unsavePost,
  updatePost,
} from '../api';
import { assetUrl } from '../api/client';
import { emitPostEvent } from '../hooks/postEvents';
import { refreshMySummary } from '../hooks/useMySummary';
import { useToast } from '../hooks/useToast.jsx';
import { formatDate } from '../utils/format';
import Avatar from './Avatar';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { ErrorNotice, Spinner, StatusBadge } from './Feedback';
import Modal from './Modal';

export default function PostModal({ postId, onClose, onOpenProfile }) {
  const { showToast } = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPost(null);
    setError('');
    Promise.all([getPost(postId), getComments(postId)])
      .then(([p, c]) => {
        if (cancelled) return;
        setPost(p);
        setComments(c.items);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const patchPost = (patch) => {
    setPost((prev) => ({ ...prev, ...patch }));
    emitPostEvent({ type: 'update', id: postId, patch });
  };

  const handleToggleLike = async () => {
    try {
      const res = post.liked_by_me ? await unlikePost(postId) : await likePost(postId);
      patchPost({ liked_by_me: res.liked, like_count: res.like_count });
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // INTENTIONAL_ERROR: B01-ERR03
  // CSV Error: 성공/실패 피드백 부재
  // Strategy: ACTION_REPLAY
  // Description: 저장 요청은 성공하고 아이콘도 바뀌지만 성공 토스트/안내 메시지를 표시하지 않음.
  const handleToggleSave = async () => {
    try {
      if (!post.saved_by_me) {
        await savePost(postId);
        patchPost({ saved_by_me: true });
      } else {
        await unsavePost(postId);
        patchPost({ saved_by_me: false });
        showToast('저장을 취소했습니다.');
      }
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleAddComment = async (content) => {
    try {
      const res = await addComment(postId, content);
      setComments((prev) => [...prev, res.comment]);
      patchPost({ comment_count: res.comment_count });
      showToast('댓글을 등록했습니다.');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      patchPost({ comment_count: res.comment_count });
      showToast('댓글을 삭제했습니다.');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const startEdit = () => {
    setDraft(post.caption);
    setEditing(true);
  };

  const handleUpdate = async () => {
    try {
      const updated = await updatePost(postId, { caption: draft });
      setPost(updated);
      emitPostEvent({ type: 'update', id: postId, patch: { caption: updated.caption, updated_at: updated.updated_at } });
      setEditing(false);
      showToast('게시물을 수정했습니다.');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(postId);
      emitPostEvent({ type: 'delete', id: postId });
      refreshMySummary().catch(() => {});
      showToast('게시물을 삭제했습니다.');
      onClose();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  return (
    <Modal title="게시물 상세" onClose={onClose} wide>
      {error && <ErrorNotice message={error} />}
      {!post && !error && <Spinner />}
      {post && (
        <div className="post-modal">
          <div className="post-modal-media">
            <img src={assetUrl(post.image_url)} alt={`${post.author.display_name}의 게시물`} />
          </div>
          <div className="post-modal-side">
            <header className="post-head">
              <Avatar user={post.author} size={40} onClick={() => onOpenProfile(post.author.id)} />
              <div className="post-author">
                <button className="link-btn" onClick={() => onOpenProfile(post.author.id)}>{post.author.display_name}</button>
                <span className="muted">
                  {formatDate(post.created_at)}
                  {post.updated_at && ' (수정됨)'}
                </span>
              </div>
              {post.is_mine && <StatusBadge tone="lavender">내 게시물</StatusBadge>}
            </header>

            {editing ? (
              <div className="edit-box">
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} maxLength={500} aria-label="게시물 내용 수정" />
                <div className="row-end">
                  <button className="btn btn-ghost" onClick={() => setEditing(false)}>취소</button>
                  <button className="btn btn-primary" onClick={handleUpdate}>수정 완료</button>
                </div>
              </div>
            ) : (
              <p className="post-caption">{post.caption}</p>
            )}

            <div className="post-actions">
              <button className={`action-btn${post.liked_by_me ? ' on' : ''}`} onClick={handleToggleLike} aria-pressed={post.liked_by_me}>
                {post.liked_by_me ? '❤️' : '🤍'} <span>{post.like_count}</span>
              </button>
              <span className="action-btn static">💬 <span>{post.comment_count}</span></span>
              <button
                className={`action-btn save-btn${post.saved_by_me ? ' on' : ''}`}
                data-bug-id="B01-ERR03"
                onClick={handleToggleSave}
                aria-pressed={post.saved_by_me}
              >
                {post.saved_by_me ? '📑 저장됨' : '🔖 게시물 저장'}
              </button>
              {post.is_mine && !editing && (
                <span className="owner-actions">
                  <button className="link-btn" onClick={startEdit}>수정</button>
                  {confirmDelete ? (
                    <>
                      <button className="link-btn danger" onClick={handleDelete}>정말 삭제</button>
                      <button className="link-btn" onClick={() => setConfirmDelete(false)}>취소</button>
                    </>
                  ) : (
                    <button className="link-btn danger" onClick={() => setConfirmDelete(true)}>삭제</button>
                  )}
                </span>
              )}
            </div>

            <div className="comment-area">
              <h3>댓글 {comments.length}</h3>
              <CommentList comments={comments} onDelete={handleDeleteComment} onOpenProfile={onOpenProfile} />
            </div>
            <CommentForm onSubmit={handleAddComment} />
          </div>
        </div>
      )}
    </Modal>
  );
}
