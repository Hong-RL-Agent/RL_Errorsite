<script>
  import { onMount } from 'svelte';

  // Core Data State
  let jobs = [];
  let applications = [];
  let interviews = [];

  // Filter States
  let searchQuery = '';
  let selectedRole = '전체';
  let selectedRegion = '전체';
  
  // Bookmarks State (Uses index in filtered list - Error 1)
  let bookmarkedIndices = [];

  // Active Panels
  let activeTab = 'jobs'; // jobs, kanban, interviews
  let selectedJob = null; // job object for Fullscreen Detail Overlay
  let showApplyModal = false;

  // Form Inputs
  let currentUser = 'tester';
  let applicantName = '';
  let coverLetter = '';
  let uploadedResumeName = '';
  let uploadedResumeUrl = '';
  
  let isUploading = false;
  let isSubmitting = false;
  let toasts = [];

  onMount(() => {
    loadJobs();
    loadApplications();
  });

  const loadJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      jobs = await res.json();
    } catch (err) {
      showToast('채용 공고 로딩 실패', 'danger');
    }
  };

  const loadApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      applications = await res.json();
    } catch (err) {
      showToast('지원 현황 로딩 실패', 'danger');
    }
  };

  // Error 5: tester user triggers 503
  const loadInterviews = async () => {
    try {
      const res = await fetch(`/api/interviews?user=${currentUser}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '503 Service Mismatch');
      }
      interviews = data;
      showToast('면접 일정을 불러왔습니다.', 'success');
      activeTab = 'interviews';
    } catch (err) {
      showToast(`일정 불러오기 실패: ${err.message}`, 'danger');
    }
  };

  // Filter Job Postings
  $: filteredJobs = jobs.filter(job => {
    const matchQuery = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = selectedRole === '전체' || job.role === selectedRole;
    const matchRegion = selectedRegion === '전체' || job.region === selectedRegion;
    return matchQuery && matchRole && matchRegion;
  });

  // Error 1 Bookmark Trigger
  const toggleBookmark = (idx) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 북마크 등록 시 공고의 고유 ID가 아닌 현재 화면에 렌더링된 
    // 필터링 리스트 내의 순서(index)를 배열에 추가합니다. 이로 인해 필터를 수정하면 
    // 기존 별표 표시가 엉뚱한 다른 공고에 할당되어 노출되는 부조화가 생깁니다.
    if (bookmarkedIndices.includes(idx)) {
      bookmarkedIndices = bookmarkedIndices.filter(i => i !== idx);
    } else {
      bookmarkedIndices = [...bookmarkedIndices, idx];
    }
  };

  // File Upload Simulator
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    isUploading = true;
    
    // Simulate API file upload payload
    try {
      const res = await fetch('/api/resumes/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name })
      });
      const data = await res.json();
      if (res.ok) {
        uploadedResumeName = data.filename;
        uploadedResumeUrl = data.url;
        showToast(`이력서 업로드 성공: ${file.name}`, 'success');
      }
    } catch (err) {
      showToast('이력서 파일 서버 인계 실패', 'danger');
    } finally {
      isUploading = false;
    }
  };

  // Apply Submit (Error 2 test)
  const submitApplication = async () => {
    if (!applicantName.trim() || !coverLetter.trim()) {
      showToast('지원자 이름과 자기소개서를 입력해 주세요.', 'warning');
      return;
    }

    isSubmitting = true;

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob.id,
          applicantName,
          coverLetter,
          resumeName: uploadedResumeName
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '지원서 전송 거부');
      }

      showToast('채용 지원서가 정상 접수되었습니다!', 'success');
      showApplyModal = false;
      selectedJob = null;
      applicantName = '';
      coverLetter = '';
      uploadedResumeName = '';
      uploadedResumeUrl = '';
      
      loadApplications();
      activeTab = 'kanban';
    } catch (err) {
      showToast(`지원 에러: ${err.message}`, 'danger');
    } finally {
      isSubmitting = false;
    }
  };

  // Move Kanban Stage (Error 3 test)
  const moveStage = async (appId, targetStage) => {
    const appItem = applications.find(a => a.id === appId);
    if (!appItem) return;

    const originalStage = appItem.stage;
    
    // Optimistic Update on Frontend
    appItem.stage = targetStage;
    applications = [...applications];

    try {
      const res = await fetch(`/api/applications/${appId}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: targetStage })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '상태 갱신 실패');
      }
      showToast(`지원 단계 상태가 '${targetStage}'(으)로 조정되었습니다.`, 'success');
    } catch (err) {
      // Revert if failure occurs
      appItem.stage = originalStage;
      applications = [...applications];
      showToast(`연동 실패: ${err.message}`, 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 4500);
  };

  const getJobName = (jobId) => {
    const j = jobs.find(x => x.id === jobId);
    return j ? `${j.company} - ${j.title}` : '로딩 중...';
  };
</script>

<div class="hireboard-app">
  <!-- Navbar Header -->
  <header class="app-navbar">
    <div class="navbar-logo">
      <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      <span class="logo-title">HireBoard</span>
      <span class="logo-subtitle">채용 매니저 &amp; 이력서 허브</span>
    </div>
    
    <!-- User profiles -->
    <div class="navbar-actions">
      <div class="user-picker">
        <label for="user-select">접속계정:</label>
        <select id="user-select" bind:value={currentUser}>
          <option value="tester">tester (503 에러 발생용)</option>
          <option value="applicant_kim">개발자_김철수</option>
        </select>
      </div>
      <button class="nav-btn" class:active={activeTab === 'jobs'} on:click={() => activeTab = 'jobs'}>💼 공고 탐색</button>
      <button class="nav-btn" class:active={activeTab === 'kanban'} on:click={() => activeTab = 'kanban'}>📊 지원 현황 보드</button>
      <button class="nav-btn" on:click={loadInterviews}>🗓️ 면접 일정 불러오기</button>
    </div>
  </header>

  <!-- Workspace Grid -->
  <div class="workspace-grid">
    
    <!-- Left panel: Filters (visible on jobs tab) -->
    <aside class="panel-section column-filters">
      <div class="panel-header">
        <h2>🔍 검색 및 직무 필터</h2>
      </div>

      <div class="filter-group">
        <label for="search-input">공고 키워드</label>
        <input 
          id="search-input"
          type="text" 
          placeholder="회사명, 직무 검색..." 
          bind:value={searchQuery}
        />
      </div>

      <div class="filter-group">
        <label for="role-select">직무 카테고리</label>
        <select id="role-select" bind:value={selectedRole}>
          {#each ['전체', '개발', '디자인', '마케팅'] as r}
            <option value={r}>{r}</option>
          {/each}
        </select>
      </div>

      <div class="filter-group">
        <label for="region-select">근무 지역</label>
        <select id="region-select" bind:value={selectedRegion}>
          {#each ['전체', '서울', '경기', '제주'] as reg}
            <option value={reg}>{reg}</option>
          {/each}
        </select>
      </div>

      <div class="filter-overall-status">
        <p>전체 매칭 공고: <strong>{filteredJobs.length}</strong>개</p>
      </div>
    </aside>

    <!-- Center main container -->
    <main class="panel-section column-main">
      {#if activeTab === 'jobs'}
        <!-- Tab 1: Jobs List -->
        <div class="panel-header">
          <h2>💼 현재 채용 중인 직무 목록</h2>
        </div>

        <div class="jobs-list-layout">
          {#each filteredJobs as job, idx (job.id)}
            <div class="job-item-card">
              <div class="card-left">
                <!-- bookmark click triggers index based logic -->
                <button class="bookmark-star-btn" on:click={() => toggleBookmark(idx)}>
                  {bookmarkedIndices.includes(idx) ? '⭐' : '☆'}
                </button>
                <div class="job-title-block">
                  <span class="region-badge">{job.region}</span>
                  <h3>{job.title}</h3>
                  <p class="company-sub">{job.company} | {job.role}</p>
                </div>
              </div>
              <button class="view-detail-btn" on:click={() => selectedJob = job}>
                상세 정보 &amp; 지원
              </button>
            </div>
          {/each}
        </div>

      {:else if activeTab === 'kanban'}
        <!-- Tab 2: Application status Kanban Board -->
        <div class="panel-header">
          <h2>📊 채용 지원 단계별 현황판</h2>
          <p class="subtitle">지원의 진행상태를 단계 버튼(◀ / ▶)을 통해 이동할 수 있습니다.</p>
        </div>

        <div class="kanban-board-scroll">
          {#each ['지원', '서류합격', '면접', '최종합격'] as columnStage}
            <div class="kanban-column">
              <div class="col-head">
                <h3>{columnStage} ({applications.filter(a => a.stage === columnStage).length})</h3>
              </div>
              <div class="col-body-cards">
                {#each applications.filter(a => a.stage === columnStage) as app (app.id)}
                  <div class="kanban-card">
                    <div class="k-head">
                      <h4>{app.applicantName}</h4>
                      <div class="kanban-controls">
                        <!-- Left trigger -->
                        {#if columnStage !== '지원'}
                          <button 
                            class="ctrl-btn" 
                            on:click={() => {
                              const stages = ['지원', '서류합격', '면접', '최종합격'];
                              const nextIdx = stages.indexOf(columnStage) - 1;
                              moveStage(app.id, stages[nextIdx]);
                            }}
                          >
                            ◀
                          </button>
                        {/if}
                        <!-- Right trigger -->
                        {#if columnStage !== '최종합격'}
                          <button 
                            class="ctrl-btn" 
                            on:click={() => {
                              const stages = ['지원', '서류합격', '면접', '최종합격'];
                              const nextIdx = stages.indexOf(columnStage) + 1;
                              moveStage(app.id, stages[nextIdx]);
                            }}
                          >
                            ▶
                          </button>
                        {/if}
                      </div>
                    </div>
                    
                    <p class="k-job">{getJobName(app.jobId)}</p>
                    <p class="k-letter">{app.coverLetter.slice(0, 40)}...</p>
                    
                    <!-- File download link with Error 4 (Korean name check) -->
                    {#if app.resumeName}
                      <a 
                        href={`/uploads/${app.resumeName}`} 
                        download 
                        class="resume-link"
                      >
                        📂 이력서: {app.resumeName}
                      </a>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>

      {:else if activeTab === 'interviews'}
        <!-- Tab 3: Interviews scheduler -->
        <div class="panel-header">
          <h2>🗓️ 확정된 면접 일정표</h2>
        </div>

        {#if interviews.length === 0}
          <div class="empty-placeholder">면접 일정이 없습니다.</div>
        {:else}
          <div class="interviews-timeline">
            {#each interviews as iv (iv.id)}
              <div class="interview-time-node">
                <div class="iv-date">📅 {iv.date}</div>
                <div class="iv-body">
                  <h4>{iv.jobTitle}</h4>
                  <span class="iv-type">{iv.type}</span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      {/if}
    </main>

    <!-- Right panel: Bookmarks / Interest jobs (Shows bookmarked items) -->
    <aside class="panel-section column-bookmarks">
      <div class="panel-header">
        <h2>⭐ 나의 관심 공고</h2>
      </div>

      <div class="bookmarks-list-box">
        {#if bookmarkedIndices.length === 0}
          <div class="empty-placeholder">별표를 눌러 관심있는 채용 공고를 보관해 보세요.</div>
        {:else}
          {#each bookmarkedIndices as activeIdx}
            {#if filteredJobs[activeIdx]}
              <div class="bookmark-small-card">
                <span>{filteredJobs[activeIdx].company}</span>
                <h4>{filteredJobs[activeIdx].title}</h4>
                <button class="remove-btn" on:click={() => toggleBookmark(activeIdx)}>&times;</button>
              </div>
            {/if}
          {/each}
        {/if}
      </div>
    </aside>
  </div>

  <!-- Job Detail Fullscreen Overlay -->
  {#if selectedJob}
    <div class="detail-overlay-backdrop">
      <div class="detail-overlay-content">
        <button class="close-overlay-btn" on:click={() => selectedJob = null}>&times; 닫기</button>
        
        <div class="overlay-job-header">
          <span class="region-badge">{selectedJob.region}</span>
          <h2>{selectedJob.title}</h2>
          <h3>{selectedJob.company} | {selectedJob.role}</h3>
        </div>

        <div class="overlay-job-body">
          <p class="job-description-text">{selectedJob.desc}</p>
          <hr class="divider"/>
          
          <div class="apply-section">
            <h3>📝 입사 지원하기</h3>
            <button class="trigger-apply-btn" on:click={() => showApplyModal = true}>
              이 공고에 즉시 지원서 제출
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Apply form Modal sheet -->
  {#if showApplyModal}
    <div class="apply-modal-overlay">
      <div class="apply-modal-content">
        <div class="modal-header">
          <h3>📝 {selectedJob?.title} - 지원서 제출</h3>
          <button class="modal-close" on:click={() => showApplyModal = false}>&times;</button>
        </div>
        <form on:submit|preventDefault={submitApplication} class="apply-form">
          <div class="form-group">
            <label for="applicant-name-input">지원자 이름</label>
            <input 
              id="applicant-name-input"
              type="text" 
              placeholder="본인의 이름을 입력하세요." 
              bind:value={applicantName}
            />
          </div>

          <div class="form-group">
            <label for="cover-letter-input">자기소개서 (내용에 &lt;script&gt; 가 들어있으면 서버 500 오류 유발)</label>
            <textarea 
              id="cover-letter-input"
              rows="5" 
              placeholder="본인의 강점과 역량을 기술하십시오." 
              bind:value={coverLetter}
            />
          </div>

          <div class="form-group file-upload-group">
            <label for="resume-file-input">이력서 첨부 (한글 파일 이름 업로드 시 링크 다운로드 404 유발)</label>
            <div class="file-action-row">
              <input 
                id="resume-file-input"
                type="file" 
                accept=".pdf,.doc,.docx"
                on:change={handleFileUpload}
              />
              {#if isUploading}
                <span class="uploading-lbl">이력서 검사 중...</span>
              {:else if uploadedResumeName}
                <span class="uploaded-lbl">선택됨: {uploadedResumeName}</span>
              {/if}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="cancel-btn" on:click={() => showApplyModal = false}>취소</button>
            <button type="submit" class="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? '지원 송신 중...' : '지원서 최종 제출'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Toast containers -->
  <div class="toast-container">
    {#each toasts as t (t.id)}
      <div class="toast-card {t.type}">
        <span class="toast-icon">
          {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
        </span>
        <span class="toast-message">{t.message}</span>
        <button class="toast-close" on:click={() => toasts = toasts.filter(x => x.id !== t.id)}>&times;</button>
      </div>
    {/each}
  </div>
</div>
