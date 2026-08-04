const API = {
  campaigns: "/api/campaigns",
  reports: "/api/reports"
};

const BROKEN_PLEDGE_CAMPAIGN_ID = "safe-home";

const state = {
  campaigns: [],
  reports: [],
  selectedField: "전체",
  selectedCampaignId: "",
  amount: 50000,
  frequency: "monthly",
  activeReportType: "finance"
};

const dom = {
  campaignGrid: document.getElementById("campaignGrid"),
  campaignState: document.getElementById("campaignState"),
  fieldFilters: document.getElementById("fieldFilters"),
  totalTarget: document.getElementById("totalTarget"),
  totalCurrent: document.getElementById("totalCurrent"),
  averageProgress: document.getElementById("averageProgress"),
  campaignCount: document.getElementById("campaignCount"),
  campaignSelect: document.getElementById("campaignSelect"),
  selectedSummary: document.getElementById("selectedSummary"),
  amountOptions: document.getElementById("amountOptions"),
  frequencyOptions: document.getElementById("frequencyOptions"),
  customAmount: document.getElementById("customAmount"),
  pledgeForm: document.getElementById("pledgeForm"),
  pledgeStatus: document.getElementById("pledgeStatus"),
  resetPledgeBtn: document.getElementById("resetPledgeBtn"),
  reportState: document.getElementById("reportState"),
  reportTabs: document.getElementById("reportTabs"),
  reportList: document.getElementById("reportList"),
  modal: document.getElementById("campaignModal"),
  modalBody: document.getElementById("modalBody"),
  modalCloseBtn: document.getElementById("modalCloseBtn"),
  faqList: document.getElementById("faqList"),
  loginBtn: document.getElementById("loginBtn"),
  headerPledgeBtn: document.getElementById("headerPledgeBtn"),
  heroCtaBtn: document.getElementById("heroCtaBtn"),
  reportCtaBtn: document.getElementById("reportCtaBtn"),
  summaryPledgeBtn: document.getElementById("summaryPledgeBtn"),
  summaryShareBtn: document.getElementById("summaryShareBtn")
};

function formatWon(value) {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function getProgress(campaign) {
  return Math.round((campaign.currentAmount / campaign.targetAmount) * 100);
}

function getSelectedCampaign() {
  return state.campaigns.find((campaign) => campaign.id === state.selectedCampaignId);
}

function showReadyAlert() {
  window.alert("준비중입니다.");
}

function setLoading(box, message) {
  box.className = "state-box";
  box.textContent = message;
}

function setError(box, message, retryHandler) {
  box.className = "state-box is-error";
  box.innerHTML = `
    <strong>${message}</strong>
    <button class="btn btn-secondary" type="button">다시 시도</button>
  `;
  box.querySelector("button").addEventListener("click", retryHandler);
}

function hideState(box) {
  box.classList.add("is-hidden");
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function loadCampaigns() {
  setLoading(dom.campaignState, "캠페인 데이터를 불러오는 중입니다.");
  dom.campaignGrid.innerHTML = "";

  try {
    const data = await fetchJson(API.campaigns);
    state.campaigns = data.campaigns;
    state.selectedCampaignId = state.campaigns[0]?.id || "";
    renderFieldFilters();
    renderCampaigns();
    renderPledgeCampaignOptions();
    renderImpactSummary();
    renderSelectedSummary();
    hideState(dom.campaignState);
  } catch (error) {
    setError(dom.campaignState, "캠페인 데이터를 불러오지 못했습니다.", loadCampaigns);
  }
}

async function loadReports() {
  setLoading(dom.reportState, "보고서 데이터를 불러오는 중입니다.");
  dom.reportList.innerHTML = "";

  try {
    const data = await fetchJson(API.reports);
    state.reports = data.reports;
    renderReports();
    hideState(dom.reportState);
  } catch (error) {
    setError(dom.reportState, "보고서 데이터를 불러오지 못했습니다.", loadReports);
  }
}

function renderFieldFilters() {
  const fields = ["전체", ...new Set(state.campaigns.map((campaign) => campaign.field))];
  dom.fieldFilters.innerHTML = fields
    .map(
      (field) => `
        <button class="filter-chip ${field === state.selectedField ? "is-active" : ""}" type="button" data-field="${field}">
          ${field}
        </button>
      `
    )
    .join("");

  dom.fieldFilters.querySelectorAll(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedField = button.dataset.field;
      renderFieldFilters();
      renderCampaigns();
    });
  });
}

function renderCampaigns() {
  const visibleCampaigns =
    state.selectedField === "전체"
      ? state.campaigns
      : state.campaigns.filter((campaign) => campaign.field === state.selectedField);

  if (!visibleCampaigns.length) {
    dom.campaignGrid.innerHTML = `<div class="state-box">선택한 분야의 캠페인이 없습니다.</div>`;
    return;
  }

  dom.campaignGrid.innerHTML = visibleCampaigns.map(renderCampaignCard).join("");

  dom.campaignGrid.querySelectorAll(".js-detail").forEach((button) => {
    button.addEventListener("click", () => openCampaignModal(button.dataset.campaignId));
  });

  dom.campaignGrid.querySelectorAll(".js-pledge").forEach((button) => {
    const campaignId = button.dataset.campaignId;
    if (campaignId === BROKEN_PLEDGE_CAMPAIGN_ID) {
      // INTENTIONAL GUI BUG: site078-bug03
      // CSV Error: 기부 약정 버튼 무반응
      // Type: pledge-button-no-response
      // Description: 특정 캠페인 기부 약정 버튼에 click listener를 연결하지 않아 약정 UI가 갱신되지 않음.
      return;
    }

    button.addEventListener("click", () => {
      selectCampaign(campaignId);
      document.getElementById("pledge").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderCampaignCard(campaign) {
  const progress = getProgress(campaign);
  const bug02Attr = campaign.currentAmount > campaign.targetAmount ? 'data-bug-id="site078-bug02"' : "";
  const bug03Attr = campaign.id === BROKEN_PLEDGE_CAMPAIGN_ID ? 'data-bug-id="site078-bug03"' : "";

  // INTENTIONAL GUI BUG: site078-bug02
  // CSV Error: progress bar overflow
  // Type: donation-progress-overflow
  // Description: 달성률 width를 100%로 clamp하지 않아 초과 달성 캠페인의 progress bar가 카드 밖으로 넘침.
  const progressWidth = progress;

  return `
    <article class="campaign-card">
      <img src="${campaign.image}" alt="${campaign.title} 캠페인 이미지" />
      <div class="campaign-body">
        <div class="campaign-meta">
          <span class="pill field-tag">${campaign.field}</span>
          <span class="pill">${campaign.region}</span>
        </div>
        <h3>${campaign.title}</h3>
        <p>${campaign.description}</p>
        <div class="progress-area">
          <div class="progress-row">
            <span>${formatWon(campaign.currentAmount)}</span>
            <strong>${progress}%</strong>
          </div>
          <div class="progress-track" aria-label="${campaign.title} 달성률">
            <span class="progress-fill ${progress > 100 ? "is-overflow" : ""}" ${bug02Attr} style="width: ${progressWidth}%"></span>
          </div>
          <div class="progress-row">
            <span>목표 ${formatWon(campaign.targetAmount)}</span>
            <span>${campaign.partner}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary js-detail" type="button" data-campaign-id="${campaign.id}">상세 보기</button>
          <button class="btn btn-primary js-pledge" type="button" data-campaign-id="${campaign.id}" ${bug03Attr}>기부 약정하기</button>
        </div>
      </div>
    </article>
  `;
}

function renderPledgeCampaignOptions() {
  dom.campaignSelect.innerHTML = state.campaigns
    .map(
      (campaign) => `
        <option value="${campaign.id}" ${campaign.id === state.selectedCampaignId ? "selected" : ""}>
          ${campaign.title}
        </option>
      `
    )
    .join("");
}

function renderImpactSummary() {
  const totalTarget = state.campaigns.reduce((sum, campaign) => sum + campaign.targetAmount, 0);
  const totalCurrent = state.campaigns.reduce((sum, campaign) => sum + campaign.currentAmount, 0);
  const average = state.campaigns.length
    ? Math.round(state.campaigns.reduce((sum, campaign) => sum + getProgress(campaign), 0) / state.campaigns.length)
    : 0;

  dom.totalTarget.textContent = formatWon(totalTarget);
  dom.totalCurrent.textContent = formatWon(totalCurrent);
  dom.averageProgress.textContent = `${average}%`;
  dom.campaignCount.textContent = `${state.campaigns.length}개`;
}

function renderSelectedSummary() {
  const campaign = getSelectedCampaign();

  if (!campaign) {
    dom.selectedSummary.innerHTML = "<p>캠페인을 선택하면 약정 요약이 표시됩니다.</p>";
    return;
  }

  dom.selectedSummary.innerHTML = `
    <h3>${campaign.title}</h3>
    <p>${campaign.description}</p>
    <dl>
      <div>
        <dt>분야</dt>
        <dd>${campaign.field}</dd>
      </div>
      <div>
        <dt>달성률</dt>
        <dd>${getProgress(campaign)}%</dd>
      </div>
      <div>
        <dt>약정 금액</dt>
        <dd>${formatWon(state.amount)}</dd>
      </div>
      <div>
        <dt>주기</dt>
        <dd>${state.frequency === "monthly" ? "매월" : "1회"}</dd>
      </div>
    </dl>
  `;
}

function selectCampaign(campaignId) {
  state.selectedCampaignId = campaignId;
  dom.campaignSelect.value = campaignId;
  renderSelectedSummary();
  dom.pledgeStatus.textContent = "선택한 캠페인 요약이 갱신되었습니다.";
}

function openCampaignModal(campaignId) {
  const campaign = state.campaigns.find((item) => item.id === campaignId);
  if (!campaign) {
    return;
  }

  const cardProgress = getProgress(campaign);

  // INTENTIONAL GUI BUG: site078-bug01
  // CSV Error: 달성률 계산 불일치
  // Type: campaign-progress-mismatch
  // Description: 캠페인 카드와 상세 모달이 서로 다른 달성률 계산식을 사용해 퍼센트가 불일치함.
  const modalProgress = Math.round((campaign.currentAmount / (campaign.targetAmount * 1.13)) * 100);

  dom.modalBody.innerHTML = `
    <div class="modal-hero">
      <img src="${campaign.image}" alt="${campaign.title} 캠페인 상세 이미지" />
      <div class="modal-content">
        <p class="eyebrow">${campaign.field} Campaign</p>
        <h2 id="modalTitle">${campaign.title}</h2>
        <p>${campaign.description}</p>
        <dl class="modal-facts">
          <div>
            <dt>목표 금액</dt>
            <dd>${formatWon(campaign.targetAmount)}</dd>
          </div>
          <div>
            <dt>현재 금액</dt>
            <dd>${formatWon(campaign.currentAmount)}</dd>
          </div>
          <div>
            <dt>카드 달성률</dt>
            <dd>${cardProgress}%</dd>
          </div>
          <div data-bug-id="site078-bug01">
            <dt>상세 달성률</dt>
            <dd>${modalProgress}%</dd>
          </div>
          <div>
            <dt>지역</dt>
            <dd>${campaign.region}</dd>
          </div>
          <div>
            <dt>파트너</dt>
            <dd>${campaign.partner}</dd>
          </div>
        </dl>
        <button class="btn btn-primary" type="button" id="modalPledgeBtn">이 캠페인 약정하기</button>
      </div>
    </div>
  `;

  dom.modal.classList.add("is-open");
  dom.modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  document.getElementById("modalPledgeBtn").addEventListener("click", () => {
    selectCampaign(campaign.id);
    closeCampaignModal();
    document.getElementById("pledge").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function closeCampaignModal() {
  dom.modal.classList.remove("is-open");
  dom.modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function renderReports() {
  const reports = state.reports.filter((report) => report.type === state.activeReportType);

  dom.reportList.innerHTML = reports
    .map(
      (report) => `
        <article class="report-card">
          <div>
            <h3>${report.title}</h3>
            <p>${report.summary}</p>
            <small>${report.period} · ${report.id}</small>
          </div>
          <button class="btn ${report.downloadable ? "btn-primary" : "btn-secondary"} js-download" type="button">
            ${report.downloadable ? "보고서 받기" : "요약만 보기"}
          </button>
        </article>
      `
    )
    .join("");

  dom.reportList.querySelectorAll(".js-download").forEach((button) => {
    button.addEventListener("click", showReadyAlert);
  });
}

function setAmount(amount) {
  state.amount = amount;
  dom.amountOptions.querySelectorAll(".amount-chip").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.amount) === amount);
  });
  renderSelectedSummary();
}

function bindStaticInteractions() {
  dom.loginBtn.addEventListener("click", showReadyAlert);
  document.querySelectorAll(".footer-link").forEach((button) => button.addEventListener("click", showReadyAlert));

  dom.headerPledgeBtn.addEventListener("click", () => {
    document.getElementById("pledge").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  dom.heroCtaBtn.addEventListener("click", () => {
    document.getElementById("campaigns").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  dom.reportCtaBtn.addEventListener("click", () => {
    document.getElementById("reports").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  dom.summaryPledgeBtn.addEventListener("click", () => {
    document.getElementById("pledge").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  dom.summaryShareBtn.addEventListener("click", showReadyAlert);

  dom.campaignSelect.addEventListener("change", (event) => {
    selectCampaign(event.target.value);
  });

  dom.amountOptions.querySelectorAll(".amount-chip").forEach((button) => {
    button.addEventListener("click", () => {
      dom.customAmount.value = "";
      setAmount(Number(button.dataset.amount));
    });
  });

  dom.customAmount.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (value >= 1000) {
      setAmount(value);
    }
  });

  dom.frequencyOptions.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      state.frequency = button.dataset.frequency;
      dom.frequencyOptions.querySelectorAll(".segment").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      renderSelectedSummary();
    });
  });

  dom.pledgeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const campaign = getSelectedCampaign();
    dom.pledgeStatus.textContent = `${campaign ? campaign.title : "선택 캠페인"}에 ${formatWon(state.amount)} ${state.frequency === "monthly" ? "매월" : "1회"} mock 약정이 저장되었습니다.`;
  });

  dom.resetPledgeBtn.addEventListener("click", () => {
    state.amount = 50000;
    state.frequency = "monthly";
    dom.customAmount.value = "";
    dom.pledgeForm.reset();
    dom.frequencyOptions.querySelectorAll(".segment").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.frequency === "monthly");
    });
    dom.amountOptions.querySelectorAll(".amount-chip").forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.amount) === 50000);
    });
    if (state.campaigns[0]) {
      state.selectedCampaignId = state.campaigns[0].id;
      dom.campaignSelect.value = state.selectedCampaignId;
    }
    dom.pledgeStatus.textContent = "약정 입력값이 초기화되었습니다.";
    renderSelectedSummary();
  });

  dom.reportTabs.querySelectorAll(".report-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeReportType = button.dataset.type;
      dom.reportTabs.querySelectorAll(".report-tab").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      renderReports();
    });
  });

  dom.faqList.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const isOpen = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
      button.querySelector("span").textContent = isOpen ? "-" : "+";
    });
  });

  dom.modalCloseBtn.addEventListener("click", closeCampaignModal);
  dom.modal.addEventListener("click", (event) => {
    if (event.target === dom.modal) {
      closeCampaignModal();
    }
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dom.modal.classList.contains("is-open")) {
      closeCampaignModal();
    }
  });
}

bindStaticInteractions();
loadCampaigns();
loadReports();
