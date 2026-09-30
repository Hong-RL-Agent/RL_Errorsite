import React, { useState, useEffect } from 'react';
import { Video, Users, DollarSign, Eye, TrendingUp, Calendar, ArrowRight, Sparkles } from 'lucide-react';

export default function Dashboard({ setCurrentPage, showToast }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err));
  }, []);

  const stats = data?.stats || {
    totalSubscribers: '142K',
    monthlyViews: '890.5K',
    totalRevenue: '₩4,850,000',
    activeProjects: 6,
    pendingShipments: 2
  };

  return (
    <div>
      {/* Channel Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 36px',
        color: '#ffffff',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 12px 24px -4px rgba(79, 70, 229, 0.25)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '10px' }}>
            <Sparkles size={14} /> Creator Enterprise Pro
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
            {data?.user?.channelName || 'DailyFrame Studio'}
          </h2>
          <p style={{ color: '#c7d2fe', fontSize: '0.92rem' }}>
            유튜브, 뉴스레터, 굿즈 커머스를 통합 관리하는 스마트 크리에이터 워크스페이스입니다.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => setCurrentPage('content')}>
          콘텐츠 관리 <ArrowRight size={16} />
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--gray-500)', fontWeight: 600 }}>총 채널 구독자</span>
            <Users size={20} color="#6366f1" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--navy-900)' }}>{stats.totalSubscribers}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 700 }}>+8.4% 이번 달</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--gray-500)', fontWeight: 600 }}>월간 총 조회수</span>
            <Eye size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--navy-900)' }}>{stats.monthlyViews}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 700 }}>+12.1% 이번 달</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--gray-500)', fontWeight: 600 }}>월간 정산 예상 수익</span>
            <DollarSign size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--navy-900)' }}>{stats.totalRevenue}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 700 }}>애드센스 + 굿즈</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--gray-500)', fontWeight: 600 }}>진행 중인 프로젝트</span>
            <Video size={20} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--navy-900)' }}>{stats.activeProjects}개</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>영상 & 기획</span>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
        {/* Recent Contents */}
        <div className="card">
          <div className="card-header-flex">
            <h3 className="card-title-lg">최근 제작 및 게시된 콘텐츠</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage('content')}>
              전체 보기
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {data?.recentContents?.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                <img src={c.thumbnail} alt={c.title} style={{ width: '80px', height: '52px', borderRadius: '6px', objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
                    <span className="badge badge-published">{c.platform}</span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--gray-400)' }}>{c.publishDate}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.title}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.84rem', color: 'var(--gray-500)' }}>
                  조회수 <strong>{c.views}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header-flex">
            <h3 className="card-title-lg">콘텐츠 캘린더 일정</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage('calendar')}>
              일정 관리
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.upcomingEvents?.map(e => (
              <div key={e.id} style={{ padding: '14px', background: '#faf7f2', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '2px' }}>
                  {e.date}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--navy-900)' }}>
                  {e.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                  담당: {e.creator}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
