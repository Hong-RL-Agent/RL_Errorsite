import React, { useState, useEffect } from 'react';

export default function App() {
  // DB States
  const [meetings, setMeetings] = useState([]);
  const [recordings, setRecordings] = useState([]);

  // Active Navigation
  // Tabs: 'schedule' (main calendar), 'create' (create new), 'recordings' (archives), 'room' (inside conference call)
  const [currentTab, setCurrentTab] = useState('schedule');
  const [selectedMeetingId, setSelectedMeetingId] = useState('meet-01');

  // Create form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('2026-07-13');
  const [newTime, setNewTime] = useState('11:00');
  const [newDuration, setNewDuration] = useState('60');
  const [newHost, setNewHost] = useState('김민재 팀장');

  // Reschedule form states
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  // Inside meeting room states
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState(["김민재", "이서현", "박지성"]);
  const [participantsCount, setParticipantsCount] = useState(3);
  const [chatMessages, setChatMessages] = useState([
    { id: 'c-1', user: '김민재', text: '회의를 시작합니다. 공유 문서 확인 부탁드립니다.', time: '10:00' },
    { id: 'c-2', user: '이서현', text: '넷, 알겠습니다.', time: '10:01' }
  ]);
  const [chatInputText, setChatInputText] = useState('');
  const [rightPanelTab, setRightPanelTab] = useState('chat'); // 'chat' | 'participants'
  const [newInviteName, setNewInviteName] = useState('');

  // UI status
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadMeetings();
    loadRecordings();
  }, []);

  const loadMeetings = async () => {
    try {
      const res = await fetch('/api/meetings');
      const data = await res.json();
      setMeetings(data);
    } catch (err) {
      showToast('회의 목록 로딩 실패', 'danger');
    }
  };

  const loadRecordings = async () => {
    try {
      const res = await fetch('/api/recordings');
      const data = await res.json();
      setRecordings(data);
    } catch (err) {
      showToast('녹화 내역 로딩 실패', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Create meeting (Error 3 Trigger)
  const handleCreateMeeting = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          date: newDate,
          time: newTime,
          duration: newDuration,
          host: newHost,
          participants: [newHost]
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '회의를 저장하지 못했습니다.');
      }

      showToast(`성공적으로 [${data.title}] 회의가 일정에 등록되었습니다.`, 'success');
      setNewTitle('');
      setNewDesc('');
      loadMeetings();
      setCurrentTab('schedule');
    } catch (err) {
      showToast(`[서버 에러] ${err.message}`, 'danger');
    }
  };

  // Reschedule date/time (Error 2 Trigger)
  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!editDate || !editTime) return;

    try {
      const res = await fetch(`/api/meetings/${editingMeetingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editDate,
          time: editTime
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast('회의 일정이 변경 저장되었습니다. (캘린더 중복 확인)', 'warning');
      setEditingMeetingId(null);
      loadMeetings();
    } catch (err) {
      showToast('일정 변경 실패', 'danger');
    }
  };

  // Delete Meeting
  const handleDeleteMeeting = async (id) => {
    try {
      const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('회의 일정이 삭제되었습니다.', 'info');
        loadMeetings();
      }
    } catch (err) {
      showToast('회의 삭제 통신 실패', 'danger');
    }
  };

  // Start / Join meeting room
  const handleJoinMeeting = (meeting) => {
    setSelectedMeetingId(meeting.id);
    setParticipants([...meeting.participants]);
    setParticipantsCount(meeting.participants.length);
    setChatMessages([
      { id: 'c-1', user: meeting.host, text: `[${meeting.title}] 회의실이 생성되었습니다.`, time: meeting.time },
      { id: 'c-2', user: 'System', text: '모두가 연결되었습니다. 마이크와 웹캠을 켜주세요.', time: meeting.time }
    ]);
    setIsScreenSharing(false);
    setCurrentTab('room');
  };

  // Remove participant from active meeting (Error 1 Logic)
  const handleRemoveParticipant = (name) => {
    setParticipants(prev => prev.filter(p => p !== name));

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 참가자 목록에서 특정 인원을 내보내면 화면의 참가자 목록에서는 지워지지만, 
    // 상단 룸 정보 영역에 띄워주는 전체 참가자 카운트 숫자 배지(participantsCount)는 차감(감산)하지 않고 
    // 기존에 세팅된 값을 그대로 유지하게 만들어 수량 불일치 결함을 형성합니다.
    // 원래 있어야 할 차감 연산 누락:
    // setParticipantsCount(prev => prev - 1);

    showToast(`${name} 님이 회의실에서 퇴장 조치되었습니다.`, 'warning');
  };

  // Add participant to active meeting
  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (!newInviteName.trim()) return;

    if (participants.includes(newInviteName)) {
      showToast('이미 회의에 참가 중인 동료입니다.', 'warning');
      return;
    }

    setParticipants(prev => [...prev, newInviteName]);
    setParticipantsCount(prev => prev + 1);
    
    // Add join message to chat
    const timeNow = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, {
      id: `chat-join-${Date.now()}`,
      user: 'System',
      text: `${newInviteName} 님이 회의실에 참여하셨습니다.`,
      time: timeNow
    }]);

    setNewInviteName('');
    showToast(`${newInviteName} 님을 회의실에 초대했습니다.`, 'success');
  };

  // Post chat message
  const handlePostChatMessage = (e) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    const timeNow = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: `chat-${Date.now()}`,
      user: '나 (호스트)',
      text: chatInputText,
      time: timeNow
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInputText('');
  };

  // Tab change inside meeting room (Error 4 Logic)
  const handleRightTabChange = (tabName) => {
    setRightPanelTab(tabName);

    if (tabName === 'chat' && chatMessages.length > 0) {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 화상 회의실 내부에서 채팅 탭과 참가자 목록 탭을 왔다갔다 변환할 때, 
      // 채팅 탭으로 돌아오는 이벤트 시점마다 현재 채팅 메시지 배열의 최하단에 있는 
      // 마지막 메시지 요소를 복제하여 리스트 맨 끝에 중복 추가해 렌더링되게 만듭니다.
      const lastMsg = chatMessages[chatMessages.length - 1];
      setChatMessages(prev => [...prev, { ...lastMsg, id: `chat-dup-${Date.now()}` }]);
    }
  };

  // Sync / Refresh recordings catalog (Error 5 Trigger)
  const handleSyncRecordings = async () => {
    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: '녹화 파일 다시 불러오기' 단추 클릭 시 백엔드에 라우팅 맵핑이 부재한 
    // '/api/recordings/sync-v3'를 fetch 요청하여 고의로 HTTP 404 상태 오류를 발생시킵니다.
    try {
      const res = await fetch('/api/recordings/sync-v3');
      if (!res.ok) throw new Error(`HTTP Status ${res.status}`);
      showToast('녹화 보관함이 서버와 동기화되었습니다.', 'success');
    } catch (err) {
      showToast(`[네트워크 에러] 동기화 실패: ${err.message}`, 'danger');
    }
  };

  // Save Mock Recording (Error 6 Trigger)
  const handleSaveRecording = async (meeting) => {
    try {
      const res = await fetch('/api/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: meeting.id,
          title: meeting.title
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast('녹화 파일이 인프라 서버 보관소에 최종 전송 저장되었습니다.', 'success');
      loadRecordings();
    } catch (err) {
      showToast(`[인프라 저장 실패] ${err.message}`, 'danger');
    }
  };

  const handleResetSandbox = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        showToast('MeetDeck 회의실 통합 샌드박스가 초기화되었습니다.', 'warning');
        loadMeetings();
        loadRecordings();
        setCurrentTab('schedule');
      }
    } catch (err) {
      showToast('초기화 API 에러', 'danger');
    }
  };

  // Calendar dates grouping (Mon to Sun of 2026-07-13 week)
  const weekDays = [
    { date: "2026-07-13", label: "13일 (월)" },
    { date: "2026-07-14", label: "14일 (화)" },
    { date: "2026-07-15", label: "15일 (수)" },
    { date: "2026-07-16", label: "16일 (목)" },
    { date: "2026-07-17", label: "17일 (금)" },
    { date: "2026-07-18", label: "18일 (토)" },
    { date: "2026-07-19", label: "19일 (일)" }
  ];

  const getMeetingsForDate = (dateString) => {
    return meetings.filter(m => m.date === dateString);
  };

  const activeMeeting = meetings.find(m => m.id === selectedMeetingId) || { title: '알 수 없는 회의', host: '호스트 정보 없음' };

  return (
    <div className="meetdeck-app">
      
      {/* Top Banner Header */}
      <header className="app-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 10l5-5v14l-5-5V10zm-9 4h6v3H6v-3zm0-5h6v3H6V9zm-2 9h10a2 2 0 002-2V8a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="logo-title">MeetDeck</span>
          <span className="logo-subtitle">화상회의 관제 스케줄러</span>
        </div>

        <nav className="header-nav">
          <button type="button" onClick={() => setCurrentTab('schedule')} className={currentTab === 'schedule' ? 'active' : ''}>
            🗓️ 주간 스케줄
          </button>
          <button type="button" onClick={() => setCurrentTab('create')} className={currentTab === 'create' ? 'active' : ''}>
            ➕ 새 회의 개설
          </button>
          <button type="button" onClick={() => setCurrentTab('recordings')} className={currentTab === 'recordings' ? 'active' : ''}>
            📹 녹화본 보관함
          </button>
        </nav>

        <div className="header-actions">
          <button type="button" onClick={handleResetSandbox} className="reset-sandbox-btn">
            ⚠️ 샌드박스 초기화
          </button>
        </div>
      </header>

      {/* TAB 1: WEEKLY CALENDAR SCHEDULE */}
      {currentTab === 'schedule' && (
        <div className="schedule-workspace-layout">
          
          {/* Left Column: Meeting list by day */}
          <aside className="panel-section meetings-timeline-sidebar">
            <div className="panel-header">
              <h3>📋 등록된 화상 회의 목록</h3>
            </div>
            
            <div className="timeline-meetings-scroll">
              {meetings.map(meet => (
                <div key={meet.id} className="timeline-meet-card">
                  <div className="card-top">
                    <span className="time-lbl">⏰ {meet.date} {meet.time} ({meet.duration}분)</span>
                    <span className="host-lbl">진행: {meet.host}</span>
                  </div>
                  <h4>{meet.title}</h4>
                  <p className="desc-lbl">{meet.description}</p>
                  
                  <div className="card-action-bar">
                    <button type="button" onClick={() => handleJoinMeeting(meet)} className="join-btn">
                      🚪 입장하기
                    </button>
                    <button type="button" onClick={() => {
                      setEditingMeetingId(meet.id);
                      setEditDate(meet.date);
                      setEditTime(meet.time);
                    }} className="resched-btn">
                      시간 변경
                    </button>
                    <button type="button" onClick={() => handleDeleteMeeting(meet.id)} className="delete-btn">
                      &times;
                    </button>
                  </div>
                </div>
              ))}

              {meetings.length === 0 && (
                <p className="empty-hint">등록된 회의 스케줄이 존재하지 않습니다.</p>
              )}
            </div>
          </aside>

          {/* Center Column: Weekly Grid */}
          <main className="panel-section weekly-calendar-main">
            <div className="panel-header-row">
              <h2>🗓️ 주간 예약 현황 (2026년 7월 2째주)</h2>
              <p className="info-badge">총 {meetings.length}건 예약됨</p>
            </div>

            {/* Time Reschedule Panel */}
            {editingMeetingId && (
              <form onSubmit={handleReschedule} className="inline-reschedule-form">
                <h4>⏰ 선택된 회의의 일정을 조율합니다.</h4>
                <div className="form-row">
                  <div className="input-group">
                    <label>날짜 변경</label>
                    <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>시작 시각</label>
                    <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} required />
                  </div>
                  <div className="btn-group">
                    <button type="submit" className="save-btn">변경 저장 (Error 2)</button>
                    <button type="button" onClick={() => setEditingMeetingId(null)} className="cancel-btn">취소</button>
                  </div>
                </div>
              </form>
            )}

            <div className="weekly-calendar-grid">
              {weekDays.map(day => {
                const dayMeets = getMeetingsForDate(day.date);
                return (
                  <div key={day.date} className="calendar-day-column">
                    <div className="day-header-pill">
                      {day.label}
                    </div>
                    
                    <div className="day-cells-stack">
                      {dayMeets.map(m => (
                        <div key={m.id} className="calendar-meeting-block" onClick={() => handleJoinMeeting(m)}>
                          <span className="block-time">{m.time}</span>
                          <span className="block-title">{m.title}</span>
                          <span className="block-host">{m.host}</span>
                        </div>
                      ))}
                      
                      {dayMeets.length === 0 && (
                        <div className="empty-cell-block">예약 없음</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

        </div>
      )}

      {/* TAB 2: CREATE MEETING (SEPARATE PANEL) */}
      {currentTab === 'create' && (
        <div className="panel-section create-meeting-panel">
          <div className="panel-header">
            <h2>➕ 신규 화상 회의 예약 패널</h2>
          </div>

          <form onSubmit={handleCreateMeeting} className="create-meeting-form">
            <div className="form-grid-two">
              <div className="form-group">
                <label>회의 제목 (제목 비고 설명만 기입 시 Error 3 발생)</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="예: 4분기 예산 계획 안 조율 회의"
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label>개설 호스트 성명</label>
                <input 
                  type="text" 
                  value={newHost} 
                  onChange={(e) => setNewHost(e.target.value)} 
                  className="form-input" 
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>회의 아젠다 및 상세 설명</label>
              <textarea 
                value={newDesc} 
                onChange={(e) => setNewDesc(e.target.value)} 
                placeholder="회의 주요 안건을 적어주세요."
                rows="4"
                className="form-textarea"
              ></textarea>
            </div>

            <div className="form-grid-three">
              <div className="form-group">
                <label>회의 날짜</label>
                <input 
                  type="date" 
                  value={newDate} 
                  onChange={(e) => setNewDate(e.target.value)} 
                  className="form-input" 
                  required
                />
              </div>

              <div className="form-group">
                <label>시작 시각</label>
                <input 
                  type="time" 
                  value={newTime} 
                  onChange={(e) => setNewTime(e.target.value)} 
                  className="form-input" 
                  required
                />
              </div>

              <div className="form-group">
                <label>진행 예상 시간 (분)</label>
                <select 
                  value={newDuration} 
                  onChange={(e) => setNewDuration(e.target.value)} 
                  className="form-select"
                >
                  <option value="30">30분</option>
                  <option value="45">45분</option>
                  <option value="60">1시간</option>
                  <option value="90">1시간 30분</option>
                  <option value="120">2시간</option>
                </select>
              </div>
            </div>

            <div className="form-actions-row">
              <button type="submit" className="submit-create-btn">
                💾 스케줄 표에 신규 예약 저장 등록
              </button>
              <button type="button" onClick={() => setCurrentTab('schedule')} className="cancel-create-btn">
                취소하고 캘린더로 가기
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: RECORDINGS ARCHIVES */}
      {currentTab === 'recordings' && (
        <div className="panel-section recordings-archives-panel">
          <div className="panel-header-row">
            <h2>📹 지난 화상 회의 녹화 보관소</h2>
            <button type="button" onClick={handleSyncRecordings} className="sync-recordings-btn">
              🔄 녹화 파일 다시 불러오기 (Error 5)
            </button>
          </div>

          <div className="recordings-grid">
            {recordings.map(rec => (
              <div key={rec.id} className="recording-card">
                <div className="card-media-mock">
                  <span className="play-ic">▶</span>
                  <span className="badge-dur">{rec.duration}</span>
                </div>
                <div className="card-info">
                  <h4>{rec.filename}</h4>
                  <p>녹화 일자: {rec.date} | 용량: {rec.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONFERENCE ROOM UI */}
      {currentTab === 'room' && (
        <div className="meeting-room-stage-layout">
          
          {/* Central Call Tiles */}
          <main className="panel-section call-tiles-container">
            <div className="room-info-bar">
              <div className="title-section">
                <span className="live-tag">LIVE</span>
                <h3>{activeMeeting.title}</h3>
              </div>

              <div className="participants-badge-summary">
                {/* Error 1: Renders participantsCount instead of participants.length */}
                👥 활성 참가자 수: <strong className="num-count">{participantsCount}명</strong>
              </div>

              <button type="button" onClick={() => handleSaveRecording(activeMeeting)} className="mock-save-rec-btn">
                🔴 회의 녹화본 저장 (Error 6)
              </button>
            </div>

            {/* Grid of User Webcams */}
            <div className="webcam-tiles-grid">
              
              {/* Screen Share Tile (if enabled) */}
              {isScreenSharing && (
                <div className="webcam-tile screen-share-tile">
                  <div className="video-mock screen-sharing-glow">
                    <span className="avatar">🖥️</span>
                    <p className="name-tag">나의 화면 공유 중</p>
                  </div>
                </div>
              )}

              {/* Participants Tiles */}
              {participants.map((person, idx) => (
                <div key={idx} className="webcam-tile">
                  <div className="video-mock">
                    <span className="avatar">👤</span>
                    <p className="name-tag">{person} {idx === 0 ? '(호스트)' : ''}</p>
                    <div className="status-overlay">
                      <span className="indicator mic-on">🎤 ON</span>
                      <span className="indicator cam-on">📹 LIVE</span>
                    </div>
                  </div>
                </div>
              ))}

              {participants.length === 0 && (
                <div className="empty-room-placeholder">
                  아무도 참여하지 않은 회의실입니다. 오른쪽에서 동료를 초대하세요.
                </div>
              )}
            </div>

            {/* Conference control bar */}
            <div className="conference-control-bar">
              <button 
                type="button" 
                onClick={() => setIsScreenSharing(!isScreenSharing)} 
                className={`control-btn ${isScreenSharing ? 'active' : ''}`}
              >
                {isScreenSharing ? '🛑 공유 중단' : '🖥️ 화면 공유'}
              </button>
              <button type="button" className="control-btn mic">🎤 음소거</button>
              <button type="button" className="control-btn cam">📹 카메라 끄기</button>
              <button type="button" onClick={() => {
                setCurrentTab('schedule');
                showToast('회의실 퇴장 완료.', 'info');
              }} className="control-btn leave-call">
                ❌ 회의 종료 및 나가기
              </button>
            </div>
          </main>

          {/* Right Panel: Chat & Participants Tab switch */}
          <aside className="panel-section room-side-control-panel">
            <div className="side-tabs-header">
              <button 
                type="button" 
                onClick={() => handleRightTabChange('chat')} 
                className={rightPanelTab === 'chat' ? 'active' : ''}
              >
                💬 회의 채팅
              </button>
              <button 
                type="button" 
                onClick={() => handleRightTabChange('participants')} 
                className={rightPanelTab === 'participants' ? 'active' : ''}
              >
                👥 참가자 ({participants.length})
              </button>
            </div>

            {/* CHAT TAB PANEL */}
            {rightPanelTab === 'chat' && (
              <div className="tab-pane-content chat-pane">
                <div className="messages-history-box">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="chat-bubble-row">
                      <div className="meta">
                        <span className="user">{msg.user}</span>
                        <span className="time">{msg.time}</span>
                      </div>
                      <p className="text">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handlePostChatMessage} className="chat-input-bar">
                  <input 
                    type="text" 
                    placeholder="채팅 메시지를 전송하세요..." 
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    className="msg-input"
                  />
                  <button type="submit" className="msg-send-btn">전송</button>
                </form>
              </div>
            )}

            {/* PARTICIPANTS INVITE & LIST TAB PANEL */}
            {rightPanelTab === 'participants' && (
              <div className="tab-pane-content participants-pane">
                
                <form onSubmit={handleAddParticipant} className="invite-colleague-form">
                  <div className="invite-row">
                    <input 
                      type="text" 
                      placeholder="초대할 동료 이름..." 
                      value={newInviteName}
                      onChange={(e) => setNewInviteName(e.target.value)}
                      className="invite-input"
                    />
                    <button type="submit" className="invite-btn">초대</button>
                  </div>
                </form>

                <ul className="participants-list-stack">
                  {participants.map((person, idx) => (
                    <li key={idx} className="participant-item">
                      <span>👤 {person}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveParticipant(person)} 
                        className="kick-btn"
                        title="회의실 퇴장 조치"
                      >
                        퇴장 (Error 1)
                      </button>
                    </li>
                  ))}
                </ul>

              </div>
            )}

          </aside>

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
