import React, { useState, useEffect } from 'react';
import { Video, Tag, Plus, Eye, ThumbsUp, DollarSign } from 'lucide-react';
import Modal from '../components/Modal';

export default function Content({ showToast }) {
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [savingTag, setSavingTag] = useState(false);

  const loadContents = () => {
    fetch('/api/content')
      .then(res => res.json())
      .then(d => setContents(d))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadContents();
  }, []);

  // Add Tag handler (SEC-351 / site038-bug01)
  const handleAddTag = (e) => {
    e.preventDefault();
    if (!selectedContent || !tagInput.trim()) return;

    setSavingTag(true);
    const idempotency_key = `TAG-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch(`/api/content/${selectedContent.id}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tag: tagInput.trim(),
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setSavingTag(false);
      setTagInput('');
      loadContents();
      if (data.content) {
        setSelectedContent(data.content);
      }
      showToast('태그 추가 완료', `[#${data.tag}] 태그가 콘텐츠에 성공적으로 추가되었습니다.`, 'success', data.transaction_id, data.bugId, data.secId);
    })
    .catch(err => {
      console.error(err);
      setSavingTag(false);
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)' }}>콘텐츠 및 영상 프로젝트 관리</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>플랫폼별 게시 현황, 메타데이터 태그 및 성과 지표</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        {contents.map(c => (
          <div key={c.id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
              <img src={c.thumbnail} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span className={`badge badge-${c.status}`} style={{ position: 'absolute', top: '12px', left: '12px' }}>
                {c.platform} · {c.status}
              </span>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '10px', lineHeight: 1.4 }}>
                  {c.title}
                </h3>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {c.tags?.map((t, idx) => (
                    <span key={idx} className="badge-tag">#{t}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--gray-500)', borderTop: '1px solid var(--gray-100)', paddingTop: '12px', marginBottom: '16px' }}>
                  <span>조회: <strong>{c.views}</strong></span>
                  <span>좋아요: <strong>{c.likes}</strong></span>
                  <span>수익: <strong style={{ color: 'var(--primary)' }}>{c.revenue}</strong></span>
                </div>
              </div>

              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSelectedContent(c);
                  setTagInput('');
                }}
              >
                <Tag size={14} /> 태그 관리 / 추가
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Tag Modal (SEC-351) */}
      <Modal
        isOpen={!!selectedContent}
        onClose={() => setSelectedContent(null)}
        title={selectedContent ? `[${selectedContent.title}] 태그 관리` : '태그 관리'}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--navy-800)', marginBottom: '8px' }}>현재 등록된 태그 목록:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {selectedContent?.tags?.map((t, i) => (
              <span key={i} className="badge-tag">#{t}</span>
            ))}
          </div>
        </div>

        <form onSubmit={handleAddTag}>
          <div className="form-group">
            <label className="form-label">새 태그 입력</label>
            <input
              type="text"
              className="form-control"
              placeholder="예: travel, vlog, camera, productivity"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedContent(null)}>
              닫기
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={savingTag || !tagInput.trim()}>
              {savingTag ? '추가 중...' : '태그 추가'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
