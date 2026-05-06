import React from "react";
import MentorCard from "./MentorCard.jsx";

export default function MentorGrid({ mentors, selectedMentorId, onSelectMentor, onOpenModal }) {
  return (
    <section className="mentor-section" id="mentors">
      <div className="mentor-grid">
        {mentors.map((mentor) => (
          <MentorCard
            key={mentor.id}
            mentor={mentor}
            isSelected={mentor.id === selectedMentorId}
            onSelectMentor={onSelectMentor}
            onOpenModal={onOpenModal}
          />
        ))}
      </div>
      {mentors.length === 0 && <div className="empty-state">조건에 맞는 멘토가 없습니다.</div>}
    </section>
  );
}
