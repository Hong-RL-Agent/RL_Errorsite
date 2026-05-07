import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Timer, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search, 
  History, 
  Settings,
  ArrowLeft,
  Award,
  BarChart3,
  FileText,
  MousePointer2,
  ListChecks,
  RefreshCw
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState('dashboard'); // dashboard, quizzes, exam, results, review
  const [quizzes, setQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [review, setReview] = useState(null);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [bug, setBug] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchQuizzes();
    fetchSummary();
  }, []);

  const fetchQuizzes = async () => {
    const res = await fetch(`/api/quizzes?search=${searchTerm}`);
    const json = await res.json();
    setQuizzes(json.data);
  };

  const fetchSummary = async () => {
    const res = await fetch('/api/dashboard/summary');
    setSummary(await res.json());
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const startQuiz = async (id, triggerBug = false) => {
    const res = await fetch(`/api/quiz/start?quizId=${id}&triggerBug=${triggerBug}`);
    const json = await res.json();
    setActiveQuiz(quizzes.find(q => q.id === id));
    setQuestions(json.questions);
    setAnswers({});
    setCurrentQIdx(0);
    setView('exam');
    if (json.bugId) {
      setBug({ id: json.bugId });
      window.alert(`[순서 오류] ${json.bugId}: 문항이 랜덤 셔플되었으나 채점 기준은 고정되어 점수 오차가 발생할 수 있습니다.`);
    } else {
      setBug(null);
    }
  };

  const submitQuiz = async (triggerBug2 = false, triggerBug4 = false) => {
    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        quizId: activeQuiz.id, 
        answers, 
        triggerBug: (triggerBug2 || triggerBug4).toString() 
      })
    });
    const json = await res.json();
    setResult(json);
    setView('results');
    
    if (json.bugId === 'site068-bug02') {
      setBug({ id: json.bugId });
      window.alert(`[누락 오류] ${json.bugId}: 채점 과정에서 일부 문항의 점수가 누산되지 않았습니다.`);
    } else if (json.bugId === 'site068-bug04') {
      setBug({ id: json.bugId });
      window.alert(`[상태 오류] ${json.bugId}: 답안이 제출되었으나 시스템 상태는 '미제출'로 역전되었습니다.`);
    } else {
      setBug(null);
      showToast("퀴즈가 성공적으로 제출되었습니다.");
    }
  };

  const fetchReview = async (triggerBug = false) => {
    const res = await fetch(`/api/quiz/review?triggerBug=${triggerBug}`);
    const json = await res.json();
    setReview(json.details);
    setView('review');
    if (json.bugId) {
      setBug({ id: json.bugId });
      window.alert(`[부분 채점 오류] ${json.bugId}: 복수 선택 문제의 부분 점수 로직이 무시되었습니다.`);
    } else {
      setBug(null);
    }
  };

  const fetchLogs = async () => {
    const res = await fetch('/api/logs');
    const json = await res.json();
    setLogs(json.data);
  };

  const toggleOption = (qId, opt, isMultiple) => {
    const current = answers[qId];
    if (isMultiple) {
      const arr = Array.isArray(current) ? current : [];
      if (arr.includes(opt)) setAnswers({ ...answers, [qId]: arr.filter(o => o !== opt) });
      else setAnswers({ ...answers, [qId]: [...arr, opt] });
    } else {
      setAnswers({ ...answers, [qId]: opt });
    }
  };

  return (
    <div className="quiz-app">
      {toast && <div className="toast" style={{position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', background:'var(--primary)', color:'#fff', padding:'12px 24px', borderRadius:'30px', zIndex:3000, boxShadow:'var(--shadow)'}}>{toast}</div>}

      {/* Side Nav */}
      <nav className="side-nav">
        <div className="brand">
          <GraduationCap size={32} />
          <span>Quiz<strong>Master</strong></span>
        </div>
        <ul className="nav-links">
          <li className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <LayoutDashboard size={20} /> 대시보드
          </li>
          <li className={`nav-item ${view === 'quizzes' ? 'active' : ''}`} onClick={() => setView('quizzes')}>
            <BookOpen size={20} /> 퀴즈 목록
          </li>
          <li className={`nav-item ${view === 'logs' ? 'active' : ''}`} onClick={() => { setView('logs'); fetchLogs(); }}>
            <History size={20} /> 시스템 로그
          </li>
          <li className="nav-item" onClick={() => showToast("준비 중인 기능입니다.")}>
            <Settings size={20} /> 설정
          </li>
        </ul>
      </nav>

      {/* Main Area */}
      <main className="main-area">
        
        {view === 'dashboard' && (
          <div className="fade-in">
            <h2 style={{fontSize:'2rem', marginBottom:'32px'}}>학습 요약</h2>
            <div className="card-grid">
               <div className="stat-card">
                  <span style={{color:'var(--text-muted)', fontSize:'0.875rem'}}>총 응시 횟수</span>
                  <div style={{fontSize:'2.5rem', fontWeight:'900', marginTop:'8px'}}>{summary?.totalAttempts}회</div>
               </div>
               <div className="stat-card">
                  <span style={{color:'var(--text-muted)', fontSize:'0.875rem'}}>평균 점수</span>
                  <div style={{fontSize:'2.5rem', fontWeight:'900', marginTop:'8px', color:'var(--primary)'}}>{summary?.avgScore}점</div>
               </div>
               <div className="stat-card">
                  <span style={{color:'var(--text-muted)', fontSize:'0.875rem'}}>완료율</span>
                  <div style={{fontSize:'2.5rem', fontWeight:'900', marginTop:'8px', color:'var(--secondary)'}}>{summary?.completionRate}</div>
               </div>
            </div>
            <div className="stat-card" style={{marginTop:'32px'}}>
               <h3>최근 추천 퀴즈</h3>
               <div style={{marginTop:'20px', display:'flex', gap:'16px'}}>
                  {quizzes.slice(0, 2).map(q => (
                    <div key={q.id} style={{padding:'20px', background:'#f8fafc', borderRadius:'16px', flex:1, border:'1px solid var(--border)'}}>
                       <h4>{q.title}</h4>
                       <p style={{fontSize:'0.875rem', color:'var(--text-muted)', marginTop:'4px'}}>{q.category} • {q.duration}분</p>
                       <button className="btn-primary" style={{marginTop:'16px', padding:'10px 20px', fontSize:'0.875rem'}} onClick={() => setView('quizzes')}>바로가기</button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {view === 'quizzes' && (
          <div className="fade-in">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px'}}>
              <h2 style={{fontSize:'2rem'}}>퀴즈 라이브러리</h2>
              <div style={{position:'relative'}}>
                 <Search size={18} style={{position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)'}} />
                 <input 
                  type="text" 
                  placeholder="퀴즈 검색..." 
                  style={{padding:'12px 16px 12px 48px', borderRadius:'12px', border:'1px solid var(--border)', width:'300px'}}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && fetchQuizzes()}
                 />
              </div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
               {quizzes.map(q => (
                 <div key={q.id} style={{background:'#fff', padding:'24px', borderRadius:'20px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'var(--shadow)'}}>
                    <div>
                       <h4 style={{fontSize:'1.25rem'}}>{q.title}</h4>
                       <span style={{fontSize:'0.875rem', color:'var(--text-muted)'}}>{q.category} | {q.totalQuestions}문항 | {q.duration}분</span>
                    </div>
                    <div style={{display:'flex', gap:'12px'}}>
                       <button className="btn-primary" onClick={() => startQuiz(q.id, false)}>일반 모드</button>
                       <button className="btn-secondary" onClick={() => startQuiz(q.id, true)} data-bug-id="site068-bug01">스마트 모드 (셔플)</button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {view === 'exam' && (
          <div className="exam-view fade-in">
             <div className="q-list-panel">
                <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px', color:'var(--text-muted)'}}>
                   <Timer size={18} /> 09:42 남음
                </div>
                {questions.map((_, i) => (
                  <div 
                    key={i} 
                    className={`q-indicator ${currentQIdx === i ? 'active' : ''} ${answers[questions[i].id] ? 'answered' : ''}`}
                    onClick={() => setCurrentQIdx(i)}
                  >
                     <span>Question {i + 1}</span>
                     {answers[questions[i].id] && <CheckCircle size={16} color="var(--primary)" />}
                  </div>
                ))}
                <div style={{marginTop:'auto', padding:'16px', background:'#fef3c7', borderRadius:'12px', border:'1px solid #fde68a'}}>
                   <p style={{fontSize:'0.75rem', fontWeight:'600', color:'#92400e'}}>주의: 스마트 모드에서는 문항 순서가 실시간으로 재배치될 수 있습니다.</p>
                </div>
             </div>

             <div className="q-detail-panel">
                <div style={{marginBottom:'32px'}}>
                   <span style={{fontSize:'0.875rem', color:'var(--primary)', fontWeight:'700'}}>QUESTION {currentQIdx + 1} OF {questions.length}</span>
                   <h2 style={{fontSize:'1.5rem', marginTop:'12px'}}>{questions[currentQIdx].text}</h2>
                </div>
                <div className="options-grid">
                   {questions[currentQIdx].options.map(opt => (
                     <div 
                      key={opt} 
                      className={`option-card ${
                        questions[currentQIdx].isMultiple 
                          ? (answers[questions[currentQIdx].id]?.includes(opt) ? 'selected' : '')
                          : (answers[questions[currentQIdx].id] === opt ? 'selected' : '')
                      }`}
                      onClick={() => toggleOption(questions[currentQIdx].id, opt, questions[currentQIdx].isMultiple)}
                     >
                        <div style={{
                          width:'20px', height:'20px', borderRadius: questions[currentQIdx].isMultiple ? '4px' : '50%',
                          border:'2px solid', borderColor: 'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center'
                        }}>
                           {(questions[currentQIdx].isMultiple ? answers[questions[currentQIdx].id]?.includes(opt) : answers[questions[currentQIdx].id] === opt) && (
                             <div style={{width:'10px', height:'10px', background:'var(--primary)', borderRadius: questions[currentQIdx].isMultiple ? '2px' : '50%'}}></div>
                           )}
                        </div>
                        {opt}
                     </div>
                   ))}
                </div>
                <div style={{marginTop:'auto', display:'flex', justifyContent:'space-between'}}>
                   <button className="btn-primary" style={{background:'#f1f5f9', color:'var(--text-main)'}} onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))}>이전 문제</button>
                   {currentQIdx < questions.length - 1 ? (
                     <button className="btn-primary" onClick={() => setCurrentQIdx(currentQIdx + 1)}>다음 문제</button>
                   ) : (
                     <div style={{display:'flex', gap:'12px'}}>
                        <button className="btn-primary" onClick={() => submitQuiz(true, false)} data-bug-id="site068-bug02">제출 (Legacy)</button>
                        <button className="btn-secondary" onClick={() => submitQuiz(false, true)} data-bug-id="site068-bug04">제출 (Quick)</button>
                     </div>
                   )}
                </div>
             </div>
             <div className="progress-container">
                <div className="progress-fill" style={{width: `${(Object.keys(answers).length / questions.length) * 100}%`}}></div>
             </div>
          </div>
        )}

        {view === 'results' && (
          <div className="fade-in" style={{maxWidth:'800px', margin:'0 auto', textAlign:'center'}}>
             <Award size={80} color="var(--secondary)" style={{marginBottom:'24px'}} />
             <h2 style={{fontSize:'2.5rem'}}>퀴즈 완료!</h2>
             <p style={{color:'var(--text-muted)', marginBottom:'40px'}}>수고하셨습니다. 당신의 점수는 다음과 같습니다.</p>
             
             <div className="card-grid">
                <div className="stat-card">
                   <span style={{fontSize:'0.875rem', color:'var(--text-muted)'}}>최종 점수</span>
                   <div style={{fontSize:'3rem', fontWeight:'900', color: result?.score >= 60 ? 'var(--primary)' : '#ef4444'}}>{result?.score} / 100</div>
                </div>
                <div className="stat-card">
                   <span style={{fontSize:'0.875rem', color:'var(--text-muted)'}}>제출 상태</span>
                   <div style={{fontSize:'1.5rem', fontWeight:'700', marginTop:'12px', color: result?.submitted ? '#10b981' : '#ef4444'}}>
                      {result?.submitted ? 'SUBMITTED' : 'NOT SUBMITTED'}
                   </div>
                </div>
             </div>

             <div style={{marginTop:'48px', display:'flex', gap:'16px', justifyContent:'center'}}>
                <button className="btn-primary" onClick={() => setView('quizzes')}>다른 퀴즈 풀기</button>
                <button className="btn-secondary" onClick={() => fetchReview(true)} data-bug-id="site068-bug03">상세 리뷰 보기</button>
             </div>
          </div>
        )}

        {view === 'review' && (
          <div className="fade-in">
             <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'32px'}}>
                <ArrowLeft size={24} className="clickable" onClick={() => setView('results')} />
                <h2 style={{fontSize:'2rem'}}>문항별 상세 분석</h2>
             </div>
             <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                {review.map((d, i) => (
                  <div key={i} style={{background:'#fff', padding:'24px', borderRadius:'20px', display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft:`6px solid ${d.correct ? '#10b981' : '#ef4444'}`}}>
                     <div>
                        <h4 style={{fontSize:'1.125rem'}}>{d.text}</h4>
                        <p style={{fontSize:'0.875rem', color:'var(--text-muted)', marginTop: '4px'}}>배점: {d.earnedScore}점</p>
                     </div>
                     {d.correct ? <CheckCircle color="#10b981" /> : <XCircle color="#ef4444" />}
                  </div>
                ))}
             </div>
          </div>
        )}

        {view === 'logs' && (
          <div className="fade-in">
             <h2 style={{fontSize:'2rem', marginBottom:'32px'}}>시스템 로직 로그</h2>
             <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                {logs.map((l, i) => (
                  <div key={i} style={{padding:'20px', background:'#fff', borderRadius:'16px', borderLeft:'4px solid #1e293b', boxShadow:'var(--shadow)'}}>
                     <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>[{new Date(l.time).toLocaleTimeString()}]</span>
                     <p style={{marginTop:'4px', fontWeight:'500'}}>{l.msg}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

      </main>

      {/* PPO Monitor */}
      <div className="ppo-monitor">
         <div style={{borderBottom:'1px solid #334155', paddingBottom:'8px', marginBottom:'12px', color:'#94a3b8', fontSize:'0.7rem', fontWeight:'800'}}>PPO-QUIZ-MONITOR</div>
         <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>ACTIVE_BUG</span><span style={{color: bug ? '#ef4444' : '#10b981'}}>{bug ? 'YES' : 'NO'}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>BUG_ID</span><span>{bug ? bug.id : 'NONE'}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>PORT</span><span>9177</span></div>
         </div>
      </div>
    </div>
  );
};

export default App;
