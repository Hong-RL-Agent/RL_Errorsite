import React, { useState, useEffect } from 'react';

export default function App() {
  // State Variables
  const [lectures, setLectures] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [notes, setNotes] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  // Active lecture progress state (rendered in player progress bar)
  const [currentLecProgress, setCurrentLecProgress] = useState(0);

  // Tab State ('notes', 'questions')
  const [selectedTab, setSelectedTab] = useState('notes');

  // Input states
  const [newNote, setNewNote] = useState('');
  const [newQTitle, setNewQTitle] = useState('');
  const [newQContent, setNewQContent] = useState('');
  const [userName, setUserName] = useState('');
  const [progressInput, setProgressInput] = useState(0);

  // Layout UI
  const [toasts, setToasts] = useState([]);
  const [isTOCMobileOpen, setIsTOCMobileOpen] = useState(false);

  useEffect(() => {
    loadLectures();
    loadProgress();
    loadNotes();
    loadQuestions();
  }, []);

  const loadLectures = async () => {
    try {
      const res = await fetch('/api/lectures');
      const data = await res.json();
      setLectures(data);
      if (data.length > 0) {
        setCurrentLecture(data[0]);
        setCurrentLecProgress(85); // Dummy initial for Lecture 1 (or load from server map later)
      }
    } catch (err) {
      showToast('강의 목록을 가져오지 못했습니다.', 'danger');
    }
  };

  const loadProgress = async () => {
    try {
      const res = await fetch('/api/progress');
      const data = await res.json();
      setProgressMap(data);
      // Initialize progress
      if (lectures.length > 0 && currentLecture) {
        setCurrentLecProgress(data[currentLecture.id] || 0);
        setProgressInput(data[currentLecture.id] || 0);
      }
    } catch (err) {
      showToast('수강 진도 내역 로딩 실패', 'danger');
    }
  };

  // Keep progress state synced when database loads
  useEffect(() => {
    if (currentLecture && progressMap[currentLecture.id] !== undefined) {
      // Only set if not currently stuck on the frontend bug
      // (The bug handles this by conditionally bypassing set state)
    }
  }, [progressMap]);

  const loadNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      showToast('메모 불러오기 실패', 'danger');
    }
  };

  const loadQuestions = async () => {
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      showToast('질문 리스트 로딩 실패', 'danger');
    }
  };

  // Lecture Switcher with Error 1
  const handleLectureSelect = (lecture) => {
    const prevLecId = currentLecture ? currentLecture.id : null;
    const nextLecId = lecture.id;

    setCurrentLecture(lecture);
    setIsTOCMobileOpen(false);

    // Sync input range
    const currentRealProgress = progressMap[lecture.id] || 0;
    setProgressInput(currentRealProgress);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 3번 강의(lec-03)를 보던 중 4번 강의(lec-04)로 이동하는 특정 트리거 동작 시, 
    // 화면상의 강의 정보 제목은 4번으로 변경되지만, 수강 진행 상태바(currentLecProgress)의 값을 
    // 3번의 기존 수치 상태 그대로 갱신하지 않고 스킵함으로써 사용자 인터페이스 동기화 불일치를 야기합니다.
    if (prevLecId === 'lec-03' && nextLecId === 'lec-04') {
      showToast('주의: 진도 진행 바 동기화가 누락되었습니다. (강의 3 수치 고정)', 'warning');
      // Bypasses: setCurrentLecProgress(currentRealProgress);
    } else {
      setCurrentLecProgress(currentRealProgress);
    }
  };

  // Submit Progress (Error 3 test helper)
  const saveProgressRate = async () => {
    if (!currentLecture) return;
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lectureId: currentLecture.id,
          progress: progressInput
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`'${currentLecture.name}'의 진도가 ${progressInput}%로 저장되었습니다.`, 'success');
        setProgressMap(data.progress);
        setCurrentLecProgress(progressInput);
      } else {
        showToast(`에러: ${data.error}`, 'danger');
      }
    } catch (err) {
      showToast('진도 기록 통신 중 예외가 발생했습니다.', 'danger');
    }
  };

  // Cloud Progress Sync (Error 4 test helper)
  const syncProgressCloud = async () => {
    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: 학습 기록 클라우드 동기화 수행 시, 백엔드에 존재하지 않는 API 엔드포인트인 
    // '/api/progress/sync-v3'에 동기화 패치를 송신하도록 설계하여 브라우저 개발자 도구의 네트워크 탭에 
    // 404 Not Found 에러 로그를 기록합니다.
    try {
      const res = await fetch('/api/progress/sync-v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressMap)
      });
      if (!res.ok) {
        throw new Error(`서버 응답 거부: HTTP ${res.status}`);
      }
      showToast('동기화 완료!', 'success');
    } catch (err) {
      showToast(`[네트워크 404 에러] 클라우드 동기화 경로를 찾을 수 없습니다. (${err.message})`, 'danger');
    }
  };

  // Submit Memo Note
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lectureId: currentLecture.id,
          content: newNote
        })
      });
      if (res.ok) {
        showToast('강의 메모가 저장되었습니다.', 'success');
        setNewNote('');
        loadNotes();
      }
    } catch (err) {
      showToast('메모 전송 실패', 'danger');
    }
  };

  // Submit Question (Error 2 test helper)
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!newQContent.trim()) {
      showToast('질문 내용을 적어주세요.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lectureId: currentLecture.id,
          title: newQTitle, // 비어있으면 백엔드에서 500 반환 (Error 2)
          content: newQContent
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Q&A 전송 실패');
      }

      showToast('강사 질문이 등록되었습니다.', 'success');
      setNewQTitle('');
      setNewQContent('');
      loadQuestions();
    } catch (err) {
      showToast(`질문 등록 실패: ${err.message}`, 'danger');
    }
  };

  // Certificate PDF Generator (Error 5 helper)
  const handleCertificateGenerate = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      showToast('수료증에 표기될 성함을 작성해 주세요.', 'warning');
      return;
    }

    const completedCount = Object.values(progressMap).filter(p => p === 100).length;

    try {
      const res = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          completedLecturesCount: completedCount
        })
      });
      const data = await res.json();

      if (!res.ok) {
        // Catch Error 5 (Infrastructure / FS write failure)
        throw new Error(data.error || '수료증 파일 생성 실패');
      }

      showToast(`수료증 생성 성공! 파일 저장 경로: ${data.path}`, 'success');
      setUserName('');
    } catch (err) {
      showToast(`인프라 오류: ${err.message}`, 'danger');
    }
  };

  // Count overall progress percentage
  const getOverallProgressPercentage = () => {
    if (lectures.length === 0) return 0;
    const total = lectures.length * 100;
    const currentSum = Object.values(progressMap).reduce((a, b) => a + b, 0);
    return Math.round((currentSum / total) * 100);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  return (
    <div className="skilltrack-app">
      {/* Top Header */}
      <header className="app-navbar">
        <div className="navbar-logo">
          <button className="mobile-toc-toggle" onClick={() => setIsTOCMobileOpen(true)}>
            ☰ Menu
          </button>
          <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="logo-title">SkillTrack</span>
          <span className="logo-subtitle">학습 성과 &amp; 마일스톤 매니저</span>
        </div>
        <div className="navbar-actions">
          <button className="cloud-sync-btn" onClick={syncProgressCloud}>
            ☁️ 학습 기록 클라우드 동기화
          </button>
        </div>
      </header>

      {/* Main Workspace grid */}
      <div className="learning-workspace">
        {/* Left Column: Lecture Table of Contents (TOC) */}
        <aside className={`column-toc ${isTOCMobileOpen ? 'mobile-open' : ''}`}>
          <div className="toc-header">
            <h3>📖 강의 목차 커리큘럼</h3>
            <button className="mobile-close-btn" onClick={() => setIsTOCMobileOpen(false)}>&times;</button>
          </div>
          <div className="lecture-menu-list">
            {lectures.map((lec) => {
              const p = progressMap[lec.id] || 0;
              const isActive = currentLecture && currentLecture.id === lec.id;
              return (
                <button
                  key={lec.id}
                  className={`lecture-menu-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleLectureSelect(lec)}
                >
                  <div className="lec-info">
                    <span className="lec-name">{lec.name}</span>
                    <span className="lec-meta">{lec.category} | {lec.duration}</span>
                  </div>
                  <span className={`lec-progress-badge ${p === 100 ? 'done' : ''}`}>
                    {p}%
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center Column: Video Player Container */}
        <main className="column-player">
          {currentLecture ? (
            <div className="player-inner-card">
              <div className="player-title-row">
                <h2>{currentLecture.name}</h2>
                <span className="category-tag">{currentLecture.category}</span>
              </div>

              {/* Mock CSS Video Player UI */}
              <div className="mock-video-player">
                <div className="player-screen">
                  <div className="play-overlay-icon">▶</div>
                  <div className="video-stats-overlay">
                    <span>PLAYING MOCK VIDEO</span>
                    <span>1080p HD</span>
                  </div>
                </div>
                <div className="player-controls-bar">
                  <button className="play-btn">❚❚ PAUSE</button>
                  <div className="progress-bar-container">
                    <span className="time-lbl">04:12</span>
                    <div className="progress-track-bg">
                      {/* Displays currentLecProgress which might be stuck on Lecture 3's progress for Lecture 4 */}
                      <div className="progress-fill" style={{ width: `${currentLecProgress}%` }}></div>
                    </div>
                    <span className="time-lbl">{currentLecture.duration}</span>
                  </div>
                  <span className="gauge-value">진도: {currentLecProgress}%</span>
                </div>
              </div>

              {/* Progress Slider Form */}
              <div className="progress-setter-card">
                <h3>📈 이 강의 수강율 기록 조정</h3>
                <div className="slider-action-row">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressInput}
                    onChange={(e) => setProgressInput(Number(e.target.value))}
                  />
                  <span className="slider-num">{progressInput}%</span>
                  <button className="save-progress-btn" onClick={saveProgressRate}>
                    수강율 저장
                  </button>
                </div>
                <p className="help-text">진도를 100%로 저장했다가 70%로 낮춰서 저장하면 그대로 감소하여 덮어쓰기됩니다. (DB 에러)</p>
              </div>
            </div>
          ) : (
            <div className="empty-player">강의를 로드하는 중입니다...</div>
          )}
        </main>

        {/* Right Column: Memo & Questions Tab */}
        <aside className="column-tabs">
          <div className="tab-buttons">
            <button className={selectedTab === 'notes' ? 'active' : ''} onClick={() => setSelectedTab('notes')}>
              📝 메모장 ({notes.filter(n => currentLecture && n.lectureId === currentLecture.id).length})
            </button>
            <button className={selectedTab === 'questions' ? 'active' : ''} onClick={() => setSelectedTab('questions')}>
              ❓ 질의응답 ({questions.filter(q => currentLecture && q.lectureId === currentLecture.id).length})
            </button>
          </div>

          <div className="tab-content-panel">
            {currentLecture ? (
              <>
                {/* Notes Tab */}
                {selectedTab === 'notes' && (
                  <div className="tab-pane">
                    <form onSubmit={handleNoteSubmit} className="memo-form">
                      <textarea
                        rows="3"
                        placeholder="이 강의에 대해 기억할 내용을 메모해 두세요."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      />
                      <button type="submit" className="save-memo-btn">메모 저장하기</button>
                    </form>

                    <div className="memos-list">
                      {notes
                        .filter(n => n.lectureId === currentLecture.id)
                        .map(n => (
                          <div key={n.id} className="memo-item">
                            <p>{n.content}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Questions Tab */}
                {selectedTab === 'questions' && (
                  <div className="tab-pane">
                    <form onSubmit={handleQuestionSubmit} className="q-form">
                      <div className="form-group">
                        <label>질문 제목 (비워두고 등록하면 HTTP 500 유발)</label>
                        <input
                          type="text"
                          placeholder="질문 한줄 요약"
                          value={newQTitle}
                          onChange={(e) => setNewQTitle(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>질문 내용</label>
                        <textarea
                          rows="4"
                          placeholder="궁금한 내용을 구체적으로 기입해 주세요."
                          value={newQContent}
                          onChange={(e) => setNewQContent(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="save-q-btn">강사님께 질문하기</button>
                    </form>

                    <div className="questions-list">
                      {questions
                        .filter(q => q.lectureId === currentLecture.id)
                        .map(q => (
                          <div key={q.id} className="q-item">
                            <h4>{q.title}</h4>
                            <p>{q.content}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-tab">강의를 먼저 선택하세요.</div>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom Layout Timeline */}
      <section className="timeline-layout-panel">
        <div className="panel-header">
          <h2>📊 학습 완료 타임라인 및 마일스톤</h2>
          <span className="overall-lbl">전체 진도율: <strong>{getOverallProgressPercentage()}%</strong></span>
        </div>

        <div className="timeline-road">
          {lectures.map((lec, idx) => {
            const p = progressMap[lec.id] || 0;
            const isCompleted = p === 100;
            return (
              <div key={lec.id} className={`timeline-node ${isCompleted ? 'completed' : ''}`}>
                <div className="node-dot">
                  <span className="dot-num">{idx + 1}</span>
                </div>
                <div className="node-info">
                  <h4>강의 {idx + 1}</h4>
                  <div className="node-progress-line">
                    <div className="inner-line" style={{ width: `${p}%` }}></div>
                  </div>
                  <span className="percent-lbl">{p}% 완료</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Completion Certificate Section */}
      <section className="certificate-section">
        <div className="certificate-card-inner">
          <div className="cert-header">
            <h2>🎓 SkillTrack 학습 수료 인증서 발급</h2>
            <p>모든 교육과정 강의(5개)의 수강 완료 진도율이 100%에 달성되면 수료증 발급 신청이 가능합니다.</p>
          </div>

          <div className="cert-body">
            <form onSubmit={handleCertificateGenerate} className="cert-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="수료자 이름 입력"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                <button type="submit" className="generate-cert-btn">
                  공식 수료증 발급 신청
                </button>
              </div>
              <p className="help-text">수료증 파일 생성 시 POSIX 전용 경로를 탐색하여 Windows 개발 장비에서 파일 생성 예외(HTTP 500)가 발생합니다. (인프라 에러)</p>
            </form>
          </div>
        </div>
      </section>

      {/* Toast Alert popups */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}
