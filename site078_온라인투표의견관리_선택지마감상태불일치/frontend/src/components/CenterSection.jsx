import React from 'react';

export default function CenterSection({
  selectedVote,
  participants,
  deleteParticipant,
  getCategoryLabel
}) {
  const voteParticipants = participants.filter(p => p.voteId === selectedVote?.id);

  return (
    <main className="panel-section center-section">
      {selectedVote ? (
        <div className="vote-detail-header">
          <h2>{selectedVote.title}</h2>
          <p>카테고리: <strong>{getCategoryLabel(selectedVote.category)}</strong> | 상태: <span className={`status-badge ${selectedVote.status.toLowerCase()}`}>{selectedVote.status}</span> | 총 참여자: <strong>{selectedVote.totalVoters}명</strong></p>
        </div>
      ) : (
        <div className="vote-detail-header">
          <h2>투표 안건을 선택하세요</h2>
        </div>
      )}

      <!-- SVG Results Bar Chart Widget -->
      <div className="widget-section results-svg-widget">
        <h3>📊 선택지별 투표 결과 (SVG Graph)</h3>
        {selectedVote ? (
          <div className="bar-chart-container">
            {selectedVote.options.map(opt => {
              const maxVotes = Math.max(...selectedVote.options.map(o => o.votesCount), 1);
              const pct = Math.round((opt.votesCount / maxVotes) * 100);
              return (
                <div key={opt.id} className="opt-bar-row">
                  <div className="opt-bar-label">
                    <span>{opt.text}</span>
                    <strong>{opt.votesCount}표 ({pct}%)</strong>
                  </div>
                  <div className="opt-bar-track">
                    <div className="opt-bar-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-lbl-dark">안건을 선택하면 개표 그래프가 표시됩니다.</div>
        )}
      </div>

      <!-- Participants List Table (Error 2 Target) -->
      <div className="widget-section">
        <h3>👥 실시간 투표 참여자 대장 (최소 35개)</h3>
        <div className="table-scroll-box">
          <table>
            <thead>
              <tr>
                <th>참여 ID</th>
                <th>투표자 성명</th>
                <th>선택 옵션 ID</th>
                <th>참여 일시</th>
                <th>취소</th>
              </tr>
            </thead>
            <tbody>
              {voteParticipants.map(part => (
                <tr key={part.id}>
                  <td><strong>{part.id}</strong></td>
                  <td>{part.voterName}</td>
                  <td>{part.optionId}</td>
                  <td>{part.votedAt}</td>
                  <td>
                    <button className="delete-btn-sm" onClick={() => deleteParticipant(part.id)}>
                      🗑️ 취소 (Error 2)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <small className="warn-desc">* 투표 참여 취소(DELETE) 시 목록에서는 삭제되나 결과 그래프와 총 참여자 수 및 data.json statistics에는 계속 포함 유지됨 (Error 2)</small>
      </div>
    </main>
  );
}
