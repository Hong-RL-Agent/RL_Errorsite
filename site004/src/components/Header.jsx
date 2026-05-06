import React from 'react';
import { BookOpen, Bell, UserCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <BookOpen color="var(--primary)" />
        EduLMS
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-sub)' }}>
          <Bell size={20} />
        </button>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCircle size={24} />
          <span style={{ fontWeight: 600 }}>학습자님</span>
        </button>
      </div>
    </header>
  );
}
