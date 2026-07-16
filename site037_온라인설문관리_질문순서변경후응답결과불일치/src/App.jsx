import React, { useState, useEffect } from 'react';

export default function App() {
  // DB States
  const [surveys, setSurveys] = useState([]);
  const [responses, setResponses] = useState([]);

  // Navigation state
  // Tabs: 'list' (dashboard), 'editor' (builder), 'respond' (answering), 'analytics' (results)
  const [currentTab, setCurrentTab] = useState('list');
  const [selectedSurveyId, setSelectedSurveyId] = useState('srv-01');

  // Editor states
  const [surveyTitle, setSurveyTitle] = useState('새로운 서비스 피드백 설문');
  const [surveyDeadline, setSurveyDeadline] = useState('2026-12-31');
  const [questions, setQuestions] = useState([
    { id: 'q-editor-1', type: 'radio', title: '설문지 첫 질문입니다.', options: ['만족', '보통', '불만족'], required: true, deletedOptions: [] }
  ]);
  // Error 1 Cache
  const [previewQuestions, setPreviewQuestions] = useState([
    { id: 'q-editor-1', type: 'radio', title: '설문지 첫 질문입니다.', options: ['만족', '보통', '불만족'], required: true, deletedOptions: [] }
  ]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Response collector states (Error 6 Target)
  const [responseEmail, setResponseEmail] = useState('');
  const [responseAnswers, setResponseAnswers] = useState({});
  const [respondStepIndex, setRespondStepIndex] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadSurveys();
    loadResponses();
  }, []);

  const loadSurveys = async () => {
    try {
      const res = await fetch('/api/surveys');
      const data = await res.json();
      setSurveys(data);
    } catch (err) {
      showToast('설문 리스트 로드 실패', 'danger');
    }
  };

  const loadResponses = async () => {
    try {
      const res = await fetch('/api/responses');
      const data = await res.json();
      setResponses(data);
    } catch (err) {
      showToast('응답 데이터 로드 실패', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Add question to editor
  const handleAddQuestion = (type) => {
    const newQ = {
      id: `q-${Date.now()}`,
      type,
      title: `${type === 'text' ? '단답형' : type === 'paragraph' ? '장문형' : type === 'radio' ? '객관식 단일' : type === 'checkbox' ? '객관식 다중' : type === 'star' ? '별점형' : '날짜선택'} 질문 제목을 적어주세요.`,
      options: ['옵션 1', '옵션 2', '옵션 3'],
      required: false,
      deletedOptions: []
    };
    
    const updated = [...questions, newQ];
    setQuestions(updated);
    setPreviewQuestions(updated); // Syncing on addition is normal
    setActiveQuestionIndex(updated.length - 1);
    showToast('새 질문이 하단에 추가되었습니다.', 'success');
  };

  // Move Question order (Error 1 Logic)
  const handleMoveQuestion = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    const reordered = [...questions];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    setQuestions(reordered);
    setActiveQuestionIndex(targetIdx);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 질문의 순서를 변경할 때는 미리보기 렌더링에 사용되는 previewQuestions 캐시 상태를 
    // 동기화해주지 않고 건너뜁니다. 이로 인해 편집 보드에서 순서를 바꿔도 '미리보기'를 열면 
    // 이전 순서로 표시되는 버그가 발생합니다.
    // 원래 행해져야 하는 캐시 업데이트 누락:
    // setPreviewQuestions(reordered);

    showToast('질문 순서가 변경되었습니다.', 'info');
  };

  // Delete question
  const handleDeleteQuestion = (index) => {
    if (questions.length <= 1) {
      showToast('설문지에는 최소 1개 이상의 질문이 존재해야 합니다.', 'warning');
      return;
    }
    const updated = questions.filter((_, idx) => idx !== index);
    setQuestions(updated);
    setPreviewQuestions(updated);
    setActiveQuestionIndex(Math.max(0, index - 1));
    showToast('질문이 삭제되었습니다.', 'info');
  };

  // Add Option to Multiple Choice question
  const handleAddOption = (qIndex) => {
    const updated = [...questions];
    const q = updated[qIndex];
    q.options = [...(q.options || []), `새 옵션 ${q.options.length + 1}`];
    setQuestions(updated);
    setPreviewQuestions(updated);
  };

  // Remove Option (Error 2 Logic)
  const handleRemoveOption = (qIndex, optIndex) => {
    const updated = [...questions];
    const q = updated[qIndex];
    const removedOption = q.options[optIndex];
    
    // Remove from UI array
    q.options = q.options.filter((_, idx) => idx !== optIndex);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 객관식 문항의 선택지를 삭제할 때, 화면에 노출되는 options 목록에서는 
    // 정상 제거하지만, 내부적 누적 분석용 데이터 리스트인 deletedOptions에 해당 값을 보존해둡니다. 
    // 나중에 결과 분석 차트를 그릴 때 deletedOptions까지 합산해 계산되도록 기획하여 
    // 삭제된 옵션이 통계 도표상에 여전히 남아서 잡히는 이상 현상을 만듭니다.
    q.deletedOptions = [...(q.deletedOptions || []), removedOption];

    setQuestions(updated);
    setPreviewQuestions(updated);
    showToast('선택지가 삭제되었습니다.', 'info');
  };

  // Edit question properties
  const handleUpdateQuestionField = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
    setPreviewQuestions(updated);
  };

  // Edit Option Text
  const handleUpdateOptionText = (qIndex, optIndex, val) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = val;
    setQuestions(updated);
    setPreviewQuestions(updated);
  };

  // Save Survey (Error 3 Trigger)
  const handleSaveSurvey = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: surveyTitle,
          deadline: surveyDeadline,
          questions
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '설문 저장 중 알 수 없는 에러가 발생했습니다.');
      }

      showToast(`성공적으로 [${data.title}] 설문지가 빌드되었습니다!`, 'success');
      loadSurveys();
      setCurrentTab('list');
    } catch (err) {
      showToast(`[서버 에러] ${err.message}`, 'danger');
    }
  };

  // Duplicate Survey (Error 4 Trigger)
  const handleDuplicateSurvey = async (surveyId) => {
    try {
      const res = await fetch(`/api/surveys/${surveyId}/duplicate`, { method: 'POST' });
      if (res.ok) {
        showToast('설문지가 성공적으로 복제되었습니다. (필수 속성 누락 주의)', 'success');
        loadSurveys();
      }
    } catch (err) {
      showToast('설문지 복제 통신 실패', 'danger');
    }
  };

  // Live responses refresh (Error 5 Trigger)
  const handleLiveRefresh = async () => {
    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: 실시간 응답 조회를 새로고침할 때, 백엔드 라우터에 맵핑되지 않은 
    // 가상의 잘못된 주소인 '/api/responses/live-v2'를 호출하여 네트워크 404 예외를 유도합니다.
    try {
      const res = await fetch('/api/responses/live-v2');
      if (!res.ok) throw new Error(`HTTP Status ${res.status}`);
      showToast('실시간 피드백 응답 갱신 완료', 'success');
    } catch (err) {
      showToast(`[새로고침 실패] 서버 요청 실패: ${err.message}`, 'danger');
    }
  };

  // Toggle deadline closed
  const handleToggleClose = async (survey) => {
    try {
      const res = await fetch(`/api/surveys/${survey.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closed: !survey.closed })
      });
      if (res.ok) {
        showToast(`설문 상태가 [${!survey.closed ? '마감됨' : '진행중'}]으로 변경되었습니다.`, 'success');
        loadSurveys();
      }
    } catch (err) {
      showToast('마감 상태 변경 오류', 'danger');
    }
  };

  // Open answering screen
  const startRespond = (survey) => {
    if (survey.closed) {
      showToast('이미 마감된 설문입니다.', 'warning');
      return;
    }
    setSelectedSurveyId(survey.id);
    setResponseEmail('');
    setResponseAnswers({});
    setRespondStepIndex(0);
    setCurrentTab('respond');
  };

  // Submit Answer response (Error 6 Trigger)
  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!responseEmail.trim()) return;

    // Validate required questions
    const activeSurvey = surveys.find(s => s.id === selectedSurveyId);
    const missing = activeSurvey.questions.filter(q => q.required && !responseAnswers[q.id]);
    if (missing.length > 0) {
      showToast(`필수 입력 문항이 누락되었습니다: "${missing[0].title}"`, 'warning');
      return;
    }

    try {
      const res = await fetch(`/api/surveys/${selectedSurveyId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: responseEmail,
          answers: responseAnswers
        })
      });

      if (res.ok) {
        showToast('설문 응답이 최종 접수되었습니다. 감사합니다!', 'success');
        loadSurveys();
        loadResponses();
        setCurrentTab('list');
      }
    } catch (err) {
      showToast('응답 제출 API 통신 실패', 'danger');
    }
  };

  // Open Results screen
  const viewAnalytics = (surveyId) => {
    setSelectedSurveyId(surveyId);
    setCurrentTab('analytics');
  };

  const handleResetSandbox = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        showToast('설문 플랫폼 샌드박스가 초기화되었습니다.', 'warning');
        loadSurveys();
        loadResponses();
        setCurrentTab('list');
      }
    } catch (err) {
      showToast('초기화 API 에러', 'danger');
    }
  };

  const activeSurvey = surveys.find(s => s.id === selectedSurveyId) || { title: '', questions: [], deadline: '' };
  const surveyResponses = responses.filter(r => r.surveyId === selectedSurveyId);
  const activeQuestion = (respondStepIndex > 0 && activeSurvey.questions) ? activeSurvey.questions[respondStepIndex - 1] : null;

  // Compute option choice count helper
  const getChoiceStatistics = (questionId, optionValue) => {
    const matches = surveyResponses.filter(r => {
      const ans = r.answers[questionId];
      if (Array.isArray(ans)) {
        return ans.includes(optionValue);
      }
      return ans === optionValue;
    });
    return matches.length;
  };

  return (
    <div className="formwave-app">
      
      {/* Top Banner Header */}
      <header className="app-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span className="logo-title">FormWave</span>
          <span className="logo-subtitle">스마트 피드백 빌더</span>
        </div>

        <div className="header-actions">
          <button type="button" onClick={() => {
            setQuestions([{ id: `q-${Date.now()}`, type: 'radio', title: '설문지 첫 질문입니다.', options: ['만족', '보통', '불만족'], required: true, deletedOptions: [] }]);
            setPreviewQuestions([{ id: `q-${Date.now()}`, type: 'radio', title: '설문지 첫 질문입니다.', options: ['만족', '보통', '불만족'], required: true, deletedOptions: [] }]);
            setSurveyTitle('새로운 피드백 설문');
            setCurrentTab('editor');
          }} className="create-tab-btn">
            ＋ 새 설문지 제작
          </button>
          <button type="button" onClick={handleResetSandbox} className="reset-sandbox-btn">
            ⚠️ 샌드박스 초기화
          </button>
        </div>
      </header>

      {/* Main Layout Tabs */}
      {currentTab === 'list' && (
        <div className="panel-section surveys-dashboard">
          <div className="panel-header-row">
            <h2>📋 등록된 액티브 설문 조사 목록</h2>
            <div className="dashboard-actions">
              <button type="button" onClick={handleLiveRefresh} className="live-refresh-btn">
                🔄 실시간 응답 새로고침 (Error 5)
              </button>
            </div>
          </div>

          <div className="surveys-grid">
            {surveys.map(survey => (
              <div key={survey.id} className="survey-card">
                <div className="card-header">
                  <span className={`status-pill ${survey.closed ? 'closed' : 'active'}`}>
                    {survey.closed ? '마감됨' : '진행중'}
                  </span>
                  <span className="resp-count">응답 {survey.responsesCount}건</span>
                </div>
                <h3>{survey.title}</h3>
                <p className="deadline">마감일: {survey.deadline}</p>

                <div className="card-actions">
                  <button type="button" onClick={() => startRespond(survey)} className="btn-action answer" disabled={survey.closed}>
                    📝 응답 참여
                  </button>
                  <button type="button" onClick={() => viewAnalytics(survey.id)} className="btn-action stats">
                    📊 결과 분석
                  </button>
                  <button type="button" onClick={() => handleDuplicateSurvey(survey.id)} className="btn-action copy" title="설문지 복제 (Error 4)">
                    📑 복제
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleToggleClose(survey)} 
                    className={`btn-action toggle-close ${survey.closed ? 'open-it' : 'close-it'}`}
                  >
                    {survey.closed ? '🔓 개시' : '🔒 마감'}
                  </button>
                </div>
              </div>
            ))}

            {surveys.length === 0 && (
              <div className="empty-placeholder">등록된 설문 조사가 없습니다. 우측 상단에서 새 설문을 만드세요.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB: EDITOR CANVAS */}
      {currentTab === 'editor' && (
        <div className="editor-workspace-container">
          
          {/* Left Panel: Question Toolbox */}
          <aside className="panel-section question-toolbox-sidebar">
            <div className="panel-header">
              <h3>🛠️ 질문 유형 도구상자</h3>
            </div>
            <div className="toolbox-buttons-stack">
              <button type="button" onClick={() => handleAddQuestion('text')} className="tool-btn">✏️ 단답형 입력</button>
              <button type="button" onClick={() => handleAddQuestion('paragraph')} className="tool-btn">📝 장문형 서술</button>
              <button type="button" onClick={() => handleAddQuestion('radio')} className="tool-btn">🔘 객관식 단일 선택</button>
              <button type="button" onClick={() => handleAddQuestion('checkbox')} className="tool-btn">☑️ 객관식 다중 선택</button>
              <button type="button" onClick={() => handleAddQuestion('star')} className="tool-btn">⭐ 별점 매기기</button>
              <button type="button" onClick={() => handleAddQuestion('date')} className="tool-btn">📅 날짜 선택</button>
            </div>
            
            <div className="editor-bottom-nav">
              <button type="button" onClick={() => setShowPreviewModal(true)} className="nav-preview-btn">
                👁️ 설문 미리보기 (Error 1)
              </button>
              <button type="button" onClick={() => setCurrentTab('list')} className="nav-cancel-btn">
                목록으로 돌아가기
              </button>
            </div>
          </aside>

          {/* Center Panel: Edit Canvas */}
          <main className="panel-section editor-main-canvas">
            <form onSubmit={handleSaveSurvey} className="canvas-form">
              <div className="canvas-header-block">
                <input 
                  type="text" 
                  value={surveyTitle}
                  onChange={(e) => setSurveyTitle(e.target.value)}
                  placeholder="설문지 제목을 입력하세요 (25자 지정 시 Error 3)"
                  className="canvas-title-input"
                  required
                />
                <div className="deadline-row">
                  <label>설문 마감기한 설정: </label>
                  <input 
                    type="date" 
                    value={surveyDeadline} 
                    onChange={(e) => setSurveyDeadline(e.target.value)}
                    className="canvas-date-input"
                  />
                </div>
              </div>

              <div className="canvas-questions-list">
                {questions.map((q, idx) => (
                  <div 
                    key={q.id} 
                    className={`canvas-question-card ${activeQuestionIndex === idx ? 'selected' : ''}`}
                    onClick={() => setActiveQuestionIndex(idx)}
                  >
                    <div className="q-card-header">
                      <span className="q-num">질문 #{idx + 1}</span>
                      <span className="q-type-badge">{q.type}</span>
                      
                      <div className="q-order-btns" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => handleMoveQuestion(idx, -1)} disabled={idx === 0}>▲</button>
                        <button type="button" onClick={() => handleMoveQuestion(idx, 1)} disabled={idx === questions.length - 1}>▼</button>
                        <button type="button" onClick={() => handleDeleteQuestion(idx)} className="delete">&times;</button>
                      </div>
                    </div>

                    <input 
                      type="text" 
                      value={q.title}
                      onChange={(e) => handleUpdateQuestionField(idx, 'title', e.target.value)}
                      placeholder="질문 내용을 기입하세요."
                      className="q-title-input"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Question type mock layouts */}
                    <div className="q-type-mock-options" onClick={(e) => e.stopPropagation()}>
                      {q.type === 'text' && (
                        <input type="text" placeholder="단답형 텍스트 응답란" className="mock-input" disabled />
                      )}
                      {q.type === 'paragraph' && (
                        <textarea placeholder="서술형 장문 응답란" rows="2" className="mock-input" disabled></textarea>
                      )}
                      {(q.type === 'radio' || q.type === 'checkbox') && (
                        <div className="options-editor-block">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="option-row">
                              <span className="bullet">{q.type === 'radio' ? '○' : '□'}</span>
                              <input 
                                type="text" 
                                value={opt}
                                onChange={(e) => handleUpdateOptionText(idx, oIdx, e.target.value)}
                                className="opt-text-input"
                              />
                              <button type="button" onClick={() => handleRemoveOption(idx, oIdx)} className="opt-del-btn">&times;</button>
                            </div>
                          ))}
                          <button type="button" onClick={() => handleAddOption(idx)} className="add-opt-btn">
                            ＋ 항목 추가
                          </button>
                        </div>
                      )}
                      {q.type === 'star' && (
                        <div className="mock-stars">⭐⭐⭐⭐⭐ (별점 평가)</div>
                      )}
                      {q.type === 'date' && (
                        <input type="date" className="mock-input" disabled />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="save-survey-submit-btn">
                💾 설문 제작 최종 완료 및 배포 저장
              </button>
            </form>
          </main>

          {/* Right Panel: Properties */}
          <aside className="panel-section question-properties-sidebar">
            <div className="panel-header">
              <h3>⚙️ 문항 상세 설정</h3>
            </div>
            
            {questions[activeQuestionIndex] ? (
              <div className="properties-form">
                <p className="focus-q-title">문항 #{activeQuestionIndex + 1} 편집 중</p>
                
                <div className="prop-group">
                  <label>질문 형태</label>
                  <select 
                    value={questions[activeQuestionIndex].type}
                    onChange={(e) => handleUpdateQuestionField(activeQuestionIndex, 'type', e.target.value)}
                    className="prop-select"
                  >
                    <option value="text">단답형</option>
                    <option value="paragraph">장문형</option>
                    <option value="radio">객관식 단일</option>
                    <option value="checkbox">객관식 다중</option>
                    <option value="star">별점형</option>
                    <option value="date">날짜선택</option>
                  </select>
                </div>

                <div className="prop-group checkbox-row">
                  <input 
                    type="checkbox" 
                    id="req-checkbox"
                    checked={questions[activeQuestionIndex].required}
                    onChange={(e) => handleUpdateQuestionField(activeQuestionIndex, 'required', e.target.checked)}
                  />
                  <label htmlFor="req-checkbox">이 질문을 필수 응답으로 지정</label>
                </div>
              </div>
            ) : (
              <p className="no-focus-hint">편집할 문항 카드를 중앙에서 선택해 주세요.</p>
            )}
          </aside>

        </div>
      )}

      {/* TAB: RESPOND TO SURVEY */}
      {currentTab === 'respond' && (
        <div className="panel-section survey-answering-panel">
          <div className="panel-header-row">
            <h2>📝 설문 응답: {activeSurvey.title}</h2>
            <button type="button" onClick={() => setCurrentTab('list')} className="close-btn">그만두기</button>
          </div>

          <p className="warn-email-hint">
            ⚠️ 이메일 중복 제어: 본 설문은 한 이메일 계정당 단 1회만 중복 응답 제출이 불가능합니다. (Error 6)
          </p>

          <form onSubmit={handleSubmitResponse} className="respond-card-step-form">
            
            {/* Step 0: Email address validation card */}
            {respondStepIndex === 0 && (
              <div className="step-card">
                <h3>응답자 신원 확인</h3>
                <div className="form-group">
                  <label>응답자의 이메일을 적어주세요. (제출 인증용)</label>
                  <input 
                    type="email" 
                    placeholder="example@gmail.com" 
                    value={responseEmail}
                    onChange={(e) => setResponseEmail(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <button type="button" onClick={() => {
                  if (responseEmail.trim()) setRespondStepIndex(1);
                  else showToast('이메일을 입력해 주세요.', 'warning');
                }} className="next-step-btn">
                  설문 문항 시작하기 ➔
                </button>
              </div>
            )}

            {/* Steps 1..N: Question cards */}
            {respondStepIndex > 0 && activeSurvey.questions && activeSurvey.questions[respondStepIndex - 1] && (
              <div className="step-card">
                <div className="q-header">
                  <span className="step-num">질문 {respondStepIndex} / {activeSurvey.questions.length}</span>
                  {activeQuestion && activeQuestion.required && <span className="req-tag">필수</span>}
                </div>
                
                <h3>{activeQuestion && activeQuestion.title}</h3>

                <div className="answer-input-zone">
                  {activeQuestion && activeQuestion.type === 'text' && (
                    <input 
                      type="text" 
                      placeholder="이곳에 답안을 작성해주세요."
                      value={responseAnswers[activeQuestion.id] || ''}
                      onChange={(e) => setResponseAnswers({...responseAnswers, [activeQuestion.id]: e.target.value})}
                      className="form-input"
                      required={activeQuestion.required}
                    />
                  )}

                  {activeQuestion && activeQuestion.type === 'paragraph' && (
                    <textarea 
                      placeholder="의견을 상세히 남겨주세요."
                      rows="4"
                      value={responseAnswers[activeQuestion.id] || ''}
                      onChange={(e) => setResponseAnswers({...responseAnswers, [activeQuestion.id]: e.target.value})}
                      className="form-textarea"
                      required={activeQuestion.required}
                    ></textarea>
                  )}

                  {activeQuestion && activeQuestion.type === 'radio' && (
                    <div className="radio-options-stack">
                      {activeQuestion.options.map((opt, oIdx) => (
                        <label key={oIdx} className="choice-lbl">
                          <input 
                            type="radio" 
                            name={`q-${activeQuestion.id}`} 
                            value={opt}
                            checked={responseAnswers[activeQuestion.id] === opt}
                            onChange={(e) => setResponseAnswers({...responseAnswers, [activeQuestion.id]: e.target.value})}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {activeQuestion && activeQuestion.type === 'checkbox' && (
                    <div className="radio-options-stack">
                      {activeQuestion.options.map((opt, oIdx) => (
                        <label key={oIdx} className="choice-lbl">
                          <input 
                            type="checkbox" 
                            checked={(responseAnswers[activeQuestion.id] || []).includes(opt)}
                            onChange={(e) => {
                              const curr = responseAnswers[activeQuestion.id] || [];
                              const next = e.target.checked 
                                ? [...curr, opt] 
                                : curr.filter(x => x !== opt);
                              setResponseAnswers({...responseAnswers, [activeQuestion.id]: next});
                            }}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {activeQuestion && activeQuestion.type === 'star' && (
                    <div className="star-rating-box">
                      {[1, 2, 3, 4, 5].map(starNum => (
                        <button 
                          key={starNum}
                          type="button" 
                          onClick={() => setResponseAnswers({...responseAnswers, [activeQuestion.id]: starNum})}
                          className={`star-btn ${responseAnswers[activeQuestion.id] >= starNum ? 'active' : ''}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  )}

                  {activeQuestion && activeQuestion.type === 'date' && (
                    <input 
                      type="date"
                      value={responseAnswers[activeQuestion.id] || ''}
                      onChange={(e) => setResponseAnswers({...responseAnswers, [activeQuestion.id]: e.target.value})}
                      className="form-input"
                      required={activeQuestion.required}
                    />
                  )}
                </div>

                <div className="step-actions">
                  <button type="button" onClick={() => setRespondStepIndex(prev => prev - 1)} className="prev-btn">
                    이전 문항
                  </button>

                  {respondStepIndex < activeSurvey.questions.length ? (
                    <button type="button" onClick={() => {
                      if (activeQuestion && activeQuestion.required && !responseAnswers[activeQuestion.id]) {
                        showToast('이 문항은 필수 답변 항목입니다.', 'warning');
                        return;
                      }
                      setRespondStepIndex(prev => prev + 1);
                    }} className="next-btn">
                      다음 문항 ➔
                    </button>
                  ) : (
                    <button type="submit" className="submit-btn">
                      🏁 설문 응답 제출하기
                    </button>
                  )}
                </div>

              </div>
            )}

          </form>
        </div>
      )}

      {/* TAB: RESULT ANALYTICS */}
      {currentTab === 'analytics' && (
        <div className="panel-section survey-results-panel">
          <div className="panel-header-row">
            <h2>📊 설문 통계 결과 분석: {activeSurvey.title}</h2>
            <button type="button" onClick={() => setCurrentTab('list')} className="close-btn">목록으로</button>
          </div>

          <div className="results-summary-info">
            <p>총 수집된 피드백 응답: <strong>{surveyResponses.length}건</strong></p>
          </div>

          <div className="questions-statistics-stack">
            {activeSurvey.questions.map((q, idx) => (
              <div key={q.id} className="question-stat-card">
                <h4>질문 {idx + 1}. {q.title}</h4>
                <span className="q-type-label">유형: {q.type}</span>

                <div className="stat-content-render">
                  {(q.type === 'radio' || q.type === 'checkbox') && (
                    <div className="choice-stats-grid">
                      <div className="table-box">
                        <table className="stat-table">
                          <thead>
                            <tr>
                              <th>옵션명</th>
                              <th>득표수</th>
                              <th>비율</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Error 2: q.deletedOptions are rendered and accounted for in stats list */}
                            {[...(q.options || []), ...(q.deletedOptions || [])].map((opt, oIdx) => {
                              const cnt = getChoiceStatistics(q.id, opt);
                              const total = surveyResponses.length || 1;
                              const pct = Math.round((cnt / total) * 100);
                              const isDeleted = (q.deletedOptions || []).includes(opt);
                              return (
                                <tr key={oIdx} className={isDeleted ? 'deleted-option-row' : ''}>
                                  <td>
                                    {opt} {isDeleted && <span className="del-tag">(삭제된 옵션 - Error 2)</span>}
                                  </td>
                                  <td><strong>{cnt}건</strong></td>
                                  <td>{pct}%</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="chart-box">
                        {/* SVG Bar Chart representing votes */}
                        <svg viewBox="0 0 200 120" className="chart-bar-svg">
                          {[...(q.options || []), ...(q.deletedOptions || [])].map((opt, oIdx) => {
                            const cnt = getChoiceStatistics(q.id, opt);
                            const total = surveyResponses.length || 1;
                            const barW = (cnt / total) * 120;
                            const barY = 10 + oIdx * 20;
                            return (
                              <g key={oIdx}>
                                <text x="5" y={barY + 12} fill="#94a3b8" fontSize="6">{opt.substring(0, 10)}</text>
                                <rect x="70" y={barY + 4} width={barW || 2} height="10" fill="#06b6d4" rx="1" />
                                <text x={75 + barW} y={barY + 12} fill="#06b6d4" fontSize="6" fontWeight="bold">{cnt}표</text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  )}

                  {q.type === 'star' && (() => {
                    const avg = (surveyResponses.reduce((sum, r) => sum + (Number(r.answers[q.id]) || 0), 0) / (surveyResponses.length || 1)).toFixed(1);
                    return (
                      <div className="star-rating-stat-box">
                        <div className="average-box">
                          <span className="avg-num">{avg}</span>
                          <span className="stars-fill">{'★'.repeat(Math.round(avg))}</span>
                          <p className="lbl">5점 만점 기준 평균 평점</p>
                        </div>
                      </div>
                    );
                  })()}

                  {(q.type === 'text' || q.type === 'paragraph') && (
                    <div className="text-answers-list">
                      <h5>수집된 응답 문구 ({surveyResponses.length}건)</h5>
                      <ul>
                        {surveyResponses.map((r, rIdx) => (
                          <li key={rIdx}>
                            <span className="respondent">{r.email.split('@')[0]} : </span>
                            <span className="phrase">"{r.answers[q.id] || '답변 없음'}"</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {q.type === 'date' && (
                    <div className="text-answers-list">
                      <h5>기입된 날짜 내역</h5>
                      <ul>
                        {surveyResponses.map((r, rIdx) => (
                          <li key={rIdx}>
                            <span className="phrase">{r.answers[q.id] || '미선택'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal overlay (Error 1 Target) */}
      {showPreviewModal && (
        <div className="preview-modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="preview-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👁️ 설문지 동작 미리보기</h3>
              <button type="button" onClick={() => setShowPreviewModal(false)} className="close-btn">&times;</button>
            </div>
            
            <div className="modal-body-scroll">
              <p className="preview-indicator-alert">
                * [미리보기 모드] 이 화면은 실제 사용자에게 노출되는 순서 규격을 테스트합니다. (순서 스위칭 버그 검증)
              </p>
              
              <h2 className="preview-srv-title">{surveyTitle}</h2>

              <div className="preview-questions-list">
                {/* Error 1: Renders previewQuestions state instead of active questions state */}
                {previewQuestions.map((q, idx) => (
                  <div key={q.id} className="preview-q-card">
                    <h4>
                      질문 #{idx + 1}. {q.title}
                      {q.required && <span className="req-tag">필수</span>}
                    </h4>

                    <div className="preview-ans-mock">
                      {q.type === 'text' && (
                        <input type="text" placeholder="단답형 답변 작성란" className="mock-input" disabled />
                      )}
                      {q.type === 'paragraph' && (
                        <textarea placeholder="장문형 답변 작성란" rows="3" className="mock-input" disabled></textarea>
                      )}
                      {q.type === 'radio' && (
                        <div className="mock-choices">
                          {q.options.map((opt, oIdx) => (
                            <label key={oIdx} className="choice-lbl">
                              <input type="radio" name={`preview-q-${q.id}`} disabled />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === 'checkbox' && (
                        <div className="mock-choices">
                          {q.options.map((opt, oIdx) => (
                            <label key={oIdx} className="choice-lbl">
                              <input type="checkbox" disabled />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === 'star' && (
                        <div className="mock-stars-line">★★★★★ (5성 선택형)</div>
                      )}
                      {q.type === 'date' && (
                        <input type="date" className="mock-input" disabled />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setShowPreviewModal(false)} className="close-btn-bottom">
                미리보기 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert logs */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button 
              className="toast-close" 
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
