"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import ToastStack from "../components/ToastStack";
import { useToast } from "../hooks/useToast";

const LEARNER_ID = 1;
const TARGET_COURSE = "C0001";
const TARGET_NOTE_COURSE = "C0002";
const TARGET_ASSIGNMENT = "A0001";

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState(null);
  const [syllabus, setSyllabus] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [slides, setSlides] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [summaryProgress, setSummaryProgress] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [enrollments, setEnrollments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [answer, setAnswer] = useState("");
  const [attachment, setAttachment] = useState("");
  const [preview, setPreview] = useState(false);
  const [note, setNote] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [staleNoteText, setStaleNoteText] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("popular");
  const [view, setView] = useState("catalog");
  const [playing, setPlaying] = useState(false);
  const { toasts, pushToast } = useToast();

  const categories = ["", "프로그래밍", "디자인", "데이터 분석", "AI", "마케팅", "영상 편집", "비즈니스", "외국어", "자격증", "취미"];
  const progressPercent = useMemo(() => {
    if (!syllabus.length) return 0;
    return Math.round((completedLessonIds.size / syllabus.length) * 100);
  }, [completedLessonIds, syllabus]);

  const loadCourses = useCallback(async () => {
    const data = await api.courses({ q: query, category, level, sort });
    setCourses(data.items);
    if (!course && data.items[0]) setCourse(data.items[0]);
  }, [query, category, level, sort, course]);

  const loadAccount = useCallback(async () => {
    const [en, as, ce, nt, ac] = await Promise.all([
      api.enrollments(LEARNER_ID),
      api.assignments({ learnerId: LEARNER_ID }),
      api.certificates(LEARNER_ID),
      api.notifications(LEARNER_ID),
      api.activity(LEARNER_ID)
    ]);
    setEnrollments(en.items);
    setAssignments(as.items);
    setCertificates(ce.items);
    setNotifications(nt.items);
    setActivity(ac.items);
  }, []);

  const openCourse = useCallback(async (id) => {
    const [detail, list, status] = await Promise.all([api.course(id), api.syllabus(id, LEARNER_ID), api.status(id, LEARNER_ID)]);
    setCourse(detail.course);
    setSyllabus(list.items);
    setCompletedLessonIds(new Set(list.items.filter((item) => item.completed).map((item) => item.id)));
    setSummaryProgress(status.status.progressPercent);
    if (list.items[0]) await openLesson(list.items[0].id);
    setView("classroom");
  }, []);

  async function openLesson(id) {
    const [lessonData, slideData] = await Promise.all([api.lesson(id), api.slides(id)]);
    setLesson(lessonData.lesson);
    setSlides(slideData.items);
    setSlideIndex(0);
    setPlaying(false);
  }

  async function loadNote(courseId = course?.id) {
    if (!courseId) return;
    const data = await api.notes({ learnerId: LEARNER_ID, courseId });
    const found = data.items[0] || null;
    setNote(found);
    if (courseId === TARGET_NOTE_COURSE && staleNoteText) {
      setNoteText(staleNoteText);
      return;
    }
    setNoteText(found?.body || "");
  }

  useEffect(() => {
    loadCourses().catch((error) => pushToast(error.message, "error"));
    loadAccount().catch((error) => pushToast(error.message, "error"));
  }, []);

  async function searchCourses(event) {
    event.preventDefault();
    await loadCourses();
    setView("catalog");
    pushToast("강의를 검색했습니다.");
  }

  async function enroll() {
    if (!course) return;
    await api.enroll({ learnerId: LEARNER_ID, courseId: course.id });
    await loadAccount();
    pushToast("수강 신청이 완료되었습니다.");
  }

  async function completeLesson() {
    if (!lesson || !course) return;
    const saved = await api.saveProgress({ learnerId: LEARNER_ID, courseId: course.id, lessonId: lesson.id, status: "completed", seconds: 600 });
    setCompletedLessonIds((current) => new Set([...current, lesson.id]));
    // INTENTIONAL_ERROR: B10-ERR05
    // CSV Error: 캐시 상태 불일치
    // Strategy: ACTION_REPLAY
    // Description: 강의 완료 후 상단 진도율 요약 캐시를 갱신하지 않음.
    pushToast("학습 완료로 저장했습니다.");
  }

  async function checkCompletion() {
    if (!course) return;
    // INTENTIONAL_ERROR: B10-ERR01
    // CSV Error: 워크플로우 우회 / 단계 우회
    // Strategy: SEQUENCE_REPLAY
    // Description: 필수 강의가 완료되지 않았지만 수료 확인 단계가 활성화됨.
    const status = await api.status(course.id, LEARNER_ID);
    setView("certificate");
    if (!status.status.eligible) pushToast("아직 수료 조건을 모두 충족하지 못했습니다.", "error");
  }

  async function issueCertificate() {
    if (!course) return;
    try {
      await api.issueCertificate({ learnerId: LEARNER_ID, courseId: course.id });
      await loadAccount();
      pushToast("수료증이 발급되었습니다.");
    } catch (error) {
      pushToast(error.message, "error");
    }
  }

  async function saveNote() {
    if (!course) return;
    const previous = noteText;
    const result = note ? await api.updateNote(note.id, { body: noteText }) : await api.createNote({ learnerId: LEARNER_ID, courseId: course.id, body: noteText });
    setNote(result.note);
    if (course.id === TARGET_NOTE_COURSE && !staleNoteText) setStaleNoteText(previous);
    pushToast("학습 메모를 저장했습니다.");
  }

  async function revisitNote() {
    setView("dashboard");
    await loadNote(TARGET_NOTE_COURSE);
    // INTENTIONAL_ERROR: B10-ERR04
    // CSV Error: 정보 지속성 부족 (Persistence)
    // Strategy: STATE_REVISIT
    // Description: 재방문 시 최신 서버 메모보다 오래된 로컬 캐시 값을 우선 표시함.
  }

  function openAssignment(item = assignments[0]) {
    setAssignment(item);
    setAnswer("");
    setAttachment("");
    setPreview(false);
    setView("assignments");
  }

  function cancelSubmissionFlow() {
    // INTENTIONAL_ERROR: B10-ERR02
    // CSV Error: 다단계 워크플로우 부분적 롤백 실패
    // Strategy: SEQUENCE_REPLAY
    // Description: 제출 취소 시 첨부 상태와 요약 정보가 제출 준비 상태로 남음.
    setAnswer("");
    setPreview(false);
  }

  async function submitAssignment() {
    if (!assignment) return;
    await api.submitAssignment(assignment.id, { learnerId: LEARNER_ID, body: answer, attachmentName: attachment });
    await loadAccount();
    pushToast("과제를 제출했습니다.");
  }

  async function resetData() {
    await api.reset();
    setView("catalog");
    setCourse(null);
    setLesson(null);
    setSyllabus([]);
    setCompletedLessonIds(new Set());
    setSummaryProgress(0);
    setStaleNoteText("");
    await Promise.all([loadCourses(), loadAccount()]);
    pushToast("초기 데이터로 복원했습니다.");
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand" onClick={() => setView("catalog")}><span>SO</span>SkillOrbit</div>
        <form className="search" onSubmit={searchCourses}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="강의 검색" />
          <button type="submit">검색</button>
        </form>
        <nav>
          <button onClick={() => setView("dashboard")}>대시보드</button>
          <button onClick={() => openAssignment()}>과제</button>
          <button onClick={() => setView("certificate")}>수료증</button>
          <button onClick={resetData}>Reset</button>
        </nav>
      </header>

      {view === "catalog" && (
        <>
          <section className="hero">
            <div><p>Unseen Edu Platform</p><h1>배우고, 제출하고, 수료까지 도는 학습 궤도</h1><span>강의 검색부터 수료증 발급까지 실제 API로 상태를 저장합니다.</span></div>
          </section>
          <section className="filters">
            <select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item} value={item}>{item || "전체 카테고리"}</option>)}</select>
            <select value={level} onChange={(event) => setLevel(event.target.value)}><option value="">전체 난이도</option><option>입문</option><option>중급</option><option>고급</option></select>
            <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">인기순</option><option value="latest">최신순</option></select>
          </section>
          <section className="courseGrid">
            {courses.slice(0, 18).map((item) => (
              <article className="courseCard" key={item.id} onClick={() => openCourse(item.id)}>
                <span>{item.category}</span><h2>{item.title}</h2><p>{item.summary}</p><strong>{item.level} · {item.hours}시간</strong>
              </article>
            ))}
          </section>
        </>
      )}

      {view === "classroom" && course && (
        <section className="classroom">
          <aside className="curriculum">
            <h2>커리큘럼</h2>
            {syllabus.map((item, index) => <button className={lesson?.id === item.id ? "active" : ""} key={item.id} onClick={() => openLesson(item.id)}>{completedLessonIds.has(item.id) ? "✓" : index + 1} {item.title}</button>)}
            <button onClick={checkCompletion} data-bug-id="B10-ERR01">수료 확인</button>
          </aside>
          <div className="lessonStage">
            <div className="progressHeader">
              <div><p>{course.title}</p><h1>{lesson?.title}</h1></div>
              <div className="progressRing" data-bug-id="B10-ERR05">{summaryProgress}%</div>
            </div>
            <div className="player">
              <button onClick={() => setPlaying((value) => !value)}>{playing ? "일시정지" : "재생"}</button>
              <p>{playing ? "데모 강의 플레이어가 재생 중입니다." : "강의 플레이어 대기 중"}</p>
            </div>
            <div className="slides" data-bug-id="B10-ERR03">
              <h2>{slides[slideIndex]?.title}</h2>
              <p>{slides[slideIndex]?.body}</p>
              {/* INTENTIONAL_ERROR: B10-ERR03
              CSV Error: 페이지네이션 없는 슬라이드
              Strategy: SEQUENCE_REPLAY
              Description: 학습 슬라이드의 현재 페이지와 전체 개수 표시가 누락됨. */}
              <div className="row"><button onClick={() => setSlideIndex((index) => Math.max(0, index - 1))}>이전 슬라이드</button><button onClick={() => setSlideIndex((index) => Math.min(slides.length - 1, index + 1))}>다음 슬라이드</button></div>
            </div>
            <div className="row">
              <button onClick={completeLesson} data-bug-id="B10-ERR05">학습 완료</button>
              <button onClick={() => loadNote(course.id)}>메모 열기</button>
              <button onClick={enroll}>수강 신청</button>
            </div>
          </div>
          <aside className="resourcePanel">
            <h2>강사 프로필</h2><p>{course.instructorName}</p>
            <h2>자료 다운로드</h2><p>워크북.pdf · 예제파일.zip</p>
            <h2>퀴즈</h2><button onClick={() => api.submitQuiz("Q0001", { learnerId: LEARNER_ID, answer: "A" }).then(() => pushToast("퀴즈를 제출했습니다."))}>퀴즈 제출</button>
            <h2>강의 메모</h2>
            <textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="학습 메모" data-bug-id={course.id === TARGET_NOTE_COURSE ? "B10-ERR04" : undefined} />
            <button onClick={saveNote}>메모 저장</button>
            <button onClick={revisitNote} data-bug-id="B10-ERR04">재로그인 후 재방문</button>
          </aside>
        </section>
      )}

      {view === "assignments" && (
        <section className="assignmentPage">
          <div className="panel">
            <h1>과제 제출</h1>
            <select value={assignment?.id || ""} onChange={(event) => openAssignment(assignments.find((item) => item.id === event.target.value))}>{assignments.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
            <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="답안 텍스트" data-bug-id="B10-ERR02" />
            <input value={attachment} onChange={(event) => setAttachment(event.target.value)} placeholder="테스트 첨부 자료명" data-bug-id="B10-ERR02" />
            <div className="submissionSummary" data-bug-id="B10-ERR02">제출 요약: {attachment || "첨부 없음"}</div>
            {preview && <div className="preview">미리보기: {answer} / {attachment}</div>}
            <div className="row"><button onClick={() => setPreview(true)}>미리보기</button><button onClick={cancelSubmissionFlow} data-bug-id="B10-ERR02">제출 취소</button><button onClick={submitAssignment}>제출</button></div>
          </div>
        </section>
      )}

      {view === "dashboard" && (
        <section className="dashboard">
          <div className="panel"><h2>내 강의</h2>{enrollments.slice(0, 8).map((item) => <p key={item.id}>{item.courseTitle} · {item.status}</p>)}</div>
          <div className="panel"><h2>학습 시간 통계</h2><strong>{activity.length * 12}분</strong><p>최근 학습 활동 기반 데모 통계</p></div>
          <div className="panel"><h2>학습 알림</h2>{notifications.slice(0, 6).map((item) => <p key={item.id}>{item.message}</p>)}</div>
          <div className="panel"><h2>활동 로그</h2>{activity.slice(0, 8).map((item) => <p key={item.id}>{item.message}</p>)}</div>
        </section>
      )}

      {view === "certificate" && (
        <section className="certificatePage">
          <div className="certificate" data-bug-id="B10-ERR01">
            <p>SkillOrbit Certificate</p><h1>{course?.title || "선택된 강의"}</h1><span>수료 조건 충족 시 발급됩니다.</span>
            <button onClick={issueCertificate}>수료증 발급</button>
          </div>
          <div className="panel"><h2>발급 내역</h2>{certificates.map((item) => <p key={item.id}>{item.courseTitle} · {item.issuedAt?.slice(0, 10)}</p>)}</div>
        </section>
      )}
      <ToastStack toasts={toasts} />
    </main>
  );
}
