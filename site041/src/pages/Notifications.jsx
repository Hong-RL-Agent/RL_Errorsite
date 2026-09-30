import React, { useEffect, useState } from 'react';
import { Bell, Plus, Check } from 'lucide-react';
import { fetchApi } from '../api/client';
import { showToast } from '../components/Toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await fetchApi('/api/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Triggers SEC-386: async-no-feedback on Notification Title
  const handleAddNotification = (e) => {
    e.preventDefault();
    if (!notifTitle.trim()) return;

    const currentTitle = notifTitle;
    setShowAddModal(false);
    setNotifTitle('');
    setNotifMsg('');

    // Intentionally without progress/loading feedback UI state for SEC-386
    fetchApi('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({ title: currentTitle, message: notifMsg })
    }).then(() => {
      showToast('알림 등록 완료', '새로운 케어 알림이 등록되었습니다.', 'success');
      loadNotifications();
    }).catch((err) => {
      showToast('오류', err.message, 'error');
    });
  };

  return (
    <div className="main-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>돌봄 알림 센터</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>예약 상태 및 케어 리마인더를 확인합니다.</p>
        </div>

        <button className="primary-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>새 알림 등록</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {notifications.map((n) => (
          <div key={n.id} className="card-box" style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e8f5e9', color: '#2d6a4f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#1b261e' }}>{n.title}</div>
                <div style={{ fontSize: '13px', color: '#526156', marginTop: '2px' }}>{n.message}</div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#8d99ae' }}>{n.date}</div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '460px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>새 케어 알림 등록</h3>
            <form onSubmit={handleAddNotification}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>알림 제목</label>
                <input
                  type="text"
                  required
                  placeholder="예: 예방접종 일정, 산책 시간"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>알림 내용</label>
                <textarea
                  rows="3"
                  placeholder="상세 내용을 입력하세요"
                  value={notifMsg}
                  onChange={(e) => setNotifMsg(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                  취소
                </button>
                <button type="submit" className="primary-btn">
                  알림 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
