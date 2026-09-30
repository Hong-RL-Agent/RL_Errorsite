import React, { useState, useEffect } from 'react';
import { Bell, Plus, Eye, Calendar, User } from 'lucide-react';
import Modal from '../components/Modal';

export default function Notices({ showToast }) {
  const [notices, setNotices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('시설안내');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadNotices = () => {
    fetch('/api/notices')
      .then(res => res.json())
      .then(d => setNotices(d))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadNotices();
  }, []);

  // Publish notice handler (SEC-349 / site037-bug09)
  const handlePublishNotice = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    const idempotency_key = `NOTICE-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        category,
        content: content.trim(),
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setSubmitting(false);
      setModalOpen(false);
      setTitle('');
      setContent('');
      loadNotices();
      showToast('공지사항 등록 완료', '공연장 새 공지사항이 게재되었습니다.', 'success', data.transaction_id, data.bugId, data.secId);
    })
    .catch(err => {
      console.error(err);
      setSubmitting(false);
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-900)' }}>공연장 공지사항</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>운영 일정, 예매 정책 및 안전 수칙 안내</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> 공지사항 등록
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {notices.map(n => (
          <div key={n.id} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="badge badge-classic">{n.category}</span>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', display: 'flex', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} /> {n.createdAt}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={13} /> {n.views}</span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-900)', marginBottom: '8px' }}>
              {n.title}
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)', lineHeight: 1.6 }}>
              {n.content}
            </p>
          </div>
        ))}
      </div>

      {/* Publish Notice Modal (SEC-349) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="새 공지사항 작성"
      >
        <form onSubmit={handlePublishNotice}>
          <div className="form-group">
            <label className="form-label">공지 카테고리</label>
            <select 
              className="form-control"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="시설안내">시설안내</option>
              <option value="멤버십">멤버십</option>
              <option value="전시안내">전시안내</option>
              <option value="티켓예매">티켓예매</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">공지 제목</label>
            <input
              type="text"
              className="form-control"
              placeholder="예: 공연장 운영시간 변경 안내"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">공지 상세 내용</label>
            <textarea
              className="form-control"
              placeholder="관객 여러분께 전달할 상세 내용을 작성해 주세요."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows="5"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !title.trim()}>
              {submitting ? '등록 중...' : '공지 게재'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
