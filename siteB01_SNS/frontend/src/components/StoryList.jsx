import React, { useEffect, useState } from 'react';
import { getStories } from '../api';
import Avatar from './Avatar';

export default function StoryList({ onOpenProfile }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getStories()
      .then((res) => !cancelled && setStories(res.items))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="stories card" aria-label="스토리">
      {loading && <span className="muted">스토리를 불러오는 중…</span>}
      {stories.map((u) => (
        <button key={u.id} className="story" onClick={() => onOpenProfile(u.id)}>
          <Avatar user={u} size={56} ring />
          <span>{u.is_me ? '내 스토리' : u.display_name}</span>
        </button>
      ))}
    </section>
  );
}
