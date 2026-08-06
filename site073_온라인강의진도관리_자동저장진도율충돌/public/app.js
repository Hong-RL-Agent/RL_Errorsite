const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const courses = ref([]);
    const students = ref([]);
    const quizzes = ref([]);
    const stats = ref({ totalEnrolledStudents: 150, avgProgressRate: 58.5, totalReviewsCount: 42 });

    // Selections / Filters
    const activeStudent = ref('STUDENT_A');
    const courseSearchQuery = ref('');
    const courseSortOrder = ref('NONE');

    const selectedCourse = ref(null);
    const activeQuiz = ref(null);
    const selectedQuizAnswer = ref('A. const는 재할당이 불가능하다.');
    const toasts = ref([]);

    // Stale title cache for Error 7
    let previousCourseTitleCache = '';

    // Student session cache (Error 5 Target)
    const cachedLastWatchedTitle = ref('모던 자바스크립트 ES6+ 넓은 범위 개념');
    const cachedLastWatchedId = ref('CS-101');

    onMounted(() => {
      loadAll();
    });

    const loadAll = async () => {
      await loadCourses();
      await loadStudents();
      await loadQuizzes();
    };

    const loadCourses = async () => {
      const res = await fetch('/api/courses');
      const data = await res.json();
      courses.value = data;

      if (data.length > 0 && !selectedCourse.value) {
        selectedCourse.value = data[0];
        previousCourseTitleCache = data[0].title;
      }
    };

    const loadStudents = async () => {
      const res = await fetch('/api/students');
      const data = await res.json();
      students.value = data;
    };

    const loadQuizzes = async () => {
      // Mock load active quiz
      activeQuiz.value = {
        id: "QZ-01",
        courseId: "CS-101",
        question: "자바스크립트에서 let과 const의 블록 스코프 차이점은 무엇인가요?",
        savedAnswer: "A. const는 재할당이 불가능하다.",
        score: 100,
        submitted: false
      };
    };

    const showToast = (message, type = 'info') => {
      const id = Date.now();
      toasts.value.push({ id, message, type });
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    };

    const removeToast = (id) => {
      toasts.value = toasts.value.filter(t => t.id !== id);
    };

    // Session Switch (Error 5 Target)
    const handleStudentSwitch = (studentRole) => {
      activeStudent.value = studentRole;
      showToast(`학생 계정을 [${studentRole}] 프로필로 스위칭합니다.`, 'info');

      // Reload courses
      loadCourses();

      // INTENTIONAL_ERROR
      // CATEGORY: Session + Cache
      // DESCRIPTION: 학생 A의 수강 기록을 본 뒤 학생 B로 로그인하면 강의 목록은 B 기준으로 리로드되지만, 
      // 상단의 최근 시청 강의 제목과 이어보기 버튼 정보(`cachedLastWatchedTitle`, `cachedLastWatchedId`)를 
      // 갱신하지 않고 이전 학생 A의 데이터를 그대로 남겨두는 캐시 누수 결함입니다.
      
      // Note: We intentionally do NOT update cachedLastWatchedTitle or cachedLastWatchedId!
    };

    const resumeLastWatchedCourse = () => {
      const target = courses.value.find(c => c.id === cachedLastWatchedId.value);
      if (target) {
        selectedCourse.value = target;
        showToast(`[${target.title}] 강좌 이어보기를 실행합니다.`, 'success');
      }
    };

    // Watch Progress & Immediate Course Change Race (Error 1 Trigger)
    const simulateWatchProgress = (progressPercent) => {
      if (!selectedCourse.value) return;
      selectedCourse.value.progress = progressPercent;
      showToast(`현재 강의 재생 진도율을 ${progressPercent}%로 업데이트했습니다.`, 'info');
    };

    const switchToNextCourse = () => {
      if (!selectedCourse.value) return;
      const prevCourseId = selectedCourse.value.id;
      const prevProgress = selectedCourse.value.progress;

      // Find next course
      const currentIndex = courses.value.findIndex(c => c.id === prevCourseId);
      const nextCourse = courses.value[(currentIndex + 1) % courses.value.length];

      showToast(`다음 강의 [${nextCourse.title}]로 즉시 이동합니다.`, 'info');

      // 1. PATCH previous course progress (3.0s delay)
      fetch(`/api/courses/${prevCourseId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: prevProgress })
      });

      // Switch view immediately to next course
      selectedCourse.value = nextCourse;

      // 3초 후 이전 강의 진도 저장이 완료되면서 현재 새로 연 강의의 진도를 덮어쓰도록 유도
      setTimeout(() => {
        // Overwrite currently opened course progress with previous progress!
        if (selectedCourse.value) {
          selectedCourse.value.progress = prevProgress;
          showToast(`지연 처리 완료: 이전 강의 진도율(${prevProgress}%)이 현재 강의 [${selectedCourse.value.title}] 진도율로 덮어씌워졌습니다.`, 'warning');
        }
      }, 3100);
    };

    // Popularity Sort Enrollment Index Mismatch (Error 3 Target)
    const confirmEnrollment = (index) => {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 강의 목록을 인기순으로 정렬한 뒤 수강 신청 버튼을 누르면 
      // 화면 정렬 배열의 인덱스(index)를 원본 강의 배열(`courses`)에 그대로 대입해 
      // 엉뚱한 다른 강의가 수강 신청 등록되는 결함입니다.
      const targetCourse = courses.value[index];
      if (!targetCourse) {
        showToast('수강 신청할 강의 인덱스를 찾을 수 없습니다.', 'danger');
        return;
      }

      showToast(`[${targetCourse.title}] 강좌의 수강 신청이 완료되었습니다. (인덱스 불일치 오신청 가능)`, 'warning');
    };

    // Delete Course (Error 4 Target)
    const deleteCourse = async (id) => {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('강의 항목을 카탈로그에서 삭제하였습니다. (강사 대시보드 총 수강생 진도율 및 후기 통계에는 기산 포함됨)', 'warning');
        await loadCourses();
      }
    };

    // Quiz Submit & Answer Modify Conflict (Error 2 Trigger)
    const triggerQuizSubmitModifyConflict = () => {
      if (!activeQuiz.value) return;
      showToast('퀴즈 답안 제출 및 수정 요청을 동시 전송합니다.', 'info');

      // 1. POST Submit (0.5s delay)
      setTimeout(async () => {
        const res = await fetch(`/api/quizzes/${activeQuiz.value.id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer: selectedQuizAnswer.value })
        });
        if (res.ok) {
          showToast('퀴즈 제출 완료 (0.5초 완료)', 'success');
          const data = await res.json();
          activeQuiz.value = data.quiz;
        }
      }, 100);

      // 2. PATCH Answer (4.0s delay) - modifies answer after submission
      setTimeout(async () => {
        const res = await fetch(`/api/quizzes/${activeQuiz.value.id}/answer`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer: "B. let은 상수를 선언할 때 사용한다." })
        });
        if (res.ok) {
          showToast('답안 수정 완료 (4초 지연 완료: 제출 완료 상태에서 점수가 20점으로 덮어써져 화면과 점수 불일치)', 'danger');
          const data = await res.json();
          activeQuiz.value = data.quiz;
        }
      }, 150);
    };

    // Download Material (Error 6 Trigger)
    const downloadMaterial = async (courseId) => {
      // Simulate unauthorized request by setting isEnrolled=false
      const res = await fetch(`/api/courses/${courseId}/materials?isEnrolled=false`);
      const data = await res.json();

      if (!res.ok) {
        showToast(`HTTP 403 Forbidden: ${data.error} (응답 본문에 파일명: ${data.materialTitle}, 용량: ${data.materialSize} 정보가 노출됨)`, 'danger');
      }
    };

    // Course Title & Public status race (Error 7 Trigger)
    const triggerTitlePublicRace = (course) => {
      showToast('강의 제목 수정과 공개 여부 변경을 순차 적용합니다.', 'info');

      // 1. PATCH Title (0.1s delay)
      fetch(`/api/courses/${course.id}/title`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: course.title })
      });

      // 2. PATCH Public Status (3.0s delay) - sends old title
      setTimeout(() => {
        fetch(`/api/courses/${course.id}/public`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isPublic: course.isPublic,
            title: previousCourseTitleCache // Sends stale title cache!
          })
        });
      }, 100);

      // Optimistic cache update
      previousCourseTitleCache = course.title;

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('공개 여부 설정 저장 완료 (공개 상태는 바뀌었으나 3초 지연 완료로 강의 제목이 이전 값으로 롤백됨)', 'warning');
        await loadCourses();
      }, 4500);
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('CourseLab 강의 진도 데이터베이스가 초기화되었습니다.', 'success');
      selectedCourse.value = null;
      await loadAll();
    };

    // Computed Sort properties
    const sortedCourses = computed(() => {
      let list = [...courses.value];

      if (courseSearchQuery.value) {
        list = list.filter(c => c.title.includes(courseSearchQuery.value) || c.instructor.includes(courseSearchQuery.value));
      }

      if (courseSortOrder.value === 'POPULARITY_DESC') {
        list.sort((a, b) => b.popularity - a.popularity);
      }

      return list;
    });

    return {
      courses,
      students,
      quizzes,
      stats,
      activeStudent,
      courseSearchQuery,
      courseSortOrder,
      selectedCourse,
      activeQuiz,
      selectedQuizAnswer,
      cachedLastWatchedTitle,
      cachedLastWatchedId,
      toasts,
      handleStudentSwitch,
      resumeLastWatchedCourse,
      simulateWatchProgress,
      switchToNextCourse,
      confirmEnrollment,
      deleteCourse,
      triggerQuizSubmitModifyConflict,
      downloadMaterial,
      triggerTitlePublicRace,
      resetSandbox,
      removeToast,
      sortedCourses
    };
  }
}).mount('#app');
