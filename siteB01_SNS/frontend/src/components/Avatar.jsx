import React from 'react';
import { assetUrl } from '../api/client';

export default function Avatar({ user, size = 40, ring = false, onClick }) {
  return (
    <img
      className={`avatar${ring ? ' avatar-ring' : ''}${onClick ? ' clickable' : ''}`}
      style={{ width: size, height: size }}
      src={assetUrl(user?.avatar_url)}
      alt={user?.display_name || ''}
      onClick={onClick}
    />
  );
}
