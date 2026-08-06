import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedContent, setSelectedContent, contents, plans, triggerStatusPlanRace, triggerPrivateWatchConflict, triggerPartialSave }) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('15세이상관람가');
  const target = selectedContent || contents[0];

  useEffect(() => {
    if (target) {
      setTitle(target.title || '');
      setGenre(target.genre || '');
      setRating(target.rating || '15세이상관람가');
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🎬 영상 상세 & 공개·구독권한 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>콘텐츠 제목: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.title}</strong></p>
            <p>장르: <strong>{target.genre}</strong> | 관람등급: <strong>{target.rating}</strong></p>
            <p>누적 시청수: <strong style={{ color: 'var(--color-success)' }}>{target.viewCount.toLocaleString()}회</strong></p>
            <p>필요 구독 권한: <strong style={{ color: 'var(--color-dark)' }}>{target.requiredPlan}</strong></p>
            <p>공개 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>구독 등급 권한 변경 (0.1초 완료):</label>
              <select value={target.requiredPlan || 'BASIC'} onChange={(e) => {
                setSelectedContent({ ...target, requiredPlan: e.target.value });
              }}>
                {plans.map(p => <option key={p.id} value={p.id.replace('PLAN-', '')}>{p.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>공개 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'PUBLISHED'} onChange={(e) => setSelectedContent({ ...target, status: e.target.value })}>
                <option value="DRAFT">초안 (DRAFT)</option>
                <option value="REVIEWING">검수중 (REVIEWING)</option>
                <option value="SCHEDULED">공개예정 (SCHEDULED)</option>
                <option value="PUBLISHED">공개중 (PUBLISHED)</option>
                <option value="PRIVATE">비공개 (PRIVATE)</option>
                <option value="RESTRICTED">제한공개 (RESTRICTED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusPlanRace(target)}>
              공개중 변경 + 즉시 구독권한 변경 (Error 1)
            </button>
            <small className="warn-desc">* 공개 상태 변경(3초 지연) 직후 구독권한 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 구독권한을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerPrivateWatchConflict(target.id)}>
                ⚡ 비공개 처리 후 시청 로그 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 비공개 처리(0.5초 완료) 직후 시청 로그 생성(4초 지연 완료) 시, 비공개 콘텐츠가 PUBLISHED로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 영상을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 콘텐츠 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>영상 제목:</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>장르 (부분 저장 미반영):</label>
              <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} />
            </div>
            <div className="form-group">
              <label>관람 등급:</label>
              <select value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="전체관람가">전체관람가</option>
                <option value="12세이상관람가">12세이상관람가</option>
                <option value="15세이상관람가">15세이상관람가</option>
                <option value="청소년관람불가">청소년관람불가</option>
              </select>
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, title, genre, rating)}>
              콘텐츠 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 제목/장르/관람등급 동시 수정 시 장르만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 영상을 선택하세요.</div>}
      </div>
    </aside>
  );
}
