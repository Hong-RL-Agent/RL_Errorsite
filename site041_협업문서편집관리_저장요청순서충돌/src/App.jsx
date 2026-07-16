import React, { useState, useEffect } from 'react';

export default function App() {
  // Session / User state
  const [currentUser, setCurrentUser] = useState('User A');

  // Documents and comments databases
  const [documents, setDocuments] = useState([]);
  const [comments, setComments] = useState([]);
  const [versions, setVersions] = useState([]);

  // Active view states
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace' | 'recent' | 'trash'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [selectedDocId, setSelectedDocId] = useState(null);
  
  // Editor panel local inputs
  const [editorTitle, setEditorTitle] = useState('');
  const [editorBody, setEditorBody] = useState('');
  
  // Right panel states
  const [rightPanelTab, setRightPanelTab] = useState('comments'); // 'comments' | 'versions' | 'share'
  const [commentText, setCommentText] = useState('');

  // Favorites index-based mapping (Error 2 target)
  const [favoritesByIndex, setFavoritesByIndex] = useState(new Array(12).fill(false));
  const [isNameSorted, setIsNameSorted] = useState(false);

  // Stale comments cache reference (Error 4 target)
  const [lastViewedDocIdForComments, setLastViewedDocIdForComments] = useState('doc-01');

  // Alert toasts
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadDocuments();
    loadComments();
  }, []);

  // Update editor states when selected document changes
  useEffect(() => {
    if (selectedDocId) {
      const activeDoc = documents.find(d => d.id === selectedDocId);
      if (activeDoc) {
        setEditorTitle(activeDoc.title);
        setEditorBody(activeDoc.body);
        
        // Update comments target references
        setLastViewedDocIdForComments(activeDoc.id);
        
        // Load version history
        loadVersions(activeDoc.id);
      }
    }
  }, [selectedDocId]);

  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data);
      
      // Map favorite flags to index positions for Error 2
      const favs = data.map(d => d.isFavorite);
      setFavoritesByIndex(favs);

      // Auto select first document if none selected
      if (data.length > 0 && !selectedDocId) {
        setSelectedDocId(data[0].id);
      }
    } catch (err) {
      showToast('문서 목록 로딩 실패', 'danger');
    }
  };

  const loadComments = async () => {
    try {
      const res = await fetch('/api/comments');
      const data = await res.json();
      setComments(data);
    } catch (err) {
      showToast('댓글 데이터 로딩 실패', 'danger');
    }
  };

  const loadVersions = async (id) => {
    try {
      const res = await fetch(`/api/documents/${id}/versions`);
      const data = await res.json();
      setVersions(data);
    } catch (err) {
      setVersions([]);
    }
  };

  const showToast = (message, type = 'info', actionCallback = null, actionLabel = '') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, actionCallback, actionLabel }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5500);
  };

  // Switch Active User (Error 4 Trigger)
  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    showToast(`${user} 계정으로 위임 전환되었습니다.`, 'success');

    // INTENTIONAL_ERROR
    // CATEGORY: Session + Frontend
    // DESCRIPTION: 사용자 로그아웃 후 다른 계정(User B)으로 세션을 전환할 때, 
    // 왼쪽 문서 스택과 본문 권한은 새 정보에 맞춰 렌더링되지만, 
    // 우측의 댓글 탭 데이터(`comments`)와 연결된 문서 ID 레퍼런스(`lastViewedDocIdForComments`)는 
    // 갱신을 생략하여 사용자 A가 보고 있던 댓글 캐시 내용을 화면에 그대로 유출시킵니다.
    // 이 상태에서 댓글을 남기면 B가 보고 있는 문서가 아닌 A가 보던 이전 꼬인 문서 ID로 전송됩니다.
  };

  // Filtered documents list helper
  const getFilteredDocs = () => {
    let list = [];
    if (activeTab === 'workspace') {
      list = documents.filter(d => !d.inTrash);
    } else if (activeTab === 'recent') {
      list = documents.filter(d => !d.inTrash).slice(0, 4); // recent 4 items
    } else if (activeTab === 'trash') {
      list = documents.filter(d => d.inTrash);
    }

    // Sort by name if name sort is checked
    if (isNameSorted) {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  };

  // Toggle favorite star icon (Error 2 Logic)
  const handleToggleFavorite = (doc, displayIndex) => {
    // Find the original index of this document in the database order (unsorted)
    const originalIndex = documents.findIndex(d => d.id === doc.id);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend + Database
    // DESCRIPTION: 즐겨찾기 상태를 문서의 ID가 아니라 현재 화면 렌더링 리스트의 
    // 배열 인덱스 위치(favoritesByIndex[index])를 기준으로 매핑해버립니다. 
    // 이로 인해 이름순 정렬 수행 직후 별표 표시가 엉뚱한 위치의 다른 문서 위로 이동해 버립니다.
    // 또한 그 꼬인 상태에서 별표를 해제하면, 화면 인덱스 상태는 해제되나 
    // 백엔드 싱크 API는 원본 문서 데이터베이스 인덱스(originalIndex)를 타겟하여 
    // 엉뚱한 원래 문서의 즐겨찾기를 실제 삭제/변경해버리는 결과적 모순을 초래합니다.
    setFavoritesByIndex(prev => {
      const next = [...prev];
      next[displayIndex] = !next[displayIndex];
      return next;
    });

    // Send favorite state update to server based on selected document ID
    fetch(`/api/documents/${doc.id}/favorite`, { method: 'POST' });
    showToast('즐겨찾기 상태가 동기화되었습니다.', 'info');
  };

  // Create new document
  const handleCreateDocument = async () => {
    try {
      const tempId = `doc-${Date.now()}`;
      const newDoc = {
        id: tempId,
        title: "제목 없는 신규 문서",
        author: currentUser,
        body: "여기에 내용을 입력해 주세요...",
        isFavorite: false,
        inTrash: false,
        permission: "Edit",
        modifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };

      setDocuments(prev => [newDoc, ...prev]);
      setSelectedDocId(tempId);
      showToast('새 문서 블록이 개설되었습니다.', 'success');
    } catch (err) {
      showToast('문서 개설 통신 실패', 'danger');
    }
  };

  // Move document to Trash (Error 3 Logic)
  const handleMoveToTrash = async (docId) => {
    // 1. UI local state update (Looks like it moved to trash immediately)
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, inTrash: true } : d));
    
    // 2. Dispatch delayed API request to server
    fetch(`/api/documents/${docId}/trash`, { method: 'POST' });

    // Show toast with undo/restore action trigger
    showToast(
      '문서가 휴지통으로 이동했습니다.',
      'warning',
      () => handleRestoreDocumentImmediately(docId),
      '실행 취소(복원)'
    );
  };

  // Immediately Restore from Trash (Error 3 Race Trigger)
  const handleRestoreDocumentImmediately = async (docId) => {
    // 1. UI updates local state immediately (Looks like it came back)
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, inTrash: false } : d));

    // 2. Dispatch restore API request (Fast 200ms write)
    fetch(`/api/documents/${docId}/restore`, { method: 'POST' });

    showToast('문서 복원 요청을 완료했습니다.', 'success');
  };

  // Duplicate Document
  const handleDuplicateDocument = async (docId) => {
    try {
      const res = await fetch(`/api/documents/${docId}/duplicate`, { method: 'POST' });
      if (res.ok) {
        showToast('문서가 정상적으로 사본으로 복제되었습니다.', 'success');
        loadDocuments();
      }
    } catch (err) {
      showToast('문서 복제 실패', 'danger');
    }
  };

  // Save Title and Body (Error 1 Logic)
  const handleSaveDocument = async () => {
    if (!selectedDocId) return;

    // Immediately update UI states to look fully saved
    setDocuments(prev => prev.map(d => d.id === selectedDocId ? { ...d, title: editorTitle, body: editorBody } : d));

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend + Network
    // DESCRIPTION: 문서 임시 저장 시 제목(Title)과 본문(Body) 저장 요청을 
    // 비동기식으로 동시에 전송하되, 제목 요청에는 이전 본문 상태(oldBody)를 첨부하고 
    // 백엔드 상에서 4초 지연을 발생시키며, 본문 요청은 1초 후에 끝나도록 설계합니다.
    // 이 경우 본문 저장은 1초 뒤에 먼저 완료되고, 제목 저장은 4초 후에 늦게 완료되면서 
    // 동봉되었던 옛날 본문으로 데이터를 덮어써 새로고침 시 변경된 본문 내용이 증발하게 됩니다.
    const currentDoc = documents.find(d => d.id === selectedDocId);
    const oldBodySnapshot = currentDoc ? currentDoc.body : '';

    // Fetch Request 1: Title change (Stale body + 4s delay on backend)
    fetch(`/api/documents/${selectedDocId}/title`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editorTitle, body: oldBodySnapshot })
    });

    // Fetch Request 2: Body change (1s delay on backend)
    fetch(`/api/documents/${selectedDocId}/body`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: editorBody })
    });

    showToast('저장 중... (완료 순서 뒤집힘 발생)', 'warning');
  };

  // Add Comment (Error 4 Comment submission ID bug)
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: `c-local-${Date.now()}`,
      docId: lastViewedDocIdForComments, // INTENTIONAL_ERROR: Uses the cached lastViewedDocIdForComments
      author: currentUser,
      text: commentText,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    // Synchronize to backend database
    fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComment)
    });

    setComments(prev => [...prev, newComment]);
    setCommentText('');
    showToast(`댓글이 [문서: ${lastViewedDocIdForComments}] 타겟으로 등록되었습니다.`, 'success');
  };

  // Change Document Permission Level
  const handleChangePermission = async (perm) => {
    try {
      const res = await fetch(`/api/documents/${selectedDocId}/permission`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission: perm })
      });
      if (res.ok) {
        showToast(`공유 권한이 [${perm}] (으)로 변경되었습니다.`, 'info');
        loadDocuments();
      }
    } catch (err) {
      showToast('권한 변경 통신 에러', 'danger');
    }
  };

  const handleResetSandbox = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        showToast('DocuNest 협업 환경 샌드박스가 초기화되었습니다.', 'warning');
        loadDocuments();
        loadComments();
        setActiveTab('workspace');
      }
    } catch (err) {
      showToast('초기화 API 에러', 'danger');
    }
  };

  // Filtered comments for right pane
  // Normally: comments.filter(c => c.docId === selectedDocId)
  // To match Error 4: we render based on lastViewedDocIdForComments which might be stale!
  const displayComments = comments.filter(c => c.docId === lastViewedDocIdForComments);

  const activeDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="docunest-app">
      
      {/* Top Banner Control bar */}
      <header className="app-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="logo-title">DocuNest</span>
          <span className="logo-subtitle">팀 협업 지식 저장소</span>
        </div>

        <div className="header-actions">
          {/* User Swapping */}
          <div className="user-swapping-box">
            <span className="user-indicator">👤 현재 로그인: <strong>{currentUser}</strong></span>
            <button 
              type="button" 
              onClick={() => handleSwitchUser(currentUser === 'User A' ? 'User B' : 'User A')}
              className="switch-user-btn"
            >
              계정 스위칭 (Error 4)
            </button>
          </div>

          <button type="button" onClick={handleResetSandbox} className="reset-sandbox-btn">
            ⚠️ 초기화
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="workspace-main-grid">
        
        {/* Left Column: Sidebar with document trees */}
        <aside className="panel-section sidebar-tree-panel">
          <div className="panel-header-row">
            <h3>📂 워크스페이스 문서 트리</h3>
            <button type="button" onClick={handleCreateDocument} className="new-doc-btn">
              📝 작성
            </button>
          </div>

          <div className="sidebar-filter-tabs">
            <button type="button" onClick={() => setActiveTab('workspace')} className={activeTab === 'workspace' ? 'active' : ''}>
              모든 문서
            </button>
            <button type="button" onClick={() => setActiveTab('recent')} className={activeTab === 'recent' ? 'active' : ''}>
              최근 편집
            </button>
            <button type="button" onClick={() => setActiveTab('trash')} className={activeTab === 'trash' ? 'active' : ''}>
              휴지통
            </button>
          </div>

          {/* Sorting Option */}
          <div className="sorting-checkbox-row">
            <label>
              <input 
                type="checkbox" 
                checked={isNameSorted} 
                onChange={(e) => setIsNameSorted(e.target.checked)} 
              />
              🔤 가나다 이름순 정렬하기
            </label>
          </div>

          {/* List of files in sidebar tree */}
          <ul className="doc-tree-stack">
            {getFilteredDocs().map((doc, idx) => (
              <li 
                key={doc.id} 
                className={`tree-item ${selectedDocId === doc.id ? 'active' : ''}`}
                onClick={() => setSelectedDocId(doc.id)}
              >
                <span className="file-icon">📄</span>
                <span className="file-name">{doc.title}</span>
                
                {/* Favorite Star */}
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(doc, idx);
                  }}
                  className={`fav-star-btn ${favoritesByIndex[idx] ? 'favorited' : ''}`}
                  title="즐겨찾기 토글 (Error 2)"
                >
                  {favoritesByIndex[idx] ? '★' : '☆'}
                </button>
              </li>
            ))}

            {getFilteredDocs().length === 0 && (
              <p className="empty-tree-msg">조건에 매칭되는 문서가 없습니다.</p>
            )}
          </ul>
        </aside>

        {/* Center Column: Rich Document Editor */}
        <main className="panel-section document-editor-panel">
          {activeDoc ? (
            <div className="editor-container">
              
              {/* Tool Actions */}
              <div className="editor-controls-row">
                <span className="author-lbl">✍️ 작성자: {activeDoc.author}</span>
                <span className="perm-lbl">🔒 권한 레벨: {activeDoc.permission}</span>
                
                <div className="btn-actions-group">
                  <button type="button" onClick={() => handleDuplicateDocument(activeDoc.id)} className="tool-btn">
                    📋 사본 복제
                  </button>
                  <button type="button" onClick={() => handleMoveToTrash(activeDoc.id)} className="tool-btn trash">
                    🗑️ 휴지통 이동 (Error 3)
                  </button>
                  <button type="button" onClick={handleSaveDocument} className="save-btn-trigger">
                    💾 즉각 저장 완료 (Error 1)
                  </button>
                </div>
              </div>

              {/* Document Editor Block Inputs */}
              <div className="editor-canvas">
                <input 
                  type="text" 
                  value={editorTitle} 
                  onChange={(e) => setEditorTitle(e.target.value)} 
                  className="editor-title-input" 
                  placeholder="문서 제목을 입력해 주세요..."
                />
                
                <div className="block-editor-helper">
                  <span className="block-tag">💡 본문 편집 블록</span>
                  <span className="block-meta">새로고침 시 Race Condition으로 인한 덮어쓰기 관측(Error 1)</span>
                </div>

                <textarea 
                  value={editorBody} 
                  onChange={(e) => setEditorBody(e.target.value)} 
                  className="editor-body-textarea" 
                  placeholder="본문 지식을 서술해 주세요..."
                  rows="14"
                ></textarea>

                {/* Simulated Editor Blocks: Checklist & Table */}
                <div className="simulated-blocks-container">
                  <h4>☑️ 협업 마일스톤 체크리스트</h4>
                  <div className="checklist-block">
                    <label><input type="checkbox" defaultChecked /> 1차 기획안 배포 및 피드백 검토</label>
                    <label><input type="checkbox" /> 로컬 환경 동시성 교정 및 검증</label>
                    <label><input type="checkbox" /> API 병렬 저장 예외 테스트케이스 완성</label>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="empty-editor-fallback">
              <h3>📄 편집할 문서가 선택되지 않았거나 존재하지 않습니다.</h3>
              <p>왼쪽 트리에서 문서를 클릭해 열거나 '새 문서 작성' 단추를 이용해 시작하세요.</p>
            </div>
          )}
        </main>

        {/* Right Column: Comments, Version & Sharing Tab Panel */}
        <aside className="panel-section comments-versions-sidebar">
          
          <div className="sidebar-tab-menu">
            <button 
              type="button" 
              onClick={() => setRightPanelTab('comments')} 
              className={rightPanelTab === 'comments' ? 'active' : ''}
            >
              💬 댓글 ({displayComments.length})
            </button>
            <button 
              type="button" 
              onClick={() => setRightPanelTab('versions')} 
              className={rightPanelTab === 'versions' ? 'active' : ''}
            >
              ⏳ 버전
            </button>
            <button 
              type="button" 
              onClick={() => setRightPanelTab('share')} 
              className={rightPanelTab === 'share' ? 'active' : ''}
            >
              🔑 권한
            </button>
          </div>

          {/* TAB 1: COMMENTS PANEL */}
          {rightPanelTab === 'comments' && (
            <div className="tab-pane-content comments-pane">
              <div className="pane-header-title">
                <h4>💬 공동 편집용 피드백 피드</h4>
                <p className="cached-doc-alert">* 현재 활성화된 댓글 타겟: <code>{lastViewedDocIdForComments}</code></p>
              </div>

              <div className="comments-history-scroll">
                {displayComments.map(c => (
                  <div key={c.id} className="comment-bubble">
                    <div className="meta">
                      <span className="author">{c.author}</span>
                      <span className="date">{c.date}</span>
                    </div>
                    <p className="text">{c.text}</p>
                  </div>
                ))}

                {displayComments.length === 0 && (
                  <p className="empty-comments">댓글 피드백이 존재하지 않습니다.</p>
                )}
              </div>

              <form onSubmit={handleAddComment} className="comment-compose-form">
                <input 
                  type="text" 
                  placeholder="댓글 입력..." 
                  value={commentText} 
                  onChange={(e) => setCommentText(e.target.value)} 
                  className="comment-input"
                  required
                />
                <button type="submit" className="comment-submit-btn">남기기</button>
              </form>
            </div>
          )}

          {/* TAB 2: VERSIONS HISTORY PANEL */}
          {rightPanelTab === 'versions' && (
            <div className="tab-pane-content versions-pane">
              <h4>⏳ 문서 타임라인 버전 내역</h4>
              <ul className="version-list-stack">
                {versions.map((v, i) => (
                  <li key={i} className="version-item">
                    <div className="v-header">
                      <strong className="v-num">v{v.version}</strong>
                      <span className="v-author">{v.author}</span>
                    </div>
                    <p className="v-comment">{v.comment}</p>
                    <span className="v-time">{v.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB 3: SHARE PERMISSION SETTINGS */}
          {rightPanelTab === 'share' && (
            <div className="tab-pane-content share-pane">
              <h4>🔑 공유 권한 및 공동 보안 수정</h4>
              <p className="hint-txt">해당 문서에 대한 워크스페이스 팀원들의 편집 권한 단계를 조율합니다.</p>
              
              <div className="perm-select-stack">
                <button 
                  type="button" 
                  onClick={() => handleChangePermission('Edit')}
                  className={`perm-btn ${activeDoc?.permission === 'Edit' ? 'active' : ''}`}
                >
                  ✏️ 공동 편집 가능 (Edit)
                </button>
                <button 
                  type="button" 
                  onClick={() => handleChangePermission('Read')}
                  className={`perm-btn ${activeDoc?.permission === 'Read' ? 'active' : ''}`}
                >
                  👁️ 단순 뷰어 읽기 전용 (Read)
                </button>
              </div>
            </div>
          )}

        </aside>

      </div>

      {/* Floating Action Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            {t.actionCallback && (
              <button 
                type="button" 
                onClick={() => {
                  t.actionCallback();
                  setToasts(prev => prev.filter(x => x.id !== t.id));
                }}
                className="toast-action-btn"
              >
                {t.actionLabel}
              </button>
            )}
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
