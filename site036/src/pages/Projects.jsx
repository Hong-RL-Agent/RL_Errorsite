import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Filter, 
  MessageSquare, 
  Calendar, 
  User, 
  Plus, 
  Send, 
  CheckCircle,
  Tag
} from 'lucide-react';
import Modal from '../components/Modal';

export default function Projects({ showToast }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');

  // Selected project for comments modal
  const [selectedProject, setSelectedProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Load projects
  const loadProjects = () => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Filter Search handler (SEC-340 / site036-bug10)
  const handleApplyFilter = () => {
    const idempotency_key = `FILTER-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    
    fetch('/api/projects/filter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: statusFilter,
        priority: priorityFilter,
        owner: ownerFilter,
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.results) {
        setProjects(resData.results);
        showToast('필터 적용 완료', `${resData.count}개의 프로젝트가 검색되었습니다.`, 'info', resData.transaction_id);
      }
    })
    .catch(err => console.error(err));
  };

  // Open comments modal
  const openComments = (project) => {
    setSelectedProject(project);
    fetch(`/api/projects/${project.id}/comments`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error(err));
  };

  // Submit comment handler (SEC-336 / site036-bug06)
  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedProject) return;

    setSubmittingComment(true);
    const idempotency_key = `COMMENT-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch(`/api/projects/${selectedProject.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newComment,
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(resData => {
      setSubmittingComment(false);
      if (resData.comment) {
        setComments(prev => [...prev, resData.comment]);
        setNewComment('');
        showToast('댓글 등록 성공', '프로젝트에 새 댓글이 등록되었습니다.', 'success', resData.transaction_id);
        loadProjects(); // refresh comments count
      }
    })
    .catch(err => {
      console.error(err);
      setSubmittingComment(false);
    });
  };

  return (
    <div>
      {/* Top Filter Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--navy-800)' }}>
              <Filter size={16} color="#4f46e5" /> 조건별 필터:
            </span>

            <select 
              className="form-control" 
              style={{ width: '140px', padding: '7px 12px', fontSize: '0.86rem' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">모든 상태</option>
              <option value="active">진행 중 (active)</option>
              <option value="planning">기획 중 (planning)</option>
              <option value="completed">완료됨 (completed)</option>
            </select>

            <select 
              className="form-control" 
              style={{ width: '140px', padding: '7px 12px', fontSize: '0.86rem' }}
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <option value="all">모든 우선순위</option>
              <option value="high">높음 (High)</option>
              <option value="medium">보통 (Medium)</option>
              <option value="low">낮음 (Low)</option>
            </select>

            <select 
              className="form-control" 
              style={{ width: '140px', padding: '7px 12px', fontSize: '0.86rem' }}
              value={ownerFilter}
              onChange={e => setOwnerFilter(e.target.value)}
            >
              <option value="all">모든 담당자</option>
              <option value="김민준">김민준</option>
              <option value="이서연">이서연</option>
              <option value="박도현">박도현</option>
              <option value="최유진">최유진</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={handleApplyFilter}>
              <Filter size={14} /> 필터 검색 적용
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
              setOwnerFilter('all');
              loadProjects();
            }}>
              초기화
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px' }}>
        {projects.map(project => (
          <div key={project.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span className={`badge badge-${project.status}`}>{project.status}</span>
                <span className={`badge badge-${project.priority}`}>우선순위: {project.priority}</span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '8px' }}>
                {project.name}
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--gray-500)', marginBottom: '16px', lineHeight: 1.5, minHeight: '40px' }}>
                {project.description}
              </p>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy-800)', marginBottom: '6px' }}>
                  <span>진척률</span>
                  <span style={{ color: 'var(--primary)' }}>{project.progress}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${project.progress}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '999px' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--gray-500)', borderTop: '1px solid var(--gray-100)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="#64748b" /> 담당: <strong style={{ color: 'var(--navy-800)' }}>{project.owner}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="#64748b" /> 마감일: <span>{project.dueDate}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid var(--gray-100)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                카테고리: {project.category}
              </span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => openComments(project)}
              >
                <MessageSquare size={14} /> 댓글 ({project.commentsCount || 0})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Project Comments Modal */}
      <Modal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={selectedProject ? `[${selectedProject.name}] 프로젝트 토론 & 댓글` : '댓글'}
      >
        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>작성된 댓글이 없습니다. 첫 의견을 남겨보세요.</div>
          ) : (
            comments.map(c => (
              <div key={c.id} style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--navy-900)' }}>{c.author}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.createdAt}</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--navy-800)' }}>{c.content}</div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handlePostComment}>
          <div className="form-group">
            <label className="form-label">새 댓글 작성</label>
            <textarea
              className="form-control"
              placeholder="업무 진행 상황이나 의견을 남겨주세요..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              rows="3"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedProject(null)}>
              닫기
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submittingComment || !newComment.trim()}>
              <Send size={14} /> {submittingComment ? '등록 중...' : '댓글 등록'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
