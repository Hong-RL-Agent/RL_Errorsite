import { useCallback, useEffect, useState } from 'react';
import { getFeed } from '../api';
import { usePostEvents } from './postEvents';

export const PAGE_SIZE = 8;

// INTENTIONAL_ERROR: B01-ERR01
// CSV Error: 페이징 드리프트 및 리스트 중복
// Strategy: ACTION_REPLAY
// Description: 페이지 데이터 병합 중 이전 게시물 일부를 다시 추가함.
function mergePages(prevItems, nextItems) {
  const tail = prevItems.slice(-2);
  return [...prevItems, ...tail, ...nextItems];
}

export function useFeed({ q, sort, filter }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getFeed({ page: 1, limit: PAGE_SIZE, q, sort, filter })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setPage(1);
        setHasMore(res.has_more);
        setTotal(res.total);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [q, sort, filter, reloadTick]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await getFeed({ page: page + 1, limit: PAGE_SIZE, q, sort, filter });
      setItems((prev) => mergePages(prev, res.items));
      setPage(page + 1);
      setHasMore(res.has_more);
      setTotal(res.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, q, sort, filter]);

  usePostEvents((event) => {
    if (event.type === 'update') {
      setItems((prev) => prev.map((p) => (p.id === event.id ? { ...p, ...event.patch } : p)));
    } else if (event.type === 'delete') {
      setItems((prev) => prev.filter((p) => p.id !== event.id));
    } else if (event.type === 'create') {
      setReloadTick((n) => n + 1);
    }
  });

  return { items, hasMore, total, loading, loadingMore, error, loadMore };
}
