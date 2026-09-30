import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, HeartHandshake, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, PackageCheck, Info, Megaphone } from 'lucide-react';
import { api } from '../api/client';

export default function ActivityDetail({ id, user, navigate }) {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinedSuccess, setJoinedSuccess] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await api.getActivity(id);
      setActivity(res.activity);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      // INTENTIONAL BACKEND BUG: site049-SEC-424
      // Server allows repeated join requests from the same user without checking duplicates
      const res = await api.joinActivity(id);
      if (res.success) {
        setJoinedSuccess(true);
        if (res.duplicateCount) {
          setDuplicateCount(res.duplicateCount);
        }
        // Update local activity enrolled count
        setActivity(prev => ({ ...prev, enrolled: prev.enrolled + 1 }));
      }
    } catch (e) {
      alert(e.message || '참여 신청에 실패했습니다.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-light)' }}>
        봉사활동 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>봉사활동을 찾을 수 없습니다.</h2>
        <button className="btn-primary" style={{ display: 'inline-flex', width: 'auto', marginTop: '16px' }} onClick={() => navigate('/activities')}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const isClosed = activity.status === 'closed' || activity.enrolled >= activity.capacity;

  return (
    <div className="page-wrapper">
      {/* Back Button */}
      <button 
        style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' }}
        onClick={() => navigate('/activities')}
      >
        <ArrowLeft size={18} />
        <span>목록으로 돌아가기</span>
      </button>

      <div className="detail-container">
        {/* Main Info */}
        <div className="detail-main">
          <img src={activity.image} alt={activity.title} className="detail-banner-img" />

          <div className="detail-header">
            <div className="detail-badges">
              <span className={`card-category-badge ${activity.category}`} style={{ position: 'static' }}>
                {activity.category}
              </span>
              <span className={`card-status-badge ${isClosed ? 'closed' : 'open'}`} style={{ position: 'static' }}>
                {isClosed ? '모집 마감' : '모집중'}
              </span>
            </div>
            <h1 className="detail-title">{activity.title}</h1>
          </div>

          <div className="detail-organizer-row">
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeartHandshake size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>활동 주최</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>{activity.organizerName}</div>
            </div>
          </div>

          {/* Activity Description */}
          <div className="detail-section-block">
            <h3>
              <Info size={20} color="var(--primary)" />
              <span>활동 소개</span>
            </h3>
            <p>{activity.description}</p>
          </div>

          {/* Supplies */}
          <div className="detail-section-block">
            <h3>
              <PackageCheck size={20} color="var(--primary)" />
              <span>준비물 및 지참사항</span>
            </h3>
            <p>{activity.supplies}</p>
          </div>

          {/* Gathering Place */}
          <div className="detail-section-block">
            <h3>
              <MapPin size={20} color="var(--primary)" />
              <span>집결 장소 및 오시는 길</span>
            </h3>
            <p>{activity.gatheringPlace}</p>
          </div>

          {/* Notices */}
          <div className="detail-section-block">
            <h3>
              <Megaphone size={20} color="var(--primary)" />
              <span>참여 안내 및 유의사항</span>
            </h3>
            <p>{activity.notices}</p>
          </div>
        </div>

        {/* Sidebar Info & Action */}
        <div className="detail-sidebar">
          <div className="booking-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main)' }}>
              활동 일정 및 참여 신청
            </h3>

            <div className="booking-info-list">
              <div className="booking-info-item">
                <div className="info-icon-box">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="info-label">활동 일자</div>
                  <div className="info-value activity-datetime-badge">
                    {activity.date}
                  </div>
                </div>
              </div>

              <div className="booking-info-item">
                <div className="info-icon-box">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="info-label">활동 시간</div>
                  {/* INTENTIONAL BACKEND BUG: site049-SEC-423 */}
                  <div className="info-value activity-datetime-badge">
                    {activity.rawUtcDisplay ? (
                      <span title="UTC 변환 표기">{activity.startTime} ~ {activity.endTime} (기준: {activity.rawUtcDisplay.substring(11, 16)} UTC)</span>
                    ) : (
                      <span>{activity.startTime} ~ {activity.endTime}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="booking-info-item">
                <div className="info-icon-box">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="info-label">활동 지역</div>
                  <div className="info-value">{activity.location}</div>
                </div>
              </div>

              <div className="booking-info-item">
                <div className="info-icon-box">
                  <Users size={20} />
                </div>
                <div>
                  <div className="info-label">모집 인원</div>
                  <div className="info-value">
                    <span style={{ color: 'var(--primary)' }}>{activity.enrolled}명</span> / {activity.capacity}명
                  </div>
                </div>
              </div>
            </div>

            {/* Application Section */}
            {joinedSuccess ? (
              <div style={{ background: 'var(--primary-subtle)', border: '1px solid var(--primary-light)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', textAlign: 'center' }}>
                <CheckCircle2 size={32} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: '700', color: 'var(--primary-dark)', fontSize: '1.05rem', marginBottom: '4px' }}>
                  신청 완료
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {duplicateCount > 1 
                    ? `(현재 동일 계정으로 총 ${duplicateCount}회 중복 신청되었습니다)` 
                    : '봉사활동 참여 신청이 성공적으로 접수되었습니다.'}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ flex: 1, fontSize: '0.85rem', padding: '8px' }}
                    onClick={() => navigate('/my-activities')}
                  >
                    참여 내역 확인
                  </button>
                  {/* Repeated Click allowed for SEC-424 trigger */}
                  <button 
                    className="btn-primary join-btn"
                    style={{ flex: 1, fontSize: '0.85rem', padding: '8px' }}
                    onClick={handleJoin}
                  >
                    참여 신청
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="btn-primary join-btn"
                disabled={isClosed}
                onClick={handleJoin}
              >
                <HeartHandshake size={18} />
                <span>{isClosed ? '모집이 마감되었습니다' : '참여 신청'}</span>
              </button>
            )}

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-light)', justifyContent: 'center' }}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span>1365 자원봉사 포털 시간 인정 연계 가능</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
