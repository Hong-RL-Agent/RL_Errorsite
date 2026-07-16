<template>
  <div class="learndesk-app">
    
    <!-- Top Header Navigation -->
    <header class="app-header">
      <div class="logo-group">
        <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span class="logo-title">LearnDesk</span>
        <span class="logo-subtitle">LMS & Grade Manager</span>
      </div>

      <div class="header-right">
        <div class="login-student-badge">
          🎓 학생 로그인: <strong>김철수 (학번: 20261042)</strong>
        </div>
        <button class="sandbox-reset-btn" @click="resetSandbox">
          🔄 DB 초기화
        </button>
      </div>
    </header>

    <!-- Tab Section selectors -->
    <nav class="app-sections-nav">
      <button :class="{ active: activeTab === 'courses' }" @click="activeTab = 'courses'">
        📚 수강 강의 & 과제 보드
      </button>
      <button :class="{ active: activeTab === 'grades' }" @click="activeTab = 'grades'">
        📊 내 성적 & 학점 분석
      </button>
      <button :class="{ active: activeTab === 'calendar' }" @click="activeTab = 'calendar'">
        📅 학사 일정 캘린더
      </button>
    </nav>

    <!-- Main Workspace -->
    <div class="learndesk-grid">
      
      <!-- TAB 1: COURSES & ASSIGNMENTS BOARD -->
      <template v-if="activeTab === 'courses'">
        
        <!-- Left: Course List -->
        <aside class="panel-section left-courses-sidebar">
          <div class="sidebar-header">
            <h3>📚 수강 강의 목록</h3>
            <span class="mobile-hint">* 모바일은 상단 스크롤 사용</span>
          </div>

          <div class="courses-stack">
            <div 
              v-for="c in courses" 
              :key="c.id" 
              class="course-list-item"
              :class="{ active: currentCourseId === c.id }"
              @click="switchCourse(c.id)"
            >
              <strong>{{ c.name }}</strong>
              <button class="course-delete-btn" @click.stop="deleteCourse(c.id)">
                강의 폐강 (Error 5)
              </button>
            </div>

            <div v-if="courses.length === 0" class="empty-lbl">
              등록된 수강 과목이 없습니다.
            </div>
          </div>
        </aside>

        <!-- Center: Announcements & Assignments -->
        <main class="panel-section center-assignments-pane">
          
          <!-- Course Announcements -->
          <div class="announcements-block">
            <h3>📢 강의 중요 공지사항</h3>
            <div class="announcements-list">
              <div v-for="ann in activeAnnouncements" :key="ann.id" class="announcement-item">
                <span class="date">{{ ann.date }}</span>
                <strong>{{ ann.title }}</strong>
              </div>
              <div v-if="activeAnnouncements.length === 0" class="empty-lbl">
                공지사항이 없습니다.
              </div>
            </div>
          </div>

          <!-- Assignment Search and List -->
          <div class="assignments-block">
            <div class="assignments-header">
              <h3>📝 과제 제출 리스트</h3>
              
              <!-- Search area -->
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  @input="searchAssignments" 
                  placeholder="과제 제목 검색..."
                />
                <button class="search-race-btn" @click="triggerSearchRace">
                  ⚡ 고속 연속 검색 (Error 4)
                </button>
              </div>
            </div>

            <div class="assignments-list">
              <div 
                v-for="a in activeAssignments" 
                :key="a.id"
                class="assignment-item-row"
                :class="{ active: selectedAssignmentId === a.id, closed: a.isClosed }"
                @click="selectAssignment(a)"
              >
                <div class="title-col">
                  <span v-if="a.isClosed" class="closed-badge">마감됨</span>
                  <strong>{{ a.title }}</strong>
                </div>
                <div class="meta-col">
                  <span>기한: {{ a.deadline }}</span>
                </div>
              </div>

              <div v-if="activeAssignments.length === 0" class="empty-lbl">
                과제 목록이 비어 있습니다.
              </div>
            </div>
          </div>

        </main>

        <!-- Right: Selected Assignment Details & Submission (Error 1 & 6 Target) -->
        <aside class="panel-section right-assignment-details">
          <div v-if="selectedAssignment" class="details-wrapper">
            <div class="header">
              <h3>📝 과제 상세 내역</h3>
              <span class="id-lbl">ID: <code>{{ selectedAssignment.id }}</code></span>
            </div>

            <div class="details-body">
              <h4>{{ selectedAssignment.title }}</h4>
              <p class="desc">{{ selectedAssignment.description }}</p>
              <p class="deadline">제출 마감 시각: <strong>{{ selectedAssignment.deadline }}</strong></p>

              <!-- Tab internal to assignment details: Submission status & feedback -->
              <div class="submission-composer-box">
                <h5>📤 파일 과제 제출</h5>
                
                <div class="form-group">
                  <label>가상 제출 파일 첨부</label>
                  <div class="file-select-row">
                    <input type="text" v-model="selectedFileName" class="filename-input" />
                    <!-- File selection assigns stale parameters -->
                    <button class="file-attach-btn" @click="mockAttachFile">파일 첨부</button>
                  </div>
                  <span class="attachment-hint">
                    * 첨부 시점의 과제: <code>{{ staleAssignmentId }}</code> ({{ staleCourseName }})
                  </span>
                </div>

                <button class="submit-assignment-btn" @click="submitAssignment">
                  과제물 서버 최종 제출
                </button>
              </div>

              <!-- Feedbacks tab -->
              <div class="feedback-box">
                <h5>💬 교수 피드백 내역</h5>
                <div v-for="(fb, index) in activeFeedbacks" :key="index" class="feedback-bubble">
                  <strong>{{ fb.author }}:</strong>
                  <p>{{ fb.text }}</p>
                </div>
                <div v-if="activeFeedbacks.length === 0" class="empty-lbl">
                  제출본 피드백 대기 중
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-msg">
            중앙의 과제 리스트에서 항목을 클릭하시면 상세 제출 요강 및 피드백이 표시됩니다.
          </div>
        </aside>

      </template>

      <!-- TAB 2: GRADES & GPA ANALYSIS -->
      <template v-if="activeTab === 'grades'">
        <main class="panel-section full-width-grades">
          <div class="grades-header">
            <h2>📊 수강 학기 성적 분석 대조표</h2>
            <div class="sort-actions">
              <button @click="changeGradesSort('score')">
                점수순 정렬 변경 (Error 3)
              </button>
              <span class="current-sort-lbl">현재 정렬 기준: <code>점수 {{ gradeSortOrder }}</code></span>
            </div>
          </div>

          <div class="grades-grid-layout">
            <!-- Table list -->
            <div class="grades-table-wrapper">
              <table class="grades-table">
                <thead>
                  <tr>
                    <th>학생명</th>
                    <th>과목명</th>
                    <th>원점수 (Score)</th>
                    <th>취득 등급 (Grade)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="g in sortedGrades" :key="g.student">
                    <td>{{ g.student }}</td>
                    <td>{{ courses.find(c => c.id === currentCourseId)?.name || '기타 강의' }}</td>
                    <td><strong>{{ g.score }} 점</strong></td>
                    <!-- Color matches from stale criteria (Error 3) -->
                    <td>
                      <span class="grade-tag" :style="{ backgroundColor: getGradeColor(g.score) }">
                        {{ g.grade }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- SVG Graph visualization (Error 3 average line target) -->
            <div class="grades-chart-wrapper">
              <h3>📈 원점수 분포 및 성적 가이드라인</h3>
              <p class="chart-desc">* 가로선은 과목 평균 점수를 표기합니다.</p>

              <svg class="grades-svg-chart" viewBox="0 0 400 200">
                <!-- Background lines -->
                <line x1="30" y1="20" x2="380" y2="20" stroke="#334155" stroke-dasharray="3" />
                <line x1="30" y1="180" x2="380" y2="180" stroke="#334155" />

                <!-- Bars representing students -->
                <g v-for="(g, idx) in sortedGrades" :key="idx">
                  <rect 
                    :x="50 + idx * 80" 
                    :y="180 - (g.score / 100) * 150" 
                    width="35" 
                    :height="(g.score / 100) * 150" 
                    fill="#f59e0b"
                    rx="3"
                  />
                  <text :x="67 + idx * 80" y="195" text-anchor="middle" fill="#94a3b8" font-size="9">
                    {{ g.student }}
                  </text>
                  <text :x="67 + idx * 80" :y="175 - (g.score / 100) * 150" text-anchor="middle" fill="#f8fafc" font-size="9">
                    {{ g.score }}
                  </text>
                </g>

                <!-- INTENTIONAL_ERROR
                     CATEGORY: Frontend
                     DESCRIPTION: 다른 강의로 과목 성적표를 변경했을 때 점수는 렌더링되나,
                     평균 지시선(`cachedAverageLine`)과 등급 구분 색상이 
                     이전 과목에 묶여 업데이트를 누락하는 상태 유지 불일치 오류입니다. -->
                <!-- Stale mean score guide line -->
                <line 
                  x1="30" 
                  :y1="180 - (cachedAverageLine / 100) * 150" 
                  x2="380" 
                  :y2="180 - (cachedAverageLine / 100) * 150" 
                  stroke="#ef4444" 
                  stroke-width="2" 
                />
                <text x="320" :y="173 - (cachedAverageLine / 100) * 150" fill="#ef4444" font-size="9" font-weight="bold">
                  과목 평균선: {{ cachedAverageLine }}점
                </text>
              </svg>
            </div>
          </div>
        </main>
      </template>

      <!-- TAB 3: CALENDAR DEADLINES -->
      <template v-if="activeTab === 'calendar'">
        <main class="panel-section full-width-calendar">
          <h2>📅 학사 과제 마감 캘린더</h2>
          
          <div class="calendar-list-grid">
            <div v-for="evt in calendar" :key="evt.id" class="calendar-card-item">
              <span class="date-lbl">{{ evt.date }}</span>
              <!-- Error 5: orphaned calendar event points to undefined course! -->
              <div class="evt-body">
                <span class="course-badge">
                  강의: {{ getCourseNameForEvent(evt.courseId) }}
                </span>
                <h4>{{ evt.title }}</h4>
              </div>
            </div>
          </div>
        </main>
      </template>

    </div>

    <!-- Submission History Footer pane (Error 2 target) -->
    <footer class="panel-section submissions-history-footer">
      <h3>🕒 과제물 최종 제출 이력</h3>
      <div class="history-grid">
        <div v-for="sub in submissions" :key="sub.id" class="history-card">
          <div class="info">
            <strong>과제 ID: {{ sub.assignmentId }}</strong>
            <p>파일명: <code>{{ sub.fileName }}</code></p>
            <span>제출 시간: {{ sub.submittedAt }}</span>
          </div>
          <div class="actions">
            <!-- Normal cancel -->
            <button class="cancel-btn" @click="cancelSubmission(sub.id)">제출 취소</button>
            <!-- Error 2 Trigger -->
            <button class="race-cancel-btn" @click="triggerReplaceCancelRace(sub.id)">
              ⚡ 파일 재교체 후 바로 취소 (Error 2)
            </button>
          </div>
        </div>

        <div v-if="submissions.length === 0" class="empty-lbl">
          제출한 과제 내역이 없습니다.
        </div>
      </div>
    </footer>

    <!-- Floating UI Toasts -->
    <div class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast-card" :class="t.type">
        <span class="toast-icon">
          {{ t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️' }}
        </span>
        <span class="toast-message">{{ t.message }}</span>
        <button class="toast-close" @click="toasts = toasts.filter(x => x.id !== t.id)">
          &times;
        </button>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'courses',
      currentCourseId: 'course-01',
      
      // DB items
      courses: [],
      announcements: [],
      assignments: [],
      submissions: [],
      grades: {},
      feedbacks: {},
      calendar: [],

      // Search and detail selections
      searchQuery: '',
      selectedAssignment: null,
      selectedAssignmentId: null,

      // File attachment simulator states (Error 1 target)
      selectedFileName: '데이터사이언스_인물보고서.pdf',
      staleAssignmentId: 'assign-01',
      staleCourseName: '데이터 사이언스 입문',

      // Grades filter/sort and cache (Error 3 target)
      gradeSortBy: 'score',
      gradeSortOrder: 'desc',
      cachedAverageLine: 85.5, // Loaded mean from first course
      cachedGradeCutoff: 80,

      toasts: []
    };
  },
  computed: {
    activeAnnouncements() {
      return this.announcements.filter(ann => ann.courseId === this.currentCourseId);
    },
    activeAssignments() {
      return this.assignments.filter(a => a.courseId === this.currentCourseId);
    },
    activeFeedbacks() {
      if (!this.selectedAssignment) return [];
      return this.feedbacks[this.selectedAssignment.id] || [];
    },
    sortedGrades() {
      const list = this.grades[this.currentCourseId] || [];
      const order = this.gradeSortOrder === 'asc' ? 1 : -1;
      return [...list].sort((a, b) => (a.score - b.score) * order);
    }
  },
  mounted() {
    this.loadCourses();
    this.loadAnnouncements();
    this.loadAssignments();
    this.loadSubmissions();
    this.loadGrades();
    this.loadFeedbacks();
    this.loadCalendar();
  },
  methods: {
    loadCourses() {
      fetch('/api/courses').then(res => res.json()).then(data => this.courses = data);
    },
    loadAnnouncements() {
      fetch('/api/announcements').then(res => res.json()).then(data => this.announcements = data);
    },
    loadAssignments() {
      fetch('/api/assignments').then(res => res.json()).then(data => this.assignments = data);
    },
    loadSubmissions() {
      fetch('/api/submissions').then(res => res.json()).then(data => this.submissions = data);
    },
    loadGrades() {
      fetch('/api/grades').then(res => res.json()).then(data => this.grades = data);
    },
    loadFeedbacks() {
      fetch('/api/feedbacks').then(res => res.json()).then(data => this.feedbacks = data);
    },
    loadCalendar() {
      fetch('/api/calendar').then(res => res.json()).then(data => this.calendar = data);
    },
    showToast(message, type = 'info') {
      const id = Date.now();
      this.toasts.push({ id, message, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, 4500);
    },
    
    // Switch course action
    switchCourse(courseId) {
      this.currentCourseId = courseId;
      this.selectedAssignment = null;
      this.selectedAssignmentId = null;
      this.searchQuery = '';
      
      // Load default assignments list
      this.loadAssignments();
    },

    // Select assignment (Error 1 stores stale parameters)
    selectAssignment(assign) {
      this.selectedAssignment = assign;
      this.selectedAssignmentId = assign.id;
      
      // Auto cache the assignment selection metadata
      this.staleAssignmentId = assign.id;
      const crs = this.courses.find(c => c.id === this.currentCourseId);
      this.staleCourseName = crs ? crs.name : '알 수 없음';
      this.selectedFileName = `${assign.title.replace(/\s+/g, '_')}_김철수제출.zip`;
    },

    mockAttachFile() {
      this.showToast('파일이 정상 첨부되어 제출 대기 상태로 이식되었습니다.', 'info');
    },

    // Submit assignment (Error 1 leaks and Error 6 bypasses)
    async submitAssignment() {
      if (!this.selectedAssignment) return;

      try {
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignmentId: this.staleAssignmentId, // BUG: Leaks stale assignment ID
            fileName: this.selectedFileName,
            student: '김철수',
            isClosed: this.selectedAssignment.isClosed // checks if currently shown is closed
          })
        });

        if (res.status === 403) {
          const data = await res.json();
          this.showToast(`[403 거부] ${data.error}`, 'danger');
          // Reload submissions list anyway to show it was bypassed and saved!
          this.loadSubmissions();
        } else {
          this.showToast('과제가 기한 내 정상 접수 처리되었습니다.', 'success');
          this.loadSubmissions();
        }
      } catch (err) {
        this.showToast('제출 서버 오류', 'danger');
      }
    },

    // Cancel submission
    async cancelSubmission(subId) {
      try {
        const res = await fetch(`/api/submissions/${subId}`, { method: 'DELETE' });
        if (res.ok) {
          this.showToast('과제물 제출이 취소(철회)되었습니다.', 'success');
          this.loadSubmissions();
        }
      } catch (err) {
        this.showToast('취소 에러', 'danger');
      }
    },

    // Submit replace and cancel race simulator (Error 2 Trigger)
    triggerReplaceCancelRace(subId) {
      this.showToast('제출 파일 교체 직후 취소 경합을 수행합니다.', 'info');
      
      // 1. PUT replace (3s delay)
      fetch(`/api/submissions/${subId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: "재교체본_최종_수정파일.zip" })
      });

      // 2. DELETE cancel immediately (0.1s delay)
      setTimeout(async () => {
        const res = await fetch(`/api/submissions/${subId}`, { method: 'DELETE' });
        if (res.ok) {
          this.showToast('제출이 즉각 취소(삭제)되었습니다 (0.1초 완료)', 'success');
          this.loadSubmissions();
        }
      }, 100);

      // Refresh list after 3.5 seconds to see it resurrected
      setTimeout(() => {
        this.showToast('제출 교체 지연 작업 완료 (삭제된 과제가 다시 부활함)', 'warning');
        this.loadSubmissions();
      }, 3500);
    },

    // Search assignments race condition (Error 4 Trigger)
    triggerSearchRace() {
      this.showToast('과제 연속 비동기 탐색 레이스 컨디션을 시작합니다...', 'info');

      // Search sequence: 데이터 (3s) -> 알고리즘 (1s) -> 수학 (0.2s)
      
      // 1. 데이터 (3s delay)
      fetch('/api/assignments/search?q=데이터')
        .then(res => res.json())
        .then(data => {
          this.assignments = data.results;
          this.showToast('데이터 과제 탐색 응답 수신 (3초 지연)', 'warning');
        });

      // 2. 알고리즘 (1s delay)
      setTimeout(() => {
        fetch('/api/assignments/search?q=알고리즘')
          .then(res => res.json())
          .then(data => {
            this.assignments = data.results;
            this.showToast('알고리즘 과제 탐색 응답 수신 (1초)', 'info');
          });
      }, 100);

      // 3. 수학 (0.2s delay)
      setTimeout(() => {
        fetch('/api/assignments/search?q=수학')
          .then(res => res.json())
          .then(data => {
            this.assignments = data.results;
            this.showToast('수학 과제 탐색 응답 수신 (0.2초)', 'info');
          });
      }, 200);
    },

    // Search input normal handler
    searchAssignments() {
      if (!this.searchQuery.trim()) {
        this.loadAssignments();
        return;
      }
      fetch(`/api/assignments/search?q=${this.searchQuery}`)
        .then(res => res.json())
        .then(data => {
          this.assignments = data.results;
        });
    },

    // Delete course (Error 5 lecture deleted calendar remain)
    async deleteCourse(courseId) {
      try {
        const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
        if (res.ok) {
          this.showToast('선택한 강의가 폐강 처리되었습니다.', 'success');
          this.loadCourses();
          // Calendar events list is NOT re-fetched, showing the orphan schedule logs!
        }
      } catch (err) {
        this.showToast('폐강 실패', 'danger');
      }
    },

    // Grade sort order (Error 3 cache average line)
    changeGradesSort(field) {
      this.gradeSortOrder = this.gradeSortOrder === 'desc' ? 'asc' : 'desc';
      
      // Calculate and cache average line for current course
      const list = this.grades[this.currentCourseId] || [];
      if (list.length > 0) {
        const sum = list.reduce((acc, cur) => acc + cur.score, 0);
        this.cachedAverageLine = Math.round(sum / list.length);
      }
      this.showToast(`정렬 기준 변경 완료. 가로 평균 가이드라인을 ${this.cachedAverageLine}점으로 갱신 캐시합니다.`, 'info');
    },

    getGradeColor(score) {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 성적 정렬 변경 후 강의를 다른 과목으로 전환하더라도 
      // 등급 색상 분기 필터 지표가 갱신되지 않고 기존 1강의의 최고점/최저점 기준 점수를 
      // 강제 기인하여 매칭 색상이 왜곡 렌더링되게 만듭니다.
      if (score >= this.cachedAverageLine) {
        return "#10b981"; // Green for above mean
      }
      return "#ef4444"; // Red for below mean
    },

    // Course name resolver for calendar (Error 5 helper)
    getCourseNameForEvent(courseId) {
      const crs = this.courses.find(c => c.id === courseId);
      if (!crs) {
        // Crash scenario: Cannot read properties of undefined (reading 'name')
        // We will output a warning log to indicate the crash / orphan condition
        return `🚨 [경고: 수강 취소된 강의 ID ${courseId}]`;
      }
      return crs.name;
    },

    // Reset Sandbox database
    async resetSandbox() {
      await fetch('/api/reset', { method: 'POST' });
      this.showToast('LearnDesk 강의 포털 DB 가 리셋되었습니다.', 'success');
      this.loadCourses();
      this.loadAnnouncements();
      this.loadAssignments();
      this.loadSubmissions();
      this.loadGrades();
      this.loadFeedbacks();
      this.loadCalendar();
    }
  }
};
</script>

<style>
  /* Index.css has general layout styling */
</style>
