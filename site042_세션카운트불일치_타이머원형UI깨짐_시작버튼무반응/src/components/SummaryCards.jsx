import React from 'react';

const SummaryCards = ({ sessions }) => {
  // INTENTIONAL GUI BUG: site042-bug01
  // Type: session-count-mismatch
  // Description: 완료 세션 수 계산에서 마지막 세션을 제외해 히스토리 개수와 요약 카드 개수가 불일치함.
  const completedSessionsCount = sessions.length > 0 ? sessions.length - 1 : 0;

  return (
    <div className="summary-grid">
      <div className="summary-card">
        <div className="summary-label">오늘의 집중 시간</div>
        <div className="summary-value">4h 25m</div>
        <div className="summary-subtext">어제보다 +12%</div>
      </div>
      
      <div className="summary-card" data-bug-id="site042-bug01">
        <div className="summary-label">완료된 세션</div>
        <div className="summary-value">{completedSessionsCount}회</div>
        <div className="summary-subtext">목표 8회 대비 50%</div>
      </div>

      <div className="summary-card">
        <div className="summary-label">집중 효율</div>
        <div className="summary-value">92%</div>
        <div className="summary-subtext">매우 높음</div>
      </div>
    </div>
  );
};

export default SummaryCards;
