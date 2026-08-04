import React from "react";

export default function TimeSlotPicker({ mentor, selectedSlot, onSlotChange }) {
  if (!mentor) return null;

  return (
    <section className="time-slot-card" id="booking">
      <span>Available time</span>
      <h2>{mentor.name} 상담 시간</h2>
      <div className="slot-row">
        {mentor.availableSlots.map((slot) => (
          <button key={slot} className={selectedSlot === slot ? "active" : ""} onClick={() => onSlotChange(slot)}>
            {slot}
          </button>
        ))}
      </div>
    </section>
  );
}
