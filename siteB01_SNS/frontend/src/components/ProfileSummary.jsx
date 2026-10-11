import React from 'react';
import { useMySummary } from '../hooks/useMySummary';
import Avatar from './Avatar';

export default function ProfileSummary({ onOpenProfile }) {
  const me = useMySummary();

  if (!me) {
    return (
      <section className="card side-card" aria-label="프로필 요약">
        <div className="skeleton skeleton-line" style={{ width: '60%' }} />
        <div className="skeleton skeleton-line" style={{ width: '90%' }} />
      </section>
    );
  }

  return (
    <section className="card side-card summary" aria-label="프로필 요약">
      <div className="summary-head">
        <Avatar user={me} size={56} ring onClick={() => onOpenProfile(me.id)} />
        <div>
          <strong>{me.display_name}</strong>
          <div className="muted small">@{me.username}</div>
        </div>
      </div>
      <dl className="stats">
        <div>
          <dt>게시물</dt>
          <dd>{me.post_count}</dd>
        </div>
        <div>
          <dt>팔로워</dt>
          <dd>{me.follower_count}</dd>
        </div>
        <div>
          <dt>팔로잉</dt>
          <dd data-bug-id="B01-ERR05" id="summary-following-count">{me.following_count}</dd>
        </div>
      </dl>
    </section>
  );
}
