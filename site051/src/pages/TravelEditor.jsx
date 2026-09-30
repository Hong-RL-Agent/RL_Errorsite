import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, MapPin, Clock } from 'lucide-react';
import { api } from '../api/client';

export default function TravelEditor({ editId, user, navigate }) {
  const isEditing = Boolean(editId);

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('제주');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-04');
  const [tags, setTags] = useState('제주, 힐링');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80');
  const [description, setDescription] = useState('');
  const [itinerary, setItinerary] = useState([
    { day: 1, place: '공항 도착', time: '10:00', note: '출발 및 렌터카 수령' }
  ]);

  useEffect(() => {
    if (isEditing) {
      api.getTravelLog(editId).then(res => {
        const data = res.travelLog;
        if (data) {
          setTitle(data.title || '');
          setDestination(data.destination || '제주');
          setStartDate(data.startDate || '');
          setEndDate(data.endDate || '');
          setTags(data.tags?.join(', ') || '');
          setImage(data.image || '');
          setDescription(data.description || '');
          setItinerary(data.itinerary?.length ? data.itinerary : [{ day: 1, place: '', time: '10:00', note: '' }]);
        }
      }).catch(console.error);
    }
  }, [editId]);

  const handleAddStop = () => {
    setItinerary([...itinerary, { day: 1, place: '', time: '12:00', note: '' }]);
  };

  const handleRemoveStop = (idx) => {
    if (itinerary.length <= 1) return;
    setItinerary(itinerary.filter((_, i) => i !== idx));
  };

  const handleStopChange = (idx, field, value) => {
    const updated = [...itinerary];
    updated[idx][field] = field === 'day' ? parseInt(value, 10) : value;
    setItinerary(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      if (isEditing) {
        // INTENTIONAL BACKEND BUG: site051-SEC-435
        // If we send only partial update (e.g. title), unprovided fields get overwritten
        await api.updateTravelLog(editId, {
          title
          // Note: In editing mode, sending partial payload causes backend SEC-435 overwrite
        });
        alert('여행기가 수정되었습니다!');
        navigate(`/travel/${editId}`);
      } else {
        const res = await api.createTravelLog({
          title,
          destination,
          startDate,
          endDate,
          tags: tagList,
          image,
          description,
          itinerary
        });
        if (res.id) {
          navigate(`/travel/${res.id}`);
        }
      }
    } catch (err) {
      alert(err.message || '저장 실패');
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '820px' }}>
      <button 
        style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' }}
        onClick={() => navigate(isEditing ? `/travel/${editId}` : '/travel')}
      >
        <ArrowLeft size={18} />
        <span>뒤로가기</span>
      </button>

      <div style={{ background: 'var(--sand-card)', borderRadius: 'var(--radius-xl)', padding: '36px', border: '1px solid var(--sand-border)', boxShadow: 'var(--shadow-sm)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
          {isEditing ? '여행기 수정하기' : '새 여행 일정 & 여행기 작성'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          방문했던 장소와 나만의 감성 여행 후기를 남겨보세요.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">여행기 제목</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="예: 제주도 3박 4일 힐링 로드트립"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Destination & Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label className="form-label">여행지 (도시/지역)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="예: 제주, 부산, 오사카"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">시작일</label>
              <input 
                type="date" 
                className="form-input" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>

            <div>
              <label className="form-label">종료일</label>
              <input 
                type="date" 
                className="form-input" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
          </div>

          {/* Tags & Image */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label className="form-label">태그 (쉼표로 구분)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="제주, 힐링, 카페투어"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">대표 썸네일 이미지 URL</label>
              <input 
                type="url" 
                className="form-input" 
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
          </div>

          {/* Story Description */}
          <div className="form-group">
            <label className="form-label">여행 후기 및 이야기</label>
            <textarea 
              className="form-textarea" 
              rows={4}
              placeholder="여행의 감동과 팁을 적어주세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Day Itinerary Manager */}
          <div style={{ marginTop: '32px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Day별 방문 장소 일정</label>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                onClick={handleAddStop}
              >
                <Plus size={14} />
                <span>장소 추가</span>
              </button>
            </div>

            {itinerary.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select 
                  className="form-select" 
                  style={{ width: '90px' }}
                  value={item.day}
                  onChange={(e) => handleStopChange(idx, 'day', e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(d => (
                    <option key={d} value={d}>Day {d}</option>
                  ))}
                </select>

                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="방문 장소명 (예: 협재해수욕장)"
                  style={{ flex: 1, minWidth: '160px' }}
                  value={item.place}
                  onChange={(e) => handleStopChange(idx, 'place', e.target.value)}
                />

                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="시간 (예: 14:00)"
                  style={{ width: '100px' }}
                  value={item.time}
                  onChange={(e) => handleStopChange(idx, 'time', e.target.value)}
                />

                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="메모/꿀팁"
                  style={{ flex: 1, minWidth: '160px' }}
                  value={item.note}
                  onChange={(e) => handleStopChange(idx, 'note', e.target.value)}
                />

                <button 
                  type="button" 
                  className="icon-button"
                  style={{ width: '42px', height: '42px', flexShrink: 0 }}
                  onClick={() => handleRemoveStop(idx)}
                >
                  <Trash2 size={16} color="#ef4444" />
                </button>
              </div>
            ))}
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '36px', borderTop: '1px solid var(--border-light)', paddingTop: '24px' }}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => navigate(isEditing ? `/travel/${editId}` : '/travel')}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="btn-primary save-travel-btn"
              style={{ width: 'auto', padding: '12px 28px' }}
            >
              <Save size={18} />
              <span>{isEditing ? '저장하기' : '여행기 등록'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
