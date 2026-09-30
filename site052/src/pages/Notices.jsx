import React, { useState, useEffect } from 'react';
import NoticeCard from '../components/NoticeCard';
import { api } from '../api/client';

export default function Notices({ onSelectNotice }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    async function loadNotices() {
      setLoading(true);
      try {
        const res = await api.getNotices();
        if (res && res.notices) {
          setNotices(res.notices);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadNotices();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '6px' }}>
          공지사항
        </h1>
        <p style={{ color: 'var(--navy-500)', fontSize: '0.95rem' }}>
          SpaceMate 센터 운영 시간, 시설 개선 및 멤버십 혜택 안내입니다.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--navy-500)' }}>
          공지사항을 불러오는 중...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {notices.map(notice => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onSelectNotice={(n) => setSelectedNotice(n)}
            />
          ))}
        </div>
      )}

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="modal-overlay" onClick={() => setSelectedNotice(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  {selectedNotice.important && (
                    <span style={{
                      background: 'var(--rose-50)',
                      color: 'var(--rose-500)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      중요
                    </span>
                  )}
                  <span style={{ fontSize: '0.8rem', color: 'var(--navy-500)', fontWeight: '600' }}>
                    {selectedNotice.branch} · {selectedNotice.date}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--navy-900)' }}>
                  {selectedNotice.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedNotice(null)}
                style={{ fontSize: '1.2rem', color: 'var(--navy-500)' }}
              >
                ✕
              </button>
            </div>

            <div style={{
              fontSize: '0.95rem',
              color: 'var(--navy-700)',
              lineHeight: '1.7',
              background: '#f8fafc',
              padding: '20px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px'
            }}>
              {selectedNotice.content}
            </div>

            <div style={{ textAlign: 'right' }}>
              <button className="btn-primary" onClick={() => setSelectedNotice(null)}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
