import React from 'react';
import { 
  Home, 
  Compass, 
  CalendarCheck, 
  Heart, 
  MessageSquare, 
  Bell, 
  User, 
  Sliders, 
  Layers, 
  PlusCircle,
  FileText
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, isHost = false }) {
  const userNavItems = [
    { id: 'home', label: '홈', icon: <Home size={18} /> },
    { id: 'explore', label: '체험 탐색', icon: <Compass size={18} /> },
    { id: 'reservations', label: '내 예약 내역', icon: <CalendarCheck size={18} /> },
    { id: 'wishlist', label: '위시리스트', icon: <Heart size={18} /> },
    { id: 'reviews', label: '나의 리뷰', icon: <FileText size={18} /> },
    { id: 'messages', label: '호스트 메시지', icon: <MessageSquare size={18} /> },
    { id: 'notifications', label: '알림 센터', icon: <Bell size={18} /> },
    { id: 'profile', label: '프로필 관리', icon: <User size={18} /> },
    { id: 'settings', label: '환경 설정', icon: <Sliders size={18} /> }
  ];

  const hostNavItems = [
    { id: 'host', label: '호스트 대시보드', icon: <Layers size={18} /> },
    { id: 'explore', label: '서비스 둘러보기', icon: <Compass size={18} /> },
    { id: 'reservations', label: '전체 예약 현황', icon: <CalendarCheck size={18} /> },
    { id: 'messages', label: '게스트 메시지', icon: <MessageSquare size={18} /> }
  ];

  const items = isHost ? hostNavItems : userNavItems;

  return (
    <aside style={{
      width: 240,
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-color)',
      padding: '16px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }}>
      <div style={{ padding: '8px 12px', marginBottom: 8, borderBottom: '1px solid var(--border-light)' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.5px' }}>
          {isHost ? '호스트 관리 메뉴' : '마이 메뉴'}
        </span>
      </div>

      {items.map(item => {
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            id={`sidebar-link-${item.id}`}
            onClick={() => setActivePage(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              fontWeight: 600,
              color: isActive ? 'var(--sky-blue)' : 'var(--text-main)',
              backgroundColor: isActive ? 'var(--sky-blue-light)' : 'transparent',
              transition: 'all 0.15s ease',
              textAlign: 'left'
            }}
          >
            <span style={{ color: isActive ? 'var(--sky-blue)' : 'var(--text-muted)' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
