import React, { useEffect, useState } from 'react';
import { followUser, getFeed, getFollowing, getUser, unfollowUser } from '../api';
import { assetUrl } from '../api/client';
import Avatar from '../components/Avatar';
import { EmptyState, ErrorNotice, Spinner, StatusBadge } from '../components/Feedback';
import UserRow from '../components/UserRow';
import { usePostEvents } from '../hooks/postEvents';
import { refreshMySummary } from '../hooks/useMySummary';
import { useToast } from '../hooks/useToast.jsx';

export default function ProfilePage({ userId, onOpenPost, onOpenProfile }) {
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setTab('posts');
    Promise.all([getUser(userId), getFeed({ user_id: userId, limit: 60 }), getFollowing(userId)])
      .then(([u, feed, fl]) => {
        if (cancelled) return;
        setUser(u);
        setPosts(feed.items);
        setFollowing(fl.items);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  usePostEvents((event) => {
    if (event.type === 'update') setPosts((prev) => prev.map((p) => (p.id === event.id ? { ...p, ...event.patch } : p)));
    if (event.type === 'delete') setPosts((prev) => prev.filter((p) => p.id !== event.id));
  });

  const toggleProfileFollow = async () => {
    try {
      const res = user.is_following ? await unfollowUser(user.id) : await followUser(user.id);
      setUser((prev) => ({ ...prev, is_following: res.is_following, follower_count: res.follower_count }));
      await refreshMySummary();
      showToast(res.is_following ? `${user.display_name}님을 팔로우했습니다.` : `${user.display_name}님을 언팔로우했습니다.`);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const toggleListFollow = async (target) => {
    try {
      const res = target.is_following ? await unfollowUser(target.id) : await followUser(target.id);
      setFollowing((prev) => prev.map((u) => (u.id === target.id ? { ...u, is_following: res.is_following, follower_count: res.follower_count } : u)));
      await refreshMySummary();
      showToast(res.is_following ? `${target.display_name}님을 팔로우했습니다.` : `${target.display_name}님을 언팔로우했습니다.`);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  if (loading) return <div className="page"><Spinner /></div>;
  if (error) return <div className="page"><ErrorNotice message={error} /></div>;

  return (
    <div className="page profile-page">
      <section className="card profile-head">
        <Avatar user={user} size={96} ring />
        <div className="profile-info">
          <div className="profile-title">
            <h2>{user.display_name}</h2>
            {user.is_me && <StatusBadge tone="lavender">나</StatusBadge>}
            {!user.is_me && user.is_following && <StatusBadge tone="mint">팔로잉 중</StatusBadge>}
          </div>
          <div className="muted">@{user.username}</div>
          <p>{user.bio}</p>
          <dl className="stats inline">
            <div><dt>게시물</dt><dd>{user.post_count}</dd></div>
            <div><dt>팔로워</dt><dd>{user.follower_count}</dd></div>
            <div><dt>팔로잉</dt><dd>{user.following_count}</dd></div>
          </dl>
        </div>
        {!user.is_me && (
          <button className={`btn ${user.is_following ? 'btn-soft' : 'btn-primary'}`} onClick={toggleProfileFollow}>
            {user.is_following ? '팔로잉' : '팔로우'}
          </button>
        )}
      </section>

      <div className="tabs card">
        <button className={`tab${tab === 'posts' ? ' active' : ''}`} onClick={() => setTab('posts')}>게시물 {posts.length}</button>
        <button className={`tab${tab === 'following' ? ' active' : ''}`} onClick={() => setTab('following')}>팔로잉 {following.length}</button>
      </div>

      {tab === 'posts' &&
        (posts.length === 0 ? (
          <EmptyState title="아직 게시물이 없습니다" />
        ) : (
          <div className="grid">
            {posts.map((p) => (
              <button key={p.id} className="grid-item" onClick={() => onOpenPost(p.id)} aria-label={`게시물 ${p.id} 열기`}>
                <img src={assetUrl(p.image_url)} alt="" loading="lazy" />
                <span className="grid-overlay">❤️ {p.like_count} · 💬 {p.comment_count}</span>
              </button>
            ))}
          </div>
        ))}

      {tab === 'following' &&
        (following.length === 0 ? (
          <EmptyState title="팔로잉하는 사용자가 없습니다" />
        ) : (
          <ul className="card user-list padded">
            {following.map((u) => (
              <UserRow key={u.id} user={u} onOpenProfile={onOpenProfile} onToggleFollow={toggleListFollow} />
            ))}
          </ul>
        ))}
    </div>
  );
}
