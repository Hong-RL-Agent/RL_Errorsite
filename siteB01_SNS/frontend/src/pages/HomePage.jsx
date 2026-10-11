import React, { useState } from 'react';
import { EmptyState, ErrorNotice, PostSkeleton, Spinner } from '../components/Feedback';
import PostCard from '../components/PostCard';
import StoryList from '../components/StoryList';
import { useFeed } from '../hooks/useFeed';

const FILTERS = [
  { value: '', label: '전체' },
  { value: 'following', label: '팔로잉' },
  { value: 'mine', label: '내 게시물' },
];
const SORTS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'discussed', label: '댓글 많은 순' },
];

export default function HomePage({ query, onClearQuery, onOpenPost, onOpenProfile }) {
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('latest');
  const { items, hasMore, total, loading, loadingMore, error, loadMore } = useFeed({ q: query, sort, filter });

  return (
    <div className="page home-page">
      <StoryList onOpenProfile={onOpenProfile} />

      <div className="toolbar card">
        <div className="tabs" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={filter === f.value}
              className={`tab${filter === f.value ? ' active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="정렬">
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {query && (
        <div className="search-result-bar">
          <span>“{query}” 검색 결과 {loading ? '…' : `${total}개`}</span>
          <button className="link-btn" onClick={onClearQuery}>검색 해제</button>
        </div>
      )}

      {error && <ErrorNotice message={error} />}
      {loading && <PostSkeleton />}

      {!loading && !error && items.length === 0 && (
        <EmptyState title="표시할 게시물이 없습니다" text="검색어나 필터를 바꿔 보세요." />
      )}

      <div className="feed" data-bug-id="B01-ERR01">
        {!loading &&
          items.map((post, index) => (
            <PostCard key={`${post.id}-${index}`} post={post} onOpen={onOpenPost} onOpenProfile={onOpenProfile} />
          ))}
      </div>

      {!loading && hasMore && (
        <div className="load-more">
          <button className="btn btn-soft btn-wide" data-bug-id="B01-ERR01" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? '불러오는 중…' : '게시물 더보기'}
          </button>
        </div>
      )}
      {loadingMore && <Spinner />}
      {!loading && !hasMore && items.length > 0 && <p className="muted center">모든 게시물을 확인했습니다.</p>}
    </div>
  );
}
