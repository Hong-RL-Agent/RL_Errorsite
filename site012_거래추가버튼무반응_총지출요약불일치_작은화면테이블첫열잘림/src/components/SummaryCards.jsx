import React from 'react';

function fmt(n) {
  return n.toLocaleString('ko-KR') + '원';
}

function SummaryCards({ totalIncome, displayedExpense, balance }) {
  return (
    <div className="summary-section">
      <div className="summary-card">
        <div className="label">총 수입</div>
        <div className="amount income">+{fmt(totalIncome)}</div>
      </div>

      {/* INTENTIONAL GUI BUG: site012-bug02 (rendered from App.jsx displayedExpense)
          Type: state-mismatch
          Description: 실제 합계와 다른 값(totalExpense + 99999)을 받아 표시하여
          목록 합계와 요약 카드가 일치하지 않음.
      */}
      <div className="summary-card" data-bug-id="site012-bug02">
        <div className="label">총 지출</div>
        <div className="amount expense">-{fmt(displayedExpense)}</div>
      </div>

      <div className="summary-card">
        <div className="label">잔액</div>
        <div className="amount balance">{balance >= 0 ? '+' : ''}{fmt(balance)}</div>
      </div>
    </div>
  );
}

export default SummaryCards;
