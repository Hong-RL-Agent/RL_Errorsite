import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Heart, MessageSquare, MapPin, User, Edit, Trash2, Tag, Compass } from 'lucide-react';
import ImageWithFallback from '../components/ImageWithFallback';
import ItineraryTimeline from '../components/ItineraryTimeline';
import CommentList from '../components/CommentList';
import TravelCard from '../components/TravelCard';
import { api } from '../api/client';

export default function TravelDetail({ id, user, navigate }) {
  const [log, setLog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    loadDetailAndComments();
  }, [id]);

  const loadDetailAndComments = async () => {
    setLoading(true);
    try {
      const data = await api.getTravelLog(id);
      setLog(data.travelLog);
      
      const comms = await api.getComments(id);
      setComments(comms || []);

      const all = await api.getTravelLogs({ limit: 4 });
      setRecommended(all.travelLogs?.filter(l => l.id !== parseInt(id, 10)).slice(0, 3) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    try {
      if (liked) {
        await api.unlikeTravelLog(id);
        setLiked(false);
        setLog(prev => ({ ...prev, likes: Math.max(0, prev.likes - 1) }));
      } else {
        await api.likeTravelLog(id);
        setLiked(true);
        setLog(prev => ({ ...prev, likes: prev.likes + 1 }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments(prev => [...prev, newComment]);
    // Note: We intentionally do NOT manually increment log.commentCount here
    // to reflect the backend SEC-432 bug where aggregate count stays stale!
  };

  const handleDeleteLog = async () => {
    if (!window.confirm('정말 이 여행기를 삭제하시겠습니까?')) return;
    try {
      await api.deleteTravelLog(id);
      navigate('/travel');
    } catch (err) {
      alert('삭제 실패');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-light)' }}>
        여행기를 불러오는 중입니다...
      </div>
    );
  }

  if (!log) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>여행기를 찾을 수 없습니다.</h2>
        <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/travel')}>
          여행기 목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Back Button */}
      <button 
        className="back-btn"
        style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' }}
        onClick={() => window.history.back()}
      >
        <ArrowLeft size={18} />
        <span>뒤로가기</span>
      </button>

      <div className="detail-container">
        {/* Main Content */}
        <div className="detail-main">
          <ImageWithFallback 
            src={log.image} 
            alt={log.title} 
            className="detail-banner-img" 
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="card-dest-badge" style={{ position: 'static' }}>
              {log.destination}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} />
              <span>{log.startDate} ~ {log.endDate}</span>
            </span>
          </div>

          <h1 className="detail-title">{log.title}</h1>

          {/* Author info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--sand)', borderRadius: 'var(--radius-md)', marginBottom: '28px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={log.authorAvatar} alt={log.authorName} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>{log.authorName}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{log.createdAt} 작성</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Heart size={16} color="#f43f5e" />
                <strong>{log.likes}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MessageSquare size={16} color="var(--primary)" />
                <strong>{log.commentCount}개</strong>
              </span>
            </div>
          </div>

          {/* Story Description */}
          <div style={{ marginBottom: '36px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-main)' }}>
              📖 여행 이야기
            </h3>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
              {log.description}
            </p>
          </div>

          {/* Tags */}
          {log.tags && log.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '36px' }}>
              {log.tags.map((t, idx) => (
                <span key={idx} style={{ padding: '6px 12px', background: 'var(--primary-subtle)', color: 'var(--primary-dark)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: '600' }}>
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Day by Day Itinerary */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={20} color="var(--primary)" />
              <span>Day별 상세 여행 코스</span>
            </h3>
            <ItineraryTimeline itinerary={log.itinerary} />
          </div>

          {/* Comments Component */}
          <CommentList 
            travelLogId={id}
            comments={comments}
            onCommentAdded={handleCommentAdded}
            user={user}
          />
        </div>

        {/* Sidebar Actions & Recommended */}
        <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          <div style={{ background: 'var(--sand-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--sand-border)', boxShadow: 'var(--shadow-md)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
              여행기 반응 및 관리
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn-secondary"
                onClick={handleLikeToggle}
                style={{
                  color: liked ? '#f43f5e' : 'var(--text-main)',
                  borderColor: liked ? '#fecdd3' : 'var(--sand-border)',
                  background: liked ? '#fff1f2' : 'var(--sand)'
                }}
              >
                <Heart size={18} fill={liked ? '#f43f5e' : 'none'} />
                <span>{liked ? '좋아요 취소' : '좋아요 누르기'} ({log.likes})</span>
              </button>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '10px', fontSize: '0.88rem' }}
                  onClick={() => navigate(`/travel/edit/${log.id}`)}
                >
                  <Edit size={15} />
                  <span>수정</span>
                </button>
                <button 
                  className="btn-danger-outline" 
                  style={{ flex: 1, padding: '10px', fontSize: '0.88rem', justifyContent: 'center' }}
                  onClick={handleDeleteLog}
                >
                  <Trash2 size={15} />
                  <span>삭제</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recommended Other Travel Logs (Allows testing SEC-431) */}
          <div style={{ background: 'var(--sand-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--sand-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
              함께 둘러보는 추천 여행기
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recommended.map(rec => (
                <div 
                  key={rec.id}
                  style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', padding: '8px', borderRadius: 'var(--radius-md)', transition: 'background 0.2s' }}
                  onClick={() => navigate(`/travel/${rec.id}`)}
                >
                  <img src={rec.image} alt={rec.title} style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {rec.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '2px' }}>
                      {rec.destination} • {rec.authorName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
