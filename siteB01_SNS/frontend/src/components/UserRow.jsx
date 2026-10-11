import React from 'react';
import Avatar from './Avatar';

export default function UserRow({ user, onOpenProfile, onToggleFollow }) {
  return (
    <li className="user-row">
      <Avatar user={user} size={44} onClick={() => onOpenProfile(user.id)} />
      <div className="user-meta">
        <button className="link-btn" onClick={() => onOpenProfile(user.id)}>{user.display_name}</button>
        <span className="muted small">@{user.username} · 팔로워 {user.follower_count}명</span>
      </div>
      {!user.is_me && (
        <button className={`btn btn-small ${user.is_following ? 'btn-soft' : 'btn-primary'}`} onClick={() => onToggleFollow(user)}>
          {user.is_following ? '팔로잉' : '팔로우'}
        </button>
      )}
    </li>
  );
}
