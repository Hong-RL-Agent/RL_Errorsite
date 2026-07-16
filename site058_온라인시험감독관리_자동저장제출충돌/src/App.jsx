import React, { useState, useEffect } from 'react';

export default function App() {
  const [currentUser, setCurrentUser] = useState('학생 A');
  
  // Database states
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [submissionsHistory, setSubmissionsHistory] = useState([]);
  const [proctorLogs, setProctorLogs] = useState([]);
  
  // Navigation & editors
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [examStatus, setExamStatus] = useState('ONGOING'); // ONGOING | SUBMITTED
  const [submissionTime, setSubmissionTime] = useState(null);

  // Filters
  const [filterUnanswered, setFilterUnanswered] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Session & Proctoring caches (Error 4 Target)
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [cachedWarningCount, setCachedWarningCount] = useState(5);

  // Professor inputs
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionKeyword, setNewQuestionKeyword] = useState('데이터베이스');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadExams();
    await loadQuestions();
    await loadAnswers();
    await loadProctorLogs();
    await loadSubmissionsHistory();
  };

  const loadExams = async () => {
    const res = await fetch('/api/exams');
    const data = await res.json();
    setExams(data);
  };

  const loadQuestions = async () => {
    const res = await fetch('/api/questions');
    const data = await res.json();
    setQuestions(data);
  };

  const loadAnswers = async () => {
    const res = await fetch('/api/answers');
    const data = await res.json();
    setExamStatus(data.status);
    setUserAnswers(data.answers);
    setSubmissionTime(data.submissionTime);
  };

  const loadProctorLogs = async () => {
    const res = await fetch('/api/proctor/logs');
    const data = await res.json();
    setProctorLogs(data);
  };

  const loadSubmissionsHistory = async () => {
    const res = await fetch('/api/submissions/history');
    const data = await res.json();
    setSubmissionsHistory(data);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const resetSandbox = async () => {
    await fetch('/api/reset', { method: 'POST' });
    showToast('ExamGuard 시험 시스템 디비가 초기화되었습니다.', 'success');
    setCurrentQuestionIdx(0);
    setCurrentAnswer('');
    await loadAll();
  };

  // Student Switcher (Error 4 Target)
  const handleStudentSwitch = async (newStudent) => {
    setCurrentUser(newStudent);
    showToast(`로그인 세션이 [${newStudent}]로 전환되었습니다.`, 'info');

    // Fetch timeRemaining from server (e.g. 50 minutes for B)
    const res = await fetch(`/api/student-proctor?student=${newStudent}`);
    const data = await res.json();
    setTimeRemaining(data.timeRemaining);

    // INTENTIONAL_ERROR
    // CATEGORY: Session
    // DESCRIPTION: 학생 A에서 B로 로그인 세션을 전환할 때 남은 타이머 시간은 B 기준으로 갱신되지만, 
    // 우측 패널의 부정행위 적발 경고 누적 수치(`cachedWarningCount`) 캐시를 초기화하지 않고 그대로 인계하여 
    // B 학생 대시보드에 A의 감독 경고(5회)가 노출되는 세션 캐시 누수 결함입니다.
  };

  // Fix warning count manually
  const syncWarningMeters = () => {
    setCachedWarningCount(0);
    showToast('부정행위 경고 횟수가 0회로 동기화 리셋되었습니다.', 'success');
  };

  // Filtered unanswered questions (Error 3 Target)
  const filteredQuestions = filterUnanswered 
    ? questions.filter(q => !userAnswers[q.id]) 
    : questions;

  const handleQuestionSelect = (idxInFiltered) => {
    if (filterUnanswered) {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 미응답 문제 필터가 켜진 상태에서 문항 단추를 클릭하면, 
      // 필터링된 배열 순서 인덱스를 원본 문제 배열(`questions`)의 인덱스로 그대로 대입해버려 
      // 엉뚱한 번호의 문제가 에디터에 로딩되는 인덱스 맵 꼬임 결함입니다.
      setCurrentQuestionIdx(idxInFiltered);
      const q = questions[idxInFiltered];
      setCurrentAnswer(userAnswers[q.id] || '');
    } else {
      setCurrentQuestionIdx(idxInFiltered);
      const q = questions[idxInFiltered];
      setCurrentAnswer(userAnswers[q.id] || '');
    }
  };

  // Q5 Switch Auto-Save Race Condition (Error 1 Target)
  const handleQuestionSwitchAndSave = (nextIdx) => {
    const oldIdx = currentQuestionIdx;
    const oldQ = questions[oldIdx];
    const oldAns = currentAnswer;

    let delayFlag = false;
    if (oldIdx === 4) { // Q5 (index 4)
      delayFlag = true;
      showToast('문제 5번 답안 자동 저장이 백그라운드(4초 지연)로 예약되었습니다.', 'info');
    }

    // Call save API for the previous question
    fetch('/api/exams/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: oldQ.id, answer: oldAns, delay: delayFlag })
    })
    .then(res => res.json())
    .then(data => {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend + Network
      // DESCRIPTION: 5번 문제 자동저장이 4초 지연되는 사이 6번 문제로 넘어가 답을 입력하면, 
      // 뒤늦게 수신된 5번 저장 완료 응답이 현재 에디터 영역의 입력 상태(`currentAnswer`)를 
      // 5번의 저장값으로 덮어써서 6번 답안이 5번의 내용으로 변질되는 결함입니다.
      if (delayFlag) {
        setCurrentAnswer(data.savedAnswer);
        showToast('5번 지연 저장 완료 응답 수신 (현재 화면 에디터 상태 덮어씀)', 'warning');
      }
      setUserAnswers(prev => ({ ...prev, [oldQ.id]: data.savedAnswer }));
    });

    // Move to next question immediately
    setCurrentQuestionIdx(nextIdx);
    const nextQ = questions[nextIdx];
    setCurrentAnswer(userAnswers[nextQ.id] || '');
  };

  // Submit & Save Race simulation (Error 2 Target)
  const triggerSaveAndSubmitRace = () => {
    const currentQ = questions[currentQuestionIdx];
    showToast('답안 자동 저장(3초 지연) 후 최종 제출(0.1초 완료) 레이스를 시뮬레이션합니다.', 'info');

    // 1. Save draft with 3s delay on server
    fetch('/api/exams/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: currentQ.id, answer: '자동저장 유입 꼬임 답안', delay: true })
    });

    // 2. Submit exam immediately (0.1s completion)
    setTimeout(async () => {
      const res = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: userAnswers, forceExpired: false })
      });
      if (res.ok) {
        showToast('시험 최종 제출 완료 승인 (결과지 잠금)', 'success');
        await loadAnswers();
        await loadSubmissionsHistory();
      }
    }, 150);
  };

  // Submit Expired exam (Error 6 Target)
  const triggerExpiredSubmit = async () => {
    showToast('시간 만료 상태로 강제 제출을 시도합니다.', 'info');

    const res = await fetch('/api/exams/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: userAnswers, forceExpired: true })
    });

    if (res.status === 403) {
      showToast('시험 시간이 만료되었습니다. 최종 제출이 잠금 차단됩니다. (HTTP 403)', 'danger');
      await loadAnswers(); // Re-fetch to show that answers are STILL written to DB!
    }
  };

  // Delete Exam (Error 5 Target)
  const deleteExamStatsLeak = async (examId) => {
    const res = await fetch(`/api/exams/${examId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('해당 시험이 목록에서 소거되었습니다.', 'success');
      await loadExams();
      // Bypasses cleaning submissionsHistory!
      await loadSubmissionsHistory();
    }
  };

  // Add question (Professor)
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: newQuestionText,
        points: 4,
        correctKeyword: newQuestionKeyword
      })
    });
    if (res.ok) {
      showToast('신규 시험 평가 문항이 추가되었습니다.', 'success');
      setNewQuestionText('');
      await loadQuestions();
    }
  };

  const activeQuestion = questions[currentQuestionIdx];

  return (
    <div className="examguard-app">
      
      {/* Top Header bar */}
      <header class="app-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 11 2 2 4-4" />
          </svg>
          <span className="logo-title">ExamGuard</span>
          <span className="logo-subtitle">Secure Online Examination Console</span>
        </div>

        <div className="header-right">
          <div className="session-select">
            <span>👤 사용자 세션: </span>
            <select value={currentUser} onChange={e => {
              const val = e.target.value;
              if (val === '교수자') {
                setCurrentUser(val);
              } else {
                handleStudentSwitch(val);
              }
            }}>
              <option value="학생 A">학생 A (경고 5회 누적)</option>
              <option value="학생 B">학생 B (신규 진입)</option>
              <option value="교수자">교수자 (시험지 출제 및 감독관)</option>
            </select>
          </div>

          <button className="sandbox-reset-btn" onClick={resetSandbox}>
            🔄 DB 초기화
          </button>
        </div>
      </header>

      {/* Main Grid workspace */}
      <div className="examguard-grid">

        {currentUser === '교수자' ? (
          /* Professor Mode View */
          <React.Fragment>
            <aside className="panel-section stats-sidebar">
              <h3>📊 시험 관리 및 제출 통계</h3>
              <div className="exams-config-list">
                {exams.map(ex => (
                  <div key={ex.id} className="exam-config-card">
                    <strong>{ex.title}</strong>
                    <span>시간: {ex.duration}분</span>
                    <button 
                      className="delete-exam-btn"
                      onClick={() => deleteExamStatsLeak(ex.id)}
                    >
                      시험 삭제 (Error 5)
                    </button>
                  </div>
                ))}
              </div>

              {/* Submissions backup logs (Error 5 display) */}
              <div className="submissions-history-block">
                <h4>📜 영구 적재된 제출 이력 목록</h4>
                <p className="warn-desc">* 시험을 삭제해도 아래 제출 이력과 통계는 남아있음 (Error 5)</p>
                <div className="history-list">
                  {submissionsHistory.map(sub => (
                    <div key={sub.id} className="history-card">
                      <span>{sub.student} - 점수: <strong>{sub.score}점</strong></span>
                      <small>시험 ID: {sub.examId}</small>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <main className="panel-section editor-center">
              <h2>✍️ 교수자 평가 문제 은행 관리</h2>
              <div className="questions-list-view">
                {questions.map(q => (
                  <div key={q.id} className="question-list-row">
                    <strong>Q{q.num}</strong>
                    <p>{q.text}</p>
                    <span className="point-tag">{q.points}점</span>
                  </div>
                ))}
              </div>

              <div className="add-question-block">
                <h3>➕ 신규 문항 추가 출제</h3>
                <form onSubmit={handleAddQuestion} className="question-form">
                  <textarea 
                    placeholder="문제 지문 입력..."
                    value={newQuestionText}
                    onChange={e => setNewQuestionText(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="핵심 정답 키워드..."
                    value={newQuestionKeyword}
                    onChange={e => setNewQuestionKeyword(e.target.value)}
                  />
                  <button type="submit">문제 등록</button>
                </form>
              </div>
            </main>
          </React.Fragment>
        ) : (
          /* Student Exam Mode View */
          <React.Fragment>
            {/* Left side: Question Navigation grid */}
            <aside className="panel-section nav-sidebar">
              <div className="nav-header">
                <h3>❓ 문항 인덱스</h3>
                <label className="filter-unanswered">
                  <input 
                    type="checkbox"
                    checked={filterUnanswered}
                    onChange={e => setFilterUnanswered(e.target.checked)}
                  />
                  미응답 보기
                </label>
              </div>
              <p className="warn-desc">* 미응답 필터 적용 시 엉뚱한 문제 ID가 로딩됨 (Error 3)</p>

              <div className="questions-grid-wrapper">
                {filteredQuestions.map((q, idx) => (
                  <button
                    key={q.id}
                    className={`q-num-btn ${currentQuestionIdx === idx ? 'active' : ''} ${userAnswers[q.id] ? 'answered' : ''}`}
                    onClick={() => handleQuestionSelect(idx)}
                  >
                    {q.num}
                  </button>
                ))}
              </div>
            </aside>

            {/* Center: Question and active answer editor */}
            <main className="panel-section test-sheet-center">
              <div className="sheet-header">
                <h2>📝 온라인 평가 응시 화면</h2>
                <div className="actions">
                  <button className="race-trigger-btn" onClick={triggerSaveAndSubmitRace}>
                    ⚡ 자동저장 후 바로 제출 (Error 2)
                  </button>
                  <button className="expired-submit-btn" onClick={triggerExpiredSubmit}>
                    ⏰ 시간만료 제출 시도 (Error 6)
                  </button>
                </div>
              </div>
              <p className="warn-desc">* 최종 제출 완료 후 자동저장 시 데이터 덮어쓰기 발생 (Error 2)</p>

              {activeQuestion ? (
                <div className="active-question-card">
                  <div className="question-title">
                    <span className="badge">문항 {activeQuestion.num}</span>
                    <span className="points">{activeQuestion.points}점 배점</span>
                  </div>
                  <p className="question-text">{activeQuestion.text}</p>

                  <div className="editor-area">
                    <label>✍️ 주관식/단답식 답안 입력란:</label>
                    <textarea
                      placeholder="이곳에 정답 키워드 및 풀이 답안을 기재하세요. (자동 저장은 다음 문항으로 이동 시 실행)"
                      value={currentAnswer}
                      onChange={e => {
                        setCurrentAnswer(e.target.value);
                        // Save in local state
                        setUserAnswers(prev => ({ ...prev, [activeQuestion.id]: e.target.value }));
                      }}
                    />
                  </div>

                  <div className="navigation-controls">
                    <button 
                      disabled={currentQuestionIdx === 0}
                      onClick={() => handleQuestionSwitchAndSave(currentQuestionIdx - 1)}
                    >
                      ◀ 이전 문항
                    </button>
                    <span className="index-lbl">{currentQuestionIdx + 1} / {questions.length}</span>
                    <button 
                      disabled={currentQuestionIdx === questions.length - 1}
                      onClick={() => handleQuestionSwitchAndSave(currentQuestionIdx + 1)}
                    >
                      다음 문항 ▶
                    </button>
                  </div>
                </div>
              ) : (
                <p className="empty-lbl">문항 번호를 클릭해 시험을 풀어주세요.</p>
              )}

              {/* Status display when submitted */}
              {examStatus === 'SUBMITTED' && (
                <div className="submission-result-box">
                  <h3>✅ 시험 답안 제출이 완료되었습니다.</h3>
                  <p>제출 완료 시각: <strong>{submissionTime || '방금 전'}</strong></p>
                  <p className="warn-desc">
                    * DB 최종 답안 내용: [ {Object.values(userAnswers).join(', ') || '없음'} ]
                  </p>
                  <small>최종 채점 점수는 제출 당시 상태로 교수자에게 전달됩니다.</small>
                </div>
              )}
            </main>

            {/* Right: Remaining time and proctor warning panel */}
            <aside className="panel-section proctor-sidebar">
              <h3>🚨 시험 감독 및 통제 현황</h3>
              <div className="timer-box">
                <span>남은 시간: </span>
                <strong className="time-lbl">{timeRemaining}분</strong>
              </div>

              {/* Proctor Warning (Error 4 Target) */}
              <div className="proctor-status-card">
                <h4>⚠️ AI 감독 경고 횟수</h4>
                <div className="warning-count-meter">
                  <strong className="warn-lbl">{cachedWarningCount} 회</strong>
                </div>
                <p className="warn-desc">* 학생 전환 시 경고 수가 리셋되지 않고 그대로 노출됨 (Error 4)</p>
                <button className="sync-btn" onClick={syncWarningMeters}>
                  감독 경고 동기화
                </button>
              </div>

              {/* Live proctor log feed */}
              <div className="proctor-logs-block">
                <h4>📜 실시간 웹캠 & 보안 로그</h4>
                <div className="logs-wrapper">
                  {proctorLogs.map((log, idx) => (
                    <div key={idx} className="log-row">
                      <span className="time">{log.time}</span>
                      <span className={`type-tag ${log.type}`}>{log.type}</span>
                      <p className="msg">{log.msg}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </React.Fragment>
        )}

      </div>

      {/* Floating Action Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
              &times;
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
