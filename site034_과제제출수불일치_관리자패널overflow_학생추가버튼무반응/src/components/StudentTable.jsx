import React from "react";

export default function StudentTable({ students, courses, courseFilter, onCourseFilterChange, assignmentStatus, onAssignmentStatusChange, onOpenStudent }) {
  return (
    <section className="student-panel">
      <div className="table-toolbar">
        <div><span>Students</span><h2>학생 테이블</h2></div>
        <select value={courseFilter} onChange={(event) => onCourseFilterChange(event.target.value)}>{courses.map((course) => <option key={course}>{course}</option>)}</select>
        <select value={assignmentStatus} onChange={(event) => onAssignmentStatusChange(event.target.value)}><option>전체</option><option>제출 완료</option><option>미제출</option></select>
        {/* INTENTIONAL GUI BUG: site034-bug03 */}
        {/* Type: add-student-button-no-response */}
        {/* Description: 학생 추가 버튼 클릭 시 모달 open state를 변경하지 않아 아무 반응이 없음. */}
        <button data-bug-id="site034-bug03" onClick={() => {}}>학생 추가</button>
      </div>
      <table>
        <thead><tr><th>ID</th><th>이름</th><th>강의</th><th>진도율</th><th>출석률</th><th>최근 접속</th><th>과제</th></tr></thead>
        <tbody>{students.map((student) => <tr key={student.id} onClick={() => onOpenStudent(student)}><td>{student.id}</td><td>{student.name}</td><td>{student.course}</td><td>{student.progress}%</td><td>{student.attendance}%</td><td>{student.lastLogin}</td><td>{student.submitted ? "제출 완료" : "미제출"}</td></tr>)}</tbody>
      </table>
    </section>
  );
}
