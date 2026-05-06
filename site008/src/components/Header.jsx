import React from 'react';
import { Ticket, User, Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        MIDNIGHT CINEMA
      </div>
      <div style={{ display: 'flex', gap: '20px', color: 'var(--text-main)' }}>
        <button style={{ background: 'none', color: 'inherit' }}><Search size={20} /></button>
        <button style={{ background: 'none', color: 'inherit' }}><Ticket size={20} /></button>
        <button style={{ background: 'none', color: 'inherit' }}><User size={20} /></button>
      </div>
    </header>
  );
}
