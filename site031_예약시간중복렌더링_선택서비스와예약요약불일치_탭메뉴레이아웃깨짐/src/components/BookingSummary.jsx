import React, { useState } from "react";

export default function BookingSummary({ provider, service, open, onToggle, onPreparing }) {
  const [summaryService] = useState(service);

  return (
    <aside className={`booking-summary ${open ? "open" : "closed"}`}>
      <div className="summary-header">
        <span>예약 요약</span>
        <button onClick={onToggle}>{open ? "접기" : "펼치기"}</button>
      </div>
      {open && (
        <div className="summary-body">
          <h2>{provider?.name ?? "업체 선택 필요"}</h2>
          <dl>
            <div>
              <dt>선택 서비스</dt>
              {/* INTENTIONAL GUI BUG: site031-bug02 */}
              {/* Type: selected-service-summary-mismatch */}
              {/* Description: 예약 요약 패널이 초기 서비스명만 내부 state로 저장해 이후 선택 변경을 반영하지 않음. */}
              <dd data-bug-id="site031-bug02">{summaryService}</dd>
            </div>
            <div>
              <dt>현재 카드 서비스</dt>
              <dd>{provider?.serviceType ?? "-"}</dd>
            </div>
            <div>
              <dt>지역</dt>
              <dd>{provider?.region ?? "-"}</dd>
            </div>
            <div>
              <dt>가격대</dt>
              <dd>{provider?.priceRange ?? "-"}</dd>
            </div>
          </dl>
          <button className="reserve-button" onClick={onPreparing}>예약 진행</button>
        </div>
      )}
    </aside>
  );
}
