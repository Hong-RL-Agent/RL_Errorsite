const BUGGY_RECOMMENDED_BOOK_ID = "BK-058-03";

const state = {
  books: [],
  plans: [],
  genre: "all",
  billingMode: "monthly",
  recommendedIndex: 0,
  readingIds: new Set(),
  activeBookId: null
};

const els = {};

const faqs = [
  {
    question: "무료 체험은 몇 권까지 읽을 수 있나요?",
    answer: "무료 체험 기간에는 추천 도서와 샘플 도서를 제한 없이 열람할 수 있으며, 유료 도서는 일부 챕터가 제공됩니다."
  },
  {
    question: "구독 해지는 언제든 가능한가요?",
    answer: "월간 구독은 다음 결제일 전까지 언제든 해지할 수 있고, 연간 구독은 남은 기간 기준으로 환불 규정이 적용됩니다."
  },
  {
    question: "오프라인에서도 읽을 수 있나요?",
    answer: "모바일과 데스크톱 앱에서 오프라인 저장을 지원합니다. 웹 리더는 온라인 상태에서 이용할 수 있습니다."
  },
  {
    question: "기업 도서관은 몇 명까지 이용 가능한가요?",
    answer: "기본 팀 플랜은 10명을 포함하며, 추가 멤버는 관리자 페이지에서 확장할 수 있습니다."
  }
];

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  attachStaticHandlers();
  renderFaqs();
  renderReadingList();
  loadBooks();
  loadPlans();
}

function cacheElements() {
  els.headerDownloadButton = document.getElementById("headerDownloadButton");
  els.heroDownloadButton = document.getElementById("heroDownloadButton");
  els.booksStatus = document.getElementById("booksStatus");
  els.booksError = document.getElementById("booksError");
  els.retryBooks = document.getElementById("retryBooks");
  els.recommendedTrack = document.getElementById("recommendedTrack");
  els.prevRecommended = document.getElementById("prevRecommended");
  els.nextRecommended = document.getElementById("nextRecommended");
  els.genreFilter = document.getElementById("genreFilter");
  els.bookGrid = document.getElementById("bookGrid");
  els.billingToggle = document.getElementById("billingToggle");
  els.plansStatus = document.getElementById("plansStatus");
  els.plansError = document.getElementById("plansError");
  els.retryPlans = document.getElementById("retryPlans");
  els.planGrid = document.getElementById("planGrid");
  els.faqList = document.getElementById("faqList");
  els.readingList = document.getElementById("readingList");
  els.readingCount = document.getElementById("readingCount");
  els.averageRating = document.getElementById("averageRating");
  els.clearReadingList = document.getElementById("clearReadingList");
  els.bookModalBackdrop = document.getElementById("bookModalBackdrop");
  els.bookModalClose = document.getElementById("bookModalClose");
  els.bookModalCover = document.getElementById("bookModalCover");
  els.bookModalGenre = document.getElementById("bookModalGenre");
  els.bookModalTitle = document.getElementById("bookModalTitle");
  els.bookModalAuthor = document.getElementById("bookModalAuthor");
  els.bookModalRating = document.getElementById("bookModalRating");
  els.modalAddReading = document.getElementById("modalAddReading");
  els.downloadModalBackdrop = document.getElementById("downloadModalBackdrop");
  els.downloadModalClose = document.getElementById("downloadModalClose");
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
    button.dataset.soonBound = "true";
    button.addEventListener("click", () => {
      alert("준비중입니다.");
    });
  });

  els.headerDownloadButton.addEventListener("click", openDownloadModal);

  // INTENTIONAL GUI BUG: site058-bug03
  // CSV Error: 다운로드 버튼 무반응
  // Type: download-button-no-response
  // Description: hero 다운로드 버튼에 안내 모달 click listener를 연결하지 않아 클릭해도 반응하지 않음.
  els.heroDownloadButton.setAttribute("aria-label", "리더 앱 다운로드");

  els.downloadModalClose.addEventListener("click", closeDownloadModal);
  els.downloadModalBackdrop.addEventListener("click", (event) => {
    if (event.target === els.downloadModalBackdrop) {
      closeDownloadModal();
    }
  });

  els.retryBooks.addEventListener("click", loadBooks);
  els.retryPlans.addEventListener("click", loadPlans);

  els.prevRecommended.addEventListener("click", () => {
    const recommended = getRecommendedBooks();
    state.recommendedIndex = (state.recommendedIndex - 1 + recommended.length) % recommended.length;
    renderRecommendedBooks();
  });

  els.nextRecommended.addEventListener("click", () => {
    const recommended = getRecommendedBooks();
    state.recommendedIndex = (state.recommendedIndex + 1) % recommended.length;
    renderRecommendedBooks();
  });

  els.genreFilter.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-genre]");
    if (!chip) {
      return;
    }
    state.genre = chip.dataset.genre;
    updateGenreActive();
    renderBookGrid();
  });

  els.billingToggle.addEventListener("click", () => {
    state.billingMode = state.billingMode === "monthly" ? "yearly" : "monthly";
    els.billingToggle.classList.toggle("is-yearly", state.billingMode === "yearly");
    els.billingToggle.setAttribute("aria-pressed", String(state.billingMode === "yearly"));
    renderPlans();
  });

  els.clearReadingList.addEventListener("click", () => {
    state.readingIds.clear();
    renderReadingList();
    renderBookGrid();
    renderRecommendedBooks();
  });

  els.bookModalClose.addEventListener("click", closeBookModal);
  els.bookModalBackdrop.addEventListener("click", (event) => {
    if (event.target === els.bookModalBackdrop) {
      closeBookModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!els.bookModalBackdrop.hidden) {
        closeBookModal();
      }
      if (!els.downloadModalBackdrop.hidden) {
        closeDownloadModal();
      }
    }
  });

  els.modalAddReading.addEventListener("click", () => {
    if (state.activeBookId) {
      addToReadingList(state.activeBookId);
    }
  });
}

async function loadBooks() {
  els.booksStatus.textContent = "도서 정보를 불러오는 중입니다.";
  els.booksError.hidden = true;

  try {
    const response = await fetch("/api/books");
    if (!response.ok) {
      throw new Error(`Books API returned ${response.status}`);
    }
    const payload = await response.json();
    state.books = payload.books;
    renderGenreChips();
    renderRecommendedBooks();
    renderBookGrid();
    renderReadingList();
    els.booksStatus.textContent = `${state.books.length}권 도서 표시 중 · API 데이터 정상 로드`;
  } catch (error) {
    els.booksStatus.textContent = "";
    els.booksError.hidden = false;
  }
}

async function loadPlans() {
  els.plansStatus.textContent = "요금제 정보를 불러오는 중입니다.";
  els.plansError.hidden = true;

  try {
    const response = await fetch("/api/plans");
    if (!response.ok) {
      throw new Error(`Plans API returned ${response.status}`);
    }
    const payload = await response.json();
    state.plans = payload.plans;
    renderPlans();
    els.plansStatus.textContent = `${state.plans.length}개 요금제 표시 중 · API 데이터 정상 로드`;
  } catch (error) {
    els.plansStatus.textContent = "";
    els.plansError.hidden = false;
  }
}

function renderGenreChips() {
  const genres = [...new Set(state.books.map((book) => book.genre))].sort();
  els.genreFilter.innerHTML = '<button class="chip active" type="button" data-genre="all">전체</button>';
  genres.forEach((genre) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.type = "button";
    chip.dataset.genre = genre;
    chip.textContent = genre;
    els.genreFilter.appendChild(chip);
  });
}

function updateGenreActive() {
  els.genreFilter.querySelectorAll("[data-genre]").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.genre === state.genre);
  });
}

function renderRecommendedBooks() {
  const recommended = getRecommendedBooks();
  els.recommendedTrack.innerHTML = "";

  if (recommended.length === 0) {
    els.recommendedTrack.innerHTML = '<div class="empty-state">추천 도서를 불러오는 중입니다.</div>';
    return;
  }

  for (let index = 0; index < Math.min(3, recommended.length); index += 1) {
    const book = recommended[(state.recommendedIndex + index) % recommended.length];
    els.recommendedTrack.appendChild(createBookCard(book, true));
  }
}

function renderBookGrid() {
  const filtered = state.books.filter((book) => state.genre === "all" || book.genre === state.genre);
  els.bookGrid.innerHTML = "";

  if (filtered.length === 0) {
    els.bookGrid.innerHTML = '<div class="empty-state">선택한 장르의 도서가 없습니다.</div>';
    return;
  }

  filtered.forEach((book) => {
    els.bookGrid.appendChild(createBookCard(book, false));
  });
}

function createBookCard(book, isRecommendedCard) {
  const card = document.createElement("article");
  card.className = "book-card";
  card.dataset.bookId = book.id;

  const bugAttribute = isRecommendedCard && book.id === BUGGY_RECOMMENDED_BOOK_ID ? ' data-bug-id="site058-bug01"' : "";
  let recommendationHtml = "";

  if (isRecommendedCard) {
    if (book.id === BUGGY_RECOMMENDED_BOOK_ID) {
      // INTENTIONAL GUI BUG: site058-bug01
      // CSV Error: 추천 목록 undefined
      // Type: undefined-recommendation-render
      // Description: 추천 도서 optional 필드가 없을 때 fallback 없이 렌더링해 undefined가 표시됨.
      recommendationHtml = `<p class="recommend-reason">${book.recommendationReason}</p><span class="book-meta">${book.authorAlias}</span>`;
    } else {
      recommendationHtml = `<p class="recommend-reason">${book.recommendationReason}</p><span class="book-meta">${book.authorAlias}</span>`;
    }
  } else {
    recommendationHtml = `<span class="book-meta">${book.author}</span>`;
  }

  card.innerHTML = `
    <img src="${book.coverImage}" alt="${book.title} 표지" />
    <div class="book-body"${bugAttribute}>
      <span class="genre-badge">${book.genre}</span>
      <h3>${book.title}</h3>
      ${recommendationHtml}
      <span class="book-meta">평점 ${book.rating}</span>
      <div class="book-actions">
        <button type="button" class="details-button">상세 보기</button>
        <button type="button" class="reading-button">${state.readingIds.has(book.id) ? "담김" : "목록 담기"}</button>
      </div>
    </div>
  `;

  card.querySelector(".details-button").addEventListener("click", () => openBookModal(book.id));
  card.querySelector(".reading-button").addEventListener("click", () => addToReadingList(book.id));
  return card;
}

function renderPlans() {
  els.planGrid.innerHTML = "";

  state.plans.forEach((plan) => {
    const price = state.billingMode === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    const period = state.billingMode === "yearly" ? "연" : "월";
    const card = document.createElement("article");
    card.className = "plan-card";
    card.innerHTML = `
      <h3>${plan.name}</h3>
      <div class="plan-price">${formatCurrency(price)} <small>/ ${period}</small></div>
      <ul class="benefit-list">
        ${plan.benefits.map((benefit) => `<li>${benefit}</li>`).join("")}
      </ul>
      <button class="primary-button full-width" type="button" data-soon="plan">선택하기</button>
    `;
    els.planGrid.appendChild(card);
  });

  cardSoonButtons();
}

function renderFaqs() {
  els.faqList.innerHTML = "";

  faqs.forEach((faq, index) => {
    const item = document.createElement("article");
    item.className = "faq-item";
    const contentId = `faq-${index}`;
    item.innerHTML = `
      <button class="faq-trigger" type="button" aria-expanded="${index === 0}" aria-controls="${contentId}">${faq.question}</button>
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

function openBookModal(bookId) {
  const book = state.books.find((item) => item.id === bookId);
  if (!book) {
    return;
  }

  state.activeBookId = bookId;
  els.bookModalCover.src = book.coverImage;
  els.bookModalCover.alt = `${book.title} 표지`;
  els.bookModalGenre.textContent = book.genre;
  els.bookModalTitle.textContent = book.title;
  els.bookModalAuthor.textContent = `${book.author} 저`;
  els.bookModalRating.textContent = `평점 ${book.rating}`;
  els.modalAddReading.textContent = state.readingIds.has(book.id) ? "이미 담긴 도서" : "독서 목록에 담기";
  els.bookModalBackdrop.hidden = false;
}

function closeBookModal() {
  els.bookModalBackdrop.hidden = true;
  state.activeBookId = null;
}

function openDownloadModal() {
  els.downloadModalBackdrop.hidden = false;
}

function closeDownloadModal() {
  els.downloadModalBackdrop.hidden = true;
}

function addToReadingList(bookId) {
  state.readingIds.add(bookId);
  renderReadingList();
  renderBookGrid();
  renderRecommendedBooks();
  if (state.activeBookId === bookId) {
    els.modalAddReading.textContent = "이미 담긴 도서";
  }
}

function renderReadingList() {
  const books = state.books.filter((book) => state.readingIds.has(book.id));
  els.readingList.innerHTML = "";

  if (books.length === 0) {
    els.readingList.innerHTML = '<div class="empty-state">아직 담은 도서가 없습니다.</div>';
  } else {
    books.forEach((book) => {
      const item = document.createElement("article");
      item.className = "reading-item";
      item.innerHTML = `
        <strong>${book.title}</strong>
        <span>${book.author} · ${book.genre} · 평점 ${book.rating}</span>
      `;
      els.readingList.appendChild(item);
    });
  }

  els.readingCount.textContent = `${books.length}권`;
  if (books.length === 0) {
    els.averageRating.textContent = "-";
  } else {
    const average = books.reduce((sum, book) => sum + book.rating, 0) / books.length;
    els.averageRating.textContent = average.toFixed(1);
  }
}

function getRecommendedBooks() {
  return state.books.filter((book) => book.recommended);
}

function cardSoonButtons() {
  document.querySelectorAll("[data-soon]").forEach((button) => {
    if (button.dataset.soonBound === "true") {
      return;
    }
    button.dataset.soonBound = "true";
    button.addEventListener("click", () => {
      alert("준비중입니다.");
    });
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(value);
}
