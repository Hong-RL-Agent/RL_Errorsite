import React, { useState, useEffect } from 'react';
import { Calendar, Search, User, MapPin, Star, Plus, Clock, ChevronRight, X } from 'lucide-react';

const App = () => {
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('doctors');
  const [draftNote, setDraftNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Bug 01 State: Tab Collision Simulation
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'healthcare_draft_note') {
        // INTENTIONAL GUI BUG: site017-bug01
        // CSV Error: 탭 간 데이터 충돌
        // Type: frontend-state-rendering
        // Description: 다른 탭에서 저장된 초안이 현재 탭의 입력을 강제로 덮어씌움 (정합성 파괴)
        setDraftNote(e.newValue || '');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDraftChange = (e) => {
    const val = e.target.value;
    setDraftNote(val);
    localStorage.setItem('healthcare_draft_note', val);
  };

  // Bug 02: Back-forward Cache Simulation
  useEffect(() => {
    const lastViewed = sessionStorage.getItem('last_viewed_doctor');
    if (lastViewed && activeTab === 'details') {
      // INTENTIONAL GUI BUG: site017-bug02
      // CSV Error: 백포워드 캐시 상태 박제
      // Type: frontend-state-rendering
      // Description: 뒤로가기 시 세션 스토리지의 오래된 데이터가 현재 뷰를 오염시켜 엉뚱한 의사 정보가 표시됨
      const cachedDoc = JSON.parse(lastViewed);
      setSelectedDoctor(cachedDoc);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async (nextPage = 0, query = searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/doctors?page=${nextPage}&limit=4&search=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      if (nextPage === 0) {
        setDoctors(result.data);
      } else {
        // INTENTIONAL GUI BUG: site017-bug03
        // CSV Error: 페이징 드리프트 및 리스트 중복
        // Type: frontend-state-rendering
        // Description: 페이지 이동 중 데이터 추가/삭제 혹은 오프셋 계산 오류로 인해 리스트 하단에 중복 항목 노출
        const duplicatedData = [...doctors, ...result.data.slice(-2)]; // 의도적으로 끝부분 중복 노출
        setDoctors(duplicatedData);
      }
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    const res = await fetch('/api/appointments');
    const data = await res.json();
    setAppointments(data);
  };

  const handleDoctorClick = (doc) => {
    setSelectedDoctor(doc);
    setActiveTab('details');
    sessionStorage.setItem('last_viewed_doctor', JSON.stringify(doc));
  };

  const handleBooking = async () => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          doctorName: selectedDoctor.name,
          note: draftNote
        })
      });
      if (res.ok) {
        alert('예약이 성공적으로 접수되었습니다!');
        setDraftNote('');
        localStorage.removeItem('healthcare_draft_note');
        fetchAppointments();
        setActiveTab('appointments');
      }
    } catch (e) {
      alert('예약 중 오류가 발생했습니다.');
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchDoctors(0, searchQuery);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <div className="logo" onClick={() => setActiveTab('doctors')} style={{cursor: 'pointer'}}>
            <Plus size={24} fill="currentColor" />
            <span>CareSync</span>
          </div>
          <nav className="nav">
            <a href="#" className={`nav-link ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>의사 찾기</a>
            <a href="#" className={`nav-link ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>내 예약</a>
          </nav>
          <div className="profile" onClick={() => alert('준비중입니다.')} style={{cursor: 'pointer'}}>
            <User size={24} />
          </div>
        </div>
      </header>

      <main>
        {activeTab === 'doctors' && (
          <>
            <section className="hero">
              <div className="container">
                <h1>당신에게 맞는 최고의 전문의를 찾아보세요</h1>
                <div className="search-bar">
                  <Search className="text-muted" size={20} />
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="증상, 전문분야, 병원 이름 검색" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button className="btn-primary" onClick={handleSearch}>검색하기</button>
                </div>
              </div>
            </section>

            <section className="container">
              <div className="section-title">
                <h2>전문의 리스트</h2>
                <span>총 {doctors.length}명</span>
              </div>
              
              <div className="doctor-grid" data-bug-id="site017-bug03">
                {doctors.map((doc, idx) => (
                  <div key={`${doc.id}-${idx}`} className="doctor-card" onClick={() => handleDoctorClick(doc)}>
                    <div className="doctor-info">
                      <img src={doc.image} alt={doc.name} className="doctor-image" />
                      <div className="doctor-details">
                        <div className="specialty">{doc.specialty}</div>
                        <h3>{doc.name} 의사</h3>
                        <div className="clinic">{doc.clinic}</div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                        <Star size={16} fill="#fbbf24" color="#fbbf24" />
                        <span style={{fontWeight: 600}}>{doc.rating}</span>
                      </div>
                      <button className="btn-primary" onClick={(e) => { e.stopPropagation(); alert('준비중입니다.'); }}>예약하기</button>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div style={{textAlign: 'center', padding: '2rem'}}>
                  <button 
                    className="btn-primary" 
                    style={{padding: '0.75rem 2rem', background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)'}}
                    onClick={() => fetchDoctors(page + 1)}
                    disabled={loading}
                  >
                    {loading ? '로딩 중...' : '더 많은 의사 보기'}
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'details' && selectedDoctor && (
          <section className="container" style={{padding: '4rem 0'}} data-bug-id="site017-bug02">
            <button onClick={() => setActiveTab('doctors')} style={{background: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', marginBottom: '2rem'}}>
              <ChevronRight size={20} style={{transform: 'rotate(180deg)'}} /> 뒤로 가기
            </button>
            <div className="doctor-detail-hero" style={{background: 'white', borderRadius: '24px', padding: '3rem', border: '1px solid var(--border)', display: 'flex', gap: '3rem'}}>
              <img src={selectedDoctor.image} alt={selectedDoctor.name} style={{width: '200px', height: '200px', borderRadius: '24px', objectFit: 'cover'}} />
              <div style={{flex: 1}}>
                <span className="specialty" style={{fontSize: '1.2rem'}}>{selectedDoctor.specialty}</span>
                <h1 style={{fontSize: '2.5rem', margin: '0.5rem 0'}}>{selectedDoctor.name} 전문의</h1>
                <p className="clinic" style={{fontSize: '1.1rem', marginBottom: '2rem'}}>{selectedDoctor.clinic}</p>
                
                <div style={{background: '#f1f5f9', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem'}} data-bug-id="site017-bug01">
                  <h4 style={{marginBottom: '0.5rem'}}>예약 전 전달사항 (초안)</h4>
                  <textarea 
                    style={{width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)'}}
                    placeholder="증상이나 궁금한 점을 미리 작성해주세요."
                    value={draftNote}
                    onChange={handleDraftChange}
                  />
                  <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>* 다른 브라우저 탭과 실시간으로 동기화됩니다.</p>
                </div>

                <button className="btn-primary" style={{padding: '1rem 3rem', fontSize: '1.1rem'}} onClick={handleBooking}>
                  지금 바로 예약하기
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'appointments' && (
          <section className="container" style={{padding: '4rem 0'}}>
            <h2 style={{marginBottom: '2rem'}}>내 예약 내역</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {appointments.map(app => (
                <div key={app.id} style={{background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                    <div style={{background: '#eff6ff', padding: '1rem', borderRadius: '12px', color: 'var(--primary)'}}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 style={{fontSize: '1.1rem'}}>{app.doctor} 전문의 진료</h3>
                      <p className="text-muted" style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: app.note ? '0.5rem' : '0'}}>
                        <Clock size={14} /> {app.date} {app.time}
                      </p>
                      {app.note && (
                        <p style={{fontSize: '0.875rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '4px'}}>
                          <strong>전달사항:</strong> {app.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{background: app.status === '확정' ? '#ecfdf5' : '#fffbeb', color: app.status === '확정' ? '#059669' : '#d97706', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 600, fontSize: '0.875rem', alignSelf: 'flex-start'}}>
                    {app.status}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer style={{marginTop: '4rem', padding: '4rem 0', background: '#0f172a', color: 'white'}}>
        <div className="container" style={{display: 'flex', justifyContent: 'space-between'}}>
          <div>
            <div className="logo" style={{color: 'white', marginBottom: '1rem'}}>
              <Plus size={24} fill="currentColor" />
              <span>CareSync</span>
            </div>
            <p style={{color: '#94a3b8', maxWidth: '300px'}}>언제 어디서나 간편하게 만나는 프리미엄 의료 서비스</p>
          </div>
          <div style={{display: 'flex', gap: '4rem'}}>
            <div>
              <h4 style={{marginBottom: '1rem'}}>서비스</h4>
              <ul style={{listStyle: 'none', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <li style={{cursor: 'pointer'}} onClick={() => alert('준비중입니다.')}>의사 찾기</li>
                <li style={{cursor: 'pointer'}} onClick={() => alert('준비중입니다.')}>원격 진료</li>
                <li style={{cursor: 'pointer'}} onClick={() => alert('준비중입니다.')}>건강 검진</li>
              </ul>
            </div>
            <div>
              <h4 style={{marginBottom: '1rem'}}>고객 지원</h4>
              <ul style={{listStyle: 'none', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <li style={{cursor: 'pointer'}} onClick={() => alert('준비중입니다.')}>자주 묻는 질문</li>
                <li style={{cursor: 'pointer'}} onClick={() => alert('준비중입니다.')}>공지사항</li>
                <li style={{cursor: 'pointer'}} onClick={() => alert('준비중입니다.')}>문의하기</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
