import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, MapPin, CheckCircle, AlertCircle, Edit2, Eye, Megaphone, Clock } from 'lucide-react';
import { api } from '../api/client';

export default function OrganizerDashboard({ user, navigate }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // New Activity Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('환경');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('수원시 영통구');
  const [date, setDate] = useState('2026-11-01');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [capacity, setCapacity] = useState(20);
  const [description, setDescription] = useState('');
  const [supplies, setSupplies] = useState('편안한 복장, 개인 텀블러');
  const [gatheringPlace, setGatheringPlace] = useState('');
  const [notices, setNotices] = useState('1365 자원봉사 시간 인정');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&auto=format&fit=crop&q=80');

  // Notice form
  const [noticeText, setNoticeText] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.getActivities({ limit: 20 });
      setActivities(res.activities || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      await api.createActivity({
        title,
        category,
        location,
        region,
        date,
        startTime,
        endTime,
        capacity: parseInt(capacity, 10),
        description,
        supplies,
        gatheringPlace,
        notices,
        image
      });
      setShowCreateModal(false);
      fetchActivities();
      alert('새로운 봉사활동이 등록되었습니다!');
    } catch (err) {
      alert(err.message || '활동 등록에 실패했습니다.');
    }
  };

  const handleToggleStatus = async (activity) => {
    const newStatus = activity.status === 'open' ? 'closed' : 'open';
    try {
      await api.updateActivity(activity.id, { status: newStatus });
      setActivities(prev => prev.map(a => a.id === activity.id ? { ...a, status: newStatus } : a));
    } catch (e) {
      alert(e.message || '상태 변경에 실패했습니다.');
    }
  };

  const handleSendNotice = async (e) => {
    e.preventDefault();
    if (!noticeText.trim() || !selectedActivity) return;
    try {
      await api.updateActivity(selectedActivity.id, {
        notices: `${selectedActivity.notices}\n[추가 공지]: ${noticeText.trim()}`
      });
      setShowNoticeModal(false);
      setNoticeText('');
      fetchActivities();
      alert('참여자들에게 공지사항이 등록되었습니다!');
    } catch (e) {
      alert('공지 등록 실패');
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
            활동 주최자 관리 센터
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            개설한 봉사활동의 모집 현황, 신청자 관리, 공지 발송 및 일정을 관리하세요.
          </p>
        </div>

        <button className="btn-primary" style={{ width: 'auto', padding: '12px 22px' }} onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          <span>새 봉사활동 개설</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
          개설된 봉사활동 목록을 불러오는 중입니다...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activities.map(act => (
            <div 
              key={act.id}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--cream-border)',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={`card-category-badge ${act.category}`} style={{ position: 'static' }}>
                    {act.category}
                  </span>
                  <span className={`card-status-badge ${act.status === 'open' ? 'open' : 'closed'}`} style={{ position: 'static' }}>
                    {act.status === 'open' ? '모집중' : '마감'}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
                    ID: #{act.id}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '10px' }}>
                  {act.title}
                </h3>

                <div style={{ display: 'flex', gap: '16px', fontSize: '0.88rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={15} color="var(--primary)" /> {act.date} ({act.startTime}~{act.endTime})</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={15} color="var(--primary)" /> {act.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={15} color="var(--primary)" /> <strong>{act.enrolled}</strong> / {act.capacity}명</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.88rem' }}
                  onClick={() => {
                    setSelectedActivity(act);
                    setShowNoticeModal(true);
                  }}
                >
                  <Megaphone size={15} />
                  <span>공지 등록</span>
                </button>

                <button 
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.88rem' }}
                  onClick={() => handleToggleStatus(act)}
                >
                  <Edit2 size={15} />
                  <span>{act.status === 'open' ? '모집 마감하기' : '다시 열기'}</span>
                </button>

                <button 
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.88rem', width: 'auto' }}
                  onClick={() => navigate(`/activities/${act.id}`)}
                >
                  <Eye size={15} />
                  <span>활동 상세</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Activity Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">새 봉사활동 개설</h3>
              <button className="icon-button" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateActivity}>
              <div className="form-group">
                <label className="form-label">봉사활동명</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 우리 동네 하천 환경정화 플로깅" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">카테고리</label>
                  <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="환경">환경</option>
                    <option value="동물">동물</option>
                    <option value="교육">교육</option>
                    <option value="복지">복지</option>
                    <option value="문화">문화</option>
                    <option value="지역행사">지역행사</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">모집 인원</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">활동 일자</label>
                  <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">시작 시간</label>
                  <input type="time" className="form-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">종료 시간</label>
                  <input type="time" className="form-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">활동 장소 및 집결지</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 수원시 영통구 광교호수공원 제1주차장 앞" 
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setGatheringPlace(e.target.value);
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">활동 소개 및 내용</label>
                <textarea 
                  className="form-textarea" 
                  rows={4} 
                  placeholder="봉사활동의 취지와 세부 내용을 작성해주세요" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">준비물 및 지참사항</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={supplies}
                  onChange={(e) => setSupplies(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">대표 이미지 URL</label>
                <input 
                  type="url" 
                  className="form-input" 
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  취소
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
                  활동 개설하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Modal */}
      {showNoticeModal && (
        <div className="modal-overlay" onClick={() => setShowNoticeModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">주최자 공지사항 등록</h3>
              <button className="icon-button" onClick={() => setShowNoticeModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              [{selectedActivity?.title}] 참여자들에게 전달할 공지를 작성하세요.
            </p>
            <form onSubmit={handleSendNotice}>
              <div className="form-group">
                <textarea 
                  className="form-textarea"
                  rows={4}
                  placeholder="예: 당일 우천 예보로 인해 우비 또는 우산을 지참해주세요."
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowNoticeModal(false)}>취소</button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>공지 발송</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
