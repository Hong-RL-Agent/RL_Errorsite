import React, { useState, useEffect } from 'react';

export default function App() {
  // Master lists loaded from backend
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]); // Database source of truth
  const [kanbanTasks, setKanbanTasks] = useState([]); // UI rendering state (Error 1 Target)
  const [comments, setComments] = useState([]);
  const [logs, setLogs] = useState([]);

  // Form & View states
  const [selectedProjectId, setSelectedProjectId] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Creation fields
  const [newProjectName, setNewProjectName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('박현우 개발자');

  // Comment inputs
  const [newCommentAuthor, setNewCommentAuthor] = useState('박현우 개발자');
  const [newCommentContent, setNewCommentContent] = useState('');

  // Task Details Local state (Error 4 Target)
  const [selectedAssigneeLocal, setSelectedAssigneeLocal] = useState('');
  const [selectedDueLocal, setSelectedDueLocal] = useState('');

  // Spinner states for logs (Error 6 Target)
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [refreshClickCount, setRefreshClickCount] = useState(0);

  // File uploading states (Error 5 Target)
  const [attachedFile, setAttachedFile] = useState(null);
  const [isFileUploading, setIsFileUploading] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadProjects();
    loadTasks();
    loadComments();
    loadLogs();
  }, []);

  // Sync kanbanTasks display state with filtered master list when filters change
  // Note: Changing filters re-reads from the master list (tasks), reverting unsaved changes!
  useEffect(() => {
    // Re-filter from master source of truth (tasks)
    let list = [...tasks];
    if (selectedProjectId !== 'All') {
      list = list.filter(t => t.projectId === selectedProjectId);
    }
    if (priorityFilter !== 'All') {
      list = list.filter(t => t.priority === priorityFilter);
    }
    setKanbanTasks(list);
  }, [selectedProjectId, priorityFilter, tasks]);

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      showToast('프로젝트 목록 로드 실패', 'danger');
    }
  };

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
      setKanbanTasks(data);
    } catch (err) {
      showToast('업무 목록 조회 실패', 'danger');
    }
  };

  const loadComments = async () => {
    try {
      const res = await fetch('/api/comments');
      const data = await res.json();
      setComments(data);
    } catch (err) {
      showToast('댓글 데이터 로드 실패', 'danger');
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      showToast('활동 로그 조회 실패', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const activeTask = tasks.find(t => t.id === selectedTaskId);
  const activeTaskComments = comments.filter(c => c.taskId === selectedTaskId);

  // Reinitialize local states when active task panel is selected
  useEffect(() => {
    if (activeTask) {
      setSelectedAssigneeLocal(activeTask.assignee);
      setSelectedDueLocal(activeTask.due);
    }
  }, [selectedTaskId, activeTask]);

  // Create Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`새 프로젝트 '${newProjectName}'이 개설되었습니다.`, 'success');
        setNewProjectName('');
        loadProjects();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  // Create Task (Error 2 targets title blank & desc filled)
  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
          projectId: selectedProjectId === 'All' ? 'proj-1' : selectedProjectId,
          priority: newTaskPriority,
          assignee: newTaskAssignee
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '업무 추가 에러');
      }

      showToast(`신규 업무 카드 '${data.title}'가 발급되었습니다.`, 'success');
      setNewTaskTitle('');
      setNewTaskDescription('');
      loadTasks();
      loadLogs();
    } catch (err) {
      showToast(`[오류 발생] ${err.message}`, 'danger');
    }
  };

  // Move status (Error 1: Only visual update, master list 'tasks' not synced)
  const handleMoveStatus = (taskId, newStatus) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 칸반 보드 상에서 카드의 작업 단계(status)를 다른 열로 이동시킬 때, 
    // 렌더링에 직접 쓰이는 화면 전시용 배열(kanbanTasks)만 수정하고 
    // 마스터 원본 배열(tasks)이나 백엔드 DB 상태를 갱신하지 않고 스킵합니다.
    // 이로 인해 상단 필터 변경 등으로 리스트가 재구조화될 때 이전 상태 열로 롤백 복원되는 결함을 유발합니다.
    setKanbanTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));
    
    showToast('업무 카드가 임시 이동되었습니다. (필터 변경 시 보존 여부 검증 요망)', 'warning');
  };

  // Error 4: Assignee local dropdown state mismatch
  const handleAssigneeChangeLocal = (e) => {
    const val = e.target.value;

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 우측 상세 패널에서 담당자 드롭다운 값을 수정할 때, 
    // 로컬 화면 폼 상태 변수(selectedAssigneeLocal)만 업데이트하고 원본 마스터 tasks 배열을 
    // 갱신하여 서버로 연동하는 실제 호출 로직은 고의적으로 스킵합니다. 
    // 이 때문에 상세 패널을 닫았다 다시 활성화하면 수정 이전의 최초 담당자로 강제 원복 표시됩니다.
    setSelectedAssigneeLocal(val);

    showToast(`담당자가 임시 변경되었습니다 (화면상만 적용: ${val})`, 'warning');
  };

  // Save changes for Due Date (normally modifies master tasks)
  const handleSaveDueDate = async () => {
    if (!activeTask) return;
    try {
      const res = await fetch(`/api/tasks/${activeTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ due: selectedDueLocal })
      });
      if (res.ok) {
        showToast('마감 예정일 정보가 저장되었습니다.', 'success');
        loadTasks();
      }
    } catch (err) {
      showToast('마감일 업데이트 실패', 'danger');
    }
  };

  // Write comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentContent.trim() || !selectedTaskId) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTaskId,
          author: newCommentAuthor,
          content: newCommentContent
        })
      });
      if (res.ok) {
        setNewCommentContent('');
        loadComments();
        showToast('의견 댓글이 정상 등재되었습니다.', 'success');
      }
    } catch (err) {
      showToast('댓글 등록 에러', 'danger');
    }
  };

  // Delete task (Error 3)
  const handleDeleteTask = async () => {
    if (!selectedTaskId) return;
    if (!window.confirm('선택된 업무 카드를 삭제하시겠습니까? (연동 데이터 보존 여부 검증)')) return;

    try {
      const res = await fetch(`/api/tasks/${selectedTaskId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('업무 카드 삭제 처리가 접수되었습니다.', 'success');
        setSelectedTaskId(null);
        loadTasks();
      }
    } catch (err) {
      showToast('업무 삭제 프로세스 오류', 'danger');
    }
  };

  // Error 6: Click activity refresh logs three times to trigger 8s lag and infinite loading spinner
  const handleRefreshLogs = async () => {
    const nextCount = refreshClickCount + 1;
    setRefreshClickCount(nextCount);
    setIsLogsLoading(true);

    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: 활동 로그 새로고침 단추를 3회 연속하여 클릭하는 순간, 
    // 의도적으로 8000ms(8초) 동안 지연(setTimeout) 대기를 먹인 후 새로운 에러 로그 객체만 리스트에 밀어 넣으며 
    // 로딩바 지시자(isLogsLoading)는 계속 true 상태로 유지해 스피너 뺑뺑이가 영구 지속되도록 조율합니다.
    if (nextCount === 3) {
      setTimeout(() => {
        setLogs(prev => [
          { id: Date.now(), text: "⚠️ [네트워크 연타 경보] 연속 새로고침 트래픽 유휴 지연 감지됨", time: "방금 전" },
          ...prev
        ]);
        // 원래 뺑뺑이를 해제해야 하는 코드 누락:
        // setIsLogsLoading(false);
        showToast('활동 로그 수신 지연 완료 (로딩 스피너 보존)', 'warning');
      }, 8000);
      return;
    }

    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data);
      setIsLogsLoading(false);
    } catch (err) {
      setIsLogsLoading(false);
    }
  };

  // Error 5: File Upload paths to /var/teamgrid/uploads on Windows
  const handleFileUploadSim = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAttachedFile(file);
    setIsFileUploading(true);

    try {
      const res = await fetch(`/api/tasks/${selectedTaskId}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      showToast(`파일 '${file.name}' 업로드 성공`, 'success');
      setIsFileUploading(false);
    } catch (err) {
      showToast(`[업로드 500 에러] ${err.message}`, 'danger');
      setIsFileUploading(false);
    }
  };

  // Calculate Column Counts for Statistics SVG Charts
  const todoCount = kanbanTasks.filter(t => t.status === 'TODO').length;
  const progressCount = kanbanTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const reviewCount = kanbanTasks.filter(t => t.status === 'REVIEW').length;
  const doneCount = kanbanTasks.filter(t => t.status === 'DONE').length;

  const totalFilteredCount = kanbanTasks.length || 1;
  const todoPercent = Math.round((todoCount / totalFilteredCount) * 100);
  const progressPercent = Math.round((progressCount / totalFilteredCount) * 100);
  const reviewPercent = Math.round((reviewCount / totalFilteredCount) * 100);
  const donePercent = Math.round((doneCount / totalFilteredCount) * 100);

  return (
    <div className="teamgrid-app">
      {/* Top Header navbar */}
      <header className="app-navbar">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          <span className="logo-title">TeamGrid</span>
          <span className="logo-subtitle">사내 칸반 & 프로젝트 협업 솔루션</span>
        </div>

        {/* Global Filter Toolbar */}
        <div className="toolbar-filters">
          <div className="filter-group">
            <label>프로젝트 필터:</label>
            <select 
              value={selectedProjectId} 
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="toolbar-select"
            >
              <option value="All">전체 프로젝트</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>우선순위 필터:</label>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="toolbar-select"
            >
              <option value="All">우선순위 전체</option>
              <option value="High">🚨 High</option>
              <option value="Medium">⚡ Medium</option>
              <option value="Low">💤 Low</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Workspace Workspace */}
      <div className="workspace-layout">
        
        {/* Left projects sidebar */}
        <aside className="panel-section projects-sidebar">
          <div className="panel-header">
            <h3>📂 프로젝트 목록</h3>
          </div>
          <div className="project-buttons-stack">
            <button 
              type="button" 
              onClick={() => setSelectedProjectId('All')}
              className={`project-tab-btn ${selectedProjectId === 'All' ? 'active' : ''}`}
            >
              💼 전체 프로젝트
            </button>
            {projects.map(p => (
              <button 
                key={p.id}
                type="button" 
                onClick={() => setSelectedProjectId(p.id)}
                className={`project-tab-btn ${selectedProjectId === p.id ? 'active' : ''}`}
              >
                📁 {p.name}
              </button>
            ))}
          </div>

          {/* Create new project */}
          <form onSubmit={handleCreateProject} className="create-project-form">
            <input 
              type="text" 
              placeholder="새 프로젝트 이름..." 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="proj-input"
            />
            <button type="submit" className="proj-submit-btn">+ 개설</button>
          </form>

          {/* Quick Create Task Form (Error 2 Target) */}
          <div className="quick-task-panel">
            <h4>⚡ 신규 업무 배정</h4>
            <form onSubmit={handleCreateTask} className="quick-task-form">
              <input 
                type="text" 
                placeholder="업무 제목 (설명만 쓰면 500오류)" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="task-input"
              />
              <textarea 
                placeholder="업무 세부 내용 설명 기입..." 
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="task-desc-area"
              />
              <div className="row">
                <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} className="task-select">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <select value={newTaskAssignee} onChange={(e) => setNewTaskAssignee(e.target.value)} className="task-select">
                  <option value="김민우 PM">PM 김민우</option>
                  <option value="이지혜 디자이너">디자이너 이지혜</option>
                  <option value="박현우 개발자">개발자 박현우</option>
                  <option value="최소희 QA">QA 최소희</option>
                </select>
              </div>
              <button type="submit" className="task-submit-btn">업무 카드 등록</button>
            </form>
          </div>
        </aside>

        {/* Center Kanban Board */}
        <main className="kanban-dashboard-workspace">
          
          {/* Kanban Columns */}
          <div className="kanban-board-grid">
            
            {/* TODO Column */}
            <div className="kanban-column todo">
              <div className="col-header">
                <h4>📝 할 일 (TODO) <span className="badge">{todoCount}</span></h4>
              </div>
              <div className="col-cards-list">
                {kanbanTasks.filter(t => t.status === 'TODO').map(task => (
                  <div 
                    key={task.id} 
                    className={`task-card ${selectedTaskId === task.id ? 'active' : ''}`}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <div className="card-top">
                      <span className={`priority-lbl ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <span className="due-date-badge">{task.due}</span>
                    </div>
                    <h4>{task.title}</h4>
                    <p className="desc-preview">{task.description.slice(0, 30)}...</p>
                    <div className="card-foot">
                      <span className="assignee">{task.assignee}</span>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); handleMoveStatus(task.id, 'IN_PROGRESS'); }}
                        className="move-col-btn"
                      >
                        진행 ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IN_PROGRESS Column */}
            <div className="kanban-column in-progress">
              <div className="col-header">
                <h4>⚡ 진행 중 (IN PROGRESS) <span className="badge">{progressCount}</span></h4>
              </div>
              <div className="col-cards-list">
                {kanbanTasks.filter(t => t.status === 'IN_PROGRESS').map(task => (
                  <div 
                    key={task.id} 
                    className={`task-card ${selectedTaskId === task.id ? 'active' : ''}`}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <div className="card-top">
                      <span className={`priority-lbl ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <span className="due-date-badge">{task.due}</span>
                    </div>
                    <h4>{task.title}</h4>
                    <p className="desc-preview">{task.description.slice(0, 30)}...</p>
                    <div className="card-foot">
                      <span className="assignee">{task.assignee}</span>
                      <div className="btn-group">
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); handleMoveStatus(task.id, 'TODO'); }}
                          className="move-col-btn back"
                        >
                          ◀
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); handleMoveStatus(task.id, 'REVIEW'); }}
                          className="move-col-btn"
                        >
                          리뷰 ➔
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* REVIEW Column */}
            <div className="kanban-column review">
              <div className="col-header">
                <h4>🔎 테스트 및 검토 (REVIEW) <span className="badge">{reviewCount}</span></h4>
              </div>
              <div className="col-cards-list">
                {kanbanTasks.filter(t => t.status === 'REVIEW').map(task => (
                  <div 
                    key={task.id} 
                    className={`task-card ${selectedTaskId === task.id ? 'active' : ''}`}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <div className="card-top">
                      <span className={`priority-lbl ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <span className="due-date-badge">{task.due}</span>
                    </div>
                    <h4>{task.title}</h4>
                    <p className="desc-preview">{task.description.slice(0, 30)}...</p>
                    <div className="card-foot">
                      <span className="assignee">{task.assignee}</span>
                      <div className="btn-group">
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); handleMoveStatus(task.id, 'IN_PROGRESS'); }}
                          className="move-col-btn back"
                        >
                          ◀
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); handleMoveStatus(task.id, 'DONE'); }}
                          className="move-col-btn"
                        >
                          완료 ➔
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DONE Column */}
            <div className="kanban-column done">
              <div className="col-header">
                <h4>✅ 완료됨 (DONE) <span className="badge">{doneCount}</span></h4>
              </div>
              <div className="col-cards-list">
                {kanbanTasks.filter(t => t.status === 'DONE').map(task => (
                  <div 
                    key={task.id} 
                    className={`task-card ${selectedTaskId === task.id ? 'active' : ''}`}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <div className="card-top">
                      <span className={`priority-lbl ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <span className="due-date-badge">{task.due}</span>
                    </div>
                    <h4>{task.title}</h4>
                    <p className="desc-preview">{task.description.slice(0, 30)}...</p>
                    <div className="card-foot">
                      <span className="assignee">{task.assignee}</span>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); handleMoveStatus(task.id, 'REVIEW'); }}
                        className="move-col-btn back"
                      >
                        ◀ 복원
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Statistics Dashboard Section */}
          <section className="panel-section dashboard-stats-panel">
            <div className="panel-header">
              <h3>📊 업무 단계별 통계 대시보드 (SVG 차트)</h3>
            </div>
            <div className="charts-grid-row">
              
              {/* Bar Chart SVG */}
              <div className="chart-wrapper">
                <h5>열별 태스크 볼륨 (막대 그래프)</h5>
                <svg className="svg-chart bar-chart" viewBox="0 0 400 160">
                  <rect x="50" y="10" width="300" height="140" fill="#f1f5f9" />
                  
                  {/* TODO Bar */}
                  <rect x="70" y={150 - todoCount * 15} width="40" height={todoCount * 15} fill="#4f46e5" />
                  <text x="90" y="145" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">{todoCount}</text>
                  <text x="90" y="158" textAnchor="middle" fill="#475569" fontSize="8">TODO</text>

                  {/* PROGRESS Bar */}
                  <rect x="150" y={150 - progressCount * 15} width="40" height={progressCount * 15} fill="#f59e0b" />
                  <text x="170" y="145" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">{progressCount}</text>
                  <text x="170" y="158" textAnchor="middle" fill="#475569" fontSize="8">PROGRESS</text>

                  {/* REVIEW Bar */}
                  <rect x="230" y={150 - reviewCount * 15} width="40" height={reviewCount * 15} fill="#06b6d4" />
                  <text x="250" y="145" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">{reviewCount}</text>
                  <text x="250" y="158" textAnchor="middle" fill="#475569" fontSize="8">REVIEW</text>

                  {/* DONE Bar */}
                  <rect x="310" y={150 - doneCount * 15} width="40" height={doneCount * 15} fill="#10b981" />
                  <text x="330" y="145" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">{doneCount}</text>
                  <text x="330" y="158" textAnchor="middle" fill="#475569" fontSize="8">DONE</text>
                </svg>
              </div>

              {/* Donut Chart SVG */}
              <div className="chart-wrapper">
                <h5>점유 퍼센티지 (도넛형 차트)</h5>
                <svg className="svg-chart donut-chart" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="18" />
                  
                  {/* Just render a stylized color ring segment grid for simplicity */}
                  <circle cx="80" cy="80" r="50" fill="transparent" stroke="#4f46e5" strokeWidth="18" strokeDasharray="314" strokeDashoffset={314 - (314 * todoPercent) / 100} transform="rotate(-90 80 80)" />
                  
                  <circle cx="80" cy="80" r="32" fill="#fff" />
                  <text x="80" y="78" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="bold">점유율</text>
                  <text x="80" y="93" textAnchor="middle" fill="#4f46e5" fontSize="8" fontWeight="bold">TODO {todoPercent}%</text>
                </svg>
                <div className="donut-legend">
                  <span className="lg-dot todo"></span> TODO {todoPercent}% 
                  <span className="lg-dot progress"></span> PROGRESS {progressPercent}% 
                  <span className="lg-dot done"></span> DONE {donePercent}%
                </div>
              </div>

            </div>
          </section>
        </main>

        {/* Right Task Details Panel & Comments Drawer */}
        <aside className="right-details-column">
          
          {activeTask ? (
            <section className="panel-section active-details-panel">
              <div className="panel-header detail-h">
                <span className="task-id">#{activeTask.id.slice(-5)}</span>
                <h2>업무 상세 내역</h2>
                <button type="button" onClick={() => setSelectedTaskId(null)} className="close-panel-btn">&times;</button>
              </div>

              <div className="detail-meta-card">
                <h3>{activeTask.title}</h3>
                <p className="desc-body">{activeTask.description}</p>
              </div>

              <div className="detail-settings-form">
                
                {/* Error 4 Assignee selection */}
                <div className="form-group">
                  <label>담당자 배정 (Error 4 적용):</label>
                  <select 
                    value={selectedAssigneeLocal} 
                    onChange={handleAssigneeChangeLocal} 
                    className="detail-select"
                  >
                    <option value="김민우 PM">PM 김민우</option>
                    <option value="이지혜 디자이너">디자이너 이지혜</option>
                    <option value="박현우 개발자">개발자 박현우</option>
                    <option value="최소희 QA">QA 최소희</option>
                    <option value="미배정">미배정</option>
                  </select>
                </div>

                {/* Due date customization */}
                <div className="form-group">
                  <label>마감 예정일 수정:</label>
                  <div className="due-row">
                    <input 
                      type="date" 
                      value={selectedDueLocal} 
                      onChange={(e) => setSelectedDueLocal(e.target.value)}
                      className="detail-input"
                    />
                    <button type="button" onClick={handleSaveDueDate} className="save-due-btn">저장</button>
                  </div>
                </div>

                {/* File Attachment Simulator (Error 5 Path failure) */}
                <div className="form-group file-attach-group">
                  <label>📁 협업 파일 첨부하기 (Error 5 적용):</label>
                  <input 
                    type="file" 
                    onChange={handleFileUploadSim}
                    className="file-input-field"
                    disabled={isFileUploading}
                  />
                  {attachedFile && (
                    <div className="file-info-badge">
                      <span>선택됨: {attachedFile.name} ({Math.round(attachedFile.size/1024)} KB)</span>
                    </div>
                  )}
                  {isFileUploading && <span className="upload-spin">파일 업로드 기록 스트림 전송 중...</span>}
                </div>

                {/* Delete Task */}
                <button 
                  type="button" 
                  onClick={handleDeleteTask}
                  className="task-delete-btn"
                >
                  🗑️ 업무 삭제하기 (Error 3 적용)
                </button>

              </div>

              {/* Task Comments Subsystem */}
              <div className="task-comments-box">
                <h4>💬 작업 협업 의견 ({activeTaskComments.length}개)</h4>
                
                <div className="comments-scroller">
                  {activeTaskComments.map(c => (
                    <div key={c.id} className="comment-bubble">
                      <div className="h">
                        <span className="author">{c.author}</span>
                        <span className="date">{c.date}</span>
                      </div>
                      <p>{c.content}</p>
                    </div>
                  ))}

                  {activeTaskComments.length === 0 && (
                    <div className="empty-placeholder">등록된 협업 의견이 없습니다. 첫 마디를 나누어보세요.</div>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="comment-post-form">
                  <select 
                    value={newCommentAuthor} 
                    onChange={(e) => setNewCommentAuthor(e.target.value)}
                    className="comment-author-select"
                  >
                    <option value="김민우 PM">PM 김민우</option>
                    <option value="이지혜 디자이너">디자이너 이지혜</option>
                    <option value="박현우 개발자">개발자 박현우</option>
                    <option value="최소희 QA">QA 최소희</option>
                  </select>
                  <textarea 
                    placeholder="의견을 남겨 공유하십시오." 
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    required
                  />
                  <button type="submit" className="comment-submit-btn">댓글 등록</button>
                </form>
              </div>

            </section>
          ) : (
            <section className="panel-section active-details-panel empty">
              <div className="empty-placeholder">
                칸반 보드 카드를 클릭하시면 세부 설명, 담당 배정 수정, 파일 첨부 및 협업 토크 댓글 보드를 불러올 수 있습니다.
              </div>
            </section>
          )}

          {/* Activity Logs cabinet */}
          <section className="panel-section activity-logs-panel">
            <div className="panel-header logs-h">
              <h3>📜 실시간 활동 로그 내역</h3>
              <button 
                type="button" 
                onClick={handleRefreshLogs} 
                className="logs-refresh-btn"
                disabled={isLogsLoading && refreshClickCount !== 3}
              >
                새로고침
              </button>
            </div>
            
            <div className="logs-scroller">
              {isLogsLoading && (
                <div className="logs-spinner-box">
                  <span className="spin-icon">🔄</span> 활동 로그 동기화 동결 스캔 진행 중...
                </div>
              )}
              
              <div className="logs-list">
                {logs.map(log => (
                  <div key={log.id} className="log-item">
                    <span className="time">{log.time || "방금 전"}</span>
                    <p className="text">{log.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </aside>

      </div>

      {/* Toast Warning Panels */}
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
