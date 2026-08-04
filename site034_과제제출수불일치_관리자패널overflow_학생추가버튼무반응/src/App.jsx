import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import AdminSidebar from "./components/AdminSidebar.jsx";
import StatCards from "./components/StatCards.jsx";
import StudentTable from "./components/StudentTable.jsx";
import StudentDrawer from "./components/StudentDrawer.jsx";
import AssignmentPanel from "./components/AssignmentPanel.jsx";
import ProgressChart from "./components/ProgressChart.jsx";
import NoticeComposer from "./components/NoticeComposer.jsx";
import TaskPanel from "./components/TaskPanel.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("전체");
  const [assignmentStatus, setAssignmentStatus] = useState("전체");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeBody, setNoticeBody] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [studentResponse, assignmentResponse] = await Promise.all([fetch("/api/students"), fetch("/api/assignments")]);
        if (!studentResponse.ok || !assignmentResponse.ok) throw new Error("LMS 관리자 데이터를 불러오지 못했습니다.");
        const studentData = await studentResponse.json();
        const assignmentData = await assignmentResponse.json();
        if (mounted) {
          setStudents(studentData.students);
          setAssignments(assignmentData.assignments);
        }
      } catch (loadError) {
        if (mounted) setError(loadError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const courses = useMemo(() => ["전체", ...new Set(students.map((student) => student.course))], [students]);
  const filteredStudents = useMemo(() => students.filter((student) => {
    const matchesQuery = student.name.toLowerCase().includes(query.toLowerCase()) || student.id.toLowerCase().includes(query.toLowerCase());
    const matchesCourse = courseFilter === "전체" || student.course === courseFilter;
    const matchesStatus = assignmentStatus === "전체" || (assignmentStatus === "제출 완료" ? student.submitted : !student.submitted);
    return matchesQuery && matchesCourse && matchesStatus;
  }), [students, query, courseFilter, assignmentStatus]);

  function showPreparing() { alert("준비중입니다."); }

  return (
    <div className="app-shell">
      <Header query={query} onQueryChange={setQuery} onPreparing={showPreparing} />
      <div className="admin-frame">
        <AdminSidebar />
        <main>
          {loading && <div className="status-panel">관리자 데이터를 불러오는 중입니다...</div>}
          {error && <div className="status-panel error">오류: {error}</div>}
          {!loading && !error && (
            <>
              <StatCards students={students} assignments={assignments} />
              <section className="admin-layout">
                <div className="admin-main">
                  <AssignmentPanel assignments={assignments} />
                  <ProgressChart students={students} />
                  <StudentTable
                    students={filteredStudents}
                    courses={courses}
                    courseFilter={courseFilter}
                    onCourseFilterChange={setCourseFilter}
                    assignmentStatus={assignmentStatus}
                    onAssignmentStatusChange={setAssignmentStatus}
                    onOpenStudent={setSelectedStudent}
                  />
                  <NoticeComposer title={noticeTitle} body={noticeBody} onTitleChange={setNoticeTitle} onBodyChange={setNoticeBody} onPreparing={showPreparing} />
                </div>
                <TaskPanel onPreparing={showPreparing} />
              </section>
            </>
          )}
        </main>
      </div>
      <StudentDrawer student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      <Footer onPreparing={showPreparing} />
    </div>
  );
}
