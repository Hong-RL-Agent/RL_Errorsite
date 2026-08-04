import React from "react";

export default function DateTabs({ dates, activeDate, onDateChange }) {
  return (
    <section className="date-tabs" aria-label="날짜 선택">
      {dates.map((date) => (
        <button key={date} className={date === activeDate ? "active" : ""} onClick={() => onDateChange(date)}>
          <span>{new Date(date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</span>
          <small>{new Date(date).toLocaleDateString("en-US", { weekday: "short" })}</small>
        </button>
      ))}
    </section>
  );
}
