import React from "react";

export default function ReservationSearch({ regions, region, onRegionChange, dates, selectedDate, onDateChange, partySize, onPartySizeChange }) {
  return (
    <section className="reservation-search">
      <label>
        <span>지역 필터</span>
        <select value={region} onChange={(event) => onRegionChange(event.target.value)}>
          {regions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label>
        <span>예약 날짜</span>
        <select value={selectedDate} onChange={(event) => onDateChange(event.target.value)}>
          {dates.map((date) => <option key={date} value={date}>{date}</option>)}
        </select>
      </label>
      <label>
        <span>인원 수</span>
        <select value={partySize} onChange={(event) => onPartySizeChange(Number(event.target.value))}>
          {[2, 3, 4, 5, 6, 8].map((size) => <option key={size} value={size}>{size}명</option>)}
        </select>
      </label>
    </section>
  );
}
