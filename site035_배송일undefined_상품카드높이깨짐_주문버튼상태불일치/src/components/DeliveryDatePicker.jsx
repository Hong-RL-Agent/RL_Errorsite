import React from "react";

export default function DeliveryDatePicker({ dates, selectedDate, onDateChange }) {
  return (
    <section className="date-picker">
      {dates.map((date) => <button key={date.date} disabled={!date.available} className={selectedDate === date.date ? "active" : ""} onClick={() => date.available && onDateChange(date.date)}><strong>{date.date}</strong><span>{date.weekday}</span><small>{date.available ? `+${date.extraFee.toLocaleString("ko-KR")}원` : "마감"}</small></button>)}
    </section>
  );
}
