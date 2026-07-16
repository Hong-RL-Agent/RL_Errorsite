<template>
  <div class="talentlink-app">
    
    <!-- Top Header bar -->
    <header class="app-header">
      <div class="logo-group">
        <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <polyline points="17 11 19 13 23 9" />
        </svg>
        <span class="logo-title">TalentLink</span>
        <span class="logo-subtitle">Freelancer & Smart Contracts</span>
      </div>

      <div class="header-right">
        <!-- Profile / Session Switcher (Error 1 Target) -->
        <div class="session-selector">
          <span>👤 활성 사용자: </span>
          <select v-model="currentFreelancer" @change="switchFreelancer">
            <option value="프리랜서 A">프리랜서 A (경력 7년, Figma/Vue전문)</option>
            <option value="프리랜서 B">프리랜서 B (경력 1년, 초심자)</option>
          </select>
        </div>

        <button class="sandbox-reset-btn" @click="resetSandbox">
          🔄 DB 초기화
        </button>
      </div>
    </header>

    <!-- Main Grid Workspace -->
    <div class="talentlink-grid">

      <!-- Left Column: Filters, Stats, Portfolios -->
      <aside class="panel-section left-sidebar">
        <h3>📂 분야 필터</h3>
        <div class="domain-filters">
          <button 
            v-for="d in ['전체', 'Web', 'App', 'AI']" 
            :key="d" 
            class="filter-btn"
            :class="{ active: selectedDomain === d }"
            @click="selectedDomain = d"
          >
            {{ d }}
          </button>
        </div>

        <!-- Dashboard overall Stats (Error 4 leak display) -->
        <div class="dashboard-stats-card">
          <h3>📊 대시보드 통계</h3>
          <p class="warn-desc">* 지원 철회 시에도 신청 통계는 차감되지 않음 (Error 4)</p>
          <div class="stat-row">
            <span>총 제출 지원자 수:</span>
            <strong>{{ stats.totalApplicants }}명</strong>
          </div>
          <div class="stat-row">
            <span>활성 프로젝트 수:</span>
            <strong>{{ stats.totalActiveProjects }}개</strong>
          </div>
        </div>

        <!-- Portfolios Masonry layout -->
        <div class="portfolios-block">
          <h3>💼 포트폴리오 쇼케이스</h3>
          <div class="masonry-grid">
            <div 
              v-for="port in portfolios" 
              :key="port.id" 
              class="portfolio-item"
            >
              <strong>{{ port.title }}</strong>
              <span>{{ port.tech }}</span>
              <small>작성자: {{ port.author }}</small>
            </div>
          </div>
          <div class="portfolio-composer">
            <input type="text" placeholder="포트폴리오 제목..." v-model="newPortTitle" />
            <input type="text" placeholder="기술 스택..." v-model="newPortTech" />
            <button @click="handleAddPortfolio">등록</button>
          </div>
        </div>
      </aside>

      <!-- Center Column: Project listings, Application Draft Form, Milestone -->
      <main class="panel-section center-feed">
        <div class="feed-header">
          <h2>🔍 일거리 프로젝트 탐색 ({{ filteredProjects.length }}건)</h2>
          
          <div class="search-box">
            <input 
              type="text" 
              placeholder="기술 스택, 프로젝트명 검색..." 
              v-model="searchQuery" 
              @input="handleSearch"
            />
            <button class="search-race-btn" @click="triggerSearchRace">
              ⚡ 고속 검색어 전환 (Error 3)
            </button>
          </div>
        </div>

        <!-- Projects Feed List -->
        <div class="projects-feed-list">
          <div 
            v-for="proj in filteredProjects" 
            :key="proj.id" 
            class="project-card"
            :class="{ focused: selectedProject?.id === proj.id }"
            @click="selectedProject = proj"
          >
            <div class="header">
              <span class="domain-tag">{{ proj.domain }}</span>
              <span class="budget">{{ proj.budget }}</span>
            </div>
            <h3>{{ proj.title }}</h3>
            <div class="meta">
              <span>필요 스택: <code>{{ proj.tech }}</code></span>
              <span>지원자 수: <strong class="lbl-warn">{{ proj.applicantCount }}명</strong></span>
            </div>
            
            <button class="apply-trigger-btn" @click.stop="handleOpenApply(proj)">
              지원서 전개
            </button>
          </div>
        </div>

        <!-- Application Draft Composer Form (Error 1, 3 Target) -->
        <div v-if="activeApplyProject" class="apply-form-container">
          <h3>📝 [{{ activeApplyProject.title }}] 지원서 작성</h3>
          <div class="form-fields">
            <div class="field-group">
              <label>경력 기술 및 자기소개 (Error 1)</label>
              <textarea v-model="applicationDraft.experience" placeholder="이전 프로젝트 경력을 자유롭게 적어주세요."></textarea>
            </div>
            <div class="field-group">
              <label>희망 계약 금액</label>
              <input type="text" v-model="applicationDraft.desiredPay" placeholder="금액 입력..." />
            </div>

            <div class="field-group">
              <label>연동할 포트폴리오 선택</label>
              <div class="portfolio-chips">
                <label v-for="p in portfolios" :key="p.id" class="chip">
                  <input type="checkbox" :value="p.id" v-model="applicationDraft.portfolioIds" />
                  <span>{{ p.title }}</span>
                </label>
              </div>
            </div>

            <div class="buttons">
              <button class="submit-btn" @click="submitApplicationForm">
                지원서 최종 제출
              </button>
              <button class="cancel-btn" @click="activeApplyProject = null">
                취소
              </button>
            </div>
          </div>
        </div>

        <!-- Milestone tracker (Error 6 Target) -->
        <div class="milestones-tracker-block">
          <div class="header-row">
            <h3>📈 프로젝트 마일스톤 진행률</h3>
            <div class="avg-display">
              평균 작업 진행률: <strong class="avg-lbl">{{ cachedAverageProgress }}%</strong>
            </div>
          </div>
          <p class="warn-desc">* 진행률 수정 직후 마일스톤 삭제 시 평균 미반영 결함 (Error 6)</p>

          <div class="milestones-stack">
            <div v-for="m in milestones" :key="m.id" class="milestone-item">
              <span>{{ m.title }}</span>
              <div class="progress-edit">
                <input type="number" v-model.number="m.progress" min="0" max="100" />
                <span>%</span>
              </div>
              <button class="delete-milestone-btn" @click="updateProgressAndRemove(m.id)">
                ⚡ 70% 설정 후 바로 삭제 (Error 6)
              </button>
            </div>
          </div>
        </div>
      </main>

      <!-- Right Column: My Applications list, Contracts & Settlements -->
      <aside class="panel-section right-sidebar">
        
        <!-- Application list with Withdrawal (Error 4 Target) -->
        <div class="my-applications-block">
          <h3>📁 나의 제출 지원 현황</h3>
          <div v-if="myApplications.length === 0" class="empty-lbl">제출된 지원서가 없습니다.</div>
          <div v-else class="app-cards-stack">
            <div v-for="app in myApplications" :key="app.id" class="app-status-card">
              <h4>{{ app.projectTitle }}</h4>
              <div class="row">
                <span>신청자: {{ app.freelancer }}</span>
                <span class="status-tag">{{ app.status }}</span>
              </div>
              <button class="withdraw-btn" @click="withdrawApplication(app.id)">
                지원 철회 (Error 4)
              </button>
            </div>
          </div>
        </div>

        <!-- Contracts phase with unauthorized detail leak (Error 2, 5 Target) -->
        <div class="contracts-workflow-block">
          <h3>🤝 프로젝트 스마트 계약 관리</h3>
          <div class="contracts-stack">
            <div v-for="con in contracts" :key="con.id" class="contract-card">
              <h4>{{ con.title }}</h4>
              <p>계약금: <strong>{{ con.price.toLocaleString() }}원</strong></p>
              <div class="timeline-phases">
                <span :class="{ active: con.status === 'PENDING' }">대기</span> ➔
                <span :class="{ active: con.status === 'APPROVED' }">승인</span>
              </div>

              <!-- Price modifier & approval race simulator (Error 2 Target) -->
              <div v-if="con.id === 'con-01'" class="race-actions">
                <input type="number" v-model.number="editContractPrice" placeholder="조정 계약금..." />
                <button class="race-trigger-btn" @click="triggerPriceApproveRace(con.id)">
                  ⚡ 금액 수정 후 바로 승인 (Error 2)
                </button>
              </div>

              <!-- Restricted contract detail popup (Error 5 Target) -->
              <button 
                v-if="con.restricted" 
                class="view-restricted-btn" 
                @click="requestRestrictedContract(con.id)"
              >
                계약 상세보기 (비인가 - Error 5)
              </button>
            </div>
          </div>

          <!-- Leaked info display area (Error 5 Target) -->
          <div v-if="leakedContractInfo" class="leaked-info-box">
            <h5>⚠️ 403 에러 응답 바디에서 가로챈 정보</h5>
            <p>유출된 금액: <strong class="lbl-warn">{{ leakedContractInfo.price.toLocaleString() }}원</strong></p>
            <p>유출된 마감기한: <code>{{ leakedContractInfo.deadline }}</code></p>
          </div>
        </div>

        <!-- Settlement Logs (Error 2 Result Display) -->
        <div class="settlements-block">
          <h3>💰 대금 정산 완료 내역</h3>
          <p class="warn-desc">* 계약서 상 금액과 실제 정산된 금액 불일치 확인 공간</p>
          <div class="settlements-list">
            <div v-for="set in settlements" :key="set.id" class="settlement-card">
              <strong>{{ set.title }}</strong>
              <div class="row">
                <span>정산 금액: <strong class="lbl-warn">{{ set.pricePaid.toLocaleString() }}원</strong></span>
                <small>{{ set.date }}</small>
              </div>
            </div>
          </div>
        </div>

      </aside>

    </div>

    <!-- Toast message stack -->
    <div class="toast-container">
      <div 
        v-for="t in toasts" 
        :key="t.id" 
        class="toast-card" 
        :class="t.type"
      >
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
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const currentFreelancer = ref('프리랜서 A');
    
    // DB datasets
    const projects = ref([]);
    const portfolios = ref([]);
    const applications = ref([]);
    const contracts = ref([]);
    const settlements = ref([]);
    const stats = ref({ totalApplicants: 0, totalActiveProjects: 0, activeApplicationsCount: 0 });

    // UI filters
    const selectedDomain = ref('전체');
    const searchQuery = ref('');
    const selectedProject = ref(null);
    const activeApplyProject = ref(null);

    // Form inputs
    const newPortTitle = ref('');
    const newPortTech = ref('');
    const editContractPrice = ref(15000000);
    const toasts = ref([]);

    // Leak / Error states
    const leakedContractInfo = ref(null);

    // Application draft (Error 1 Target - Kept independent of user profile switch)
    const applicationDraft = ref({
      experience: "5년차 풀스택 웹 개발자, 다양한 Vue.js 이커머스 쇼핑몰 구축 경력 보유.",
      desiredPay: "4,500,000원",
      portfolioIds: ["port-01"]
    });

    // Milestones tracker (Error 6 Target)
    const milestones = ref([
      { id: 1, title: "기획 및 디자인 와이어프레임", progress: 100 },
      { id: 2, title: "핵심 API 설계 및 스키마 명세", progress: 60 },
      { id: 3, title: "프론트엔드 연동 및 시뮬레이터 조율", progress: 40 }
    ]);
    const cachedAverageProgress = ref(67);

    onMounted(async () => {
      await loadAll();
    });

    const loadAll = async () => {
      await loadProjects();
      await loadPortfolios();
      await loadApplications();
      await loadContracts();
      await loadSettlements();
      await loadStats();
    };

    const loadProjects = async () => {
      const res = await fetch('/api/projects');
      projects.value = await res.json();
    };

    const loadPortfolios = async () => {
      const res = await fetch('/api/portfolios');
      portfolios.value = await res.json();
    };

    const loadApplications = async () => {
      applications.value = [
        { id: "app-01", projectTitle: "반응형 이커머스 웹 쇼핑몰 퍼블리싱", freelancer: "프리랜서 A", status: "제출됨" }
      ];
    };

    const loadContracts = async () => {
      const res = await fetch('/api/contracts');
      contracts.value = await res.json();
    };

    const loadSettlements = async () => {
      const res = await fetch('/api/settlement');
      settlements.value = await res.json();
    };

    const loadStats = async () => {
      const res = await fetch('/api/statistics');
      stats.value = await res.json();
    };

    const showToast = (message, type = 'info') => {
      const id = Date.now();
      toasts.value.push({ id, message, type });
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id);
      }, 4500);
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('TalentLink 데이터베이스가 복구되었습니다.', 'success');
      leakedContractInfo.value = null;
      milestones.value = [
        { id: 1, title: "기획 및 디자인 와이어프레임", progress: 100 },
        { id: 2, title: "핵심 API 설계 및 스키마 명세", progress: 60 },
        { id: 3, title: "프론트엔드 연동 및 시뮬레이터 조율", progress: 40 }
      ];
      cachedAverageProgress.value = 67;
      await loadAll();
    };

    // User profile switch (Error 1 Target)
    const switchFreelancer = () => {
      showToast(`[${currentFreelancer.value}] 세션으로 프로필이 전환되었습니다.`, 'info');
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend + Session
      // DESCRIPTION: 로그인 세션이 변경되어도 `applicationDraft` 양식의 경력 글자 수 및 희망 Pay 
      // 등의 캐시를 클리어하지 않고 이전 상담자 데이터를 유지시켜 오정보 제출을 방임합니다.
    };

    // Add portfolio
    const handleAddPortfolio = async () => {
      if (!newPortTitle.value.trim()) return;
      const res = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: currentFreelancer.value,
          title: newPortTitle.value,
          tech: newPortTech.value
        })
      });
      if (res.ok) {
        showToast('새 포트폴리오를 카드 그리드에 등록했습니다.', 'success');
        newPortTitle.value = '';
        newPortTech.value = '';
        await loadPortfolios();
      }
    };

    // Open apply modal
    const handleOpenApply = (proj) => {
      activeApplyProject.value = proj;
    };

    // Submit Application Form (Error 1, 3 Target)
    const submitApplicationForm = async () => {
      if (!activeApplyProject.value) return;
      
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend + Network
      // DESCRIPTION: 검색 레이스 도중 이전 검색 데이터가 화면을 뒤덮어, 
      // 사용자는 화면에 떠 있는 프로젝트에 지원한다고 착각하지만 
      // 실제 API 발송 시에는 검색 레이스 최종 타겟이었던 다른 프로젝트 ID를 전송하도록 조작한 결함입니다.
      const targetProjectId = searchQuery.value === 'React' ? 'proj-04' : activeApplyProject.value.id;
      const targetProjectTitle = searchQuery.value === 'React' ? '노션 연동 전사 리소스 ERP 개발' : activeApplyProject.value.title;

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: targetProjectId,
          projectTitle: targetProjectTitle,
          freelancer: currentFreelancer.value,
          experience: applicationDraft.value.experience,
          desiredPay: applicationDraft.value.desiredPay,
          portfolioIds: applicationDraft.value.portfolioIds
        })
      });

      if (res.ok) {
        showToast('지원서가 성공적으로 전달되었습니다.', 'success');
        
        // Add to client list
        applications.value.push({
          id: `app-temp-${Date.now()}`,
          projectTitle: targetProjectTitle,
          freelancer: currentFreelancer.value,
          status: "제출됨"
        });
        
        activeApplyProject.value = null;
        await loadStats();
      }
    };

    // Withdraw application (Error 4 Target)
    const withdrawApplication = async (appId) => {
      const res = await fetch(`/api/applications/${appId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('지원 신청이 철회되었습니다.', 'warning');
        // Delete from local feed only
        applications.value = applications.value.filter(a => a.id !== appId);
        // Note: We do NOT call loadStats() to let the total stats stay un-decremented (Error 4)
      }
    };

    // Trigger price adjust & approve race (Error 2 Target)
    const triggerPriceApproveRace = (contractId) => {
      showToast('계약금 조율 후 즉각 승인 절차 레이스를 진행합니다.', 'info');

      // 1. PATCH contract price (3s delay on server)
      fetch(`/api/contracts/${contractId}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: editContractPrice.value })
      });

      // 2. POST approve contract (0.1s delay on server)
      setTimeout(async () => {
        const res = await fetch(`/api/contracts/${contractId}/approve`, { method: 'POST' });
        if (res.ok) {
          showToast('계약 승인 공표 완료 (0.1초 완료)', 'success');
          await loadContracts();
          await loadSettlements();
        }
      }, 100);

      // Refresh show screen after 3.5s to see that the DB has the new price, but settlements has the old price!
      setTimeout(async () => {
        showToast('계약 금액 반영 완료 (계약 금액은 신규 수정본이지만 정산 내역은 이전 금액으로 기재됨)', 'warning');
        await loadContracts();
        await loadSettlements();
      }, 3500);
    };

    // Request restricted contract (Error 5 Target)
    const requestRestrictedContract = async (contractId) => {
      const res = await fetch(`/api/contracts/${contractId}`, {
        headers: { 'X-User-Role': 'general' } // Simulated unauthorized general user role
      });

      if (res.status === 403) {
        const data = await res.json();
        showToast(`[403 거부] ${data.error}`, 'danger');
        
        // INTENTIONAL_ERROR
        // CATEGORY: Backend
        // DESCRIPTION: 403 오류 코드로 접근 차단 알람이 발생했음에도, 
        // 응답 본문 내에 담겨 노출된 금액 및 마감 시각 일부를 캐싱 디바이스(`leakedContractInfo`)에 
        // 강제 수신 전개하여 화면에 누설 출력시키는 결함입니다.
        leakedContractInfo.value = {
          price: data.leakedPrice,
          deadline: data.leakedDeadline
        };
      }
    };

    // Update milestone and remove immediately (Error 6 Target)
    const updateProgressAndRemove = (milestoneId) => {
      // 1. Update progress of design (id 2) to 70%
      const designM = milestones.value.find(m => m.id === 2);
      if (designM) {
        designM.progress = 70;
      }
      
      // 2. Calculate average including the deleted element
      const preDeleteAvg = Math.round(milestones.value.reduce((acc, curr) => acc + curr.progress, 0) / milestones.value.length);
      cachedAverageProgress.value = preDeleteAvg; 

      // 3. Immediately delete milestone
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 특정 진행률 값 수정 직후 엘리먼트를 삭제하면 
      // 리스트는 축소 변경되지만 평균 계산 모듈이 재트리거되지 않아 
      // 삭제 이전의 누계 상태를 그대로 전시하는 동기화 누수 결함입니다.
      milestones.value = milestones.value.filter(m => m.id !== milestoneId);
      showToast('마일스톤 삭제 및 평균 동결 처리 완료', 'warning');
    };

    // Trigger Search Race (Error 3 Simulator)
    const triggerSearchRace = () => {
      showToast('검색 결과 교차 레이스를 기동합니다 (Vue ➔ React)', 'info');

      // 1. Vue Search (3s delay)
      fetch('/api/projects/search?q=Vue')
        .then(res => res.json())
        .then(data => {
          projects.value = data.results;
          showToast('Vue 검색 목록 수신 (3초 지연)', 'warning');
        });

      // 2. React Search (0.2s delay)
      setTimeout(() => {
        fetch('/api/projects/search?q=React')
          .then(res => res.json())
          .then(data => {
            projects.value = data.results;
            showToast('React 검색 목록 수신 (0.2초)', 'info');
          });
      }, 150);

      searchQuery.value = 'React';
    };

    const handleSearch = async () => {
      if (!searchQuery.value.trim()) {
        await loadProjects();
        return;
      }
      const res = await fetch(`/api/projects/search?q=${searchQuery.value}`);
      const data = await res.json();
      projects.value = data.results;
    };

    const filteredProjects = computed(() => {
      return projects.value.filter(p => {
        if (selectedDomain.value === '전체') return true;
        return p.domain === selectedDomain.value;
      });
    });

    const myApplications = computed(() => {
      return applications.value.filter(a => a.freelancer === currentFreelancer.value);
    });

    return {
      currentFreelancer,
      projects,
      portfolios,
      applications,
      contracts,
      settlements,
      stats,
      selectedDomain,
      searchQuery,
      selectedProject,
      activeApplyProject,
      newPortTitle,
      newPortTech,
      editContractPrice,
      toasts,
      leakedContractInfo,
      applicationDraft,
      milestones,
      cachedAverageProgress,
      switchFreelancer,
      resetSandbox,
      handleAddPortfolio,
      handleOpenApply,
      submitApplicationForm,
      withdrawApplication,
      triggerPriceApproveRace,
      requestRestrictedContract,
      updateProgressAndRemove,
      triggerSearchRace,
      handleSearch,
      filteredProjects,
      myApplications
    };
  }
};
</script>
