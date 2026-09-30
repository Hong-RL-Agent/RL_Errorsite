import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, ArrowRight, Trash2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { api } from '../api/client';

export default function MyActivities({ user, navigate }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('전체');

  const tabs = ['전체', '신청 완료', '참여 예정', '참여 완료', '취소'];

  useEffect(() => {
    fetchEnrollments();
  }, [user]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const data = await api.getEnrollments();
      setEnrollments(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('정말 봉사활동 참여 신청을 취소하시겠습니까?')) return;
    try {
      await api.cancelEnrollment(id);
      setEnrollments(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert(err.message || '취소 중 오류가 발생했습니다.');
    }
  };

  const filtered = enrollments.filter(e => {
    if (activeTab === '전체') return true;
    return e.status === activeTab;
  });

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
          참여 내역
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          {user ? `${user.name} 님이 신청하신 봉사활동 내역 및 참여 일정을 확인하세요.` : '봉사활동 신청 내역을 확인하세요.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="category-pills-row">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`category-pill ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} {tab === '전체' ? `(${enrollments.length})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
          참여 내역을 불러오는 중입니다...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState 
          title="해당 상태의 봉사활동이 없습니다"
          message="새로운 봉사활동을 탐색하고 이웃과 함께 나눔에 동참해보세요!"
          actionLabel="봉사활동 찾기"
          onAction={() => navigate('/activities')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(item => (
            <div 
              key={item.id}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--cream-border)',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                flexWrap: 'wrap',
                gap: '16px'
              }}
              onClick={() => navigate(`/activities/${item.activityId}`)}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={`card-category-badge ${item.activityCategory}`} style={{ position: 'static' }}>
                    {item.activityCategory}
                  </span>
                  <span style={{ 
                    padding: '3px 8px', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.8rem', 
                    fontWeight: '700',
                    background: item.status === '신청 완료' ? 'var(--primary-light)' : item.status === '참여 예정' ? '#dbeafe' : item.status === '참여 완료' ? '#f3f4f6' : '#fee2e2',
                    color: item.status === '신청 완료' ? 'var(--primary-dark)' : item.status === '참여 예정' ? '#1e40af' : item.status === '참여 완료' ? '#4b5563' : '#991b1b'
                  }}>
                    {item.status}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                    신청일: {item.appliedAt}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '10px' }}>
                  {item.activityTitle}
                </h3>

                <div style={{ display: 'flex', gap: '16px', fontSize: '0.88rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <div className="meta-item">
                    <Calendar size={15} color="var(--primary)" />
                    <span>{item.activityDate}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={15} color="var(--primary)" />
                    <span>{item.activityTime}</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={15} color="var(--primary)" />
                    <span>{item.activityLocation}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  className="btn-danger-outline"
                  onClick={(e) => handleCancel(item.id, e)}
                  title="신청 취소"
                >
                  <Trash2 size={15} />
                  <span>신청 취소</span>
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => navigate(`/activities/${item.activityId}`)}
                  style={{ padding: '8px 14px', fontSize: '0.88rem' }}
                >
                  <span>상세보기</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
