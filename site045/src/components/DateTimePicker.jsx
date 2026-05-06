export default function DateTimePicker({ selectedDate, selectedTime, onDateChange, onTimeChange, availableTimes }) {
  return (
    <section className="datetime-section">
      <div className="section-header">
        <h3>예약 일정 선택</h3>
        <p>원하는 날짜와 스타일리스트 시간대를 선택하세요.</p>
      </div>
      <div className="datetime-grid">
        <label>
          예약 날짜
          <input type="date" value={selectedDate} onChange={(e) => onDateChange(e.target.value)} />
        </label>
        <label>
          예약 시간
          <select value={selectedTime} onChange={(e) => onTimeChange(e.target.value)}>
            {availableTimes.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="datetime-note">선택 가능한 시간은 스타일리스트별로 다르게 표시됩니다.</p>
    </section>
  );
}
