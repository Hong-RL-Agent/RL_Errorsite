import React, { useState } from "react";

export default function ReservationSummary({ restaurant, selectedDate, selectedTime, initialPartySize, onPreparing }) {
  const [summaryPartySize] = useState(initialPartySize);
  return (
    <aside className="reservation-summary">
      <span>Reservation summary</span>
      <h2>{restaurant?.name ?? "매장 선택 필요"}</h2>
      <dl>
        <div><dt>날짜</dt>
          {/* INTENTIONAL GUI BUG: site032-bug03 */}
          {/* Type: date-selection-lag */}
          {/* Description: 날짜 선택 후 예약 요약 날짜를 이전 state 기준으로 업데이트해 한 단계 늦게 표시됨. */}
          <dd data-bug-id="site032-bug03">{selectedDate}</dd></div>
        <div><dt>시간</dt><dd>{selectedTime}</dd></div>
        <div><dt>인원</dt>
          {/* INTENTIONAL GUI BUG: site032-bug01 */}
          {/* Type: party-size-summary-mismatch */}
          {/* Description: 인원 선택 값 변경 후 예약 요약 패널의 내부 state가 갱신되지 않아 이전 인원 수가 표시됨. */}
          <dd data-bug-id="site032-bug01">{summaryPartySize}명</dd></div>
        <div><dt>가격대</dt><dd>{restaurant?.priceRange ?? "-"}</dd></div>
      </dl>
      <button onClick={onPreparing}>예약 요청</button>
    </aside>
  );
}
