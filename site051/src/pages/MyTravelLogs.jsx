import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Heart, MessageSquare, Edit, Trash2 } from 'lucide-react';
import ImageWithFallback from '../components/ImageWithFallback';
import EmptyState from '../components/EmptyState';
import { api } from '../api/client';

export default function MyTravelLogs({ user, navigate }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('전체');

  useEffect(() => {
    fetchMyLogs();
  }, [user]);

  const fetchMyLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getTravelLogs({ limit: 50 });
      // Filter logs by user or show all user's
      const myLogs = (res.travelLogs || []).filter(l => l.authorId === (user ? user.id : 1));
      setLogs(myLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.deleteTravelLog(id);
      setLogs(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert('삭제 실패');
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
            내 여행 기록
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            내가 직접 작성한 여행기와 저장된 일정들을 관리하세요.
          </p>
        </div>

        <button 
          className="btn-primary" 
          style={{ width: 'auto', padding: '12px 22px' }}
          onClick={() => navigate('/travel/new')}
        >
          <Plus size={18} />
          <span>새 여행기 작성</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
          내 여행기를 불러오는 중입니다...
        </div>
      ) : logs.length === 0 ? (
        <EmptyState 
          title="작성된 여행기가 없습니다"
          message="첫 번째 여행기를 작성하고 멋진 추억을 공유해보세요!"
          actionLabel="여행기 작성하기"
          onAction={() => navigate('/travel/new')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {logs.map(log => (
            <div 
              key={log.id}
              style={{
                background: 'var(--sand-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--sand-border)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                flexWrap: 'wrap',
                gap: '16px',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/travel/${log.id}`)}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                <ImageWithFallback 
                  src={log.image} 
                  alt={log.title} 
                  style={{ width: '100px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} 
                />
                <div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="card-dest-badge" style={{ position: 'static', padding: '2px 8px', fontSize: '0.75rem' }}>
                      {log.destination}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      {log.startDate} ~ {log.endDate}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
                    {log.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Heart size={13} color="#f43f5e" /> {log.likes}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MessageSquare size={13} color="var(--primary)" /> {log.commentCount}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '8px 14px', fontSize: '0.88rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/travel/edit/${log.id}`);
                  }}
                >
                  <Edit size={14} />
                  <span>수정</span>
                </button>
                <button 
                  className="btn-danger-outline" 
                  style={{ padding: '8px 14px', fontSize: '0.88rem' }}
                  onClick={(e) => handleDelete(log.id, e)}
                >
                  <Trash2 size={14} />
                  <span>삭제</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
