import React, { useCallback, useEffect, useState } from 'react';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../api';
import Avatar from '../components/Avatar';
import { EmptyState, ErrorNotice, Spinner, StatusBadge } from '../components/Feedback';
import { useToast } from '../hooks/useToast.jsx';
import { formatDate, NOTIFICATION_LABELS } from '../utils/format';

const TONES = { like: 'coral', comment: 'lavender', follow: 'mint', save: 'amber' };

export default function NotificationsPage({ onUnreadChange, onOpenPost, onOpenProfile }) {
  const { showToast } = useToast();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(
    async (targetPage, replace) => {
      try {
        const res = await getNotifications({ page: targetPage, limit: 20, unread: unreadOnly ? 1 : '' });
        setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
        setPage(targetPage);
        setHasMore(res.has_more);
        onUnreadChange(res.unread_count);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [unreadOnly, onUnreadChange]
  );

  useEffect(() => {
    setLoading(true);
    setError('');
    load(1, true);
  }, [unreadOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = async (n) => {
    try {
      if (!n.is_read) {
        const res = await markNotificationRead(n.id);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
        onUnreadChange(res.unread_count);
      }
      if (n.post_id) onOpenPost(n.post_id);
      else onOpenProfile(n.actor.id);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const readAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
      onUnreadChange(0);
      showToast('모든 알림을 읽음 처리했습니다.');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="page notifications-page">
      <div className="page-title-row">
        <h2 className="page-title">알림</h2>
        <button className="btn btn-soft btn-small" onClick={readAll}>모두 읽음</button>
      </div>
      <div className="tabs card">
        <button className={`tab${!unreadOnly ? ' active' : ''}`} onClick={() => setUnreadOnly(false)}>전체</button>
        <button className={`tab${unreadOnly ? ' active' : ''}`} onClick={() => setUnreadOnly(true)}>안 읽음</button>
      </div>
      {loading && <Spinner />}
      {error && <ErrorNotice message={error} />}
      {!loading && !error && items.length === 0 && <EmptyState title="알림이 없습니다" />}
      <ul className="card list-card">
        {items.map((n) => (
          <li key={n.id} className={`noti-item${n.is_read ? '' : ' unread'}`}>
            <Avatar user={n.actor} size={40} />
            <button className="noti-body" onClick={() => open(n)}>
              <span>{n.message}</span>
              <span className="muted small">{formatDate(n.created_at)}</span>
            </button>
            <StatusBadge tone={TONES[n.type] || 'coral'}>{NOTIFICATION_LABELS[n.type] || n.type}</StatusBadge>
            {!n.is_read && <StatusBadge tone="new">NEW</StatusBadge>}
          </li>
        ))}
      </ul>
      {!loading && hasMore && (
        <div className="load-more">
          <button className="btn btn-soft btn-wide" onClick={() => load(page + 1, false)}>알림 더 보기</button>
        </div>
      )}
    </div>
  );
}
