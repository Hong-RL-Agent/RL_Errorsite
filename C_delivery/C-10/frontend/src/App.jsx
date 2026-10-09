import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import ProjectOverview from './components/ProjectOverview';
import MilestoneList from './components/MilestoneList';
import IssueTracker from './components/IssueTracker';
import KanbanBoard from './components/KanbanBoard';
import SprintPanel from './components/SprintPanel';
import MemberDrawer from './components/MemberDrawer';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState('P-101');
  const [currentTab, setCurrentTab] = useState('overview'); // overview, milestones, issues, board, sprints, members

  const [milestones, setMilestones] = useState([]);
  const [issues, setIssues] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [members, setMembers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);
  const [hasRuntimeError, setHasRuntimeError] = useState(false);

  // Load Projects
  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:5009/workspace/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Load Project Details & Items
  const fetchProjectData = async (projId) => {
    setLoading(true);
    setHasRuntimeError(false);
    try {
      const [msRes, issRes, spRes, memRes] = await Promise.all([
        fetch(`http://localhost:5009/workspace/projects/${projId}/milestones`),
        fetch(`http://localhost:5009/workspace/projects/${projId}/issues`),
        fetch(`http://localhost:5009/workspace/projects/${projId}/sprints`),
        fetch(`http://localhost:5009/workspace/projects/${projId}/members`)
      ]);

      // BUG-057: If issues endpoint returns 500 error due to dangling foreign key reference
      if (issRes.status === 500) {
        setHasRuntimeError(true);
        setLoading(false);
        return;
      }

      const msData = await msRes.json();
      const issData = await issRes.json();
      const spData = await spRes.json();
      const memData = await memRes.json();

      setMilestones(msData.milestones || []);
      setIssues(issData.issues || []);
      setSprints(spData.sprints || []);
      setMembers(memData.members || []);
    } catch (err) {
      console.error('Project data load error:', err);
      setHasRuntimeError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (currentProjectId) {
      fetchProjectData(currentProjectId);
    }
  }, [currentProjectId]);

  // Handle Project Change
  const handleSelectProject = (id) => {
    setCurrentProjectId(id);
  };

  // Delete Milestone (BUG-057)
  const handleDeleteMilestone = async (milestoneId) => {
    try {
      await fetch(`http://localhost:5009/workspace/milestones/${milestoneId}`, {
        method: 'DELETE'
      });
      // Refresh milestones list
      const msRes = await fetch(`http://localhost:5009/workspace/projects/${currentProjectId}/milestones`);
      const msData = await msRes.json();
      setMilestones(msData.milestones || []);
    } catch (err) {
      console.error(err);
    }
  };

  // System Reset
  const handleReset = async () => {
    setResetLoading(true);
    try {
      await fetch('http://localhost:5009/workspace/test/reset', { method: 'POST' });
      await fetchProjects();
      await fetchProjectData(currentProjectId);
      setHasRuntimeError(false);
    } catch (err) {
      console.error(err);
    } finally {
      setResetLoading(false);
    }
  };

  const currentProject = projects.find(p => p.id === currentProjectId) || {
    id: 'P-101',
    name: 'Atlas Mobile',
    key: 'ATLAS',
    description: '차세대 모바일 앱 프레임워크 및 크로스플랫폼 클라이언트 개발',
    category: 'Mobile Application',
    lead: 'Alex Johnson',
    created_at: '2026-09-01'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        currentProjectId={currentProjectId}
        onSelectProject={handleSelectProject}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onReset={handleReset}
        resetLoading={resetLoading}
      />

      {/* Main Workspace Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <main style={{ flex: 1, padding: '32px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <ErrorBoundary forcedError={hasRuntimeError} onRetry={() => fetchProjectData(currentProjectId)}>
              {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  WorkGrid 워크스페이스를 동기화 중입니다...
                </div>
              ) : (
                <>
                  {currentTab === 'overview' && (
                    <ProjectOverview
                      project={currentProject}
                      milestones={milestones}
                      issues={issues}
                      sprints={sprints}
                      members={members}
                      onSelectTab={setCurrentTab}
                    />
                  )}

                  {currentTab === 'milestones' && (
                    <MilestoneList
                      projectId={currentProjectId}
                      milestones={milestones}
                      onDeleteMilestone={handleDeleteMilestone}
                      loading={loading}
                    />
                  )}

                  {currentTab === 'issues' && (
                    <IssueTracker
                      projectId={currentProjectId}
                      issues={issues}
                      onFetchIssues={() => fetchProjectData(currentProjectId)}
                      loading={loading}
                    />
                  )}

                  {currentTab === 'board' && (
                    <KanbanBoard
                      projectId={currentProjectId}
                      issues={issues}
                      loading={loading}
                    />
                  )}

                  {currentTab === 'sprints' && (
                    <SprintPanel
                      projectId={currentProjectId}
                      sprints={sprints}
                      onSprintCreated={() => fetchProjectData(currentProjectId)}
                      loading={loading}
                    />
                  )}

                  {currentTab === 'members' && (
                    <MemberDrawer
                      projectId={currentProjectId}
                      members={members}
                      loading={loading}
                    />
                  )}
                </>
              )}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
