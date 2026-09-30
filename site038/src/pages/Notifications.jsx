import React, { useState, useEffect } from 'react';
import { Bell, Edit2, Check, Clock, AlertCircle, Sparkles, Send } from 'lucide-react';
import Modal from '../components/Modal';

export default function Notifications({ onShowToast }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (notif) => {
    setSelectedNotif(notif);
    setNewTitle(notif.title);
    setIsModalOpen(true);
  };

  // SEC-356: Notification title edit/creation
  const handleUpdateTitle = async (e) => {
    e.preventDefault();
    if (!selectedNotif || !newTitle.trim()) return;

    setSubmitting(true);
    try {
      // Deterministic idempotency key per notification
      const idempotency_key = `NOTIFICATION-${selectedNotif.id.toUpperCase()}-TITLE`;

      const res = await fetch('/api/notifications/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: selectedNotif.id,
          title: newTitle.trim(),
          idempotency_key
        })
      });

      const data = await res.json();
      if (data.success) {
        onShowToast({
          title: '알림 제목 변경 완료',
          message: `알림 제목이 "${newTitle}"(으)로 업데이트되었습니다.`,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          txId: data.transaction_id,
          idempotency_key
        });
        setIsModalOpen(false);
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">알림 센터 & 푸시 메시지</h1>
          <p className="page-subtitle">구독자 및 팀원 대상 발송 알림의 제목과 메시지 내역을 관리합니다.</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>전체 알림 내역 ({notifications.length}건)</h3>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>제목을 클릭하여 수정할 수 있습니다.</span>
        </div>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>불러오는 중...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: n.read ? 'var(--bg-main)' : 'rgba(99, 102, 241, 0.04)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: n.read ? 'var(--bg-card)' : 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-color)',
                      flexShrink: 0
                    }}
                  >
                    <Bell size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge badge-indigo">{n.type}</span>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</h4>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{n.message}</p>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {n.createdAt}
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(n)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit2 size={13} /> 제목 수정
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="알림 제목 수정"
      >
        <form onSubmit={handleUpdateTitle}>
          <div className="form-group">
            <label className="form-label">알림 대상 ID</label>
            <input
              type="text"
              className="form-input"
              value={selectedNotif?.id || ''}
              disabled
              style={{ background: 'var(--bg-main)', color: 'var(--text-muted)' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">알림 제목 *</label>
            <input
              type="text"
              className="form-input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="새로운 알림 제목을 입력하세요"
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? '저장 중...' : '제목 저장'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
