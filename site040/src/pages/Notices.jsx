import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, ChevronRight, Clock, ShieldAlert } from 'lucide-react';
import Modal from '../components/Modal';

export default function Notices({ onShowToast }) {
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/notices');
      const data = await res.json();
      setNotices(data);
    } catch (err) {
      console.error(err);
    }
  };

  // SEC-379: Notice Read Trigger
  const handleOpenNotice = async (notice) => {
    setSelectedNotice(notice);
    setIsModalOpen(true);

    try {
      const res = await fetch('/api/notices/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticeId: notice.id })
      });
      const data = await res.json();
      if (data.success) {
        fetchNotices();
        onShowToast({
          title: '공지사항 읽음 처리',
          message: `[${notice.title}] 공지사항을 확인했습니다.`,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">공지사항 & 서비스 업데이트</h1>
          <p className="page-subtitle">점검 안내, 신규 오픈 코스, 수료 인증 정책 등 주요 소식을 확인하세요.</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
          전체 공지사항 ({notices.length}건)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notices.map((n) => (
            <div
              key={n.id}
              onClick={() => handleOpenNotice(n)}
              style={{
                padding: '16px 20px',
                background: n.read ? '#fcfdfe' : '#eff6ff',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span className={n.read ? 'badge badge-gray' : 'badge badge-blue'}>
                  {n.category}
                </span>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {n.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    작성자: {n.author} | 일자: {n.date}
                  </div>
                </div>
              </div>

              <ChevronRight size={18} color="var(--text-light)" />
            </div>
          ))}
        </div>
      </div>

      {/* Notice Detail Modal (SEC-379) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedNotice?.title || '공지사항 상세'}
      >
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>카테고리: {selectedNotice?.category}</span>
          <span>•</span>
          <span>작성일: {selectedNotice?.date}</span>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.7, marginBottom: '24px' }}>
          {selectedNotice?.content}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(false)}>
            확인 및 닫기
          </button>
        </div>
      </Modal>
    </div>
  );
}
