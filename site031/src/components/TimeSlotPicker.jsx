import React from "react";

export default function TimeSlotPicker({ provider }) {
  if (!provider) return null;
  const visibleTimes = [...provider.availableTimes, provider.availableTimes.find((time) => time === "14:30")].filter(Boolean);

  return (
    // INTENTIONAL GUI BUG: site031-bug01
    // Type: duplicate-time-slot-render
    // Description: 예약 가능 시간 배열 렌더링 시 특정 슬롯을 추가로 append하여 같은 시간이 중복 표시됨.
    <div className="modal-time-grid" data-bug-id="site031-bug01">
      {visibleTimes.map((time, index) => (
        <button key={`${time}-${index}`}>{time}</button>
      ))}
    </div>
  );
}
