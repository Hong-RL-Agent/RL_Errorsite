import React, { useEffect, useState } from 'react';
import { getSaved } from '../api';
import { assetUrl } from '../api/client';
import { EmptyState, ErrorNotice, Spinner } from '../components/Feedback';
import { usePostEvents } from '../hooks/postEvents';

export default function SavedPage({ onOpenPost }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getSaved()
      .then((res) => !cancelled && setItems(res.items))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  usePostEvents((event) => {
    if (event.type === 'update') {
      setItems((prev) =>
        event.patch.saved_by_me === false
          ? prev.filter((p) => p.id !== event.id)
          : prev.map((p) => (p.id === event.id ? { ...p, ...event.patch } : p))
      );
    }
    if (event.type === 'delete') setItems((prev) => prev.filter((p) => p.id !== event.id));
  });

  return (
    <div className="page saved-page">
      <h2 className="page-title">저장한 게시물 <span className="muted small">{items.length}개</span></h2>
      {loading && <Spinner />}
      {error && <ErrorNotice message={error} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState title="저장한 게시물이 없습니다" text="게시물 상세에서 ‘게시물 저장’을 눌러 보세요." />
      )}
      <div className="grid">
        {items.map((p) => (
          <button key={p.id} className="grid-item" onClick={() => onOpenPost(p.id)} aria-label={`저장한 게시물 ${p.id} 열기`}>
            <img src={assetUrl(p.image_url)} alt="" loading="lazy" />
            <span className="grid-overlay">{p.author.display_name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
