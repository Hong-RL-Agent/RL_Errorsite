import React from 'react';
import { Bell, ChevronRight } from 'lucide-react';

export default function NoticeBanner({ notices = [] }) {
  if (notices.length === 0) return null;
  const recentNotice = notices[0];

  return (
    <div style={{
      background: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: '12px',
      padding: '12px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      marginBottom: '28px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', flexShrink: 0 }}>
          <Bell size={16} />
        </div>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1d4ed8', background: '#dbeafe', padding: '2px 8px', borderRadius: '4px', flexShrink: 0 }}>
          {recentNotice.category}
        </span>
        <span style={{ fontSize: '0.88rem', color: '#1e3a8a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {recentNotice.title}
        </span>
      </div>
      <span style={{ fontSize: '0.78rem', color: '#60a5fa', flexShrink: 0 }}>
        {recentNotice.date}
      </span>
    </div>
  );
}
