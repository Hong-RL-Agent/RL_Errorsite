const BUGGY_PLAN_ID = "elite";

const state = {
  plans: [],
  trainers: [],
  billingMode: "monthly",
  selectedPlanId: null,
  selectedPtSessions: 0,
  locker: false,
  towel: false,
  programFilter: "all",
  activeTrainerId: null,
  reviewIndex: 0,
  trial: {
    name: "",
    phone: "",
    branch: "강남 스틸점",
    time: "평일 오전"
  }
};

const els = {};

const programs = [
  {
    id: "prg-01",
    type: "strength",
    label: "근력",
    title: "Power Rack Foundation",
    description: "스쿼트, 벤치프레스, 데드리프트 자세를 기록 기반으로 교정하는 기본 루틴입니다."
  },
  {
    id: "prg-02",
    type: "cardio",
    label: "유산소",
    title: "Zone 2 Cardio Build",
    description: "심박 구간을 유지하며 지방 대사와 회복 능력을 끌어올리는 유산소 프로그램입니다."
  },
  {
    id: "prg-03",
    type: "hiit",
    label: "HIIT",
    title: "Neon Burn Circuit",
    description: "짧은 인터벌로 전신 근지구력과 심폐 능력을 동시에 자극합니다."
  },
  {
    id: "prg-04",
    type: "recovery",
    label: "회복",
    title: "Mobility Reset",
    description: "어깨, 고관절, 흉추 가동성을 회복해 다음 운동의 퍼포먼스를 높입니다."
  }
];

const reviews = [
  {
    quote: "퇴근 후에도 붐비지 않는 프리웨이트 존이 좋아요. 앱 기록과 상담이 이어져서 루틴이 흔들리지 않습니다.",
    author: "김도윤 · Performance Plus 8개월"
  },
  {
    quote: "처음에는 무료 체험만 해보려 했는데 트레이너 상담이 너무 구체적이라 바로 연간권을 선택했습니다.",
    author: "박예진 · Starter에서 Elite 전환"
  },
  {
    quote: "체형 분석과 PT 기록이 누적되니 어깨 통증 없이 중량이 올랐습니다. 회복 라운지도 자주 씁니다.",
    author: "정민석 · Elite Coaching 5개월"
  }
];

const faqs = [
  {
    question: "연간권은 중도 해지가 가능한가요?",
    answer: "이용 기간과 프로모션 혜택 사용 여부에 따라 환불 금액이 산정됩니다. 상세 규정은 현장 상담에서 확인할 수 있습니다."
  },
  {
    question: "무료 체험은 어떤 프로그램을 이용하나요?",
    answer: "체성분 측정, 시설 투어, 기본 자세 체크, 30분 개인 상담 중 희망 항목을 선택할 수 있습니다."
  },
  {
    question: "PT 옵션은 언제든 추가할 수 있나요?",
    answer: "회원권 결제 후에도 앱 또는 데스크에서 2회 단위로 추가할 수 있습니다."
  },
  {
    question: "지점 간 교차 이용이 가능한가요?",
    answer: "모든 플랜에서 전 지점 이용이 가능하며, 24시간 입장은 Performance Plus 이상 플랜부터 제공됩니다."
  }
];

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  attachStaticHandlers();
  renderPrograms();
  renderFaqs();
  renderReview();
  updateTrialPreview();
  updateSummary();
  loadPlans();
  loadTrainers();
}

function cacheElements() {
  els.billingToggle = document.getElementById("billingToggle");
  els.plansStatus = document.getElementById("plansStatus");
  els.plansError = document.getElementById("plansError");
  els.retryPlans = document.getElementById("retryPlans");
  els.planGrid = document.getElementById("planGrid");
  els.ptRange = document.getElementById("ptRange");
  els.ptRangeLabel = document.getElementById("ptRangeLabel");
  els.lockerOption = document.getElementById("lockerOption");
  els.towelOption = document.getElementById("towelOption");
  els.programFilter = document.getElementById("programFilter");
  els.programGrid = document.getElementById("programGrid");
  els.trainersStatus = document.getElementById("trainersStatus");
  els.trainersError = document.getElementById("trainersError");
  els.retryTrainers = document.getElementById("retryTrainers");
  els.trainerGrid = document.getElementById("trainerGrid");
  els.trainerModalBackdrop = document.getElementById("trainerModalBackdrop");
  els.trainerModalClose = document.getElementById("trainerModalClose");
  els.trainerModalImage = document.getElementById("trainerModalImage");
  els.trainerModalSpecialty = document.getElementById("trainerModalSpecialty");
  els.trainerModalTitle = document.getElementById("trainerModalTitle");
  els.trainerModalBio = document.getElementById("trainerModalBio");
  els.trainerModalExperience = document.getElementById("trainerModalExperience");
  els.trainerModalRating = document.getElementById("trainerModalRating");
  els.trialForm = document.getElementById("trialForm");
  els.trialName = document.getElementById("trialName");
  els.trialPhone = document.getElementById("trialPhone");
  els.trialBranch = document.getElementById("trialBranch");
  els.trialTime = document.getElementById("trialTime");
  els.trialPreview = document.getElementById("trialPreview");
  els.reviewCard = document.getElementById("reviewCard");
  els.prevReview = document.getElementById("prevReview");
  els.nextReview = document.getElementById("nextReview");
  els.faqList = document.getElementById("faqList");
  els.summaryPlanName = document.getElementById("summaryPlanName");
  els.summaryPrice = document.getElementById("summaryPrice");
  els.summaryBilling = document.getElementById("summaryBilling");
  els.summaryPt = document.getElementById("summaryPt");
  els.summaryAddons = document.getElementById("summaryAddons");
  els.summaryTrial = document.getElementById("summaryTrial");
  els.checkoutButton = document.getElementById("checkoutButton");
}

function attachStaticHandlers() {
  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.scrollTarget);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  document.querySelectorAll("[data-soon]").forEach((button) => {
    button.addEventListener("click", () => {
      alert("준비중입니다.");
    });
  });

  els.retryPlans.addEventListener("click", loadPlans);
  els.retryTrainers.addEventListener("click", loadTrainers);

  els.billingToggle.addEventListener("click", () => {
    state.billingMode = state.billingMode === "monthly" ? "yearly" : "monthly";
    els.billingToggle.classList.toggle("is-yearly", state.billingMode === "yearly");
    els.billingToggle.setAttribute("aria-pressed", String(state.billingMode === "yearly"));
    renderPlans();
    updateSummary();
  });

  els.ptRange.addEventListener("input", () => {
    state.selectedPtSessions = Number(els.ptRange.value);
    els.ptRangeLabel.textContent = `${state.selectedPtSessions}회`;
    updateSummary();
  });

  els.lockerOption.addEventListener("change", () => {
    state.locker = els.lockerOption.checked;
    updateSummary();
  });

  els.towelOption.addEventListener("change", () => {
    state.towel = els.towelOption.checked;
    updateSummary();
  });

  els.programFilter.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-program-filter]");
    if (!chip) {
      return;
    }
    state.programFilter = chip.dataset.programFilter;
    els.programFilter.querySelectorAll("[data-program-filter]").forEach((button) => {
      button.classList.toggle("active", button === chip);
    });
    renderPrograms();
  });

  els.trainerModalClose.addEventListener("click", closeTrainerModal);
  els.trainerModalBackdrop.addEventListener("click", (event) => {
    if (event.target === els.trainerModalBackdrop) {
      closeTrainerModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.trainerModalBackdrop.hidden) {
      closeTrainerModal();
    }
  });

  [els.trialName, els.trialPhone, els.trialBranch, els.trialTime].forEach((field) => {
    field.addEventListener("input", syncTrialState);
    field.addEventListener("change", syncTrialState);
  });

  els.trialForm.addEventListener("submit", (event) => {
    event.preventDefault();
    syncTrialState();
    alert("준비중입니다.");
  });

  els.prevReview.addEventListener("click", () => {
    state.reviewIndex = (state.reviewIndex - 1 + reviews.length) % reviews.length;
    renderReview();
  });

  els.nextReview.addEventListener("click", () => {
    state.reviewIndex = (state.reviewIndex + 1) % reviews.length;
    renderReview();
  });

  els.checkoutButton.addEventListener("click", () => {
    alert("준비중입니다.");
  });
}

async function loadPlans() {
  els.plansStatus.textContent = "회원권 정보를 불러오는 중입니다.";
  els.plansError.hidden = true;

  try {
    const response = await fetch("/api/plans");
    if (!response.ok) {
      throw new Error(`Plans API returned ${response.status}`);
    }
    const payload = await response.json();
    state.plans = payload.plans;
    if (!state.selectedPlanId && state.plans.length > 0) {
      state.selectedPlanId = state.plans[0].id;
    }
    renderPlans();
    updateSummary();
    els.plansStatus.textContent = `${state.plans.length}개 회원권 표시 중 · API 데이터 정상 로드`;
  } catch (error) {
    els.plansStatus.textContent = "";
    els.plansError.hidden = false;
  }
}

async function loadTrainers() {
  els.trainersStatus.textContent = "트레이너 정보를 불러오는 중입니다.";
  els.trainersError.hidden = true;

  try {
    const response = await fetch("/api/trainers");
    if (!response.ok) {
      throw new Error(`Trainers API returned ${response.status}`);
    }
    const payload = await response.json();
    state.trainers = payload.trainers;
    renderTrainers();
    els.trainersStatus.textContent = `${state.trainers.length}명 트레이너 표시 중 · API 데이터 정상 로드`;
  } catch (error) {
    els.trainersStatus.textContent = "";
    els.trainersError.hidden = false;
  }
}

function renderPlans() {
  els.planGrid.innerHTML = "";

  state.plans.forEach((plan) => {
    const isSelected = plan.id === state.selectedPlanId;
    const card = document.createElement("article");
    card.className = `plan-card ${plan.recommended ? "recommended" : ""}`;
    card.dataset.planId = plan.id;

    let price = state.billingMode === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    let period = state.billingMode === "yearly" ? "연" : "월";

    if (plan.recommended) {
      // INTENTIONAL GUI BUG: site052-bug01
      // CSV Error: 가격 토글 불일치
      // Type: pricing-toggle-mismatch
      // Description: 연간 결제 토글 상태가 추천 플랜 카드 가격 렌더링에 반영되지 않아 월간 가격이 계속 표시됨.
      price = plan.monthlyPrice;
      period = "월";
    }

    const priceBugAttribute = plan.recommended ? ' data-bug-id="site052-bug01"' : "";

    card.innerHTML = `
      <div class="plan-topline">
        <span>${plan.recommended ? "Most Popular" : "Membership"}</span>
        ${plan.recommended ? '<span class="recommend-badge">추천</span>' : ""}
      </div>
      <h3>${plan.name}</h3>
      <div class="plan-price"${priceBugAttribute}>${formatCurrency(price)} <small>/ ${period}</small></div>
      <ul class="benefit-list">
        ${plan.benefits.map((benefit) => `<li>${benefit}</li>`).join("")}
      </ul>
      <button class="select-plan-button ${isSelected ? "is-selected" : ""}" type="button">
        ${isSelected ? "선택됨" : "선택하기"}
      </button>
    `;

    const button = card.querySelector(".select-plan-button");
    if (plan.id === BUGGY_PLAN_ID) {
      // INTENTIONAL GUI BUG: site052-bug03
      // CSV Error: 플랜 선택 버튼 무반응
      // Type: plan-select-button-no-response
      // Description: 특정 프리미엄 플랜 선택 버튼에 click listener를 연결하지 않아 선택 요약이 변경되지 않음.
      button.setAttribute("data-bug-id", "site052-bug03");
    } else {
      button.addEventListener("click", () => {
        state.selectedPlanId = plan.id;
        renderPlans();
        updateSummary();
      });
    }

    els.planGrid.appendChild(card);
  });
}

function renderPrograms() {
  const filteredPrograms = programs.filter((program) => {
    return state.programFilter === "all" || program.type === state.programFilter;
  });

  els.programGrid.innerHTML = "";
  filteredPrograms.forEach((program) => {
    const card = document.createElement("article");
    card.className = "program-card";
    card.innerHTML = `
      <span>${program.label}</span>
      <h3>${program.title}</h3>
      <p>${program.description}</p>
    `;
    els.programGrid.appendChild(card);
  });
}

function renderTrainers() {
  els.trainerGrid.innerHTML = "";

  state.trainers.forEach((trainer) => {
    const card = document.createElement("article");
    card.className = "trainer-card";
    card.innerHTML = `
      <img src="${trainer.image}" alt="${trainer.name} 트레이너 프로필 이미지" />
      <div class="trainer-body">
        <span>${trainer.specialty}</span>
        <h3>${trainer.name}</h3>
        <p>${trainer.experience} 경력 · 평점 ${trainer.rating}</p>
        <button type="button">상세 보기</button>
      </div>
    `;
    card.querySelector("button").addEventListener("click", () => openTrainerModal(trainer.id));
    els.trainerGrid.appendChild(card);
  });
}

function openTrainerModal(trainerId) {
  const trainer = state.trainers.find((item) => item.id === trainerId);
  if (!trainer) {
    return;
  }

  state.activeTrainerId = trainerId;
  els.trainerModalImage.src = trainer.image;
  els.trainerModalImage.alt = `${trainer.name} 트레이너 프로필 이미지`;
  els.trainerModalSpecialty.textContent = trainer.specialty;
  els.trainerModalTitle.textContent = trainer.name;
  els.trainerModalBio.textContent = trainer.bio;
  els.trainerModalExperience.textContent = trainer.experience;
  els.trainerModalRating.textContent = `${trainer.rating} / 5.0`;
  els.trainerModalBackdrop.hidden = false;
}

function closeTrainerModal() {
  els.trainerModalBackdrop.hidden = true;
  state.activeTrainerId = null;
}

function renderFaqs() {
  els.faqList.innerHTML = "";
  faqs.forEach((faq, index) => {
    const item = document.createElement("article");
    item.className = "faq-item";
    const contentId = `faq-${index}`;
    item.innerHTML = `
      <button class="faq-trigger" type="button" aria-expanded="${index === 0}" aria-controls="${contentId}">
        ${faq.question}
      </button>
      <div class="faq-content" id="${contentId}" ${index === 0 ? "" : "hidden"}>${faq.answer}</div>
    `;
    item.querySelector(".faq-trigger").addEventListener("click", () => {
      const trigger = item.querySelector(".faq-trigger");
      const content = item.querySelector(".faq-content");
      const shouldOpen = content.hidden;
      content.hidden = !shouldOpen;
      trigger.setAttribute("aria-expanded", String(shouldOpen));
    });
    els.faqList.appendChild(item);
  });
}

function renderReview() {
  const review = reviews[state.reviewIndex];
  els.reviewCard.innerHTML = `
    <blockquote>${review.quote}</blockquote>
    <cite>${review.author}</cite>
  `;
}

function syncTrialState() {
  state.trial.name = els.trialName.value.trim();
  state.trial.phone = els.trialPhone.value.trim();
  state.trial.branch = els.trialBranch.value;
  state.trial.time = els.trialTime.value;
  updateTrialPreview();
  updateSummary();
}

function updateTrialPreview() {
  if (!state.trial.name && !state.trial.phone) {
    els.trialPreview.textContent = "이름과 연락처를 입력하면 신청 미리보기가 표시됩니다.";
    return;
  }

  const name = state.trial.name || "이름 미입력";
  const phone = state.trial.phone || "연락처 미입력";
  els.trialPreview.textContent = `${name}님 · ${phone} · ${state.trial.branch} · ${state.trial.time} 무료 체험 희망`;
}

function updateSummary() {
  const selectedPlan = state.plans.find((plan) => plan.id === state.selectedPlanId);
  const basePrice = selectedPlan
    ? state.billingMode === "yearly"
      ? selectedPlan.yearlyPrice
      : selectedPlan.monthlyPrice
    : 0;
  const ptPrice = state.selectedPtSessions * 70000;
  const lockerPrice = state.locker ? 15000 : 0;
  const towelPrice = state.towel ? 12000 : 0;
  const total = basePrice + ptPrice + lockerPrice + towelPrice;

  els.summaryPlanName.textContent = selectedPlan ? selectedPlan.name : "플랜을 선택하세요";
  els.summaryPrice.textContent = formatCurrency(total);
  els.summaryBilling.textContent = state.billingMode === "yearly" ? "연간" : "월간";
  els.summaryPt.textContent = `${state.selectedPtSessions}회`;

  const addons = [];
  if (state.locker) {
    addons.push("개인 락커");
  }
  if (state.towel) {
    addons.push("수건 서비스");
  }
  els.summaryAddons.textContent = addons.length ? addons.join(", ") : "선택 없음";

  if (state.trial.name || state.trial.phone) {
    els.summaryTrial.textContent = `${state.trial.branch} · ${state.trial.time}`;
  } else {
    els.summaryTrial.textContent = "미입력";
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(value);
}
