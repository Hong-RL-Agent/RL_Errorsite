import React, { useEffect, useState } from 'react';
import { Search, Star, MapPin, Tag, Mail, CheckCircle, Calendar, Plus } from 'lucide-react';
import { fetchApi } from '../api/client';
import { showToast } from '../components/Toast';

export default function Services({ onSelectService }) {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [customTagInput, setCustomTagInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  // Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');

  // Reserve Modal State
  const [reserveModalSrv, setReserveModalSrv] = useState(null);
  const [reserveDate, setReserveDate] = useState('2026-09-30');
  const [reserveTime, setReserveTime] = useState('14:00');
  const [reserveMemo, setReserveMemo] = useState('');

  useEffect(() => {
    loadServices();
  }, [category, search, selectedTag]);

  const loadServices = async () => {
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (search.trim()) params.append('search', search.trim());
      if (selectedTag) params.append('tag', selectedTag);

      const data = await fetchApi(`/api/services?${params.toString()}`);
      setServices(data.services || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Triggers SEC-385: async-no-feedback on Search Suggestions
  const handleSearchChange = (val) => {
    setSearch(val);
    if (val.length >= 2) {
      // Intentionally without progress indicator for SEC-385
      fetchApi(`/api/search/suggestions?q=${encodeURIComponent(val)}`)
        .then((data) => {
          setSuggestions(data.suggestions || []);
        })
        .catch(() => {});
    } else {
      setSuggestions([]);
    }
  };

  // Triggers SEC-381: async-no-feedback on Tag Registration
  const handleApplyCustomTag = (e) => {
    e.preventDefault();
    if (!customTagInput.trim()) return;

    const formattedTag = customTagInput.startsWith('#') ? customTagInput.trim() : `#${customTagInput.trim()}`;
    
    // Intentionally without loading/cancel feedback UI state for SEC-381
    fetchApi('/api/tags/apply', {
      method: 'POST',
      body: JSON.stringify({ tag: formattedTag })
    }).then(() => {
      showToast('태그 적용', `${formattedTag} 태그가 검색 조건에 적용되었습니다.`, 'success');
      setSelectedTag(formattedTag);
      setCustomTagInput('');
    }).catch((err) => {
      showToast('오류', err.message, 'error');
    });
  };

  // Triggers SEC-382: async-no-feedback on Invite Message
  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail || !inviteMsg) return;

    // Intentionally without loading/cancel feedback UI state for SEC-382
    fetchApi('/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ email: inviteEmail, inviteMessage: inviteMsg })
    }).then(() => {
      showToast('초대장 발송 완료', `${inviteEmail}으로 초대장이 발송되었습니다.`, 'success');
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteMsg('');
    }).catch((err) => {
      showToast('오류', err.message, 'error');
    });
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    if (!reserveModalSrv) return;

    try {
      await fetchApi('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: reserveModalSrv.id,
          date: reserveDate,
          time: reserveTime,
          memo: reserveMemo
        })
      });
      showToast('예약 완료', `${reserveModalSrv.title} 예약이 성공적으로 접수되었습니다.`, 'success');
      setReserveModalSrv(null);
    } catch (err) {
      showToast('예약 실패', err.message, 'error');
    }
  };

  return (
    <div className="main-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>전문 펫시터 & 돌봄 서비스</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>신원 검증을 마친 안심 시터와 1:1 맞춤 케어를 예약하세요.</p>
        </div>

        <button
          className="primary-btn"
          style={{ background: '#52b788' }}
          onClick={() => setInviteModalOpen(true)}
        >
          <Mail size={16} />
          <span>공동 돌봄 초대장 보내기</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card-box" style={{ padding: '20px', marginBottom: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', marginBottom: '16px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="지역, 시터명, 산책, 돌봄 검색 (예: 강남구, 산책, 미용)"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
            {suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setSearch(s); setSuggestions([]); }}
                    style={{ padding: '10px 14px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                  >
                    🔍 {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tag input form */}
          <form onSubmit={handleApplyCustomTag} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="태그 입력 (#대형견, #탁묘)"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', width: '180px' }}
            />
            <button type="submit" className="primary-btn" style={{ padding: '10px 16px', fontSize: '13px' }}>
              태그 적용
            </button>
          </form>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', '산책', '돌봄', '미용'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13.5px',
                fontWeight: 700,
                background: category === cat ? '#2d6a4f' : '#f1f5f9',
                color: category === cat ? 'white' : '#475569'
              }}
            >
              {cat === 'all' ? '전체 카테고리' : cat}
            </button>
          ))}
          {selectedTag && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#eef7ee', color: '#2d6a4f', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>
              <span>선택 태그: {selectedTag}</span>
              <button onClick={() => setSelectedTag('')} style={{ color: '#8d99ae', marginLeft: '4px' }}>✕</button>
            </div>
          )}
        </div>
      </div>

      {/* Services Grid */}
      <div className="cards-grid">
        {services.map((srv) => (
          <div key={srv.id} className="service-card">
            <div className="card-img-wrap">
              <img src={srv.image} alt={srv.title} />
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(45, 106, 79, 0.9)', color: 'white', fontSize: '11.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                {srv.category}
              </div>
            </div>

            <div className="card-body">
              <h3 className="card-title">{srv.title}</h3>
              <div style={{ fontSize: '13px', color: '#526156', marginBottom: '6px' }}>
                {srv.providerName} · {srv.providerTitle}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: '#64748b', marginBottom: '10px' }}>
                <MapPin size={13} color="#2d6a4f" />
                <span>{srv.location}</span>
                <span style={{ margin: '0 4px' }}>·</span>
                <Star size={13} fill="#f4a261" color="#f4a261" />
                <strong style={{ color: '#1b261e' }}>{srv.rating}</strong>
                <span>({srv.reviewsCount})</span>
              </div>

              <div className="card-tags">
                {srv.tags?.map((t, idx) => (
                  <span key={idx} className="tag-badge" onClick={() => setSelectedTag(t)} style={{ cursor: 'pointer' }}>
                    {t}
                  </span>
                ))}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#8d99ae' }}>{srv.unit}</div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#2d6a4f' }}>
                    {srv.price.toLocaleString()}원
                  </div>
                </div>

                <button
                  className="primary-btn"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                  onClick={() => setReserveModalSrv(srv)}
                >
                  <span>예약하기</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>공동 돌봄 초대장 발송</h3>
            <form onSubmit={handleSendInvite}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>초대할 이메일</label>
                <input
                  type="email"
                  required
                  placeholder="family@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>초대 메시지</label>
                <textarea
                  rows="3"
                  required
                  placeholder="우리 아이 돌봄 일정을 함께 관리해요!"
                  value={inviteMsg}
                  onChange={(e) => setInviteMsg(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setInviteModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                  취소
                </button>
                <button type="submit" className="primary-btn">
                  초대장 보내기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reserve Modal */}
      {reserveModalSrv && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>[{reserveModalSrv.title}] 돌봄 예약</h3>
            <form onSubmit={handleCreateReservation}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>예약 날짜</label>
                  <input
                    type="date"
                    required
                    value={reserveDate}
                    onChange={(e) => setReserveDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>예약 시간</label>
                  <input
                    type="time"
                    required
                    value={reserveTime}
                    onChange={(e) => setReserveTime(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>시터 전달 요청사항</label>
                <textarea
                  rows="3"
                  placeholder="예: 간식 급여 요청, 특별 주의사항 등"
                  value={reserveMemo}
                  onChange={(e) => setReserveMemo(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>결제 예상 금액</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#2d6a4f' }}>{reserveModalSrv.price.toLocaleString()}원</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setReserveModalSrv(null)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                  취소
                </button>
                <button type="submit" className="primary-btn">
                  예약 확정하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
