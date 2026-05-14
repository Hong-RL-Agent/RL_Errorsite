import React from "react";

export default function Header({ regions, region, onRegionChange, dates, selectedDate, onDateChange, selectedTime, partySize, onPartySizeChange, onPreparing }) {
  return (
    <header className="site-header">
      <a className="logo" href="#top">Maison Reserve</a>
      <label>
        <span>지점</span>
        <select value={region} onChange={(event) => onRegionChange(event.target.value)}>
          {regions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label>
        <span>날짜</span>
        <select value={selectedDate} onChange={(event) => onDateChange(event.target.value)}>
          {dates.map((date) => <option key={date} value={date}>{date}</option>)}
        </select>
      </label>
      <label>
        <span>시간</span>
        <input value={selectedTime} readOnly />
      </label>
      <label>
        <span>인원</span>
        <select value={partySize} onChange={(event) => onPartySizeChange(Number(event.target.value))}>
          {[2, 3, 4, 5, 6, 8].map((size) => <option key={size} value={size}>{size}명</option>)}
        </select>
      </label>
      <button onClick={onPreparing}>예약 확인</button>
      <button onClick={onPreparing}>로그인</button>
    </header>
  );
}
