import React, { useState } from "react";

export default function BookingSummary({ mentor, initialSlot, onPreparing }) {
  const [summarySlot] = useState(initialSlot);

  return (
    <section className="booking-summary">
      <span>Booking summary</span>
      <h2>{mentor?.name ?? "멘토 선택 필요"}</h2>
      <dl>
        <div>
          <dt>분야</dt>
          <dd>{mentor?.field ?? "-"}</dd>
        </div>
        <div>
          <dt>상담 가격</dt>
          <dd>{mentor ? `${mentor.pricePerHour.toLocaleString("ko-KR")}원` : "-"}</dd>
        </div>
        <div>
          <dt>선택 시간</dt>
          {/* INTENTIONAL GUI BUG: site030-bug03 */}
          {/* Type: booking-summary-state-mismatch */}
          {/* Description: BookingSummary가 초기 시간 슬롯만 내부 state로 저장해 이후 선택 변경을 반영하지 않음. */}
          <dd data-bug-id="site030-bug03">{summarySlot || "-"}</dd>
        </div>
      </dl>
      <button onClick={onPreparing}>예약 요청</button>
    </section>
  );
}
