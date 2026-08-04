const state = {
  options: [],
  photos: [],
  selectedPhotos: [],
  selectedOptionId: null,
  selectedSize: "",
  quantity: 1,
  filters: {
    paper: "all",
    size: "all",
    recommendedOnly: false
  },
  activePhotoId: null
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  bindStaticEvents();
  loadPrintOptions();
  loadSamplePhotos();
}

function cacheElements() {
  els.optionGrid = document.getElementById("optionGrid");
  els.previewGrid = document.getElementById("previewGrid");
  els.optionsStatus = document.getElementById("optionsStatus");
  els.photosStatus = document.getElementById("photosStatus");
  els.optionsError = document.getElementById("optionsError");
  els.photosError = document.getElementById("photosError");
  els.retryOptions = document.getElementById("retryOptions");
  els.retryPhotos = document.getElementById("retryPhotos");
  els.paperFilter = document.getElementById("paperFilter");
  els.sizeFilter = document.getElementById("sizeFilter");
  els.recommendedOnly = document.getElementById("recommendedOnly");
  els.resetFilters = document.getElementById("resetFilters");
  els.selectedSize = document.getElementById("selectedSize");
  els.quantityDisplay = document.getElementById("quantityDisplay");
  els.decreaseQuantity = document.getElementById("decreaseQuantity");
  els.increaseQuantity = document.getElementById("increaseQuantity");
  els.applySelection = document.getElementById("applySelection");
  els.selectedPhotoCount = document.getElementById("selectedPhotoCount");
  els.selectedOptionLabel = document.getElementById("selectedOptionLabel");
  els.summaryQuantity = document.getElementById("summaryQuantity");
  els.summaryTotal = document.getElementById("summaryTotal");
  els.summaryCard = document.getElementById("summaryCard");
  els.toggleSummary = document.getElementById("toggleSummary");
  els.clearSelection = document.getElementById("clearSelection");
  els.selectFirstThree = document.getElementById("selectFirstThree");
  els.photoModalBackdrop = document.getElementById("photoModalBackdrop");
  els.modalClose = document.getElementById("modalClose");
  els.modalImage = document.getElementById("modalImage");
  els.modalTitle = document.getElementById("modalTitle");
  els.modalRatio = document.getElementById("modalRatio");
  els.modalToggleSelection = document.getElementById("modalToggleSelection");

  // INTENTIONAL GUI BUG: site064-bug03
  // Type: upload-next-button-no-response
  // Description: 다음 단계 버튼 selector가 실제 DOM id와 달라 click listener가 연결되지 않음.
  els.uploadNextButton = document.getElementById("uploadNextStepButton");
}

function bindStaticEvents() {
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

  els.retryOptions.addEventListener("click", loadPrintOptions);
  els.retryPhotos.addEventListener("click", loadSamplePhotos);

  [els.paperFilter, els.sizeFilter].forEach((select) => {
    select.addEventListener("change", () => {
      syncFilters();
      renderOptions();
    });
  });

  els.recommendedOnly.addEventListener("change", () => {
    syncFilters();
    renderOptions();
  });

  els.resetFilters.addEventListener("click", () => {
    els.paperFilter.value = "all";
    els.sizeFilter.value = "all";
    els.recommendedOnly.checked = false;
    syncFilters();
    renderOptions();
  });

  els.selectedSize.addEventListener("change", () => {
    const matched = state.options.find((option) => option.size === els.selectedSize.value);
    if (matched) {
      state.selectedSize = matched.size;
      state.selectedOptionId = matched.id;
      renderOptions();
      updateSummary();
    }
  });

  els.decreaseQuantity.addEventListener("click", () => {
    state.quantity = Math.max(1, state.quantity - 1);
    updateQuantityDisplay();
    updateSummary();
  });

  els.increaseQuantity.addEventListener("click", () => {
    state.quantity = Math.min(99, state.quantity + 1);
    updateQuantityDisplay();
    updateSummary();
  });

  els.applySelection.addEventListener("click", () => {
    const selected = getSelectedOption();
    if (selected) {
      alert(`${selected.size} ${selected.paperType} 옵션이 적용되었습니다.`);
    }
  });

  els.toggleSummary.addEventListener("click", () => {
    const collapsed = !els.summaryCard.classList.contains("collapsed");
    els.summaryCard.classList.toggle("collapsed", collapsed);
    els.toggleSummary.textContent = collapsed ? "펼치기" : "접기";
    els.toggleSummary.setAttribute("aria-expanded", String(!collapsed));
  });

  els.clearSelection.addEventListener("click", () => {
    state.selectedPhotos = [];
    renderPhotos();
    updateSummary();
  });

  els.selectFirstThree.addEventListener("click", () => {
    state.selectedPhotos = state.photos.slice(0, 3).map((photo) => photo.id);
    renderPhotos();
    updateSummary();
  });

  els.modalClose.addEventListener("click", closePhotoModal);
  els.photoModalBackdrop.addEventListener("click", (event) => {
    if (event.target === els.photoModalBackdrop) {
      closePhotoModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.photoModalBackdrop.hidden) {
      closePhotoModal();
    }
  });

  els.modalToggleSelection.addEventListener("click", () => {
    if (state.activePhotoId) {
      togglePhotoSelection(state.activePhotoId);
      openPhotoModal(state.activePhotoId);
    }
  });

  if (els.uploadNextButton) {
    els.uploadNextButton.addEventListener("click", () => {
      document.getElementById("printOptions").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

async function loadPrintOptions() {
  els.optionsError.hidden = true;
  els.optionsStatus.textContent = "인화 옵션을 불러오는 중입니다.";
  els.optionGrid.innerHTML = "";

  try {
    const response = await fetch("/api/print-options");
    if (!response.ok) {
      throw new Error("print option api failed");
    }
    const data = await response.json();
    state.options = data.options;
    state.selectedOptionId = state.options[0]?.id || null;
    state.selectedSize = state.options[0]?.size || "";
    populateOptionControls();
    renderOptions();
    updateSummary();
    els.optionsStatus.textContent = `${state.options.length}개 인화 옵션 표시 중 · API 데이터 정상 로드`;
  } catch (error) {
    els.optionsError.hidden = false;
    els.optionsStatus.textContent = "인화 옵션 로딩 오류";
  }
}

async function loadSamplePhotos() {
  els.photosError.hidden = true;
  els.photosStatus.textContent = "샘플 사진을 불러오는 중입니다.";
  els.previewGrid.innerHTML = "";

  try {
    const response = await fetch("/api/sample-photos");
    if (!response.ok) {
      throw new Error("sample photos api failed");
    }
    const data = await response.json();
    state.photos = data.photos;
    state.selectedPhotos = state.photos.filter((photo) => photo.selected).map((photo) => photo.id);
    renderPhotos();
    updateSummary();
    els.photosStatus.textContent = `${state.photos.length}개 사진 표시 중 · API 데이터 정상 로드`;
  } catch (error) {
    els.photosError.hidden = false;
    els.photosStatus.textContent = "샘플 사진 로딩 오류";
  }
}

function populateOptionControls() {
  const paperTypes = [...new Set(state.options.map((option) => option.paperType))];
  const sizes = [...new Set(state.options.map((option) => option.size))];
  fillSelect(els.paperFilter, "전체 용지", paperTypes);
  fillSelect(els.sizeFilter, "전체 사이즈", sizes);
  els.selectedSize.innerHTML = sizes.map((size) => `<option value="${size}">${size}</option>`).join("");
  els.selectedSize.value = state.selectedSize;
}

function fillSelect(select, allLabel, values) {
  const current = select.value || "all";
  select.innerHTML = [`<option value="all">${allLabel}</option>`, ...values.map((value) => `<option value="${value}">${value}</option>`)].join("");
  select.value = values.includes(current) ? current : "all";
}

function syncFilters() {
  state.filters.paper = els.paperFilter.value;
  state.filters.size = els.sizeFilter.value;
  state.filters.recommendedOnly = els.recommendedOnly.checked;
}

function getFilteredOptions() {
  return state.options.filter((option) => {
    const paperMatch = state.filters.paper === "all" || option.paperType === state.filters.paper;
    const sizeMatch = state.filters.size === "all" || option.size === state.filters.size;
    const recommendationMatch = !state.filters.recommendedOnly || option.recommended;
    return paperMatch && sizeMatch && recommendationMatch;
  });
}

function renderOptions() {
  const options = getFilteredOptions();
  els.optionGrid.innerHTML = "";

  if (options.length === 0) {
    els.optionGrid.innerHTML = '<div class="empty-state">조건에 맞는 인화 옵션이 없습니다.</div>';
    return;
  }

  options.forEach((option) => {
    const card = document.createElement("article");
    card.className = `option-card ${state.selectedOptionId === option.id ? "selected" : ""}`;
    card.dataset.optionId = option.id;
    card.innerHTML = `
      <div class="option-meta">
        <span class="pill">${option.size}</span>
        <span class="pill">${option.paperType}</span>
        ${option.recommended ? '<span class="pill">추천</span>' : ""}
      </div>
      <h3>${option.name}</h3>
      <p>선명도 보정과 색감 균형 체크가 포함된 기본 인화 서비스입니다.</p>
      <strong class="option-price">${formatCurrency(option.price)} / 장</strong>
      <button class="secondary-button" type="button">이 옵션 선택</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      state.selectedOptionId = option.id;
      state.selectedSize = option.size;
      els.selectedSize.value = option.size;
      renderOptions();
      updateSummary();
    });
    els.optionGrid.appendChild(card);
  });
}

function renderPhotos() {
  els.previewGrid.innerHTML = "";

  if (state.photos.length === 0) {
    els.previewGrid.innerHTML = '<div class="empty-state">표시할 사진이 없습니다.</div>';
    return;
  }

  state.photos.forEach((photo) => {
    const selected = state.selectedPhotos.includes(photo.id);
    const card = document.createElement("article");
    card.className = `photo-card ${selected ? "selected" : ""}`;
    card.dataset.photoId = photo.id;
    card.dataset.ratio = photo.ratio;
    card.innerHTML = `
      <img src="${photo.thumbnailUrl}" alt="${photo.fileName} 미리보기" />
      <h3>${photo.fileName}</h3>
      <div class="photo-actions">
        <button type="button" class="preview-button">미리보기</button>
        <button type="button" class="select-button">${selected ? "선택 해제" : "선택"}</button>
      </div>
      <span class="photo-check">${selected ? "선택됨" : ""}</span>
    `;
    card.querySelector(".preview-button").addEventListener("click", () => openPhotoModal(photo.id));
    card.querySelector(".select-button").addEventListener("click", () => togglePhotoSelection(photo.id));
    els.previewGrid.appendChild(card);
  });
}

function togglePhotoSelection(photoId) {
  if (state.selectedPhotos.includes(photoId)) {
    state.selectedPhotos = state.selectedPhotos.filter((id) => id !== photoId);
  } else {
    state.selectedPhotos.push(photoId);
  }
  renderPhotos();
  updateSummary();
}

function openPhotoModal(photoId) {
  const photo = state.photos.find((entry) => entry.id === photoId);
  if (!photo) {
    return;
  }
  state.activePhotoId = photoId;
  els.modalImage.src = photo.thumbnailUrl;
  els.modalImage.alt = `${photo.fileName} 큰 미리보기`;
  els.modalTitle.textContent = photo.fileName;
  els.modalRatio.textContent = ratioLabel(photo.ratio);
  els.modalToggleSelection.textContent = state.selectedPhotos.includes(photoId) ? "선택 해제" : "선택하기";
  els.photoModalBackdrop.hidden = false;
}

function closePhotoModal() {
  els.photoModalBackdrop.hidden = true;
  state.activePhotoId = null;
}

function getSelectedOption() {
  return state.options.find((option) => option.id === state.selectedOptionId) || null;
}

function updateQuantityDisplay() {
  els.quantityDisplay.textContent = String(state.quantity);
}

function updateSummary() {
  const selectedOption = getSelectedOption();
  const unitPrice = selectedOption ? selectedOption.price : 0;
  const total = unitPrice * state.selectedPhotos.length * state.quantity;

  // INTENTIONAL GUI BUG: site064-bug01
  // Type: selected-quantity-display-error
  // Description: 선택된 사진 수보다 하나 적은 값을 주문 요약에 표시해 수량이 불일치함.
  const displayedPhotoCount = Math.max(state.selectedPhotos.length - 1, 0);
  els.selectedPhotoCount.textContent = `${displayedPhotoCount}장`;
  els.selectedOptionLabel.textContent = selectedOption ? `${selectedOption.size} · ${selectedOption.paperType}` : "선택 전";
  els.summaryQuantity.textContent = `${state.quantity}세트`;
  els.summaryTotal.textContent = formatCurrency(total);
}

function ratioLabel(ratio) {
  const labels = {
    landscape: "가로 사진",
    portrait: "세로 사진",
    square: "정방형 사진"
  };
  return labels[ratio] || "사진";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(value);
}
