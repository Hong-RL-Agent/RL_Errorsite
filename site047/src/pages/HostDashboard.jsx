import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  PlusCircle, 
  Calendar, 
  Users, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  DollarSign
} from 'lucide-react';
import ExperienceCard from '../components/ExperienceCard';
import Modal from '../components/Modal';
import { fetchApi, getCurrentUser } from '../api/client';

export default function HostDashboard({ onSelectExperience, onShowToast }) {
  const [hostExperiences, setHostExperiences] = useState([]);
  const [hostReservations, setHostReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('experiences');
  const [loading, setLoading] = useState(true);

  // New Experience Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('class');
  const [region, setRegion] = useState('서울');
  const [price, setPrice] = useState(50000);
  const [duration, setDuration] = useState('2시간');
  const [maxParticipants, setMaxParticipants] = useState(6);
  const [location, setLocation] = useState('서울 성동구 성수이로');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&auto=format&fit=crop&q=80');

  const loadHostData = () => {
    setLoading(true);
    const currentUser = getCurrentUser();
    
    // Load host experiences
    fetchApi('/api/experiences?includePrivate=true')
      .then(allExp => {
        const myExp = allExp.filter(e => e.hostId === currentUser.id || currentUser.role === 'host' || currentUser.role === 'admin');
        setHostExperiences(myExp.length > 0 ? myExp : allExp.slice(0, 4));
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Load host reservations
    fetchApi('/api/reservations')
      .then(allRes => {
        setHostReservations(allRes);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadHostData();
  }, []);

  const handleCreateExperience = (e) => {
    e.preventDefault();
    fetchApi('/api/experiences', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        category,
        region,
        price: Number(price),
        duration,
        maxParticipants: Number(maxParticipants),
        location,
        image
      })
    })
      .then(newExp => {
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        if (onShowToast) onShowToast(`'${newExp.title}' 체험이 성공적으로 등록되었습니다!`, 'success');
        loadHostData();
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  // Stats calculation
  const totalBookings = hostReservations.length;
  const totalRevenue = hostReservations
    .filter(r => r.status !== 'cancelled')
    .reduce((sum, r) => sum + Number(r.totalPrice), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Host Dashboard Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 32px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-yellow">HOST PORTAL</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)' }}>
            호스트 이벤트 관리 센터
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            등록한 체험 상품 관리, 게스트 예약 현황 모니터링 및 신규 클래스를 개설하세요.
          </p>
        </div>

        <button 
          id="btn-open-create-experience"
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <PlusCircle size={18} />
          <span>신규 체험 등록</span>
        </button>
      </div>

      {/* Revenue & Booking Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--sky-blue)' }}>
            <Calendar size={20} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>누적 예약 건수</span>
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', marginTop: 8 }}>
            {totalBookings}건
          </p>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#10b981' }}>
            <DollarSign size={20} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>총 정산 예상액</span>
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', marginTop: 8 }}>
            {totalRevenue.toLocaleString()}원
          </p>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--warm-yellow)' }}>
            <Star size={20} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>호스트 평균 평점</span>
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', marginTop: 8 }}>
            4.94 <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ 5.0</span>
          </p>
        </div>
      </div>

      {/* Tab Controls */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
        <button
          id="host-tab-experiences"
          onClick={() => setActiveTab('experiences')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            color: activeTab === 'experiences' ? 'var(--sky-blue)' : 'var(--text-muted)',
            backgroundColor: activeTab === 'experiences' ? 'var(--sky-blue-light)' : 'transparent'
          }}
        >
          등록된 체험 목록 ({hostExperiences.length})
        </button>

        <button
          id="host-tab-reservations"
          onClick={() => setActiveTab('reservations')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            color: activeTab === 'reservations' ? 'var(--sky-blue)' : 'var(--text-muted)',
            backgroundColor: activeTab === 'reservations' ? 'var(--sky-blue-light)' : 'transparent'
          }}
        >
          전체 예약자 현황 ({hostReservations.length})
        </button>
      </div>

      {/* Tab Content: Experiences */}
      {activeTab === 'experiences' && (
        <div className="grid-cards">
          {hostExperiences.map(exp => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              onSelect={onSelectExperience}
            />
          ))}
        </div>
      )}

      {/* Tab Content: Reservations */}
      {activeTab === 'reservations' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--cream-bg)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 16px' }}>예약번호</th>
                <th style={{ padding: '14px 16px' }}>체험명</th>
                <th style={{ padding: '14px 16px' }}>예약자</th>
                <th style={{ padding: '14px 16px' }}>일시 / 인원</th>
                <th style={{ padding: '14px 16px' }}>결제금액</th>
                <th style={{ padding: '14px 16px' }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {hostReservations.map(res => (
                <tr key={res.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 600 }}>{res.bookingCode}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--primary-navy)' }}>{res.experienceTitle}</td>
                  <td style={{ padding: '14px 16px' }}>{res.userName} ({res.userPhone || '010-3491-8821'})</td>
                  <td style={{ padding: '14px 16px' }}>{res.date} {res.time} ({res.participants}명)</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>{Number(res.totalPrice).toLocaleString()}원</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${res.status === 'confirmed' ? 'badge-blue' : (res.status === 'completed' ? 'badge-green' : (res.status === 'cancelled' ? 'badge-red' : 'badge-yellow'))}`}>
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Experience Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="새로운 체험 개설"
      >
        <form onSubmit={handleCreateExperience} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">체험 제목</label>
            <input
              id="input-create-exp-title"
              type="text"
              placeholder="예: 성수동 가죽공예 키링 원데이 클래스"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">카테고리</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-select">
                <option value="class">원데이 클래스</option>
                <option value="tour">로컬 투어</option>
                <option value="activity">액티비티/레저</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">지역</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="form-select">
                <option value="서울">서울</option>
                <option value="제주">제주</option>
                <option value="부산">부산</option>
                <option value="경기">경기</option>
                <option value="강원">강원</option>
                <option value="경북">경북</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">체험 가격 (1인당)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">최대 인원</label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">만나는 장소</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">상세 설명</label>
            <textarea
              rows={3}
              placeholder="체험의 매력과 진행 과정을 상세히 소개해 주세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline">
              취소
            </button>
            <button id="btn-submit-create-experience" type="submit" className="btn btn-primary">
              체험 등록 완료
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
