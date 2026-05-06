import React from "react";

export default function StudentDrawer({ student, onClose }) {
  if (!student) return null;
  return (
    <aside className="student-drawer">
      <button onClick={onClose}>닫기</button>
      <h2>{student.name}</h2>
      <p>{student.id} · {student.course}</p>
      <dl><div><dt>진도율</dt><dd>{student.progress}%</dd></div><div><dt>출석률</dt><dd>{student.attendance}%</dd></div><div><dt>과제 제출</dt><dd>{student.submittedAssignments}개</dd></div></dl>
    </aside>
  );
}
