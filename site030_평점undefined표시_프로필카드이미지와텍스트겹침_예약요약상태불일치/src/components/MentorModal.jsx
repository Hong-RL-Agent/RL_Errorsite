import React from "react";

export default function MentorModal({ mentor, onClose, onPreparing }) {
  if (!mentor) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <section className="mentor-modal" role="dialog" aria-modal="true" aria-label={`${mentor.name} 상세`} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>닫기</button>
        <img src={mentor.image} alt={`${mentor.name} profile`} />
        <div>
          <span>{mentor.field}</span>
          <h2>{mentor.name}</h2>
          <p>{mentor.headline}</p>
          <ul>
            <li>{mentor.career}년 경력</li>
            <li>{mentor.pricePerHour.toLocaleString("ko-KR")}원/시간</li>
            <li>{mentor.availableSlots.join(", ")} 상담 가능</li>
          </ul>
          <button onClick={onPreparing}>멘토에게 질문하기</button>
        </div>
      </section>
    </div>
  );
}
