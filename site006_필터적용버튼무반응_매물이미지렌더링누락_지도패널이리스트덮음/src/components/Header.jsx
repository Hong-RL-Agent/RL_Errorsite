import React from 'react';
import { Building2, Phone } from 'lucide-react';

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <Building2 size={28} color="var(--accent)" />
        Prestige Homes
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <button style={{ background: 'var(--accent)', color: 'white', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone size={16} />
          VIP 상담
        </button>
      </div>
    </header>
  );
}
