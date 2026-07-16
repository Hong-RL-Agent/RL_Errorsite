import React, { useState, useEffect } from 'react';

export default function App() {
  // Session / User Switch (User A: 김철수, User B: 박영희)
  const [currentUser, setCurrentUser] = useState('user-A'); // 'user-A' | 'user-B'
  
  // Database state lists
  const [feed, setFeed] = useState([]);
  const [savedPosts, setSavedPosts] = useState(["post-01", "post-03", "post-05"]); // A's initial saves
  const [comments, setComments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Active chat details
  const [activeRoom, setActiveRoom] = useState('room-A');
  const [chatMessages, setChatMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');

  // Selected Detail Modal view
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Stepper post creation states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [newPostImage, setNewPostImage] = useState('https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&auto=format&fit=crop');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('여행');

  // Leaked state containers
  const [leakedProfile, setLeakedProfile] = useState(null);

  // UI notifications
  const [toasts, setToasts] = useState([]);
  const [activeSection, setActiveSection] = useState('feed'); // 'feed' | 'messages' | 'notifications' | 'saved'

  useEffect(() => {
    loadFeed(1);
    loadComments();
    loadNotifications();
    loadMessages(activeRoom);
  }, []);

  useEffect(() => {
    loadMessages(activeRoom);
  }, [activeRoom]);

  const loadFeed = async (page = 1) => {
    try {
      const res = await fetch(`/api/posts?page=${page}`);
      const data = await res.json();
      if (page === 1) {
        setFeed(data.results);
      } else {
        setFeed(prev => [...prev, ...data.results]);
      }
    } catch (err) {
      showToast('피드 로딩 실패', 'danger');
    }
  };

  const loadComments = async () => {
    try {
      const res = await fetch('/api/comments');
      const data = await res.json();
      setComments(data);
    } catch (err) {
      showToast('댓글 피드 로딩 실패', 'danger');
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      showToast('알림 내역 로딩 실패', 'danger');
    }
  };

  const loadMessages = async (room) => {
    try {
      const res = await fetch(`/api/messages/${room}`);
      const data = await res.json();
      setChatMessages(data);
    } catch (err) {
      showToast('메시지 내역 로딩 실패', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Switch Active User (Error 1 trigger target)
  const handleSwitchUser = (userId) => {
    setCurrentUser(userId);
    setLeakedProfile(null);
    showToast(`${userId === 'user-A' ? '김철수' : '박영희'} 세션으로 전환되었습니다.`, 'success');

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend + Cache
    // DESCRIPTION: 사용자 B로 로그인 상태가 바뀌었음에도, 
    // 좋아요 목록 캐시 및 저장한 북마크 게시물 배열(`savedPosts`)을 클리어하거나 
    // 새로 동기화하지 않고 A의 과거 캐시 데이터를 화면에 남겨둡니다.
  };

  // Unsave Post (Error 1 implementation)
  const handleUnsavePost = async (postId) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend + Cache
    // DESCRIPTION: B가 저장을 해제할 때, 화면에 남겨진 A의 캐시 정보를 기준으로 전송하게 됩니다.
    // 이에 따라 userId가 'user-A'로 강제 마킹된 채 API가 발생해, B 계정 상태임에도 A의 저장 목록이 수정됩니다.
    const targetUser = 'user-A'; 

    try {
      const res = await fetch('/api/posts/unsave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUser, postId })
      });
      if (res.ok) {
        showToast('게시물 저장 해제 처리 완료 (A의 캐시가 오염됨)', 'warning');
        setSavedPosts(prev => prev.filter(id => id !== postId));
      }
    } catch (err) {
      showToast('저장 해제 실패', 'danger');
    }
  };

  // Feed Scroll Pagination Race condition simulation (Error 2 Logic)
  const triggerPaginationRace = () => {
    setFeed([]); // Clear feed first
    
    // Page 3 fetch (0.3s fast response)
    fetch('/api/posts?page=3')
      .then(res => res.json())
      .then(data => {
        setFeed(prev => [...prev, ...data.results]);
        showToast('페이지 3 로딩 완료 (0.3초)', 'info');
      });

    // Page 2 fetch (2.0s slow response)
    setTimeout(() => {
      fetch('/api/posts?page=2')
        .then(res => res.json())
        .then(data => {
          // INTENTIONAL_ERROR
          // CATEGORY: Frontend + Network
          // DESCRIPTION: 페이지 2 응답이 가장 늦게 도착했을 때, 기존 피드의 맨 뒤가 아닌
          // 중간 지점(index 3 위치)에 억지로 이식 접합하여 순서를 파괴하고 중복 품목이 뜨게 만듭니다.
          setFeed(prev => {
            const copy = [...prev];
            copy.splice(3, 0, ...data.results);
            return copy;
          });
          showToast('페이지 2 로딩 완료 (2초 지연 - 중간 인서트 실행)', 'warning');
        });
    }, 100);
  };

  // Edit then immediately delete comment (Error 3 Logic)
  const handleEditAndImmediatelyDeleteComment = (commId, postId) => {
    // 1. Send update request (PUT, takes 3 seconds delay to write to database)
    fetch(`/api/comments/${commId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        text: "수정된 댓글 내용입니다. (수정 직후 삭제 경합 발생)",
        author: currentUser === 'user-A' ? '김철수' : '박영희'
      })
    });

    // 2. Immediately send delete request (DELETE, takes 0.1 seconds)
    setTimeout(async () => {
      const res = await fetch(`/api/comments/${commId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('댓글 삭제 응답 성공 (0.1초 완료)', 'success');
        // Update local state immediately
        setComments(prev => prev.filter(c => c.id !== commId));
      }
    }, 100);

    // Inform that PUT completes after 3 seconds, inserting the comment back in!
    setTimeout(() => {
      showToast('댓글 수정 지연 작업 완료 (디비 부활 확인)', 'warning');
      loadComments();
    }, 3500);
  };

  // Direct Message room swap race condition (Error 4 Logic)
  const handleSendMsgDemo = async () => {
    if (!typedMessage.trim()) return;

    const currentMsgText = typedMessage;
    setTypedMessage('');

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 메시지 대화 A를 연 상태에서 대화 B로 전환 직후 전송하면,
    // 화면 UI 상으로는 활성 대화방이 B로 바뀌어 전송된 것처럼 보이지만 
    // 실제 전송 API에는 이전 방 ID(room-A)로 하드코딩 바인딩되어 데이터가 A로 전달됩니다.
    const staleRoom = 'room-A'; 
    setActiveRoom('room-B');
    showToast('대화 B방으로 활성화방을 전환합니다.', 'info');

    setTimeout(async () => {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: staleRoom,
          text: currentMsgText,
          sender: currentUser === 'user-A' ? '김철수' : '박영희'
        })
      });
      showToast('메시지가 전송 완료되었습니다 (실제는 A방으로 기입됨)', 'warning');
      loadMessages('room-A');
      loadMessages('room-B');
    }, 400);
  };

  // Request Blocked user profile details (Error 5 Logic)
  const handleLoadBlockedProfile = async () => {
    try {
      const res = await fetch('/api/users/user-blocked/profile');
      const data = await res.json();
      if (res.status === 403) {
        showToast(`접근 제한: ${data.error}`, 'danger');
        // Leak the data from error response body
        setLeakedProfile({
          postCount: data.postCount,
          lastActive: data.lastActive
        });
      }
    } catch (err) {
      showToast('데이터 조회 에러', 'danger');
    }
  };

  // Post Deletion (Error 6 trigger)
  const handleDeletePost = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('게시물이 정상 삭제되었습니다.', 'success');
        setFeed(prev => prev.filter(p => p.id !== postId));
        if (selectedPostId === postId) setSelectedPostId(null);
      }
    } catch (err) {
      showToast('게시물 삭제 실패', 'danger');
    }
  };

  // Submit new Post
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    const newId = `post-${Date.now()}`;
    const newPost = {
      id: newId,
      author: currentUser === 'user-A' ? '김철수' : '박영희',
      category: newPostCategory,
      content: newPostContent,
      likes: 0,
      commentsCount: 0,
      image: newPostImage
    };

    // Insert locally and close modal
    setFeed(prev => [newPost, ...prev]);
    setShowCreateModal(false);
    setCreateStep(1);
    setNewPostContent('');
    showToast('새 피드 게시물이 등록되었습니다.', 'success');
  };

  const selectedPost = feed.find(p => p.id === selectedPostId);
  const activeComments = comments.filter(c => c.postId === selectedPostId);

  return (
    <div className="circleup-app">
      
      {/* Top Header bar */}
      <header className="app-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
          </svg>
          <span className="logo-title">CircleUp</span>
          <span className="logo-subtitle">감성 공유 네트워킹</span>
        </div>

        <div className="user-swapping-box">
          <span>👤 로그인: <strong>{currentUser === 'user-A' ? '김철수' : '박영희'}</strong></span>
          <button 
            onClick={() => handleSwitchUser(currentUser === 'user-A' ? 'user-B' : 'user-A')}
            className="switch-user-btn"
          >
            계정 위임 전환 (Error 1)
          </button>
        </div>
      </header>

      {/* Main Social Workspace: Left Nav, Center feed/chat, Right suggestions */}
      <div className="social-workspace-grid">
        
        {/* Left Side: Navigation Links */}
        <aside className="panel-section navigation-sidebar">
          <nav className="side-nav">
            <button className={activeSection === 'feed' ? 'active' : ''} onClick={() => { setActiveSection('feed'); loadFeed(1); }}>
              🏠 홈 피드 타임라인
            </button>
            <button className={activeSection === 'messages' ? 'active' : ''} onClick={() => setActiveSection('messages')}>
              💬 다이렉트 메시지 (DM)
            </button>
            <button className={activeSection === 'notifications' ? 'active' : ''} onClick={() => setActiveSection('notifications')}>
              🔔 실시간 활동 알림
            </button>
            <button className={activeSection === 'saved' ? 'active' : ''} onClick={() => setActiveSection('saved')}>
              🔖 저장된 보관함 (Error 1)
            </button>
            
            <button onClick={() => { setShowCreateModal(true); setCreateStep(1); }} className="create-post-trigger-btn">
              ➕ 새 사진 피드 올리기
            </button>
          </nav>
        </aside>

        {/* Center Side: Main Activity Feed / Message interface */}
        <main className="panel-section center-feed-area">
          
          {/* TAB 1: HOME FEED */}
          {activeSection === 'feed' && (
            <div className="feed-view-wrapper">
              <div className="feed-header-bar">
                <h2>📸 최근 공유된 피드 스토리</h2>
                <button @click={triggerPaginationRace} className="pagination-race-btn">
                  ⚡ 스크롤 페이지 2 & 3 동시 요청 (Error 2)
                </button>
              </div>

              <div className="feed-posts-stack">
                {feed.map(post => (
                  <article key={post.id} className="post-card">
                    <div className="post-author-row">
                      <div className="author-info">
                        <span className="avatar-dummy">👤</span>
                        <strong>{post.author}</strong>
                        <span className="cat-badge">{post.category}</span>
                      </div>
                      
                      {/* Delete option */}
                      <button onClick={() => handleDeletePost(post.id)} className="post-delete-btn">
                        삭제 (Error 6)
                      </button>
                    </div>

                    <img src={post.image} alt="Feed" className="post-img" />
                    
                    <div className="post-body">
                      <p className="post-content">{post.content}</p>
                      
                      <div className="post-stats">
                        <span className="stat">❤️ 좋아요 {post.likes}개</span>
                        <span className="stat" onClick={() => setSelectedPostId(post.id)}>💬 댓글 {post.commentsCount}개</span>
                      </div>

                      <div className="post-actions">
                        <button className="post-action-btn like">❤️ 좋아요</button>
                        <button onClick={() => setSelectedPostId(post.id)} className="post-action-btn comment">💬 댓글보기</button>
                        <button onClick={() => {
                          if (!savedPosts.includes(post.id)) {
                            setSavedPosts(prev => [...prev, post.id]);
                            showToast('보관함에 저장되었습니다.', 'success');
                          }
                        }} className="post-action-btn save">🔖 저장하기</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MESSAGES (DM CHAT PANEL) */}
          {activeSection === 'messages' && (
            <div className="messages-view-wrapper">
              <div className="chat-split-grid">
                
                {/* Chat Rooms list */}
                <div className="chat-rooms-list">
                  <div 
                    onClick={() => setActiveRoom('room-A')}
                    className={`room-item ${activeRoom === 'room-A' ? 'active' : ''}`}
                  >
                    <h4>💬 박영희 대화방 (A방)</h4>
                    <p>최근 활성 상태</p>
                  </div>
                  <div 
                    onClick={() => setActiveRoom('room-B')}
                    className={`room-item ${activeRoom === 'room-B' ? 'active' : ''}`}
                  >
                    <h4>💬 이민우 대화방 (B방)</h4>
                    <p>최근 활성 상태</p>
                  </div>
                </div>

                {/* Chat Dialog panel */}
                <div className="chat-dialog-panel">
                  <div className="dialog-header">
                    <h3>{activeRoom === 'room-A' ? '박영희' : '이민우'}님과의 대화</h3>
                    <button onClick={handleSendMsgDemo} className="room-swap-send-btn">
                      ⚡ B방 전환 후 즉각 메시지 전송 시뮬레이션 (Error 4)
                    </button>
                  </div>

                  <div className="dialog-messages-scroll">
                    {chatMessages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`message-bubble ${msg.sender === (currentUser === 'user-A' ? '김철수' : '박영희') ? 'me' : 'other'}`}
                      >
                        <span className="sender-lbl">{msg.sender}</span>
                        <p className="text">{msg.text}</p>
                        <span className="time">{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="dialog-input-row">
                    <input 
                      type="text" 
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      placeholder="메시지를 입력해 주세요..."
                      className="chat-input"
                    />
                    <button onClick={() => {
                      if (!typedMessage.trim()) return;
                      // Normal send
                      fetch('/api/messages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          room: activeRoom,
                          text: typedMessage,
                          sender: currentUser === 'user-A' ? '김철수' : '박영희'
                        })
                      }).then(() => {
                        setTypedMessage('');
                        loadMessages(activeRoom);
                      });
                    }} className="chat-send-btn">전송</button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: SOCIAL NOTIFICATIONS (Error 6 detail trigger) */}
          {activeSection === 'notifications' && (
            <div className="notifications-view-wrapper">
              <h2>🔔 내 계정 활동 알림 피드</h2>
              
              <div className="notifications-stack">
                {notifications.map(not => {
                  const targetPostExists = feed.find(p => p.id === not.postId);
                  
                  return (
                    <div key={not.id} className="notification-card-item">
                      <p>{not.message}</p>
                      
                      {/* Buggy Link rendering: Accessing properties of potentially deleted post (Error 6) */}
                      <div className="post-link-preview-box">
                        {/* INTENTIONAL_ERROR
                            CATEGORY: Database
                            DESCRIPTION: 삭제된 게시물의 정보(likes/notifications)가 DB에 그대로 남아있어 
                            알림창에서 링크 조회를 시도할 때, feed 목록에 없는(deleted) 게시물의 속성을 참조하여 
                            TypeError(Cannot read properties of undefined)가 화면에 유출되게 만듭니다. */}
                        {targetPostExists ? (
                          <button onClick={() => setSelectedPostId(not.postId)} className="preview-link-btn">
                            👉 게시물 원본 링크 보기: [제목: {targetPostExists.content.substring(0, 10)}...]
                          </button>
                        ) : (
                          <div className="crash-preview-tag">
                            <h4>🚨 참조 대상 리소스 파괴됨 (Error 6)</h4>
                            <p>Cannot read properties of undefined (reading 'content')</p>
                            <p className="crash-desc">서버에 남아있는 알림 데이터가 가리키는 ID [{not.postId}] 게시물이 삭제되어 뷰바인딩에 실패했습니다.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SAVED BOOKMARKS */}
          {activeSection === 'saved' && (
            <div className="saved-view-wrapper">
              <h2>🔖 내가 북마크로 저장한 게시물</h2>
              
              <div className="saved-items-grid">
                {savedPosts.map(id => {
                  const post = feed.find(p => p.id === id);
                  if (!post) return null;

                  return (
                    <div key={id} className="saved-card-item">
                      <img src={post.image} alt="Saved" className="saved-thumb" />
                      <div className="saved-info">
                        <p>{post.content.substring(0, 15)}...</p>
                        <button onClick={() => handleUnsavePost(id)} className="unsave-btn">
                          🔖 저장 취소 (Error 1)
                        </button>
                      </div>
                    </div>
                  );
                })}

                {savedPosts.length === 0 && (
                  <p className="empty-msg">보관된 게시물이 없습니다.</p>
                )}
              </div>
            </div>
          )}

        </main>

        {/* Right Side: Recommended Users & Blocked User check */}
        <aside className="panel-section suggestions-sidebar">
          
          <div className="widget-block">
            <h3>👥 추천 파트너</h3>
            <ul className="suggestions-list">
              <li>
                <strong>이민우 (개발자)</strong>
                <button className="follow-btn">팔로우</button>
              </li>
              <li>
                <strong>정다은 (요리연구가)</strong>
                <button className="follow-btn">팔로우</button>
              </li>
            </ul>
          </div>

          {/* Blocked User profile tester (Error 5) */}
          <div className="widget-block blocked-checker-widget">
            <h3>🚫 위험/차단 유저 모니터링</h3>
            <p className="blocked-user-desc">차단된 빌런 (@user-blocked)</p>
            <button onClick={handleLoadBlockedProfile} className="check-profile-btn">
              차단된 프로필 정보 요청 (Error 5)
            </button>

            {leakedProfile && (
              <div className="leaked-payload-box">
                <h5>🔥 403 에러 바디 누수 정보</h5>
                <p>누적 글 개수: <code>{leakedProfile.postCount}개</code></p>
                <p>최종 활동 시간: <code>{leakedProfile.lastActive}</code></p>
              </div>
            )}
          </div>
        </aside>

      </div>

      {/* STEPPER CREATE POST MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card stepper-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ 새 피드 포스팅 작성</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">&times;</button>
            </div>

            <div className="modal-body">
              {/* Step 1: Image URL select */}
              {createStep === 1 && (
                <div className="stepper-step">
                  <h4>1단계: 피드 커버 이미지 지정</h4>
                  <input 
                    type="text" 
                    value={newPostImage} 
                    onChange={e => setNewPostImage(e.target.value)} 
                    className="form-input" 
                    placeholder="이미지 URL을 입력하세요"
                  />
                  <div className="img-preview-box">
                    <img src={newPostImage} alt="Preview" className="preview-img" />
                  </div>
                  <button onClick={() => setCreateStep(2)} className="modal-btn next">다음 단계</button>
                </div>
              )}

              {/* Step 2: Content text edit */}
              {createStep === 2 && (
                <div className="stepper-step">
                  <h4>2단계: 본문 글귀 및 카테고리 지정</h4>
                  
                  <div className="form-group">
                    <label>카테고리</label>
                    <select value={newPostCategory} onChange={e => setNewPostCategory(e.target.value)}>
                      <option value="여행">여행</option>
                      <option value="일상">일상</option>
                      <option value="코딩">코딩</option>
                      <option value="카페">카페</option>
                      <option value="반려동물">반려동물</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>본문 내용</label>
                    <textarea 
                      value={newPostContent} 
                      onChange={e => setNewPostContent(e.target.value)} 
                      placeholder="아름다운 순간의 기록을 남겨보세요..."
                      rows="4"
                      className="form-textarea"
                    ></textarea>
                  </div>

                  <div className="nav-buttons">
                    <button onClick={() => setCreateStep(1)} className="modal-btn back">이전</button>
                    <button onClick={handleCreatePost} className="modal-btn submit">작성 완료 및 배포</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POST DETAILS AND COMMENTS MODAL */}
      {selectedPostId && selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPostId(null)}>
          <div className="modal-card detail-comments-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💬 {selectedPost.author}님의 게시물 댓글 피드</h2>
              <button onClick={() => setSelectedPostId(null)} className="close-btn">&times;</button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <img src={selectedPost.image} alt="Post" className="modal-detail-img" />
                <p className="modal-post-txt">{selectedPost.content}</p>
              </div>

              <div className="comments-section">
                <h4>댓글 목록</h4>
                <div className="comments-scroll">
                  {activeComments.map(c => (
                    <div key={c.id} className="comment-bubble">
                      <div className="comm-header">
                        <strong>{c.author}</strong>
                        <button 
                          onClick={() => handleEditAndImmediatelyDeleteComment(c.id, selectedPostId)}
                          className="comm-edit-del-btn"
                        >
                          수정 후 즉시 삭제 (Error 3)
                        </button>
                      </div>
                      <p className="text">{c.text}</p>
                    </div>
                  ))}

                  {activeComments.length === 0 && (
                    <p className="empty-msg">첫 댓글을 남겨보세요!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
