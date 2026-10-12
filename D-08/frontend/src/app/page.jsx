'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  fetchProjects, 
  fetchMembers, 
  fetchTasks, 
  updateTaskStatus, 
  resetDatabase 
} from '../lib/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import KanbanBoard from '../components/KanbanBoard';
import TaskListView from '../components/TaskListView';
import TaskDetailDrawer from '../components/TaskDetailDrawer';
import NewTaskModal from '../components/NewTaskModal';
import NewProjectModal from '../components/NewProjectModal';
import ProjectSettingsModal from '../components/ProjectSettingsModal';
import ActivityLogModal from '../components/ActivityLogModal';
import { Search, Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function TeamOrbitPage() {
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(1);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');

  // Modals & Drawer
  const [selectedTask, setSelectedTask] = useState(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Load Projects & Members
  const loadInitialData = async () => {
    try {
      const [projRes, memRes] = await Promise.all([fetchProjects(), fetchMembers()]);
      if (projRes.success) {
        setProjects(projRes.data);
        if (projRes.data.length > 0 && !currentProjectId) {
          setCurrentProjectId(projRes.data[0].id);
        }
      }
      if (memRes.success) {
        setMembers(memRes.data);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      showToast('초기 데이터를 불러오는데 실패했습니다.', 'error');
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Current Project
  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === currentProjectId) || projects[0] || null;
  }, [projects, currentProjectId]);

  // Load Tasks for Current Project with filters
  const loadTasks = useCallback(async () => {
    if (!currentProjectId) return;
    try {
      setLoading(true);
      const params = {
        projectId: currentProjectId
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (filterPriority) params.priority = filterPriority;
      if (filterAssignee) params.assignee = filterAssignee;

      const res = await fetchTasks(params);
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      showToast('업무 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentProjectId, searchQuery, filterPriority, filterAssignee]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Context passed for DQN Validation matching
  const filterContext = useMemo(() => ({
    projectId: currentProjectId,
    priority: filterPriority,
    assignee: filterAssignee
  }), [currentProjectId, filterPriority, filterAssignee]);

  // Quick Toggle Complete
  const handleToggleComplete = async (task) => {
    const nextStatus = task.status === 'DONE' ? 'IN_PROGRESS' : 'DONE';
    try {
      const res = await updateTaskStatus(task.id, nextStatus, filterContext);
      if (res.success) {
        showToast(
          nextStatus === 'DONE' ? `[${task.task_key}] 업무를 완료 처리했습니다.` : `[${task.task_key}] 업무를 진행중으로 변경했습니다.`,
          'success'
        );
        // Refresh to observe persisted DB state
        await loadTasks();
      }
    } catch (err) {
      showToast(err.message || '상태 변경 실패', 'error');
    }
  };

  // Reset System / Database
  const handleReset = async () => {
    if (!confirm('정말로 모든 프로젝트 데이터를 초기 상태로 복원하시겠습니까?')) return;
    try {
      setIsResetting(true);
      const res = await resetDatabase();
      if (res.success) {
        showToast('시스템 데이터가 초기 상태로 완전히 복원되었습니다.', 'success');
        await loadInitialData();
        await loadTasks();
      }
    } catch (err) {
      showToast(err.message || '데이터 초기화 실패', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Metrics Calculation
  const metrics = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'DONE').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const review = tasks.filter((t) => t.status === 'REVIEW').length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, review, todo, completionRate };
  }, [tasks]);

  return (
    <div className="orbit-layout">
      {/* 사이드바 */}
      <Sidebar
        projects={projects}
        currentProjectId={currentProjectId}
        onSelectProject={(id) => {
          setCurrentProjectId(id);
          setSelectedTask(null);
        }}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        members={members}
      />

      {/* 메인 업무 영역 */}
      <div className="orbit-main">
        {/* 상단 헤더 */}
        <Header
          currentProject={currentProject}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenNewTask={() => setIsNewTaskOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenActivities={() => setIsActivitiesOpen(true)}
          onReset={handleReset}
          isResetting={isResetting}
        />

        {/* 툴바 & 필터 바 */}
        <div className="orbit-toolbar">
          <div className="toolbar-filters">
            {/* 검색창 */}
            <div className="search-field">
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="업무 검색 (키, 제목)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* 우선순위 필터 */}
            <select
              className="select-box"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">모든 우선순위</option>
              <option value="URGENT">긴급 (URGENT)</option>
              <option value="HIGH">높음 (HIGH)</option>
              <option value="MEDIUM">보통 (MEDIUM)</option>
              <option value="LOW">낮음 (LOW)</option>
            </select>

            {/* 담당자 필터 */}
            <select
              className="select-box"
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
            >
              <option value="">모든 담당자</option>
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>

            {(searchQuery || filterPriority || filterAssignee) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterPriority('');
                  setFilterAssignee('');
                }}
              >
                필터 초기화
              </button>
            )}
          </div>

          {/* 프로젝트 진행률 통계 배지 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#64748b' }}>전체</span>
              <span style={{ fontWeight: '700', color: '#0f172a' }}>{metrics.total}건</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#059669' }}>완료</span>
              <span style={{ fontWeight: '700', color: '#059669' }}>{metrics.done}건</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>진행률</span>
              <div style={{ width: '80px', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${metrics.completionRate}%`,
                    height: '100%',
                    backgroundColor: '#7c3aed',
                    borderRadius: '4px',
                    transition: 'width 0.3s'
                  }}
                />
              </div>
              <span style={{ fontWeight: '700', color: '#7c3aed' }}>{metrics.completionRate}%</span>
            </div>
          </div>
        </div>

        {/* 뷰 렌더링 (보드 or 리스트) */}
        {viewMode === 'kanban' ? (
          <KanbanBoard
            tasks={tasks}
            onOpenDetail={(task) => setSelectedTask(task)}
            onToggleComplete={handleToggleComplete}
          />
        ) : (
          <TaskListView
            tasks={tasks}
            onOpenDetail={(task) => setSelectedTask(task)}
            onToggleComplete={handleToggleComplete}
          />
        )}
      </div>

      {/* 업무 상세 슬라이드오버 드로어 */}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          members={members}
          filterContext={filterContext}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={loadTasks}
          onNotify={showToast}
        />
      )}

      {/* 새 업무 모달 */}
      <NewTaskModal
        projectId={currentProjectId}
        members={members}
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onTaskCreated={loadTasks}
        onNotify={showToast}
      />

      {/* 새 프로젝트 모달 */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onProjectCreated={async (newProj) => {
          await loadInitialData();
          if (newProj && newProj.id) {
            setCurrentProjectId(newProj.id);
          }
        }}
        onNotify={showToast}
      />

      {/* 프로젝트 알림/환경설정 모달 (BUG-D08-05 연동) */}
      <ProjectSettingsModal
        project={currentProject}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={async () => {
          await loadInitialData();
        }}
        onNotify={showToast}
      />

      {/* 활동 타임라인 로그 모달 */}
      <ActivityLogModal
        projectId={currentProjectId}
        projectName={currentProject?.name}
        isOpen={isActivitiesOpen}
        onClose={() => setIsActivitiesOpen(false)}
      />

      {/* 토스트 알림창 */}
      {toast && (
        <div className="toast-notice">
          {toast.message}
        </div>
      )}
    </div>
  );
}
