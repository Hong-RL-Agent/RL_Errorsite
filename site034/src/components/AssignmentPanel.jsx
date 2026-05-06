import React from "react";

export default function AssignmentPanel({ assignments }) {
  return (
    <section className="assignment-panel">
      <div className="section-heading"><span>Assignments</span><h2>과제 제출 현황</h2></div>
      <div className="assignment-grid">
        {assignments.map((assignment, index) => (
          <article key={assignment.id}>
            <span>{assignment.course}</span>
            {/* INTENTIONAL GUI BUG: site034-bug01 */}
            {/* Type: assignment-count-mismatch */}
            {/* Description: 과제 요약 카드와 학생 테이블이 서로 다른 제출 상태 계산 기준을 사용해 제출 수가 불일치함. */}
            <strong data-bug-id={index === 0 ? "site034-bug01" : undefined}>{assignment.submittedCount}명 제출</strong>
            <p>미제출 {assignment.missingCount}명 · 마감 {assignment.dueDate}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
