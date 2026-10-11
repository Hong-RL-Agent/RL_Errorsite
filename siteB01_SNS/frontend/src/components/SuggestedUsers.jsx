import React, { useEffect, useState } from 'react';
import { followUser, getUsers, unfollowUser } from '../api';
import { refreshMySummary } from '../hooks/useMySummary';
import { useToast } from '../hooks/useToast.jsx';
import Avatar from './Avatar';
import { Spinner } from './Feedback';

export default function SuggestedUsers({ onOpenProfile }) {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getUsers({ recommend: 1, limit: 5 })
      .then((res) => !cancelled && setUsers(res.items))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const setFollowing = (id, value) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_following: value } : u)));

  // INTENTIONAL_ERROR: B01-ERR05
  // CSV Error: 캐시 상태 불일치
  // Strategy: ACTION_REPLAY
  // Description: 팔로우 저장 후 버튼만 갱신하고 프로필 요약 캐시를 갱신하지 않아 팔로잉 수가 이전 값으로 남음.
  const handleToggle = async (user) => {
    try {
      if (!user.is_following) {
        await followUser(user.id);
        setFollowing(user.id, true);
        showToast(`${user.display_name}님을 팔로우했습니다.`);
      } else {
        await unfollowUser(user.id);
        setFollowing(user.id, false);
        await refreshMySummary();
        showToast(`${user.display_name}님을 언팔로우했습니다.`);
      }
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  return (
    <section className="card side-card" aria-label="추천 사용자">
      <h3>회원님을 위한 추천</h3>
      {loading && <Spinner label="추천을 불러오는 중…" />}
      <ul className="user-list">
        {users.map((u) => (
          <li key={u.id} className="user-row">
            <Avatar user={u} size={40} onClick={() => onOpenProfile(u.id)} />
            <div className="user-meta">
              <button className="link-btn" onClick={() => onOpenProfile(u.id)}>{u.display_name}</button>
              <span className="muted small">팔로워 {u.follower_count}명</span>
            </div>
            <button
              className={`btn btn-small ${u.is_following ? 'btn-soft' : 'btn-primary'}`}
              data-bug-id="B01-ERR05"
              onClick={() => handleToggle(u)}
            >
              {u.is_following ? '팔로잉' : '팔로우'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
