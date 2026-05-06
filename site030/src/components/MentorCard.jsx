import React from "react";

export default function MentorCard({ mentor, isSelected, onSelectMentor, onOpenModal }) {
  return (
    <article className={`mentor-card ${isSelected ? "selected" : ""}`} data-bug-id={mentor.id === "mentor-kim" ? "site030-bug02" : undefined}>
      <div className="mentor-photo-wrap">
        <img src={mentor.image} alt={`${mentor.name} profile`} />
      </div>
      <div className="mentor-card-content">
        <span className="field-pill">{mentor.field}</span>
        <h3>{mentor.name}</h3>
        <p>{mentor.headline}</p>
        <div className="mentor-metrics">
          <span>{mentor.career}년 경력</span>
          {/* INTENTIONAL GUI BUG: site030-bug01 */}
          {/* Type: undefined-rating-render */}
          {/* Description: rating이 없는 멘토에 fallback을 제공하지 않아 undefined 텍스트가 표시됨. */}
          <span data-bug-id={mentor.rating === undefined ? "site030-bug01" : undefined}>평점 {`${mentor.rating}`}</span>
          <span>{mentor.pricePerHour.toLocaleString("ko-KR")}원/시간</span>
        </div>
        <div className="card-actions">
          <button onClick={() => onOpenModal(mentor)}>상세 보기</button>
          <button onClick={() => onSelectMentor(mentor)}>예약 선택</button>
        </div>
      </div>
    </article>
  );
}
