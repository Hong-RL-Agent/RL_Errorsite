import React from "react";

export default function StatCards({ students, assignments }) {
  const avgProgress = Math.round(students.reduce((sum, student) => sum + student.progress, 0) / students.length);
  const avgAttendance = Math.round(students.reduce((sum, student) => sum + student.attendance, 0) / students.length);
  return (
    <section className="stat-grid">
      <article><span>전체 학생</span><strong>{students.length}</strong></article>
      <article><span>평균 진도율</span><strong>{avgProgress}%</strong></article>
      <article><span>평균 출석률</span><strong>{avgAttendance}%</strong></article>
      <article><span>진행 과제</span><strong>{assignments.length}</strong></article>
    </section>
  );
}
