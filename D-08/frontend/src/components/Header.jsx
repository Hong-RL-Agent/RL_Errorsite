'use client';
import React from 'react';
import { 
  Kanban, 
  List, 
  Plus, 
  RotateCcw, 
  Settings, 
  Activity, 
  Search 
} from 'lucide-react';

export default function Header({
  currentProject,
  viewMode,
  setViewMode,
  onOpenNewTask,
  onOpenSettings,
  onOpenActivities,
  onReset,
  isResetting
}) {
  return (
    <header className="orbit-header">
      <div className="header-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{ 
              width: 12, 
              height: 12, 
              borderRadius: 3, 
              backgroundColor: currentProject?.color || '#7c3aed' 
            }} 
          />
          <h1 className="project-title">{currentProject?.name || '프로젝트'}</h1>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
            [{currentProject?.key}]
          </span>
        </div>

        {/* 칸반 / 리스트 뷰 전환 */}
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            <Kanban size={14} />
            <span>보드</span>
          </button>
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={14} />
            <span>리스트</span>
          </button>
        </div>
      </div>

      <div className="header-right">
        {/* 프로젝트 설정 (알림 설정) 버튼 */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenSettings}
          title="프로젝트 알림 및 환경설정"
        >
          <Settings size={14} />
          <span>프로젝트 설정</span>
        </button>

        {/* 활동 로그 타임라인 버튼 */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenActivities}
          title="프로젝트 활동 로그"
        >
          <Activity size={14} />
          <span>활동 로그</span>
        </button>

        {/* 새 업무 등록 버튼 */}
        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenNewTask}
        >
          <Plus size={14} />
          <span>새 업무</span>
        </button>

        {/* 시스템 초기화 버튼 */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onReset}
          disabled={isResetting}
          title="SQLite DB 및 모든 설정을 초기 상태로 완전 복원합니다."
        >
          <RotateCcw size={14} className={isResetting ? 'spin' : ''} />
          <span>{isResetting ? '초기화 중...' : '시스템 초기화'}</span>
        </button>
      </div>
    </header>
  );
}
