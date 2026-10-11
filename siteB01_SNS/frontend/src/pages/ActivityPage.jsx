import React, { useEffect, useState } from 'react';
import { getActivity } from '../api';
import { EmptyState, ErrorNotice, Spinner, StatusBadge } from '../components/Feedback';
import { ACTIVITY_LABELS, formatDate } from '../utils/format';

const CATEGORIES = [
  { value: '', label: '전체' },
  { value: 'post', label: '게시물' },
  { value: 'like', label: '좋아요' },
  { value: 'comment', label: '댓글' },
  { value: 'follow', label: '팔로우' },
  { value: 'save', label: '저장' },
];

export default function ActivityPage() {
  const [category, setCategory] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (targetPage, replace) => {
    try {
      const res = await getActivity({ page: targetPage, limit: 20, category });
      setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
      setPage(targetPage);
      setHasMore(res.has_more);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    load(1, true);
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page activity-page">
      <h2 className="page-title">활동 내역</h2>
      <div className="tabs card">
        {CATEGORIES.map((c) => (
          <button key={c.value} className={`tab${category === c.value ? ' active' : ''}`} onClick={() => setCategory(c.value)}>
            {c.label}
          </button>
        ))}
      </div>
      {loading && <Spinner />}
      {error && <ErrorNotice message={error} />}
      {!loading && !error && items.length === 0 && <EmptyState title="활동 내역이 없습니다" />}
      <ul className="card list-card">
        {items.map((a) => (
          <li key={a.id} className="activity-item">
            <StatusBadge tone="lavender">{ACTIVITY_LABELS[a.action] || a.action}</StatusBadge>
            <span className="activity-detail">{a.detail}</span>
            <span className="muted small">{formatDate(a.created_at)}</span>
          </li>
        ))}
      </ul>
      {!loading && hasMore && (
        <div className="load-more">
          <button className="btn btn-soft btn-wide" onClick={() => load(page + 1, false)}>활동 더 보기</button>
        </div>
      )}
    </div>
  );
}
