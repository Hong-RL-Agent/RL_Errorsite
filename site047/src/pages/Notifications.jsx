import React, { useState, useEffect } from 'react';
import { Bell, Check, CalendarCheck, MessageSquare, Tag, Info } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { fetchApi } from '../api/client';

export default function Notifications({ onNavigatePage }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = () => {
    setLoading(true);
    fetchApi('/api/notifications')
      .then(data => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = (id) => {
    fetchApi(`/api/notifications/${id}/read`, { method: 'PATCH' })
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      })
      .catch(() => {});
  };

  const getIcon = (type) => {
    switch (type) {
      case 'reservation': return <CalendarCheck size={18} color="var(--sky-blue)" />;
      case 'message': return <MessageSquare size={18} color="#10b981" />;
      case 'coupon': return <Tag size={18} color="var(--warm-yellow)" />;
      default: return <Info size={18} color="var(--sky-blue)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 6 }}>
          알림 센터
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          예약 확정, 결제 내역, 호스트 답변 및 시즌 프로모션 알림을 실시간으로 확인하세요.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          알림을 불러오는 중입니다...
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={32} />}
          title="수신된 알림이 없습니다"
          description="새로운 예약이나 이벤트 알림이 발생하면 이곳에 표시됩니다."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map(n => (
            <div
              key={n.id}
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                backgroundColor: n.read ? '#ffffff' : 'var(--sky-blue-light)',
                borderColor: n.read ? 'var(--border-color)' : 'var(--sky-blue)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {getIcon(n.type)}
                </div>

                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-navy)' }}>{n.title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-main)', marginTop: 2 }}>{n.message}</p>
                  <span style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4, display: 'block' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  id={`btn-read-notif-${n.id}`}
                  onClick={() => handleMarkAsRead(n.id)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: 12, padding: '4px 10px' }}
                >
                  <Check size={13} /> 확인
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
