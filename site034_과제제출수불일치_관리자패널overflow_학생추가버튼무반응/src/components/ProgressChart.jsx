import React from "react";

export default function ProgressChart({ students }) {
  const byCourse = [...new Set(students.map((student) => student.course))].map((course) => {
    const rows = students.filter((student) => student.course === course);
    return { course, progress: Math.round(rows.reduce((sum, student) => sum + student.progress, 0) / rows.length) };
  });
  return (
    <section className="progress-panel">
      <div className="section-heading"><span>Progress</span><h2>강의별 진도율</h2></div>
      {byCourse.map((item) => <div className="progress-row" key={item.course}><span>{item.course}</span><div><i style={{ width: `${item.progress}%` }} /></div><strong>{item.progress}%</strong></div>)}
    </section>
  );
}
