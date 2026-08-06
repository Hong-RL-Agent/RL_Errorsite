import React from 'react';

export default function RightPanel({
  selectedVote,
  setSelectedVote,
  triggerOptionsCloseRace,
  triggerCommentStatusReversal,
  triggerDuplicateCast,
  comments
}) {
  const voteComments = comments.filter(c => c.voteId === selectedVote?.id);
  const targetComment = voteComments.length > 0 ? voteComments[0] : null;

  return (
    <aside className="panel-section operations-sidebar">
      <!-- Options modify & Close race (Error 1 Target) -->
      <div className="detail-widget">
        <h3>✏️ 선택지 수정 및 투표 마감</h3>
        {selectedVote ? (
          <div className="detail-panel">
            <p>안건 ID: <strong>{selectedVote.id}</strong> (현재상태: <span className={`status-badge ${selectedVote.status.toLowerCase()}`}>{selectedVote.status}</span>)</p>

            {selectedVote.options.map((opt, i) => (
              <div key={opt.id} className="form-group">
                <label>선택지 {i + 1} 문구 수정:</label>
                <input 
                  type="text" 
                  value={opt.text} 
                  onChange={(e) => {
                    const newOpts = [...selectedVote.options];
                    newOpts[i] = { ...newOpts[i], text: e.target.value };
                    setSelectedVote({ ...selectedVote, options: newOpts });
                  }}
                />
              </div>
            ))}

            <div className="front-actions-group">
              <button 
                className="close-btn"
                onClick={() => triggerOptionsCloseRace(selectedVote)}
              >
                ⚡ 선택지 수정 & 마감 (Error 1)
              </button>
            </div>
            <small className="warn-desc">* 선택지 수정(3초 지연 완료) 직후 마감(0.1초 완료) 시, 마감은 성공하나 3초 뒤 구형 선택지 문구가 동봉되어 롤백됨 (Error 1)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">수정할 투표 안건을 선택하세요.</div>
        )}
      </div>

      <!-- Comment modify & Status reversal (Error 4 Target) -->
      <div className="detail-widget">
        <h3>💬 댓글 수정 및 상태 역전 테스트</h3>
        {selectedVote && targetComment ? (
          <div className="detail-panel">
            <p>댓글 작성자: <strong>{targetComment.author}</strong></p>
            <div className="form-group">
              <label>댓글 내용 수정:</label>
              <input 
                type="text" 
                value={targetComment.content} 
                onChange={(e) => {
                  targetComment.content = e.target.value;
                }}
              />
            </div>
            <button 
              className="save-btn"
              onClick={() => triggerCommentStatusReversal(targetComment)}
            >
              댓글 수정 (Error 4)
            </button>
            <small className="warn-desc">* 투표 마감 직후 댓글 수정(4초 지연 완료) 요청 시 마감 상태인 투표가 다시 OPEN(진행중)으로 상태 역전됨 (Error 4)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">수정할 댓글이 존재하지 않습니다.</div>
        )}
      </div>

      <!-- Duplicate vote attempt (Error 7 Target) -->
      <div className="detail-widget">
        <h3>🚨 중복 투표 참여 시도</h3>
        {selectedVote ? (
          <div className="detail-panel">
            <button 
              className="dup-btn"
              onClick={() => triggerDuplicateCast(selectedVote)}
            >
              🚨 중복 투표 요청 (Error 7)
            </button>
            <small className="warn-desc">* HTTP 409 Conflict 에러를 반환하나 투표 감사 로그(voteLogs)에는 중복 참여가 기록됨 (Error 7)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">투표 안건을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
