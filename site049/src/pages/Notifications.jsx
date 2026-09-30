import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import NotificationList from '../components/NotificationList';
import { api } from '../api/client';

export default function Notifications({ user, navigate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReadAll = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
            알림
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            새로운 활동 개설, 신청 일정 변경, 주최자 공지사항을 확인하세요.
          </p>
        </div>

        <button className="btn-secondary" onClick={handleReadAll}>
          <CheckCheck size={16} />
          <span>모두 읽음</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
          알림을 불러오는 중입니다...
        </div>
      ) : (
        <NotificationList 
          notifications={notifications} 
          onNotificationUpdate={fetchNotifications}
          navigate={navigate}
        />
      )}
    </div>
  );
}
