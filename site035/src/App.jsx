import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  List, 
  RotateCcw, 
  Webhook, 
  Plus, 
  Search, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  History,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [words, setWords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeBug, setActiveBug] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [newWord, setNewWord] = useState({ word: '', definition: '', category: 'Noun' });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchSummary();
    fetchWords();
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (e) { addLog("대시보드 데이터 수신 실패"); }
  };

  const fetchWords = async (suppressBug = false) => {
    setLoading(true);
    if (!suppressBug) setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/words`);
      const data = await res.json();
      setWords(data.data);
      if (data.bugId && !suppressBug) setActiveBug(data);
      addLog("단어 목록 로드 완료 (순서 확인 필요)");
    } catch (e) { addLog("단어 목록 조회 실패"); }
    finally { setLoading(false); }
  };

  const fetchWordDetail = async (id) => {
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/words/${id}`);
      const data = await res.json();
      setSelectedWord(data);
      if (data.bugId) setActiveBug(data);
      addLog(`단어 상세 정보 수신: ${data.word}`);
    } catch (e) { addLog("상세 정보 조회 실패"); }
  };

  const handleAddWord = async () => {
    if (!newWord.word) return;
    try {
      const res = await fetch(`${API_BASE}/words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWord)
      });
      const data = await res.json();
      addLog(`단어 추가됨: ${newWord.word} (웹훅 상태: ${data.webhookSent ? '성공' : '실패'})`);
      
      // Bug 02: Atomicity Violation (Partial Success)
      if (!data.webhookSent) {
        setActiveBug({
           bugId: "site035-bug02",
           type: "atomicity-violation",
           message: "데이터는 저장되었으나 동기화 웹훅 전송에 실패했습니다 (원자성 결함)."
        });
      }

      setShowAddModal(false);
      setNewWord({ word: '', definition: '', category: 'Noun' });
      fetchWords(true); // Suppress Bug 01 overwriting Bug 02
      fetchSummary();
    } catch (e) { addLog("단어 추가 중 서버 오류"); }
  };

  const sendWebhook = async (wordId) => {
    setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/webhook/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId })
      });
      const data = await res.json();
      addLog("매뉴얼 웹훅 전송 이벤트 발생");
      
      // Bug 03: Webhook Payload Change
      if (data.bugId === "site035-bug03") {
         setActiveBug(data);
         alert(`웹훅 페일로드 변조 탐지!\n기대: word\n실제: term ("${data.term}")`);
      }
      
      fetchWebhookLogs(true); // Suppress Bug 04 overwriting Bug 03
    } catch (e) { addLog("웹훅 전송 실패"); }
  };

  const fetchWebhookLogs = async (suppressBug = false) => {
    if (!suppressBug) setActiveBug(null);
    try {
      const res = await fetch(`${API_BASE}/webhook/logs`);
      const data = await res.json();
      setWebhookLogs(data.logs);
      if (data.bugId && !suppressBug) setActiveBug(data);
      addLog("웹훅 로그 동기화 완료");
    } catch (e) { addLog("로그 조회 실패"); }
  };

  const deleteWord = async (id) => {
    try {
      await fetch(`${API_BASE}/words/${id}`, { method: 'DELETE' });
      addLog("단어가 삭제되었습니다.");
      fetchWords();
      fetchSummary();
    } catch (e) { addLog("삭제 실패"); }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <BookOpen size={32} />
          <span>VOCA MASTER</span>
        </div>
        
        <nav>
          <ul className="nav-menu">
            <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={20} /> 대시보드
            </li>
            <li className={`nav-item ${activeTab === 'words' ? 'active' : ''}`} onClick={() => setActiveTab('words')}>
              <List size={20} /> 단어장
            </li>
            <li className={`nav-item ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>
              <RotateCcw size={20} /> 복습 모드
            </li>
            <li className={`nav-item ${activeTab === 'webhooks' ? 'active' : ''}`} onClick={() => {setActiveTab('webhooks'); fetchWebhookLogs();}}>
              <Webhook size={20} /> 웹훅 로그
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
           <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem' }}>Study Progress</div>
           <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: '40%', height: '100%', background: 'var(--primary-blue)' }}></div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-dark)' }}>학습 대시보드</div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
             <Plus size={20} style={{ marginRight: '0.5rem' }} /> 단어 추가
          </button>
        </header>

        {activeBug && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bug-banner">
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <AlertCircle size={20} color="#ef4444" />
                <div>
                   <strong>{activeBug.message ? activeBug.message : `오류 탐지: ${activeBug.type}`}</strong>
                </div>
                <span className="bug-id-tag">{activeBug.bugId}</span>
             </div>
             <X size={18} style={{ cursor: 'pointer' }} onClick={() => setActiveBug(null)} />
          </motion.div>
        )}

        {activeTab === 'dashboard' && (
          <div className="fade-in">
             <div className="stats-grid">
                <div className="stat-card">
                   <h4>전체 단어</h4>
                   <div className="value">{summary?.totalWords}개</div>
                </div>
                <div className="stat-card">
                   <h4>암기 완료</h4>
                   <div className="value">{summary?.memorized}개</div>
                </div>
                <div className="stat-card">
                   <h4>남은 학습량</h4>
                   <div className="value">{(summary?.totalWords - summary?.memorized) || 0}개</div>
                </div>
             </div>

             <div className="log-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'white' }}>
                   <History size={18} /> <strong>학습 이벤트 로그</strong>
                </div>
                {logs.map((log, i) => <div key={i} className="log-entry">{log}</div>)}
                {logs.length === 0 && <div style={{ opacity: 0.5 }}>기록된 활동이 없습니다.</div>}
             </div>
          </div>
        )}

        {activeTab === 'words' && (
          <div className="fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3>나의 단어장</h3>
                <button className="btn btn-outline" onClick={fetchWords} data-bug-id="site035-bug01">목록 새로고침</button>
             </div>
             <div className="word-grid">
                {words.map(w => (
                  <div key={w.id} className="word-card" onClick={() => fetchWordDetail(w.id)} data-bug-id="site035-bug05">
                     <span className={`badge ${w.memorized ? 'badge-memorized' : 'badge-review'}`} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                        {w.memorized ? '암기완료' : '복습필요'}
                     </span>
                     <h3>{w.word}</h3>
                     <p className="word-def">{w.definition || "상세 정보 로드 중..."}</p>
                     <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem' }} onClick={(e) => { e.stopPropagation(); deleteWord(w.id); }}><Trash2 size={14} /></button>
                        <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem' }} onClick={(e) => { e.stopPropagation(); sendWebhook(w.id); }} data-bug-id="site035-bug03"><Webhook size={14} /></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '4rem' }}>
             <RotateCcw size={48} color="var(--primary-blue)" style={{ marginBottom: '1.5rem' }} />
             <h3>복습 모드 준비 중</h3>
             <p style={{ color: 'var(--text-muted)' }}>알고리즘 기반 맞춤형 복습 기능을 개발 중입니다.</p>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3>웹훅 이벤트 기록</h3>
                <button className="btn btn-outline" onClick={fetchWebhookLogs} data-bug-id="site035-bug04">로그 새로고침</button>
             </div>
             <table className="data-table">
                <thead>
                   <tr>
                      <th>Event ID</th>
                      <th>Type</th>
                      <th>Payload Sample</th>
                      <th>Status</th>
                      <th>Timestamp</th>
                   </tr>
                </thead>
                <tbody>
                   {webhookLogs.map(log => (
                      <tr key={log.id}>
                         <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{log.id}</td>
                         <td style={{ fontWeight: 700 }}>{log.event}</td>
                         <td>
                            <div style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '4px' }}>
                               {JSON.stringify(log.payload)}
                            </div>
                         </td>
                         <td><span className="badge badge-memorized">{log.status}</span></td>
                         <td style={{ fontSize: '0.8rem' }}>{log.timestamp}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-content" onClick={e => e.stopPropagation()}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <h2>새 단어 추가</h2>
                  <X style={{ cursor: 'pointer' }} onClick={() => setShowAddModal(false)} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>English Word</label>
                    <input className="btn btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text' }} type="text" placeholder="예: persist" value={newWord.word} onChange={e => setNewWord({...newWord, word: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Definition</label>
                    <input className="btn btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text' }} type="text" placeholder="예: 끈기 있게 지속하다" value={newWord.definition} onChange={e => setNewWord({...newWord, definition: e.target.value})} />
                  </div>
                  <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleAddWord} data-bug-id="site035-bug02">저장 및 웹훅 전송</button>
               </div>
            </motion.div>
          </div>
        )}

        {selectedWord && (
          <div className="modal-overlay" onClick={() => setSelectedWord(null)}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-content" onClick={e => e.stopPropagation()}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <span className="badge badge-memorized">Vocabulary Detail</span>
                  <X style={{ cursor: 'pointer' }} onClick={() => setSelectedWord(null)} />
               </div>
               <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary-blue)', marginBottom: '1rem', fontFamily: 'Outfit' }}>
                  {selectedWord.word}
               </h1>
               <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                     <Info size={16} /> <span>데이터 직렬화 검증 필요</span>
                  </div>
                  <p style={{ marginTop: '1rem', fontWeight: 500 }}>{selectedWord.definition || "직렬화 오류로 인해 데이터가 누락되었습니다."}</p>
               </div>
               <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setSelectedWord(null)}>닫기</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
