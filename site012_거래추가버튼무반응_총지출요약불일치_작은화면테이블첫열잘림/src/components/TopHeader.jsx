import React from 'react';

function TopHeader({ selectedMonth, setSelectedMonth, addToast }) {
  const months = ['2026-03', '2026-04', '2026-05'];

  return (
    <div className="top-header">
      <h1>가계부 대시보드</h1>
      <div className="top-header-right">
        <div className="month-selector" onClick={() => addToast('월 선택 기능은 준비 중입니다.')}>
          📅 {selectedMonth}
        </div>

        {/* INTENTIONAL GUI BUG: site012-bug01
            Type: button-no-response
            Description: "거래 추가" 버튼이 클릭되어도 폼/모달이 열리지 않도록
            onClick 이벤트 핸들러를 연결하지 않음 (정상 기능과 달리 토스트도 없음).
        */}
        <button
          className="btn-add"
          data-bug-id="site012-bug01"
          // onClick을 의도적으로 제거 — 아무 반응 없음
        >
          + 거래 추가
        </button>
      </div>
    </div>
  );
}

export default TopHeader;
