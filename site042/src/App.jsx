import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  ClipboardList, 
  FileCheck, 
  UserCircle,
  Filter,
  AlertCircle,
  CheckCircle2,
  X,
  History,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [policies, setPolicies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeBug, setActiveBug] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterAge, setFilterAge] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) {}
  };

  const fetchPolicies = async (age = '') => {
    setIsLoading(true);
    setActiveBug(null);
    try {
      const url = age ? `${API_BASE}/policies?age=${age}` : `${API_BASE}/policies`;
      const res = await fetch(url);
      const data = await res.json();
      setPolicies(data.data);
      if (data.bugId) setActiveBug({ id: data.bugId, type: '공유 상태 오염 (Shared State Mutation)', desc: '원본 정책 데이터가 필터링에 의해 조작되었습니다.' });
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/applications`);
      const data = await res.json();
      setApplications(data.data);
      if (data.bugId) setActiveBug({ id: data.bugId, type: '쓰기 후 읽기 불일치 (Stale Read)', desc: '방금 신청한 데이터가 아직 목록에 나타나지 않습니다.' });
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (policyId) => {
    setActiveBug(null);
    try {
      // site042-bug01: Race condition trigger
      // Send multiple requests quickly if triggered
      const res = await fetch(`${API_BASE}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, policyId })
      });
      const data = await res.json();
      if (data.applied) {
        if (data.bugId) setActiveBug({ id: data.bugId, type: '경쟁 조건 (Race Condition)', desc: '중복 신청 방지 로직이 비동기 타이밍 문제로 우회되었습니다.' });
        fetchSummary();
        alert("신청 요청이 전송되었습니다.");
      }
    } catch (e) {}
  };

  const handleDoubleApply = async (policyId) => {
    // Manually trigger simultaneous requests for site042-bug01
    Promise.all([
      handleApply(policyId),
      handleApply(policyId)
    ]);
  };

  const updateAppStatus = async (appId, status) => {
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/applications/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId, status })
      });
      const data = await res.json();
      if (data.updated && data.bugId) {
        setActiveBug({ id: data.bugId, type: '비동기 처리 순서 오류 (Async Ordering)', desc: '상태 업데이트 요청이 보낸 순서와 다르게 처리될 수 있습니다.' });
      }
    } catch (e) {}
  };

  const handleTriggerOrderingBug = async (appId) => {
    // Send "approved" then "reviewing" very quickly
    // Backend "approved" is slower (2s) than "reviewing" (0.5s)
    updateAppStatus(appId, "승인");
    setTimeout(() => updateAppStatus(appId, "심사중"), 100);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Building2 size={32} />
          <span>청년정책플랫폼</span>
        </div>
        
        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={20} /> 대시보드
            </li>
            <li className={`nav-item ${activeTab === 'policies' ? 'active' : ''}`} onClick={() => { setActiveTab('policies'); fetchPolicies(); }}>
              <ClipboardList size={20} /> 정책 목록
            </li>
            <li className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => { setActiveTab('applications'); fetchApplications(); }}>
              <FileCheck size={20} /> 신청 현황
            </li>
            <li className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <UserCircle size={20} /> 마이페이지
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {activeTab === 'dashboard' && "대시보드"}
            {activeTab === 'policies' && "지원 정책 찾기"}
            {activeTab === 'applications' && "내 신청 내역"}
            {activeTab === 'profile' && "사용자 프로필"}
          </h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>접속 세션: User_001</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCircle size={24} color="#aaa" />
            </div>
          </div>
        </header>

        <AnimatePresence>
          {activeBug && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="banner">
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <AlertCircle size={24} color="#dc3545" />
                  <div>
                     <strong style={{ display: 'block', color: '#dc3545' }}>{activeBug.type} : {activeBug.id}</strong>
                     <span style={{ fontSize: '0.85rem' }}>{activeBug.desc}</span>
                  </div>
                  <span className="bug-tag">{activeBug.id}</span>
               </div>
               <X size={20} style={{ cursor: 'pointer' }} onClick={() => setActiveBug(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'dashboard' && (
          <div className="fade-in">
             <div className="stats-grid">
                <div className="stat-item">
                   <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>총 정책 수</div>
                   <div className="stat-value">{summary?.totalPolicies}개</div>
                </div>
                <div className="stat-item">
                   <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>내 신청 건수</div>
                   <div className="stat-value">{summary?.applications}건</div>
                </div>
                <div className="stat-item">
                   <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>금일 처리 현황</div>
                   <div className="stat-value">{summary?.processedToday}건</div>
                </div>
             </div>

             <div className="card" style={{ background: 'var(--primary-blue)', color: 'white' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>청년들의 꿈을 응원합니다.</h3>
                <p style={{ opacity: 0.9, marginBottom: '2rem' }}>다양한 정부 지원금을 한 곳에서 확인하고 간편하게 신청하세요.</p>
                <button className="btn" style={{ background: 'white', color: 'var(--primary-blue)' }} onClick={() => setActiveTab('policies')}>정책 보러가기</button>
             </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="fade-in">
             <div className="card" style={{ marginBottom: '2.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <Filter size={20} color="var(--primary-blue)" />
                <span style={{ fontWeight: 700 }}>조건 필터</span>
                <input 
                  type="number" 
                  placeholder="연령 (예: 25)" 
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #ddd' }}
                  value={filterAge}
                  onChange={(e) => setFilterAge(e.target.value)}
                />
                <button className="btn btn-primary" onClick={() => fetchPolicies(filterAge)} data-bug-id="site042-bug03">검색</button>
                <button className="btn btn-outline" onClick={() => { setFilterAge(''); fetchPolicies(''); }}>초기화</button>
             </div>

             <div className="card-grid">
                {policies.map(p => (
                  <div key={p.id} className="card">
                     <span className={`status-badge ${p.status === 'open' ? 'status-open' : (p.status === 'closed' ? 'status-closed' : 'status-pending')}`}>
                        {p.status === 'open' ? '신청가능' : (p.status === 'closed' ? '접수마감' : '확인필요')}
                     </span>
                     <h4 style={{ fontSize: '1.2rem', marginBottom: '0.8rem' }}>{p.name}</h4>
                     <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>대상: 만 {p.ageLimit}세 이하 • 지원내용: {p.amount}</p>
                     <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ flex: 1, opacity: p.status === 'closed' ? 0.5 : 1 }} 
                          onClick={() => handleApply(p.id)}
                          disabled={p.status === 'closed'}
                        >
                          {p.status === 'closed' ? '접수마감' : '신청하기'}
                        </button>
                        <button 
                          className="btn btn-outline" 
                          style={{ flex: 1, opacity: p.status === 'closed' ? 0.5 : 1 }} 
                          onClick={() => handleDoubleApply(p.id)} 
                          data-bug-id="site042-bug01"
                          disabled={p.status === 'closed'}
                        >
                          중복 신청 테스트
                        </button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="fade-in">
             <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <History size={20} /> 내 신청 이력
                </h3>
                <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={fetchApplications} data-bug-id="site042-bug02">목록 갱신</button>
             </div>

             <table className="data-table">
                <thead>
                   <tr>
                      <th>신청 번호</th>
                      <th>정책 명</th>
                      <th>신청 일자</th>
                      <th>현재 상태</th>
                      <th>상태 관리</th>
                   </tr>
                </thead>
                <tbody>
                   {applications.map(app => (
                     <tr key={app.id}>
                        <td style={{ fontWeight: 700 }}>#{app.id}</td>
                        <td>{policies.find(p => p.id === app.policyId)?.name || '알 수 없는 정책'}</td>
                        <td style={{ fontSize: '0.85rem', color: '#888' }}>{new Date(app.appliedAt).toLocaleString()}</td>
                        <td>
                           <span className={`status-badge ${app.status === '승인' ? 'status-open' : 'status-pending'}`}>
                              {app.status}
                           </span>
                        </td>
                        <td>
                           <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                            onClick={() => handleTriggerOrderingBug(app.id)}
                            data-bug-id="site042-bug04"
                           >
                              상태 변경 (테스트)
                           </button>
                        </td>
                     </tr>
                   ))}
                   {applications.length === 0 && (
                     <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
                           <Info size={32} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                           <p>신청 내역이 없습니다.</p>
                        </td>
                     </tr>
                   )}
                </tbody>
             </table>

             <div className="card" style={{ marginTop: '2rem', background: '#fff9e6', border: '1px solid #ffeeba' }}>
                <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#856404' }}>
                   <Clock size={16} /> 비동기 처리 안내
                </h5>
                <p style={{ fontSize: '0.85rem', color: '#856404', marginTop: '0.5rem' }}>
                   신청 데이터는 시스템 반영까지 최대 1~2초가 소요될 수 있습니다. 목록에 나타나지 않을 경우 잠시 후 '목록 갱신'을 눌러주세요.
                </p>
             </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="fade-in card" style={{ textAlign: 'center', padding: '5rem' }}>
             <UserCircle size={80} color="var(--primary-blue)" style={{ margin: '0 auto 2rem' }} />
             <h3>User_001 님, 안녕하세요.</h3>
             <p style={{ color: '#888', marginTop: '1rem' }}>회원 정보 및 자격 요건을 관리할 수 있습니다.</p>
             <hr style={{ margin: '2rem 0', opacity: 0.1 }} />
             <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                <div className="stat-item">
                   <div style={{ fontSize: '0.8rem', color: '#888' }}>가입일</div>
                   <strong>2026.01.15</strong>
                </div>
                <div className="stat-item">
                   <div style={{ fontSize: '0.8rem', color: '#888' }}>인증 상태</div>
                   <strong style={{ color: 'var(--status-open)' }}>인증 완료</strong>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
