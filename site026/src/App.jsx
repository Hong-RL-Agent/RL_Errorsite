import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Search, 
  Plus, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Filter,
  ArrowRight,
  Info,
  X
} from 'lucide-react';

const API_BASE = '/api';

function App() {
  const [groups, setGroups] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [minParticipants, setMinParticipants] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [popularGroups, setPopularGroups] = useState([]);
  const [popularLoading, setPopularLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // New Group Form State
  const [newGroup, setNewGroup] = useState({
    title: '',
    bookTitle: '',
    participants: 4,
    description: ''
  });

  useEffect(() => {
    fetchSummary();
    fetchGroups();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) { console.error(e); }
  };

  const fetchGroups = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params.minParticipants !== undefined) queryParams.append('minParticipants', params.minParticipants);
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);

      const res = await fetch(`${API_BASE}/groups?${queryParams.toString()}`);
      const data = await res.json();
      setGroups(data.data || []);
      if (data.bugId) {
        // 백엔드 시스템 오류 알림 (배경 작업 중 발생)
        console.warn(`System Bug Detected: ${data.bugId}`);
        // 기존 생성 알림이 없을 때만 시스템 알림 표시
        setNotification(prev => prev && prev.type === 'success' ? prev : { type: 'warning', message: `시스템 데이터 오류 감지: ${data.bugId}` });
      }
    } catch (e) {
      setError('모임 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPopular = async () => {
    setPopularLoading(true);
    try {
      const res = await fetch(`${API_BASE}/groups/popular`);
      const data = await res.json();
      setPopularGroups(data.data || []);
      if (data.bugId) setNotification({ type: 'warning', message: `성능 저하 감지: ${data.bugId}` });
    } catch (e) {
      console.error(e);
    } finally {
      setPopularLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup)
      });
      const data = await res.json();
      setNotification({ type: 'success', message: `모임이 생성되었습니다! (감지된 버그: ${data.bugId || '없음'})` });
      setShowModal(false);
      fetchGroups();
      fetchSummary();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFilterApply = () => {
    fetchGroups({ minParticipants, status: statusFilter, search });
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <BookOpen size={28} />
          <span>북클럽 허브</span>
        </div>
        <div className="btn-group">
          <button className="btn" onClick={fetchPopular} data-bug-id="site026-bug04">
            <TrendingUp size={18} style={{ marginRight: '0.5rem' }} />
            인기 모임 조회
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} data-bug-id="site026-bug03">
            <Plus size={18} style={{ marginRight: '0.5rem' }} />
            모임 개설
          </button>
        </div>
      </header>

      {summary && (
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-label">전체 모임</div>
            <div className="stat-value">{summary.totalGroups}개</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">모집 중</div>
            <div className="stat-value" style={{ color: '#166534' }}>{summary.openGroups}개</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">평균 인원</div>
            <div className="stat-value">{summary.avgParticipants}명</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">시스템 상태</div>
            <div className="stat-value" style={{ color: '#f59e0b', fontSize: '1.1rem' }}>정상 가동 중</div>
          </div>
        </div>
      )}

      {popularGroups.length > 0 && (
        <div style={{ marginBottom: '3rem', background: '#fffbeb', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #fef3c7' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="#d97706" /> 실시간 인기 토론
          </h3>
          <div className="groups-grid">
            {popularGroups.map(g => (
              <div key={`popular-${g.id}`} className="group-card" style={{ boxShadow: 'none', border: '1px solid #fde68a' }}>
                <div className="card-header">
                  <strong>{g.title}</strong>
                </div>
                <div className="card-body">
                  <div className="book-tag">{g.bookTitle}</div>
                  <div style={{ fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>참여 {g.participants}명</span>
                    <span className="bug-badge">POPULAR-DATA</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="controls">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="제목 또는 도서명 검색..." 
              value={search}
              onChange={(e) => {
                const val = e.target.value;
                setSearch(val);
                fetchGroups({ minParticipants, status: statusFilter, search: val });
              }}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <select 
            className="btn" 
            value={statusFilter} 
            onChange={(e) => {
              const val = e.target.value;
              setStatusFilter(val);
              fetchGroups({ minParticipants, status: val, search });
            }}
          >
            <option value="all">전체 상태 (모집/마감)</option>
            <option value="open">모집 중</option>
            <option value="closed">모집 마감</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>최소 {minParticipants}명</span>
            <input 
              type="range" 
              min="0" max="15" 
              value={minParticipants} 
              onChange={(e) => setMinParticipants(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleFilterApply} data-bug-id="site026-bug01">
            필터 적용
          </button>
          <button className="btn" onClick={() => fetchGroups()} data-bug-id="site026-bug02">
            새로고침
          </button>
        </div>
      </section>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <Clock className="animate-spin" size={48} color="var(--primary)" />
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>데이터를 불러오는 중입니다...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '5rem', background: '#fee2e2', borderRadius: '1rem', color: '#991b1b' }}>
          <AlertCircle size={48} />
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>{error}</p>
        </div>
      ) : (
        <>
          {search && (
            <div style={{ marginBottom: '1.5rem', fontWeight: 600, color: 'var(--primary)' }}>
              <Search size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              '{search}' 검색 결과: {groups.length}건
            </div>
          )}
          <div className="groups-grid">
          {groups.map(group => (
            <div key={group.id} className="group-card">
              <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <h3 style={{ fontSize: '1.125rem' }}>{group.title}</h3>
                  <span className={`status-badge status-${group.status}`}>
                    {group.status === 'open' ? '모집 중' : '모집 마감'}
                  </span>
                </div>
              </div>
              <div className="card-body">
                {group.bookTitle ? (
                  <div className="book-tag">{group.bookTitle}</div>
                ) : (
                  <div style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                    * 도서 정보 없음 (Field Missing)
                  </div>
                )}
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', height: '3rem', overflow: 'hidden' }}>
                  {group.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Users size={16} />
                    <span>{group.participants}명 참여 중</span>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => alert(`[${group.title}] 모임 상세 정보를 불러옵니다.`)}
                  >
                    상세보기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={24} /> 새 모임 개설
            </h2>
            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label className="form-label">모임 제목</label>
                <input 
                  className="form-control" 
                  required 
                  value={newGroup.title}
                  onChange={e => setNewGroup({...newGroup, title: e.target.value})}
                  placeholder="예: 니체 철학 토론"
                />
              </div>
              <div className="form-group">
                <label className="form-label">대상 도서</label>
                <input 
                  className="form-control" 
                  required 
                  value={newGroup.bookTitle}
                  onChange={e => setNewGroup({...newGroup, bookTitle: e.target.value})}
                  placeholder="책 제목을 입력하세요"
                />
              </div>
              <div className="form-group">
                <label className="form-label">참여 인원</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="2" max="20"
                  value={newGroup.participants}
                  onChange={e => setNewGroup({...newGroup, participants: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">상세 설명</label>
                <textarea 
                  className="form-control" 
                  style={{ height: '100px' }}
                  value={newGroup.description}
                  onChange={e => setNewGroup({...newGroup, description: e.target.value})}
                ></textarea>
              </div>
              <div className="btn-group" style={{ justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>취소</button>
                <button type="submit" className="btn btn-primary">개설하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notification && (
        <div className="notification" style={{ background: notification.type === 'warning' ? '#f59e0b' : '#10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {notification.type === 'warning' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span>{notification.message}</span>
            <span style={{ cursor: 'pointer', marginLeft: '1rem', fontWeight: 'bold' }} onClick={() => setNotification(null)}>✕</span>
          </div>
        </div>
      )}
    </div>
  );
}


export default App;
