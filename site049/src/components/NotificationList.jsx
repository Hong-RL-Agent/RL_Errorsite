import React from 'react';
import { Bell, CheckCircle2, Calendar, Megaphone, HeartHandshake } from 'lucide-react';
import { api } from '../api/client';

export default function NotificationList({ notifications, onNotificationUpdate, navigate }) {
  const getIcon = (cat) => {
    switch (cat) {
      case 'schedule': return <Calendar size={18} color="#2563eb" />;
      case 'notice': return <Megaphone size={18} color="#d97706" />;
      default: return <HeartHandshake size={18} color="var(--primary)" />;
    }
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      if (onNotificationUpdate) onNotificationUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  if (!notifications || notifications.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--cream-border)' }}>
        <Bell size={40} color="var(--text-light)" style={{ marginBottom: '12px' }} />
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '6px' }}>도착한 알림이 없습니다</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>새로운 봉사활동 소식이나 주최자 공지가 생기면 여기에 알려드릴게요.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {notifications.map(n => (
        <div 
          key={n.id}
          className={`notif-item ${!n.read ? 'unread' : ''}`}
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--cream-border)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            cursor: n.link ? 'pointer' : 'default'
          }}
          onClick={() => {
            if (n.link && navigate) navigate(n.link);
          }}
        >
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: 'var(--radius-md)', 
            background: 'var(--cream-alt)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {getIcon(n.category)}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ fontSize: '1.02rem', fontWeight: '700', color: 'var(--text-main)' }}>
                {n.title}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{n.createdAt}</span>
            </div>
            
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '10px' }}>
              {n.message}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '600' }}>
                {!n.read ? '• 읽지 않음' : '읽음'}
              </span>

              {!n.read && (
                <button 
                  className="mark-read-btn"
                  style={{
                    border: '1px solid var(--primary-light)',
                    background: 'var(--primary-subtle)',
                    color: 'var(--primary-dark)',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => handleMarkRead(n.id, e)}
                >
                  읽음으로 표시
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
